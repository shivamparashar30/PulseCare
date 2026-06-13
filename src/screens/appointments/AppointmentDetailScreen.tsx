import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useAppointment } from '../../hooks';
import { AppointmentsStackParamList } from '../../types';
import { Button, StarRating } from '../../components/common';
import { formatDate } from '../../utils';

type Nav = NativeStackNavigationProp<AppointmentsStackParamList, 'AppointmentDetail'>;
type Route = RouteProp<AppointmentsStackParamList, 'AppointmentDetail'>;

export default function AppointmentDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { appointmentId } = route.params;
  const { data: appt, isLoading } = useAppointment(appointmentId);

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }
  if (!appt) return null;

  const isUpcoming = appt.status === 'upcoming';
  const isCompleted = appt.status === 'completed';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Doctor card */}
        <View style={styles.doctorCard}>
          <Image source={{ uri: appt.doctor.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.docName}>{appt.doctor.name}</Text>
            <Text style={styles.docSpec}>{appt.doctor.specialization}</Text>
            <StarRating rating={appt.doctor.rating} size={14} showCount reviewCount={appt.doctor.reviewCount} />
          </View>
        </View>

        {/* Status banner */}
        <View style={[styles.statusBanner, {
          backgroundColor: appt.status === 'upcoming' ? '#dbeafe' :
            appt.status === 'completed' ? '#dcfce7' : '#fee2e2'
        }]}>
          <Ionicons
            name={appt.status === 'upcoming' ? 'time-outline' : appt.status === 'completed' ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={appt.status === 'upcoming' ? '#1d4ed8' : appt.status === 'completed' ? '#15803d' : '#dc2626'}
          />
          <Text style={[styles.statusText, {
            color: appt.status === 'upcoming' ? '#1d4ed8' :
              appt.status === 'completed' ? '#15803d' : '#dc2626'
          }]}>
            {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
          </Text>
        </View>

        {/* Appointment info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appointment Info</Text>
          {[
            { icon: 'calendar-outline', label: 'Date', value: formatDate(appt.date) },
            { icon: 'time-outline', label: 'Time', value: appt.time },
            { icon: 'business-outline', label: 'Hospital', value: appt.doctor.hospital },
            { icon: 'videocam-outline', label: 'Type', value: appt.type === 'video' ? 'Video Consultation' : 'Clinic Visit' },
            { icon: 'receipt-outline', label: 'Booking ID', value: appt.id },
          ].map(({ icon, label, value }) => (
            <View key={label} style={styles.infoRow}>
              <Ionicons name={icon as any} size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Payment info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Info</Text>
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.infoLabel}>Amount Paid</Text>
            <Text style={[styles.infoValue, { color: COLORS.primary, fontWeight: '800' }]}>₹{appt.fee}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, { color: COLORS.success }]}>Paid</Text>
          </View>
        </View>

        {/* Prescription (if completed) */}
        {isCompleted && appt.prescription && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Prescription</Text>
            {appt.prescription.medicines.map((med: any, i: number) => (
              <View key={i} style={styles.medRow}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDosage}>{med.dosage} • {med.duration}</Text>
              </View>
            ))}
            <Text style={styles.doctorNotes}>Dr. Notes: {appt.prescription.notes}</Text>
          </View>
        )}

        {/* Actions */}
        {isUpcoming && (
          <View style={styles.actionsCard}>
            <Button title="Join Video Call" onPress={() => {}} variant="primary" />
            <Button title="Reschedule" onPress={() => {}} variant="outline" />
            <Button title="Cancel Appointment" onPress={() => {}} variant="danger" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    gap: SPACING.md,
  },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  docName: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  docSpec: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600', marginBottom: 4 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  statusText: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 8 },
  infoLabel: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  infoValue: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600', textAlign: 'right', maxWidth: '55%' },
  medRow: { marginBottom: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 8 },
  medName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  medDosage: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  doctorNotes: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontStyle: 'italic', marginTop: SPACING.sm },
  actionsCard: {
    margin: SPACING.md,
    gap: SPACING.sm,
  },
});
