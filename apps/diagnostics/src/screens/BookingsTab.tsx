import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Image,
  TouchableOpacity, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import ChatScreen from '../../../../packages/shared/src/components/ChatScreen';

interface Props { profile: any; }

const FILTERS = ['All', 'Pending', 'Approved', 'Completed', 'Cancelled'] as const;
type Filter = typeof FILTERS[number];

const TIME_SLOTS = [
  '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM',
];

const STATUS_COLORS: Record<string, string> = {
  Pending: '#D97706',
  Approved: '#7C3AED',
  Completed: '#059669',
  Cancelled: '#DC2626',
};

export default function BookingsTab({ profile }: Props) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<Filter>('All');
  const [refreshing, setRefreshing] = useState(false);

  // Chat modal state
  const [chatModal, setChatModal] = useState(false);
  const [chatBookingId, setChatBookingId] = useState('');
  const [chatPatientName, setChatPatientName] = useState('');

  // Accept modal state
  const [acceptModal, setAcceptModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const load = useCallback(async () => {
    const userId = profile?.id;
    if (!userId) return;

    const { data } = await supabase
      .from('lab_bookings')
      .select('*, test:lab_tests!lab_test_id(name, category, price), patient:profiles!patient_id(full_name, avatar_url, phone)')
      .eq('diagnostics_center_id', userId)
      .order('created_at', { ascending: false });

    setBookings(data || []);
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = filter === 'All' ? bookings : bookings.filter(b => b.status === filter);

  const openAcceptModal = (booking: any) => {
    setSelectedBooking(booking);
    setSelectedDate(booking.date || '');
    setSelectedTime('');
    setAcceptModal(true);
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

    return (
      <View key={booking.id} style={styles.card}>
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

        {/* Test info */}
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

        {/* Pending - Accept/Reject */}
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

        {/* Approved - waiting for patient visit / payment at center */}
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
      <Text style={styles.title}>Bookings</Text>

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

      {/* Accept Modal */}
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
                  onPress={() => setSelectedDate(d)}
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

            <Text style={styles.modalLabel}>Select Time Slot</Text>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.timeChip, selectedTime === t && styles.timeChipActive]}
                  onPress={() => setSelectedTime(t)}
                >
                  <Text style={[styles.timeChipText, selectedTime === t && { color: '#fff' }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleAccept}>
              <Text style={styles.confirmBtnText}>Approve Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  title: { fontSize: 22, fontWeight: '800', color: '#1E293B', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
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
  timeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F1F5F9' },
  timeChipActive: { backgroundColor: '#7C3AED' },
  timeChipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  confirmBtn: { backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
