import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../../../../../packages/core/src/constants';
import { useDoctor } from '../../../../../../packages/core/src/hooks';
import { DoctorStackParamList } from '../../../../../../packages/core/src/types';

type Nav = NativeStackNavigationProp<DoctorStackParamList, 'AppointmentSuccess'>;
type Route = RouteProp<DoctorStackParamList, 'AppointmentSuccess'>;

const AUTO_REDIRECT_SECONDS = 30;

export default function AppointmentSuccessScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { doctorId, date, visitType, fee } = route.params;
  const { data: doctor } = useDoctor(doctorId);
  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Reset Doctor stack then navigate to Home tab
          setTimeout(() => {
            navigation.popToTop();
            navigation.getParent()?.navigate('Home');
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Success animation area */}
        <View style={styles.successArea}>
          <View style={styles.successCircleOuter}>
            <View style={styles.successCircleInner}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
          </View>
          <Text style={styles.title}>Request Submitted!</Text>
          <Text style={styles.subtitle}>
            Your appointment request has been sent to the doctor. Once approved, you can pay to confirm your appointment.
          </Text>
        </View>

        {/* Request Details */}
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Request Details</Text>
          {[
            { icon: 'person-outline', label: 'Doctor', value: doctor?.name ?? '...' },
            { icon: 'medical-outline', label: 'Specialization', value: doctor?.specialization ?? '...' },
            { icon: 'business-outline', label: 'Hospital', value: doctor?.hospital ?? '...' },
            { icon: 'calendar-outline', label: 'Preferred Date', value: new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) },
            { icon: visitType === 'video' ? 'videocam-outline' : 'business-outline', label: 'Type', value: visitType === 'video' ? 'Video Consultation' : 'Clinic Visit' },
            { icon: 'cash-outline', label: 'Fee', value: `₹${fee}`, highlight: true },
          ].map(({ icon, label, value, highlight }) => (
            <View key={label} style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name={icon as any} size={14} color={COLORS.primary} />
              </View>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={[styles.detailValue, highlight && { color: COLORS.primary, fontWeight: '800' }]}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIconWrap}>
            <Ionicons name="time" size={18} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>Awaiting Confirmation</Text>
            <Text style={styles.statusDesc}>The doctor will review your request and confirm with a specific time slot.</Text>
          </View>
        </View>

        {/* What happens next */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>What happens next?</Text>
          {[
            'The doctor will review your request',
            'They will set a confirmed date & time slot',
            'You\'ll see "Pay Now" button once approved',
            'After payment, your appointment is confirmed!',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipNumWrap}>
                <Text style={styles.tipNum}>{i + 1}</Text>
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Auto-redirect countdown */}
        <View style={styles.countdownBar}>
          <Ionicons name="time-outline" size={14} color="#64748B" />
          <Text style={styles.countdownText}>Redirecting to home in {countdown}s</Text>
        </View>

        {/* Buttons */}
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              navigation.popToTop();
              navigation.getParent()?.navigate('Appointments');
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>View My Appointments</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.popToTop()}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-back" size={18} color={COLORS.primary} />
            <Text style={styles.secondaryBtnText}>Back to Doctors</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.base, paddingBottom: 40 },
  successArea: { alignItems: 'center', paddingTop: SPACING['2xl'], paddingBottom: SPACING.lg },
  successCircleOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successCircleInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 21,
    paddingHorizontal: SPACING.lg,
  },
  detailCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  detailLabel: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  detailValue: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '600' },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    backgroundColor: '#FEF9EE',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  statusIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#92400E' },
  statusDesc: { fontSize: FONT_SIZES.sm, color: '#A16207', marginTop: 3, lineHeight: 19 },
  tipsCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    marginBottom: SPACING.lg,
  },
  tipsTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  tipNumWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipNum: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
  tipText: { flex: 1, fontSize: FONT_SIZES.md, color: COLORS.textSecondary, lineHeight: 20 },
  countdownBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, marginBottom: SPACING.sm,
  },
  countdownText: { fontSize: FONT_SIZES.sm, color: '#64748B' },
  btnGroup: { gap: SPACING.md },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 16,
  },
  primaryBtnText: { color: '#fff', fontSize: FONT_SIZES.base, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primaryUltraLight,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 16,
  },
  secondaryBtnText: { color: COLORS.primary, fontSize: FONT_SIZES.base, fontWeight: '700' },
});
