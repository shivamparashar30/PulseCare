import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useDoctor } from '../../hooks';
import { DoctorsStackParamList } from '../../types';
import { Button } from '../../components/common';

type Nav = NativeStackNavigationProp<DoctorsStackParamList, 'AppointmentSuccess'>;
type Route = RouteProp<DoctorsStackParamList, 'AppointmentSuccess'>;

export default function AppointmentSuccessScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { doctorId, date, time, visitType, fee, paymentId, orderId } = route.params;
  const { data: doctor } = useDoctor(doctorId);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Success animation placeholder */}
        <View style={styles.successCircle}>
          <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
        </View>
        <Text style={styles.title}>Appointment Booked!</Text>
        <Text style={styles.subtitle}>
          Your appointment has been confirmed. You will receive a reminder 1 hour before.
        </Text>

        {/* Appointment details */}
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Appointment Details</Text>
          <View style={styles.divider} />
          {[
            { icon: 'person-outline', label: 'Doctor', value: doctor?.name ?? '...' },
            { icon: 'medical-outline', label: 'Specialization', value: doctor?.specialization ?? '...' },
            { icon: 'business-outline', label: 'Hospital', value: doctor?.hospital ?? '...' },
            { icon: 'calendar-outline', label: 'Date', value: new Date(date).toDateString() },
            { icon: 'time-outline', label: 'Time', value: time },
            {
              icon: 'videocam-outline',
              label: 'Consultation Type',
              value: visitType === 'video' ? 'Video Consultation' : 'Clinic Visit',
            },
          ].map(({ icon, label, value }) => (
            <View key={label} style={styles.detailRow}>
              <Ionicons name={icon as any} size={16} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Payment details */}
        <View style={styles.payCard}>
          <Text style={styles.cardTitle}>Payment Details</Text>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Ionicons name="wallet-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailLabel}>Amount Paid</Text>
            <Text style={[styles.detailValue, { color: COLORS.primary, fontWeight: '800' }]}>₹{fee}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="receipt-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailLabel}>Payment ID</Text>
            <Text style={[styles.detailValue, { fontSize: FONT_SIZES.xs }]}>{paymentId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="document-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailLabel}>Order ID</Text>
            <Text style={[styles.detailValue, { fontSize: FONT_SIZES.xs }]}>{orderId}</Text>
          </View>
          <View style={styles.successBadge}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.success} />
            <Text style={styles.successBadgeText}>Payment Successful</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Instructions</Text>
          {[
            'Please arrive 10 minutes before your scheduled time',
            'Carry your ID proof and any previous prescriptions',
            'You will receive a confirmation SMS/email shortly',
            'You can reschedule up to 2 hours before the appointment',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            title="View My Appointments"
            onPress={() => navigation.navigate('DoctorsList' as any)}
            variant="primary"
          />
          <Button
            title="Go to Home"
            onPress={() => navigation.navigate('DoctorsList' as any)}
            variant="outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.md, alignItems: 'center', paddingBottom: SPACING.xl },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  detailCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    marginBottom: SPACING.md,
  },
  payCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    marginBottom: SPACING.md,
  },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 10,
  },
  detailLabel: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  detailValue: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600', textAlign: 'right', maxWidth: '55%' },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
  },
  successBadgeText: { fontSize: FONT_SIZES.xs, color: '#166534', fontWeight: '700' },
  infoCard: {
    width: '100%',
    backgroundColor: '#eff6ff',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.sm },
  tipRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: 8 },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  tipText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  actions: { width: '100%', gap: SPACING.sm },
});
