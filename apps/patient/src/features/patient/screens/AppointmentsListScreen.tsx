import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, RAZORPAY_KEY } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { AppointmentStackParamList } from '../../../../../../packages/core/src/types';
import { EmptyState, RazorpayWebCheckout } from '../../../../../../packages/shared/src/components';
import { supabase } from '../../../../../../packages/supabase/src/client';

type Nav = NativeStackNavigationProp<AppointmentStackParamList, 'AppointmentsList'>;

const SECTION_TABS = ['Doctors', 'Lab Tests'] as const;
const TABS = ['Pending', 'Approved', 'Confirmed', 'Completed', 'Cancelled'];

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  Pending:   { bg: '#FEF3C7', text: '#92400E', icon: 'time-outline', label: 'Pending' },
  Approved:  { bg: '#DBEAFE', text: '#1E40AF', icon: 'checkmark-circle-outline', label: 'Approved' },
  Confirmed: { bg: '#D1FAE5', text: '#047857', icon: 'checkmark-circle', label: 'Confirmed' },
  Completed: { bg: '#E0E7FF', text: '#4338CA', icon: 'ribbon', label: 'Completed' },
  Cancelled: { bg: '#FEE2E2', text: '#B91C1C', icon: 'close-circle', label: 'Cancelled' },
  // Legacy fallback
  Upcoming:  { bg: '#DBEAFE', text: '#1E40AF', icon: 'checkmark-circle-outline', label: 'Upcoming' },
};

