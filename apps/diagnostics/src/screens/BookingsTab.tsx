import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Image,
  TouchableOpacity, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import ChatScreen from '../../../../packages/shared/src/components/ChatScreen';

interface Props {
  profile: any;
  pendingBookingId?: string | null;
  onPendingBookingHandled?: () => void;
}

const FILTERS = ['All', 'Pending', 'Approved', 'Completed', 'Cancelled'] as const;
type Filter = typeof FILTERS[number];

const ALL_TIME_SLOTS = [
  '07:00 AM','07:30 AM','08:00 AM','08:30 AM',
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','01:00 PM','01:30 PM',
  '02:00 PM','02:30 PM','03:00 PM','03:30 PM',
  '04:00 PM','04:30 PM','05:00 PM','05:30 PM',
  '06:00 PM','06:30 PM','07:00 PM','07:30 PM',
  '08:00 PM','08:30 PM','09:00 PM',
];

const STATUS_COLORS: Record<string, string> = {
  Pending: '#D97706',
  Approved: '#7C3AED',
  Completed: '#059669',
  Cancelled: '#DC2626',
};

function getAvailableSlots(startTime: string, endTime: string): string[] {
  const startIdx = ALL_TIME_SLOTS.indexOf(startTime);
  const endIdx = ALL_TIME_SLOTS.indexOf(endTime);
  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
    return ALL_TIME_SLOTS.slice(0, 17); // default 07:00 AM - 04:00 PM
  }
  return ALL_TIME_SLOTS.slice(startIdx, endIdx + 1);
}

