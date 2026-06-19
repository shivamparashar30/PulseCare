import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, RAZORPAY_KEY } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { AppointmentStackParamList } from '../../../../../../packages/core/src/types';
import { RazorpayWebCheckout } from '../../../../../../packages/shared/src/components';
import { supabase } from '../../../../../../packages/supabase/src/client';

type Nav = NativeStackNavigationProp<AppointmentStackParamList, 'AppointmentDetail'>;
type Route = RouteProp<AppointmentStackParamList, 'AppointmentDetail'>;

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string; label: string; sub: string }> = {
  Pending:   { bg: '#FEF3C7', text: '#92400E', icon: 'time-outline', label: 'Pending Approval', sub: 'Waiting for doctor to confirm date & time' },
  Approved:  { bg: '#DBEAFE', text: '#1E40AF', icon: 'checkmark-circle-outline', label: 'Approved', sub: 'Doctor approved! Please pay to confirm your appointment' },
  Confirmed: { bg: '#D1FAE5', text: '#047857', icon: 'checkmark-circle', label: 'Confirmed', sub: 'Payment done. Your appointment is confirmed!' },
  Completed: { bg: '#E0E7FF', text: '#4338CA', icon: 'ribbon', label: 'Completed', sub: 'Appointment completed successfully' },
  Cancelled: { bg: '#FEE2E2', text: '#B91C1C', icon: 'close-circle', label: 'Cancelled', sub: 'This appointment was cancelled' },
  Upcoming:  { bg: '#DBEAFE', text: '#1E40AF', icon: 'checkmark-circle-outline', label: 'Upcoming', sub: 'Appointment is upcoming' },
};