export default function AppointmentsListScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [labBookings, setLabBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Pending');
  const [sectionTab, setSectionTab] = useState<typeof SECTION_TABS[number]>('Doctors');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{ visible: boolean; appt: any; fee: number; docName: string }>({
    visible: false, appt: null, fee: 0, docName: '',
  });

  const loadAppointments = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Load doctor appointments
    const { data: rawAppts, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) { console.warn('Appointments load error:', error.message); setLoading(false); return; }

    // Fetch doctor info
    const doctorIds = [...new Set((rawAppts || []).map((a: any) => a.doctor_id))];
    const doctorMap: Record<string, any> = {};
    if (doctorIds.length > 0) {
      const { data: doctors } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, doctor_profile:doctor_profiles(specialization, hospital, consultation_fee)')
        .in('id', doctorIds);
      (doctors || []).forEach((d: any) => { doctorMap[d.id] = d; });
    }

    const enriched = (rawAppts || []).map((a: any) => ({ ...a, doctor: doctorMap[a.doctor_id] || null }));
    setAppointments(enriched);

    // Load lab bookings — two-step: bookings+test, then center info separately
    // (lab_bookings.diagnostics_center_id FK targets profiles, not diagnostics_centers,
    //  so PostgREST can't join diagnostics_centers directly without migration 012)
    const { data: rawBookings } = await supabase
      .from('lab_bookings')
      .select('*, test:lab_tests!lab_test_id(name, category, price)')
      .eq('patient_id', session.user.id)
      .order('created_at', { ascending: false });

    // Fetch center info for each booking
    const bookings = rawBookings || [];
    if (bookings.length > 0) {
      const centerIds = [...new Set(bookings.map((b: any) => b.diagnostics_center_id).filter(Boolean))];
      const centerMap: Record<string, any> = {};
      if (centerIds.length > 0) {
        const { data: centers } = await supabase
          .from('diagnostics_centers')
          .select('id, center_name, address')
          .in('id', centerIds);
        (centers || []).forEach((c: any) => { centerMap[c.id] = c; });
      }
      setLabBookings(bookings.map((b: any) => ({
        ...b,
        center: b.diagnostics_center_id ? (centerMap[b.diagnostics_center_id] || null) : null,
      })));
    } else {
      setLabBookings([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  // Reload when screen is focused (after coming back from detail, booking, etc.)
  useFocusEffect(useCallback(() => { loadAppointments(); }, [loadAppointments]));

  const onRefresh = async () => { setRefreshing(true); await loadAppointments(); setRefreshing(false); };

  const filtered = sectionTab === 'Doctors'
    ? appointments.filter(a => a.status === activeTab)
    : labBookings.filter(b => b.status === activeTab);

  const currentItems = sectionTab === 'Doctors' ? appointments : labBookings;

  const getDocInfo = (appt: any) => {
    const doc = appt.doctor;
    const dp = doc?.doctor_profile;
    const docProfile = Array.isArray(dp) ? dp[0] : dp;
    return {
      name: doc?.full_name || 'Doctor',
      avatar: doc?.avatar_url || `https://ui-avatars.com/api/?name=Dr&background=0066CC&color=fff`,
      specialization: docProfile?.specialization || 'Doctor',
      hospital: docProfile?.hospital || '',
      fee: docProfile?.consultation_fee || 0,
    };
  };

  const handlePayNow = (appt: any) => {
    const docInfo = getDocInfo(appt);
    const fee = appt.payment_amount || docInfo.fee || 500;
    setPaymentModal({ visible: true, appt, fee, docName: docInfo.name });
  };

  const onPaymentSuccess = async (paymentId: string) => {
    const appt = paymentModal.appt;
    setPaymentModal({ visible: false, appt: null, fee: 0, docName: '' });

    await supabase
      .from('appointments')
      .update({ payment_status: 'paid', payment_id: paymentId, status: 'Confirmed' })
      .eq('id', appt.id);

    Alert.alert('Payment Successful', 'Your appointment is now confirmed!');
    loadAppointments();
  };

  const onPaymentCancel = () => {
    setPaymentModal({ visible: false, appt: null, fee: 0, docName: '' });
  };

  const onPaymentError = (error: string) => {
    setPaymentModal({ visible: false, appt: null, fee: 0, docName: '' });
    Alert.alert('Payment Failed', error || 'Please try again.');
  };

  const handleCancel = (appt: any) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await supabase
              .from('appointments')
              .update({ status: 'Cancelled', notes: 'Cancelled by patient' })
              .eq('id', appt.id);
            loadAppointments();
          },
        },
      ],
    );
  };

  const handleCancelLabBooking = (booking: any) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this lab test booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('lab_bookings').update({ status: 'Cancelled' }).eq('id', booking.id);
            loadAppointments();
          },
        },
      ],
    );
  };

  const renderLabBooking = ({ item }: { item: any }) => {
    const test = Array.isArray(item.test) ? item.test[0] : item.test;
    const center = Array.isArray(item.center) ? item.center[0] : item.center;
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
    const isPending = item.status === 'Pending';
    const isApproved = item.status === 'Approved';
    const isHome = item.collection_type === 'home';

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <View style={styles.doctorRow}>
            <View style={[styles.labIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="flask" size={22} color="#7C3AED" />
            </View>
            <View style={styles.doctorInfo}>
              <Text style={[styles.docName, { color: colors.textPrimary }]} numberOfLines={1}>{test?.name || 'Lab Test'}</Text>
              <Text style={styles.spec}>{center?.center_name || 'Diagnostic Center'}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon as any} size={12} color={status.text} />
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.metaGrid}>
          <View style={[styles.metaBox, { backgroundColor: colors.background }]}>
            <Ionicons name="calendar-outline" size={14} color="#7C3AED" />
            <View>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                {new Date(item.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          </View>
          <View style={[styles.metaBox, { backgroundColor: colors.background }]}>
            <Ionicons name="time-outline" size={14} color="#7C3AED" />
            <View>
              <Text style={styles.metaLabel}>Time</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                {item.time && item.time !== 'To be confirmed' ? item.time : 'TBD'}
              </Text>
            </View>
          </View>
          <View style={[styles.metaBox, { backgroundColor: colors.background }]}>
            <Ionicons name={isHome ? 'home-outline' : 'business-outline'} size={14} color="#7C3AED" />
            <View>
              <Text style={styles.metaLabel}>Type</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{isHome ? 'Home' : 'Center'}</Text>
            </View>
          </View>
        </View>

        {isPending && (
          <View style={styles.pendingBanner}>
            <Ionicons name="hourglass-outline" size={14} color="#92400E" />
            <Text style={styles.pendingText}>Waiting for center to confirm date & time</Text>
          </View>
        )}

        {isApproved && (
          <View style={[styles.approvedBanner, { marginTop: SPACING.md }]}>
            <Ionicons name="checkmark-circle" size={16} color="#047857" />
            <Text style={styles.approvedText}>
              Confirmed! Time: {item.time || 'TBD'}. Pay at center.
            </Text>
          </View>
        )}

        {item.status === 'Completed' && (
          <View style={[styles.confirmedBanner, { marginTop: SPACING.md }]}>
            <Ionicons name="checkmark-circle" size={14} color="#047857" />
            <Text style={styles.confirmedText}>Test Completed</Text>
          </View>
        )}

        {(isPending || isApproved) && (
          <TouchableOpacity
            style={styles.cancelLinkRow}
            onPress={() => handleCancelLabBooking(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
            <Text style={styles.cancelLinkText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderAppointment = ({ item }: { item: any }) => {
    const docInfo = getDocInfo(item);
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.Pending;
    const fee = item.payment_amount || docInfo.fee || 0;
    const isApproved = item.status === 'Approved';
    const isConfirmed = item.status === 'Confirmed';
    const isPending = item.status === 'Pending';
    const isVideo = item.type === 'video';

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
        activeOpacity={0.8}
      >
        {/* Header: Doctor + Status */}
        <View style={styles.cardHeader}>
          <View style={styles.doctorRow}>
            <Image
              source={{ uri: docInfo.avatar }}
              style={styles.avatar}
            />
            <View style={styles.doctorInfo}>
              <Text style={[styles.docName, { color: colors.textPrimary }]} numberOfLines={1}>{docInfo.name}</Text>
              <Text style={styles.spec}>{docInfo.specialization}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon as any} size={12} color={status.text} />
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.metaGrid}>
          <View style={[styles.metaBox, { backgroundColor: colors.background }]}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
            <View>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                {new Date(item.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          </View>
          <View style={[styles.metaBox, { backgroundColor: colors.background }]}>
            <Ionicons name="time-outline" size={14} color={COLORS.primary} />
            <View>
              <Text style={styles.metaLabel}>Time</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                {item.time && item.time !== 'To be confirmed' ? item.time : 'TBD'}
              </Text>
            </View>
          </View>
          <View style={[styles.metaBox, { backgroundColor: colors.background }]}>
            <Ionicons name={isVideo ? 'videocam-outline' : 'business-outline'} size={14} color={COLORS.primary} />
            <View>
              <Text style={styles.metaLabel}>Type</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{isVideo ? 'Video' : 'Clinic'}</Text>
            </View>
          </View>
        </View>

        {/* Pending */}
        {isPending && (
          <View style={styles.pendingBanner}>
            <Ionicons name="hourglass-outline" size={14} color="#92400E" />
            <Text style={styles.pendingText}>Waiting for doctor to confirm date & time</Text>
          </View>
        )}

        {/* Approved — Show Pay Now + Cancel */}
        {isApproved && (
          <View style={styles.actionSection}>
            <View style={styles.approvedBanner}>
              <Ionicons name="checkmark-circle" size={16} color="#047857" />
              <Text style={styles.approvedText}>
                Doctor approved! Time: {item.time || 'TBD'}. Please pay to confirm.
              </Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>Consultation Fee</Text>
              <Text style={styles.feeValue}>₹{fee}</Text>
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.payNowBtn}
                onPress={() => handlePayNow(item)}
                disabled={payingId === item.id}
                activeOpacity={0.85}
              >
                {payingId === item.id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="card-outline" size={16} color="#fff" />
                    <Text style={styles.payNowBtnText}>Pay Now ₹{fee}</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancel(item)}
                activeOpacity={0.85}
              >
                <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Confirmed */}
        {isConfirmed && (
          <View style={styles.confirmedBanner}>
            <Ionicons name="checkmark-circle" size={14} color="#047857" />
            <Text style={styles.confirmedText}>Payment Done - Appointment Confirmed</Text>
          </View>
        )}

        {/* Pending - show cancel option */}
        {isPending && (
          <TouchableOpacity
            style={styles.cancelLinkRow}
            onPress={() => handleCancel(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle-outline" size={14} color="#DC2626" />
            <Text style={styles.cancelLinkText}>Cancel Request</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My Appointments</Text>
      </View>

      {/* Section Toggle: Doctors / Lab Tests */}
      <View style={styles.sectionToggle}>
        {SECTION_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.sectionBtn, sectionTab === tab && styles.sectionBtnActive]}
            onPress={() => { setSectionTab(tab); setActiveTab('Pending'); }}
          >
            <Ionicons
              name={tab === 'Doctors' ? 'medkit-outline' : 'flask-outline'}
              size={14}
              color={sectionTab === tab ? '#fff' : '#64748B'}
            />
            <Text style={[styles.sectionBtnText, sectionTab === tab && styles.sectionBtnTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status Tabs */}
      <View style={{ paddingVertical: SPACING.sm }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TABS}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: SPACING.base, gap: SPACING.sm }}
          renderItem={({ item: tab }) => {
            const isActive = activeTab === tab;
            const count = currentItems.filter((a: any) => a.status === tab).length;
            return (
              <TouchableOpacity
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, { color: colors.textTertiary }, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabCount, isActive && styles.tabCountActive]}>
                    <Text style={[styles.tabCountText, isActive && { color: '#fff' }]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <Text style={[styles.count, { color: colors.textTertiary }]}>
        {filtered.length} {filtered.length === 1 ? 'appointment' : 'appointments'}
      </Text>

      {filtered.length === 0 ? (
        <View style={{ flex: 1 }}>
          <EmptyState
            icon={sectionTab === 'Lab Tests' ? 'flask-outline' : 'calendar-outline'}
            title={`No ${activeTab.toLowerCase()} ${sectionTab === 'Lab Tests' ? 'lab bookings' : 'appointments'}`}
            subtitle={sectionTab === 'Lab Tests' ? 'Book a lab test from the home screen' : 'Book an appointment with a doctor'}
            actionLabel={sectionTab === 'Lab Tests' ? 'Browse Tests' : 'Find Doctors'}
            onAction={() => {}}
          />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={sectionTab === 'Lab Tests' ? renderLabBooking : renderAppointment}
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
      {/* Razorpay Payment Modal */}
      <Modal visible={paymentModal.visible} animationType="slide" onRequestClose={onPaymentCancel}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
          <RazorpayWebCheckout
            amount={paymentModal.fee}
            razorpayKey={RAZORPAY_KEY}
            name="PulseCare"
            description={`Consultation with ${paymentModal.docName}`}
            themeColor={COLORS.primary}
            onSuccess={onPaymentSuccess}
            onCancel={onPaymentCancel}
            onError={onPaymentError}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.md },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  sectionToggle: {
    flexDirection: 'row', marginHorizontal: SPACING.base, gap: SPACING.sm,
    backgroundColor: '#F1F5F9', borderRadius: BORDER_RADIUS.md, padding: 3,
  },
  sectionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 8, borderRadius: BORDER_RADIUS.sm,
  },
  sectionBtnActive: { backgroundColor: COLORS.primary },
  sectionBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#64748B' },
  sectionBtnTextActive: { color: '#fff' },
  labIcon: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#F1F5F9',
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  tabCount: { backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  tabCountActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  tabCountText: { fontSize: 10, fontWeight: '700', color: '#64748B' },
  count: { fontSize: FONT_SIZES.xs, fontWeight: '500', paddingHorizontal: SPACING.base, marginBottom: SPACING.sm },
  list: { paddingHorizontal: SPACING.base, gap: SPACING.md, paddingBottom: 30 },
  card: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.base },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  doctorInfo: { flex: 1 },
  docName: { fontSize: FONT_SIZES.md, fontWeight: '700', marginBottom: 2 },
  spec: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: BORDER_RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  divider: { height: 1, marginVertical: SPACING.md },
  metaGrid: { flexDirection: 'row', gap: SPACING.sm },
  metaBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: BORDER_RADIUS.md, padding: SPACING.sm },
  metaLabel: { fontSize: 9, fontWeight: '500', color: COLORS.textTertiary, textTransform: 'uppercase' },
  metaValue: { fontSize: FONT_SIZES.xs, fontWeight: '700', marginTop: 1 },
  pendingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.md,
    backgroundColor: '#FEF3C7', borderRadius: BORDER_RADIUS.md, padding: SPACING.sm,
  },
  pendingText: { fontSize: FONT_SIZES.xs, color: '#92400E', fontWeight: '500', flex: 1 },
  actionSection: { marginTop: SPACING.md },
  approvedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: '#D1FAE5', borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm,
  },
  approvedText: { fontSize: FONT_SIZES.xs, color: '#047857', fontWeight: '600', flex: 1 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  feeLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  feeValue: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.primary },
  btnRow: { flexDirection: 'row', gap: SPACING.sm },
  payNowBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingVertical: 12,
  },
  payNowBtnText: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
  cancelBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: '#FEE2E2', borderRadius: BORDER_RADIUS.md, paddingVertical: 12,
  },
  cancelBtnText: { color: '#DC2626', fontSize: FONT_SIZES.sm, fontWeight: '700' },
  cancelLinkRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    marginTop: SPACING.sm, paddingVertical: 6,
  },
  cancelLinkText: { fontSize: FONT_SIZES.xs, color: '#DC2626', fontWeight: '600' },
  confirmedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.md,
    backgroundColor: '#D1FAE5', borderRadius: BORDER_RADIUS.md, padding: SPACING.sm,
  },
  confirmedText: { fontSize: FONT_SIZES.xs, color: '#047857', fontWeight: '600', flex: 1 },
});
