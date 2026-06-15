import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { useAppointment } from '../../../../../../packages/core/src/hooks';
import { AppointmentStackParamList } from '../../../../../../packages/core/src/types';
import { StarRating } from '../../../../../../packages/shared/src/components';
import { formatDate } from '../../../../../../packages/core/src/utils';

type Nav = NativeStackNavigationProp<AppointmentStackParamList, 'AppointmentDetail'>;
type Route = RouteProp<AppointmentStackParamList, 'AppointmentDetail'>;

const STATUS_CONFIG: Record<string, { bg: string[]; text: string; icon: string; label: string }> = {
  upcoming: { bg: ['#EEF2FF', '#E0E7FF'], text: '#4338CA', icon: 'time-outline', label: 'Upcoming' },
  confirmed: { bg: ['#EEF2FF', '#E0E7FF'], text: '#4338CA', icon: 'time-outline', label: 'Confirmed' },
  completed: { bg: ['#ECFDF5', '#D1FAE5'], text: '#047857', icon: 'checkmark-circle', label: 'Completed' },
  cancelled: { bg: ['#FEF2F2', '#FEE2E2'], text: '#B91C1C', icon: 'close-circle', label: 'Cancelled' },
};

export default function AppointmentDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const { appointmentId } = route.params;
  const { data: appt, isLoading } = useAppointment(appointmentId);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  if (!appt) return null;

  const status = STATUS_CONFIG[appt.status.toLowerCase()] ?? STATUS_CONFIG.upcoming;
  const isUpcoming = appt.status.toLowerCase() === 'upcoming' || appt.status.toLowerCase() === 'confirmed';
  const isCompleted = appt.status.toLowerCase() === 'completed';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Appointment Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Status Banner */}
        <LinearGradient colors={status.bg as [string, string]} style={styles.statusBanner}>
          <View style={[styles.statusIconCircle, { backgroundColor: status.text + '15' }]}>
            <Ionicons name={status.icon as any} size={22} color={status.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusLabel, { color: status.text }]}>{status.label}</Text>
            <Text style={[styles.statusSub, { color: status.text + 'AA' }]}>
              {isUpcoming ? 'Your appointment is confirmed' : isCompleted ? 'Appointment completed successfully' : 'This appointment was cancelled'}
            </Text>
          </View>
        </LinearGradient>

        {/* Doctor Card */}
        <View style={[styles.doctorCard, { backgroundColor: colors.card }]}>
          <Image source={{ uri: appt.doctor.avatar }} style={styles.avatar} />
          <View style={styles.doctorInfo}>
            <Text style={[styles.docName, { color: colors.textPrimary }]}>{appt.doctor.name}</Text>
            <Text style={styles.docSpec}>{appt.doctor.specialization}</Text>
            <View style={styles.ratingRow}>
              <StarRating rating={appt.doctor.rating} size={13} />
              <Text style={[styles.reviewCount, { color: colors.textTertiary }]}>({appt.doctor.reviewCount})</Text>
            </View>
          </View>
          {isUpcoming && (
            <TouchableOpacity style={styles.callIconBtn}>
              <Ionicons name="call" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Appointment Details */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Appointment Info</Text>
          {[
            { icon: 'calendar-outline', label: 'Date', value: formatDate(appt.date), color: '#7c3aed' },
            { icon: 'time-outline', label: 'Time', value: appt.time, color: '#0891b2' },
            { icon: 'business-outline', label: 'Hospital', value: appt.doctor.hospital, color: '#059669' },
            { icon: 'videocam-outline', label: 'Type', value: appt.type === 'Video' ? 'Video Consultation' : 'In-Clinic Visit', color: '#0066CC' },
            { icon: 'receipt-outline', label: 'Booking ID', value: appt.id.toUpperCase(), color: '#6b7280' },
          ].map(({ icon, label, value, color }, index) => (
            <View key={label} style={[styles.infoRow, index > 0 && [styles.infoRowBorder, { borderTopColor: colors.border }]]}>
              <View style={[styles.infoIconBox, { backgroundColor: color + '12' }]}>
                <Ionicons name={icon as any} size={16} color={color} />
              </View>
              <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>{label}</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]} numberOfLines={1}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Payment */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Payment Summary</Text>
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>Consultation Fee</Text>
            <Text style={[styles.paymentValue, { color: colors.textPrimary }]}>₹{appt.amount}</Text>
          </View>
          <View style={[styles.paymentDivider, { backgroundColor: colors.border }]} />
          <View style={styles.paymentRow}>
            <Text style={[styles.paymentLabel, { color: colors.textPrimary, fontWeight: '700' }]}>Total Paid</Text>
            <Text style={styles.paymentTotal}>₹{appt.amount}</Text>
          </View>
          <View style={styles.paidBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#047857" />
            <Text style={styles.paidBadgeText}>Payment Successful</Text>
          </View>
        </View>

        {/* Prescription */}
        {isCompleted && appt.prescription && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardTitleRow}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Prescription</Text>
              <TouchableOpacity>
                <Ionicons name="download-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            {appt.prescription.medicines.map((med: any, i: number) => (
              <View key={i} style={[styles.medItem, { backgroundColor: colors.background }]}>
                <View style={styles.medPill}>
                  <Ionicons name="medical" size={14} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.medName, { color: colors.textPrimary }]}>{med.name}</Text>
                  <Text style={[styles.medDosage, { color: colors.textSecondary }]}>{med.dosage} · {med.duration}</Text>
                  {med.instructions && (
                    <Text style={[styles.medInstructions, { color: colors.textTertiary }]}>{med.instructions}</Text>
                  )}
                </View>
              </View>
            ))}
            {appt.prescription.notes && (
              <View style={[styles.notesBox, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}>
                <Ionicons name="chatbubble-ellipses-outline" size={14} color="#92400E" />
                <Text style={styles.notesText}>{appt.prescription.notes}</Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        {isUpcoming && (
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.primaryAction} activeOpacity={0.85}>
              <Ionicons name="videocam" size={18} color="#fff" />
              <Text style={styles.primaryActionText}>Join Video Call</Text>
            </TouchableOpacity>
            <View style={styles.secondaryActions}>
              <TouchableOpacity style={[styles.secondaryAction, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="swap-horizontal-outline" size={16} color={COLORS.primary} />
                <Text style={styles.secondaryActionText}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryAction, { backgroundColor: colors.card, borderColor: '#fecaca' }]}>
                <Ionicons name="close-circle-outline" size={16} color={COLORS.error} />
                <Text style={[styles.secondaryActionText, { color: COLORS.error }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
  },
  statusIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  statusSub: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    ...SHADOWS.sm,
    gap: SPACING.md,
  },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  doctorInfo: { flex: 1 },
  docName: { fontSize: FONT_SIZES.base, fontWeight: '700', marginBottom: 2 },
  docSpec: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '600', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewCount: { fontSize: FONT_SIZES.xs },
  callIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    ...SHADOWS.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: 10,
  },
  infoRowBorder: {
    borderTopWidth: 1,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    width: 70,
  },
  infoValue: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    textAlign: 'right',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  paymentLabel: {
    fontSize: FONT_SIZES.sm,
  },
  paymentValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  paymentDivider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  paymentTotal: {
    fontSize: FONT_SIZES.base,
    fontWeight: '800',
    color: COLORS.primary,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  paidBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: '#047857',
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  medPill: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primaryUltraLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  medDosage: {
    fontSize: FONT_SIZES.xs,
  },
  medInstructions: {
    fontSize: 10,
    marginTop: 2,
    fontStyle: 'italic',
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    marginTop: SPACING.xs,
  },
  notesText: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: '#92400E',
    lineHeight: 18,
  },
  actionsSection: {
    paddingHorizontal: SPACING.base,
    gap: SPACING.sm,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
  },
  primaryActionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 12,
  },
  secondaryActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