export default function BookingsTab({ profile, pendingBookingId, onPendingBookingHandled }: Props) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [centerInfo, setCenterInfo] = useState<any>(null);

  // Chat modal state
  const [chatModal, setChatModal] = useState(false);
  const [chatBookingId, setChatBookingId] = useState('');
  const [chatPatientName, setChatPatientName] = useState('');

  // Accept modal state
  const [acceptModal, setAcceptModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Schedule tracker modal
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);

  // Highlight booking from in-app notification banner
  const [highlightBookingId, setHighlightBookingId] = useState<string | null>(null);
  useEffect(() => {
    if (pendingBookingId) {
      setFilter('All');
      setHighlightBookingId(pendingBookingId);
      onPendingBookingHandled?.();
      const timer = setTimeout(() => setHighlightBookingId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [pendingBookingId]);

  const load = useCallback(async () => {
    const userId = profile?.id;
    if (!userId) return;

    const [{ data: center }, { data }] = await Promise.all([
      supabase.from('diagnostics_centers').select('*').eq('id', userId).single(),
      supabase
        .from('lab_bookings')
        .select('*, test:lab_tests!lab_test_id(name, category, price), patient:profiles!patient_id(full_name, avatar_url, phone)')
        .eq('diagnostics_center_id', userId)
        .order('created_at', { ascending: false }),
    ]);

    setCenterInfo(center);
    setBookings(data || []);
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  // Realtime: auto-update when lab bookings change
  useEffect(() => {
    const userId = profile?.id;
    if (!userId) return;
    const channel = supabase
      .channel('diagnostics-bookings-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'lab_bookings',
        filter: `diagnostics_center_id=eq.${userId}`,
      }, () => { load(); })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'lab_bookings',
        filter: `diagnostics_center_id=eq.${userId}`,
      }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  // Available time slots from center profile
  const availableSlots = useMemo(() => {
    const start = centerInfo?.available_start_time || '07:00 AM';
    const end = centerInfo?.available_end_time || '04:00 PM';
    return getAvailableSlots(start, end);
  }, [centerInfo]);

  // Get booking counts for a specific date+time
  const getSlotBookingCount = useCallback((date: string, time: string) => {
    return bookings.filter(
      b => b.date === date && b.time === time && (b.status === 'Approved' || b.status === 'Completed')
    ).length;
  }, [bookings]);

  // Schedule tracker data
  const scheduleForDate = useMemo(() => {
    const bookedSlots: { time: string; count: number; patients: string[]; tests: string[] }[] = [];
    const slotsWithBookings = new Map<string, { count: number; patients: string[]; tests: string[] }>();

    bookings
      .filter(b => b.date === scheduleDate && (b.status === 'Approved' || b.status === 'Completed'))
      .forEach(b => {
        if (!b.time || b.time === 'To be confirmed') return;
        const patient = Array.isArray(b.patient) ? b.patient[0] : b.patient;
        const test = Array.isArray(b.test) ? b.test[0] : b.test;
        const existing = slotsWithBookings.get(b.time) || { count: 0, patients: [], tests: [] };
        existing.count++;
        existing.patients.push(patient?.full_name || 'Patient');
        existing.tests.push(test?.name || 'Lab Test');
        slotsWithBookings.set(b.time, existing);
      });

    availableSlots.forEach(time => {
      const data = slotsWithBookings.get(time);
      if (data) bookedSlots.push({ time, ...data });
    });

    return bookedSlots;
  }, [bookings, scheduleDate, availableSlots]);

  const totalBookingsForDate = useMemo(() => {
    return bookings.filter(
      b => b.date === scheduleDate && (b.status === 'Approved' || b.status === 'Completed')
    ).length;
  }, [bookings, scheduleDate]);

  const openAcceptModal = (booking: any) => {
    setSelectedBooking(booking);
    setSelectedDate(booking.date || '');
    setSelectedTime('');
    setAcceptModal(true);
  };

  const handleTimeSlotPress = (time: string) => {
    const count = getSlotBookingCount(selectedDate, time);
    if (count > 0) {
      Alert.alert(
        'Slot Occupied',
        `This time slot already has ${count} booking${count > 1 ? 's' : ''} on ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.\n\nDo you want to force book this slot?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Force Book', style: 'destructive', onPress: () => setSelectedTime(time) },
        ]
      );
    } else {
      setSelectedTime(time);
    }
  };

  const handleAccept = async () => {
    if (!selectedDate) { Alert.alert('Required', 'Please select a date.'); return; }
    if (!selectedTime) { Alert.alert('Required', 'Please select a time slot.'); return; }

    const { error } = await supabase
      .from('lab_bookings')
      .update({ status: 'Approved', date: selectedDate, time: selectedTime })
      .eq('id', selectedBooking.id);

    if (error) { Alert.alert('Error', error.message); return; }
    Alert.alert('Approved', 'Booking approved. Patient will be notified.');
    setAcceptModal(false);
    load();
  };

  const handleReject = (booking: any) => {
    Alert.alert('Reject Booking', 'Are you sure you want to reject this booking?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase
            .from('lab_bookings')
            .update({ status: 'Cancelled' })
            .eq('id', booking.id);
          if (error) Alert.alert('Error', error.message);
          else load();
        },
      },
    ]);
  };

  const handleComplete = (bookingId: string) => {
    Alert.alert('Complete', 'Mark this booking as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          const { error } = await supabase
            .from('lab_bookings')
            .update({ status: 'Completed' })
            .eq('id', bookingId);
          if (error) Alert.alert('Error', error.message);
          else load();
        },
      },
    ]);
  };

  const generateDates = () => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const statusColor = (s: string) => STATUS_COLORS[s] || '#DC2626';

  const renderBookingCard = (booking: any) => {
    const patient = Array.isArray(booking.patient) ? booking.patient[0] : booking.patient;
    const test = Array.isArray(booking.test) ? booking.test[0] : booking.test;
    const isPending = booking.status === 'Pending';
    const isApproved = booking.status === 'Approved';
    const isHighlighted = highlightBookingId === booking.id;

    return (
      <View key={booking.id} style={[styles.card, isHighlighted && { borderColor: '#7C3AED', borderWidth: 2, backgroundColor: '#F5F3FF' }]}>
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: patient?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient?.full_name || 'P')}&background=E5E7EB&color=374151` }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.patientName}>{patient?.full_name || 'Patient'}</Text>
            {patient?.phone ? <Text style={styles.phone}>{patient.phone}</Text> : null}
          </View>
          <View style={[styles.badge, { backgroundColor: statusColor(booking.status) + '15' }]}>
            <Text style={[styles.badgeText, { color: statusColor(booking.status) }]}>{booking.status}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="flask-outline" size={14} color="#7C3AED" />
          <Text style={[styles.detailText, { color: '#7C3AED', fontWeight: '600' }]}>{test?.name || 'Lab Test'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color="#64748B" />
          <Text style={styles.detailText}>
            {booking.date ? new Date(booking.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
          </Text>
          <Ionicons name="time-outline" size={14} color="#64748B" style={{ marginLeft: 12 }} />
          <Text style={styles.detailText}>
            {booking.time && booking.time !== 'To be confirmed' ? booking.time : 'Time TBD'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name={booking.collection_type === 'home' ? 'home-outline' : 'business-outline'} size={14} color="#64748B" />
          <Text style={styles.detailText}>{booking.collection_type === 'home' ? 'Home Collection' : 'Center Visit'}</Text>
          {test?.price ? <Text style={styles.feeText}>Rs. {test.price}</Text> : null}
        </View>

        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => openAcceptModal(booking)}>
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(booking)}>
              <Ionicons name="close-circle" size={16} color="#DC2626" />
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {isApproved && (
          <>
            <View style={styles.approvedInfo}>
              <Ionicons name="checkmark-circle" size={13} color="#7C3AED" />
              <Text style={styles.approvedInfoText}>Confirmed - Patient will pay at center</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.acceptBtn, { backgroundColor: '#7C3AED' }]}
                onPress={() => {
                  setChatBookingId(booking.id);
                  setChatPatientName(patient?.full_name || 'Patient');
                  setChatModal(true);
                }}
              >
                <Ionicons name="chatbubbles" size={16} color="#fff" />
                <Text style={styles.acceptText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.acceptBtn, { backgroundColor: '#059669' }]}
                onPress={() => handleComplete(booking.id)}
              >
                <Ionicons name="checkmark-done" size={16} color="#fff" />
                <Text style={styles.acceptText}>Mark Complete</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Bookings</Text>
        <TouchableOpacity style={styles.scheduleBtn} onPress={() => setScheduleModal(true)}>
          <Ionicons name="calendar" size={18} color="#7C3AED" />
          <Text style={styles.scheduleBtnText}>Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            {f !== 'All' && (
              <Text style={[styles.filterCount, filter === f && styles.filterCountActive]}>
                {bookings.filter(b => b.status === f).length}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 30, paddingHorizontal: 16 }}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="flask-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No {filter === 'All' ? '' : filter.toLowerCase() + ' '}bookings</Text>
            <Text style={styles.emptySubtitle}>Pull down to refresh</Text>
          </View>
        ) : (
          filtered.map(renderBookingCard)
        )}
      </ScrollView>

      {/* Chat Modal */}
      <Modal visible={chatModal} animationType="slide">
        <ChatScreen
          entityType="lab_booking"
          entityId={chatBookingId}
          otherPersonName={chatPatientName}
          isBusiness={true}
          accentColor="#7C3AED"
          onBack={() => setChatModal(false)}
        />
      </Modal>

      {/* Accept Modal with slot occupancy */}
      <Modal visible={acceptModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Accept Booking</Text>
              <TouchableOpacity onPress={() => setAcceptModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {generateDates().map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dateChip, selectedDate === d && styles.dateChipActive]}
                  onPress={() => { setSelectedDate(d); setSelectedTime(''); }}
                >
                  <Text style={[styles.dateChipDay, selectedDate === d && { color: '#fff' }]}>
                    {new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })}
                  </Text>
                  <Text style={[styles.dateChipDate, selectedDate === d && { color: '#fff' }]}>
                    {new Date(d + 'T00:00:00').getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>
              Select Time Slot
              <Text style={{ fontSize: 12, fontWeight: '400', color: '#64748B' }}>
                {'  '}({centerInfo?.available_start_time || '07:00 AM'} - {centerInfo?.available_end_time || '04:00 PM'})
              </Text>
            </Text>
            <ScrollView style={{ maxHeight: 200 }}>
              <View style={styles.timeGrid}>
                {availableSlots.map(t => {
                  const count = getSlotBookingCount(selectedDate, t);
                  const isOccupied = count > 0;
                  const isSelected = selectedTime === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.timeChip,
                        isOccupied && !isSelected && styles.timeChipOccupied,
                        isSelected && styles.timeChipActive,
                      ]}
                      onPress={() => handleTimeSlotPress(t)}
                    >
                      <Text style={[
                        styles.timeChipText,
                        isOccupied && !isSelected && { color: '#9CA3AF' },
                        isSelected && { color: '#fff' },
                      ]}>{t}</Text>
                      {isOccupied && (
                        <Text style={[
                          styles.slotCount,
                          isSelected && { color: '#fff', backgroundColor: 'rgba(255,255,255,0.3)' },
                        ]}>
                          {count}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleAccept}>
              <Text style={styles.confirmBtnText}>Approve Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Schedule Tracker Modal */}
      <Modal visible={scheduleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Tracker</Text>
              <TouchableOpacity onPress={() => setScheduleModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {generateDates().map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dateChip, scheduleDate === d && styles.dateChipActive]}
                  onPress={() => setScheduleDate(d)}
                >
                  <Text style={[styles.dateChipDay, scheduleDate === d && { color: '#fff' }]}>
                    {new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' })}
                  </Text>
                  <Text style={[styles.dateChipDate, scheduleDate === d && { color: '#fff' }]}>
                    {new Date(d + 'T00:00:00').getDate()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.scheduleSummary}>
              <Ionicons name="calendar" size={18} color="#7C3AED" />
              <Text style={styles.scheduleSummaryText}>
                {new Date(scheduleDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                {'  '}•{'  '}{totalBookingsForDate} booking{totalBookingsForDate !== 1 ? 's' : ''}
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {scheduleForDate.length === 0 ? (
                <View style={styles.scheduleEmpty}>
                  <Ionicons name="checkmark-circle-outline" size={36} color="#D1D5DB" />
                  <Text style={styles.scheduleEmptyText}>No bookings scheduled</Text>
                </View>
              ) : (
                scheduleForDate.map(slot => (
                  <View key={slot.time} style={styles.scheduleSlot}>
                    <View style={styles.scheduleTimeCol}>
                      <Text style={styles.scheduleTime}>{slot.time}</Text>
                    </View>
                    <View style={styles.scheduleInfoCol}>
                      <View style={[styles.scheduleCountBadge, slot.count > 1 && { backgroundColor: '#FEF3C7' }]}>
                        <Text style={[styles.scheduleCountText, slot.count > 1 && { color: '#D97706' }]}>
                          {slot.count} booking{slot.count > 1 ? 's' : ''}
                        </Text>
                        {slot.count > 1 && <Ionicons name="warning" size={12} color="#D97706" />}
                      </View>
                      {slot.patients.map((name, i) => (
                        <Text key={i} style={styles.schedulePatient}>
                          {name} — <Text style={{ color: '#7C3AED' }}>{slot.tests[i]}</Text>
                        </Text>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  scheduleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F5F3FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  scheduleBtnText: { fontSize: 13, fontWeight: '700', color: '#7C3AED' },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12, height: 48 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
  },
  filterChipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterTextActive: { color: '#fff' },
  filterCount: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  filterCountActive: { color: '#7C3AED', backgroundColor: 'rgba(255,255,255,0.3)' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#6B7280', marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  patientName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  phone: { fontSize: 12, color: '#64748B', marginTop: 2 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  detailText: { fontSize: 13, color: '#64748B', flex: 1 },
  feeText: { fontSize: 13, fontWeight: '700', color: '#7C3AED' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  acceptBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#7C3AED', borderRadius: 10, paddingVertical: 10 },
  acceptText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FEE2E2', borderRadius: 10, paddingVertical: 10 },
  rejectText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
  approvedInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
    backgroundColor: '#F5F3FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
  },
  approvedInfoText: { fontSize: 12, fontWeight: '600', color: '#7C3AED', flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  modalLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  dateChip: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F1F5F9', marginRight: 8 },
  dateChipActive: { backgroundColor: '#7C3AED' },
  dateChipDay: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  dateChipDate: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginTop: 2 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  timeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F1F5F9' },
  timeChipActive: { backgroundColor: '#7C3AED' },
  timeChipOccupied: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  timeChipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  slotCount: { fontSize: 10, fontWeight: '800', color: '#DC2626', backgroundColor: '#FEE2E2', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  confirmBtn: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  // Schedule tracker styles
  scheduleSummary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F5F3FF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16 },
  scheduleSummaryText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  scheduleEmpty: { alignItems: 'center', paddingVertical: 40 },
  scheduleEmptyText: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
  scheduleSlot: { flexDirection: 'row', marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#7C3AED', paddingLeft: 12 },
  scheduleTimeCol: { width: 80 },
  scheduleTime: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  scheduleInfoCol: { flex: 1 },
  scheduleCountBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: '#F5F3FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  scheduleCountText: { fontSize: 11, fontWeight: '700', color: '#7C3AED' },
  schedulePatient: { fontSize: 12, color: '#64748B', marginTop: 2 },
});
