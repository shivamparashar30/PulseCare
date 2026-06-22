import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Image,
  TouchableOpacity, Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import ChatScreen from '../../../../packages/shared/src/components/ChatScreen';

interface Props {
  profile: any;
  pendingApptId?: string | null;
  onPendingApptHandled?: () => void;
  initialFilter?: string | null;
  onInitialFilterHandled?: () => void;
}

const FILTERS = ['All', 'Pending', 'Approved', 'Confirmed', 'Completed', 'Cancelled'] as const;
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
  Approved: '#2563EB',
  Confirmed: '#059669',
  Completed: '#4338CA',
  Cancelled: '#DC2626',
  Upcoming: '#2563EB',
};

function getAvailableSlots(startTime: string, endTime: string): string[] {
  const startIdx = ALL_TIME_SLOTS.indexOf(startTime);
  const endIdx = ALL_TIME_SLOTS.indexOf(endTime);
  if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
    return ALL_TIME_SLOTS.slice(4, 22); // default 09:00 AM - 06:30 PM
  }
  return ALL_TIME_SLOTS.slice(startIdx, endIdx + 1);
}

export default function AppointmentsTab({ profile, pendingApptId, onPendingApptHandled, initialFilter, onInitialFilterHandled }: Props) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>('All');
  const [refreshing, setRefreshing] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  // Accept modal state
  const [acceptModal, setAcceptModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Reject modal state
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Chat modal state
  const [chatModal, setChatModal] = useState(false);
  const [chatApptId, setChatApptId] = useState('');
  const [chatPatientName, setChatPatientName] = useState('');

  // Schedule tracker modal
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);

  // Highlight appointment from in-app notification banner
  const [highlightApptId, setHighlightApptId] = useState<string | null>(null);
  useEffect(() => {
    if (pendingApptId) {
      setFilter('All');
      setHighlightApptId(pendingApptId);
      onPendingApptHandled?.();
      const timer = setTimeout(() => setHighlightApptId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [pendingApptId]);

  // Navigate from Home with a specific filter
  useEffect(() => {
    if (initialFilter && FILTERS.includes(initialFilter as Filter)) {
      setFilter(initialFilter as Filter);
      onInitialFilterHandled?.();
    }
  }, [initialFilter]);

  const load = useCallback(async () => {
    const userId = profile?.id;
    if (!userId) return;

    const [{ data: dp }, { data }] = await Promise.all([
      supabase.from('doctor_profiles').select('*').eq('id', userId).single(),
      supabase
        .from('appointments')
        .select('*, patient:profiles!patient_id(full_name, avatar_url, phone)')
        .eq('doctor_id', userId)
        .order('created_at', { ascending: false }),
    ]);

    setDoctorProfile(dp);
    setAppointments(data || []);
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  // Realtime
  useEffect(() => {
    const userId = profile?.id;
    if (!userId) return;
    const channel = supabase
      .channel('doctor-appointments-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'appointments', filter: `doctor_id=eq.${userId}` }, () => { load(); })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'appointments', filter: `doctor_id=eq.${userId}` }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = filter === 'All' ? appointments : appointments.filter(a => a.status === filter);

  // Available time slots from doctor profile
  const availableSlots = useMemo(() => {
    const start = doctorProfile?.available_start_time || '09:00 AM';
    const end = doctorProfile?.available_end_time || '06:00 PM';
    return getAvailableSlots(start, end);
  }, [doctorProfile]);

  // Get booking counts for a specific date+time
  const getSlotBookingCount = useCallback((date: string, time: string) => {
    return appointments.filter(
      a => a.date === date && a.time === time && (a.status === 'Approved' || a.status === 'Confirmed')
    ).length;
  }, [appointments]);

  // Schedule tracker data for a given date
  const scheduleForDate = useMemo(() => {
    const bookedSlots: { time: string; count: number; patients: string[] }[] = [];
    const slotsWithBookings = new Map<string, { count: number; patients: string[] }>();

    appointments
      .filter(a => a.date === scheduleDate && (a.status === 'Approved' || a.status === 'Confirmed' || a.status === 'Completed'))
      .forEach(a => {
        if (!a.time || a.time === 'To be confirmed') return;
        const patient = Array.isArray(a.patient) ? a.patient[0] : a.patient;
        const existing = slotsWithBookings.get(a.time) || { count: 0, patients: [] };
        existing.count++;
        existing.patients.push(patient?.full_name || 'Patient');
        slotsWithBookings.set(a.time, existing);
      });

    availableSlots.forEach(time => {
      const data = slotsWithBookings.get(time);
      if (data) {
        bookedSlots.push({ time, ...data });
      }
    });

    return bookedSlots;
  }, [appointments, scheduleDate, availableSlots]);

  const totalBookingsForDate = useMemo(() => {
    return appointments.filter(
      a => a.date === scheduleDate && (a.status === 'Approved' || a.status === 'Confirmed' || a.status === 'Completed')
    ).length;
  }, [appointments, scheduleDate]);

  const openAcceptModal = (appt: any) => {
    setSelectedAppt(appt);
    setSelectedDate(appt.date);
    setSelectedTime('');
    setAcceptModal(true);
  };

  const openRejectModal = (appt: any) => {
    setSelectedAppt(appt);
    setRejectReason('');
    setRejectModal(true);
  };

  const handleTimeSlotPress = (time: string) => {
    const count = getSlotBookingCount(selectedDate, time);
    if (count > 0) {
      Alert.alert(
        'Slot Occupied',
        `This time slot already has ${count} appointment${count > 1 ? 's' : ''} on ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.\n\nDo you want to force book this slot?`,
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
    if (!selectedTime) { Alert.alert('Required', 'Please select a time slot.'); return; }

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'Approved', date: selectedDate, time: selectedTime })
      .eq('id', selectedAppt.id);

    if (error) { Alert.alert('Error', error.message); return; }
    Alert.alert('Approved', 'Appointment approved. Patient will be notified to pay.');
    setAcceptModal(false);
    load();
  };

  const handleReject = async () => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'Cancelled', notes: rejectReason || 'Rejected by doctor' })
      .eq('id', selectedAppt.id);

    if (error) { Alert.alert('Error', error.message); return; }
    setRejectModal(false);
    load();
  };

  const handleComplete = async (apptId: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'Completed' })
      .eq('id', apptId);

    if (error) Alert.alert('Error', error.message);
    else load();
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

  const openChat = (appt: any) => {
    const patient = Array.isArray(appt.patient) ? appt.patient[0] : appt.patient;
    setChatApptId(appt.id);
    setChatPatientName(patient?.full_name || 'Patient');
    setChatModal(true);
  };

  const statusColor = (s: string) => STATUS_COLORS[s] || '#DC2626';

  const renderApptCard = (appt: any) => {
    const patient = Array.isArray(appt.patient) ? appt.patient[0] : appt.patient;
    const isPending = appt.status === 'Pending';
    const isApproved = appt.status === 'Approved';
    const isConfirmed = appt.status === 'Confirmed';

    const isHighlighted = highlightApptId === appt.id;

    return (
      <View key={appt.id} style={[styles.card, isHighlighted && { borderColor: '#2563EB', borderWidth: 2, backgroundColor: '#EFF6FF' }]}>
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: patient?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient?.full_name || 'P')}&background=E5E7EB&color=374151` }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.patientName}>{patient?.full_name || 'Patient'}</Text>
            {patient?.phone ? <Text style={styles.phone}>{patient.phone}</Text> : null}
          </View>
          <View style={[styles.badge, { backgroundColor: statusColor(appt.status) + '15' }]}>
            <Text style={[styles.badgeText, { color: statusColor(appt.status) }]}>{appt.status}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color="#64748B" />
          <Text style={styles.detailText}>
            {new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
          <Ionicons name="time-outline" size={14} color="#64748B" style={{ marginLeft: 12 }} />
          <Text style={styles.detailText}>
            {appt.time && appt.time !== 'To be confirmed' ? appt.time : 'Time TBD'}
          </Text>
        </View>

        {appt.type && (
          <View style={styles.detailRow}>
            <Ionicons name={appt.type === 'video' ? 'videocam-outline' : 'business-outline'} size={14} color="#64748B" />
            <Text style={styles.detailText}>{appt.type === 'video' ? 'Video Consultation' : 'Clinic Visit'}</Text>
            {appt.payment_amount ? (
              <Text style={styles.feeText}>₹{appt.payment_amount}</Text>
            ) : null}
          </View>
        )}

        {appt.symptoms ? (
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={2}>{appt.symptoms}</Text>
          </View>
        ) : null}

        {isPending && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => openAcceptModal(appt)}>
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectBtn} onPress={() => openRejectModal(appt)}>
              <Ionicons name="close-circle" size={16} color="#DC2626" />
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        {isApproved && (
          <View style={styles.approvedInfo}>
            <Ionicons name="hourglass-outline" size={13} color="#D97706" />
            <Text style={styles.approvedInfoText}>Waiting for patient to pay and confirm</Text>
          </View>
        )}

        {isConfirmed && (
          <>
            <View style={styles.paymentRow}>
              <View style={styles.paidBadge}>
                <Ionicons name="checkmark-circle" size={13} color="#059669" />
                <Text style={styles.paidBadgeText}>Paid - Confirmed</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.acceptBtn, { backgroundColor: '#2563EB' }]}
                onPress={() => openChat(appt)}
              >
                <Ionicons name="chatbubbles" size={16} color="#fff" />
                <Text style={styles.acceptText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.acceptBtn, { backgroundColor: '#059669' }]}
                onPress={() => Alert.alert('Complete', 'Mark this appointment as completed?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Complete', onPress: () => handleComplete(appt.id) },
                ])}
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
        <Text style={styles.title}>Appointments</Text>
        <TouchableOpacity style={styles.scheduleBtn} onPress={() => setScheduleModal(true)}>
          <Ionicons name="calendar" size={18} color="#2563EB" />
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
                {appointments.filter(a => a.status === f).length}
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
            <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No {filter === 'All' ? '' : filter.toLowerCase() + ' '}appointments</Text>
            <Text style={styles.emptySubtitle}>Pull down to refresh</Text>
          </View>
        ) : (
          filtered.map(renderApptCard)
        )}
      </ScrollView>

      {/* Accept Modal with slot occupancy */}
      <Modal visible={acceptModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Accept Appointment</Text>
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
                {'  '}({doctorProfile?.available_start_time || '09:00 AM'} - {doctorProfile?.available_end_time || '06:00 PM'})
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
              <Text style={styles.confirmBtnText}>Approve Appointment</Text>
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
              <Ionicons name="calendar" size={18} color="#2563EB" />
              <Text style={styles.scheduleSummaryText}>
                {new Date(scheduleDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                {'  '}•{'  '}{totalBookingsForDate} booking{totalBookingsForDate !== 1 ? 's' : ''}
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {scheduleForDate.length === 0 ? (
                <View style={styles.scheduleEmpty}>
                  <Ionicons name="checkmark-circle-outline" size={36} color="#D1D5DB" />
                  <Text style={styles.scheduleEmptyText}>No appointments scheduled</Text>
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
                        <Text key={i} style={styles.schedulePatient}>{name}</Text>
                      ))}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Chat Modal */}
      <Modal visible={chatModal} animationType="slide">
        <ChatScreen
          appointmentId={chatApptId}
          otherPersonName={chatPatientName}
          isDoctor={true}
          accentColor="#2563EB"
          onBack={() => setChatModal(false)}
        />
      </Modal>

      {/* Reject Modal */}
      <Modal visible={rejectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: 320 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reject Appointment</Text>
              <TouchableOpacity onPress={() => setRejectModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Reason (optional)</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="e.g., Not available on this date"
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
            />
            <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#DC2626' }]} onPress={handleReject}>
              <Text style={styles.confirmBtnText}>Reject Appointment</Text>
            </TouchableOpacity>
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
  scheduleBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  scheduleBtnText: { fontSize: 13, fontWeight: '700', color: '#2563EB' },
  filterRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12, height: 48 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
  },
  filterChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterTextActive: { color: '#fff' },
  filterCount: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  filterCountActive: { color: '#2563EB', backgroundColor: 'rgba(255,255,255,0.3)' },
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
  feeText: { fontSize: 13, fontWeight: '700', color: '#2563EB' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  acceptBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 10 },
  acceptText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FEE2E2', borderRadius: 10, paddingVertical: 10 },
  rejectText: { color: '#DC2626', fontWeight: '700', fontSize: 13 },
  approvedInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
    backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
  },
  approvedInfoText: { fontSize: 12, fontWeight: '600', color: '#D97706', flex: 1 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  paidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#D1FAE5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  paidBadgeText: { fontSize: 12, fontWeight: '600', color: '#059669' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  modalLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  dateChip: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: '#F1F5F9', marginRight: 8 },
  dateChipActive: { backgroundColor: '#2563EB' },
  dateChipDay: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  dateChipDate: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginTop: 2 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  timeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F1F5F9' },
  timeChipActive: { backgroundColor: '#2563EB' },
  timeChipOccupied: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  timeChipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  slotCount: { fontSize: 10, fontWeight: '800', color: '#DC2626', backgroundColor: '#FEE2E2', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  confirmBtn: { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  reasonInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12,
    fontSize: 14, color: '#1E293B', minHeight: 80, textAlignVertical: 'top', marginBottom: 16,
  },
  // Schedule tracker styles
  scheduleSummary: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16 },
  scheduleSummaryText: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  scheduleEmpty: { alignItems: 'center', paddingVertical: 40 },
  scheduleEmptyText: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
  scheduleSlot: { flexDirection: 'row', marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#2563EB', paddingLeft: 12 },
  scheduleTimeCol: { width: 80 },
  scheduleTime: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  scheduleInfoCol: { flex: 1 },
  scheduleCountBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: '#EFF6FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  scheduleCountText: { fontSize: 11, fontWeight: '700', color: '#2563EB' },
  schedulePatient: { fontSize: 12, color: '#64748B', marginTop: 2 },
});