export default function AppointmentDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const { appointmentId } = route.params;
  const [appt, setAppt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);

  const load = useCallback(async () => {
    const { data: apptData, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();
    if (error || !apptData) { console.warn('Appointment detail error:', error?.message); setLoading(false); return; }

    // Fetch doctor info
    const { data: docData } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, doctor_profile:doctor_profiles(specialization, hospital, consultation_fee)')
      .eq('id', apptData.doctor_id)
      .single();

    setAppt({ ...apptData, doctor: docData || null });
    setLoading(false);
  }, [appointmentId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }
  if (!appt) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={{ color: colors.textSecondary }}>Appointment not found</Text></View>;
  }

  const doc = appt.doctor;
  const dp = doc?.doctor_profile;
  const docProfile = Array.isArray(dp) ? dp[0] : dp;
  const docName = doc?.full_name || 'Doctor';
  const docAvatar = doc?.avatar_url || `https://ui-avatars.com/api/?name=Dr&background=0066CC&color=fff`;
  const docSpec = docProfile?.specialization || 'Doctor';
  const docHosp = docProfile?.hospital || '';
  const status = STATUS_CONFIG[appt.status] || STATUS_CONFIG.Pending;
  const fee = appt.payment_amount || docProfile?.consultation_fee || 0;
  const isApproved = appt.status === 'Approved';
  const isConfirmed = appt.status === 'Confirmed';
  const isPending = appt.status === 'Pending';
  const isVideo = appt.type === 'video';

  const handlePayNow = () => {
    setPaymentVisible(true);
  };

  const onPaymentSuccess = async (paymentId: string) => {
    setPaymentVisible(false);
    await supabase
      .from('appointments')
      .update({ payment_status: 'paid', payment_id: paymentId, status: 'Confirmed' })
      .eq('id', appt.id);
    Alert.alert('Payment Successful', 'Your appointment is now confirmed!');
    load();
  };

  const onPaymentCancel = () => {
    setPaymentVisible(false);
  };

  const onPaymentError = (error: string) => {
    setPaymentVisible(false);
    Alert.alert('Payment Failed', error || 'Please try again.');
  };

  const handleCancel = () => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('appointments').update({ status: 'Cancelled', notes: 'Cancelled by patient' }).eq('id', appt.id);
          load();
        },
      },
    ]);
  };

  const showPaymentBar = isApproved;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Appointment Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: showPaymentBar ? 140 : 40 }}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: status.bg }]}>
          <View style={[styles.statusIconCircle, { backgroundColor: status.text + '20' }]}>
            <Ionicons name={status.icon as any} size={22} color={status.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusLabel, { color: status.text }]}>{status.label}</Text>
            <Text style={[styles.statusSub, { color: status.text + 'BB' }]}>{status.sub}</Text>
          </View>
        </View>

        {/* Doctor Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.doctorRow}>
            <Image
              source={{ uri: docAvatar }}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.docName, { color: colors.textPrimary }]}>{docName}</Text>
              <Text style={styles.docSpec}>{docSpec}</Text>
              <Text style={styles.docHosp}>{docHosp}</Text>
            </View>
          </View>
        </View>

        {/* Appointment Info */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Appointment Info</Text>
          {[
            { icon: 'calendar-outline', label: 'Date', value: new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }), color: '#7c3aed' },
            { icon: 'time-outline', label: 'Time', value: appt.time && appt.time !== 'To be confirmed' ? appt.time : 'To be confirmed', color: '#0891b2' },
            { icon: isVideo ? 'videocam-outline' : 'business-outline', label: 'Type', value: isVideo ? 'Video Consultation' : 'Clinic Visit', color: '#0066CC' },
            { icon: 'receipt-outline', label: 'Booking ID', value: appt.id.slice(0, 8).toUpperCase(), color: '#6b7280' },
          ].map(({ icon, label, value, color }, i) => (
            <View key={label} style={[styles.infoRow, i > 0 && { borderTopWidth: 1, borderTopColor: COLORS.divider }]}>
              <View style={[styles.infoIconBox, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon as any} size={16} color={color} />
              </View>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Symptoms */}
        {appt.symptoms && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Symptoms</Text>
            <Text style={styles.symptomsText}>{appt.symptoms}</Text>
          </View>
        )}

        {/* Payment Summary */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Payment</Text>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Consultation Fee</Text>
            <Text style={styles.payAmount}>₹{fee}</Text>
          </View>
          {appt.payment_status === 'paid' && (
            <View style={styles.paidBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#047857" />
              <Text style={styles.paidText}>Paid Online{appt.payment_id ? ` - ${appt.payment_id}` : ''}</Text>
            </View>
          )}
          {appt.payment_status === 'pending' && !isPending && (
            <View style={[styles.paidBadge, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="alert-circle-outline" size={14} color="#92400E" />
              <Text style={[styles.paidText, { color: '#92400E' }]}>Payment Pending</Text>
            </View>
          )}
        </View>

        {/* Chat button for Confirmed appointments */}
        {isConfirmed && (
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => (navigation as any).navigate('AppointmentChat', { appointmentId: appt.id, doctorName: docName })}
            activeOpacity={0.85}
          >
            <View style={styles.chatBtnIcon}>
              <Ionicons name="chatbubbles" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chatBtnTitle}>Chat with Doctor</Text>
              <Text style={styles.chatBtnSub}>Send messages to {docName}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Notes from doctor */}
        {appt.notes && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Doctor's Note</Text>
            <Text style={styles.symptomsText}>{appt.notes}</Text>
          </View>
        )}

        {/* Cancel link for Pending */}
        {isPending && (
          <TouchableOpacity style={styles.cancelLink} onPress={handleCancel} activeOpacity={0.7}>
            <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
            <Text style={styles.cancelLinkText}>Cancel Appointment Request</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Bottom payment bar for Approved status */}
      {showPaymentBar && (
        <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: colors.card }]}>
          <View>
            <Text style={styles.footerLabel}>Amount</Text>
            <Text style={styles.footerAmount}>₹{fee}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: SPACING.sm, flex: 1 }}>
            <TouchableOpacity style={[styles.footerPayBtn, { flex: 2 }]} onPress={handlePayNow} disabled={paying} activeOpacity={0.85}>
              {paying ? <ActivityIndicator size="small" color="#fff" /> : (
                <>
                  <Ionicons name="card-outline" size={16} color="#fff" />
                  <Text style={styles.footerPayText}>Pay Now</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerCancelBtn, { flex: 1 }]} onPress={handleCancel} activeOpacity={0.85}>
              <Text style={styles.footerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}

      {/* Razorpay Payment Modal */}
      <Modal visible={paymentVisible} animationType="slide" onRequestClose={onPaymentCancel}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
          <RazorpayWebCheckout
            amount={fee}
            razorpayKey={RAZORPAY_KEY}
            name="PulseCare"
            description={`Consultation with ${docName}`}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    marginHorizontal: SPACING.base, marginVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.base,
  },
  statusIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  statusLabel: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  statusSub: { fontSize: FONT_SIZES.xs, marginTop: 2 },
  card: { marginHorizontal: SPACING.base, marginBottom: SPACING.md, borderRadius: BORDER_RADIUS.lg, padding: SPACING.base },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', marginBottom: SPACING.md },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  docName: { fontSize: FONT_SIZES.base, fontWeight: '700', marginBottom: 2 },
  docSpec: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '600' },
  docHosp: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: 10 },
  infoIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: FONT_SIZES.xs, fontWeight: '500', color: COLORS.textTertiary, width: 70 },
  infoValue: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '600', textAlign: 'right' },
  symptomsText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  payLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  payAmount: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.primary },
  paidBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#D1FAE5', borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: 8,
  },
  paidText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#047857', flex: 1 },
  chatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    marginHorizontal: SPACING.base, marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.base,
    backgroundColor: COLORS.primary,
  },
  chatBtnIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  chatBtnTitle: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },
  chatBtnSub: { color: 'rgba(255,255,255,0.7)', fontSize: FONT_SIZES.xs, marginTop: 1 },
  cancelLink: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginHorizontal: SPACING.base, marginTop: SPACING.sm, paddingVertical: SPACING.md,
  },
  cancelLinkText: { fontSize: FONT_SIZES.md, color: '#DC2626', fontWeight: '600' },
  footer: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.base, paddingTop: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  footerLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  footerAmount: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  footerPayBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingVertical: 14, paddingHorizontal: 20,
  },
  footerPayText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },
  footerCancelBtn: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FEE2E2', borderRadius: BORDER_RADIUS.md, paddingVertical: 14,
  },
  footerCancelText: { color: '#DC2626', fontSize: FONT_SIZES.md, fontWeight: '700' },
});
