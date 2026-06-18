import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useDoctor } from '../../../../../../packages/core/src/hooks';
import { DoctorStackParamList } from '../../../../../../packages/core/src/types';
import { getNextDates } from '../../../../../../packages/core/src/utils';
import { supabase } from '../../../../../../packages/supabase/src/client';

type Nav = NativeStackNavigationProp<DoctorStackParamList, 'BookAppointment'>;
type Route = RouteProp<DoctorStackParamList, 'BookAppointment'>;

const VISIT_TYPES = [
  { id: 'in-person', label: 'Clinic Visit', icon: 'business-outline' },
  { id: 'video', label: 'Video Call', icon: 'videocam-outline' },
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function BookAppointmentScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { doctorId } = route.params;

  const { data: doctor, isLoading } = useDoctor(doctorId);

  const dates = useMemo(() => getNextDates(7), []);
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [visitType, setVisitType] = useState('in-person');
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitRequest = async () => {
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        Alert.alert('Error', 'Please login to book an appointment.');
        return;
      }

      const { data, error } = await supabase.from('appointments').insert({
        patient_id: session.user.id,
        doctor_id: doctorId,
        date: selectedDate,
        time: 'To be confirmed',
        type: visitType,
        status: 'Pending',
        symptoms: symptoms || null,
        payment_amount: doctor?.fees || 0,
        payment_status: 'pending',
      }).select().single();

      if (error) throw error;

      navigation.replace('AppointmentSuccess', {
        doctorId,
        date: selectedDate,
        visitType,
        fee: doctor?.fees || 0,
        appointmentId: data?.id,
      });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit appointment request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !doctor) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <View style={{ width: 38 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Doctor mini card */}
        <View style={styles.doctorCard}>
          <Image source={{ uri: doctor.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.docName}>{doctor.name}</Text>
            <Text style={styles.docSpec}>{doctor.specialization}</Text>
            <View style={styles.docHospRow}>
              <Ionicons name="business-outline" size={11} color={COLORS.textSecondary} />
              <Text style={styles.docHosp}>{doctor.hospital || 'Hospital'}</Text>
            </View>
          </View>
          <View style={styles.feeBadge}>
            <Text style={styles.feeAmount}>₹{doctor.fees}</Text>
            <Text style={styles.feeLabel}>Fee</Text>
          </View>
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerIcon}>
            <Ionicons name="information-circle" size={16} color={COLORS.primary} />
          </View>
          <Text style={styles.infoText}>
            Select your preferred date and submit a request. The doctor will confirm the date and assign a time slot.
          </Text>
        </View>

        {/* Visit type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Type</Text>
          <View style={styles.visitRow}>
            {VISIT_TYPES.map((v) => {
              const active = visitType === v.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[styles.visitCard, active && styles.visitActive]}
                  onPress={() => setVisitType(v.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.visitIconWrap, active && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Ionicons name={v.icon as any} size={20} color={active ? '#fff' : COLORS.primary} />
                  </View>
                  <Text style={[styles.visitLabel, active && { color: '#fff' }]}>{v.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.base }}>
            <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: SPACING.base }}>
              {dates.map((dateStr) => {
                const d = new Date(dateStr + 'T00:00:00');
                const active = selectedDate === dateStr;
                const isToday = dateStr === dates[0];
                return (
                  <TouchableOpacity
                    key={dateStr}
                    style={[styles.dateCard, active && styles.dateCardActive]}
                    onPress={() => setSelectedDate(dateStr)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateDayName, active && { color: 'rgba(255,255,255,0.85)' }]}>
                      {isToday ? 'Today' : DAY_NAMES[d.getDay()]}
                    </Text>
                    <Text style={[styles.dateNum, active && { color: '#fff' }]}>{d.getDate()}</Text>
                    <Text style={[styles.dateMonth, active && { color: 'rgba(255,255,255,0.85)' }]}>
                      {MONTH_NAMES[d.getMonth()]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Symptoms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Symptoms (Optional)</Text>
          <TextInput
            style={styles.symptomsInput}
            value={symptoms}
            onChangeText={setSymptoms}
            placeholder="Describe your symptoms briefly..."
            placeholderTextColor={COLORS.textTertiary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconWrap}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
          <Text style={styles.summaryText}>
            Request for {new Date(selectedDate + 'T00:00:00').toDateString()} {' \u2022 '} {visitType === 'video' ? 'Video Call' : 'Clinic Visit'}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.footerFee}>
          <Text style={styles.totalLabel}>Consultation Fee</Text>
          <Text style={styles.totalValue}>₹{doctor.fees}</Text>
        </View>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSubmitRequest}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="calendar-outline" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Request Appointment</Text>
            </>
          )}
        </TouchableOpacity>
      </SafeAreaView>

      {submitting && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.overlayText}>Submitting request...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerSafe: { backgroundColor: COLORS.card },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.textPrimary },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.base,
    padding: SPACING.base,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: COLORS.primaryUltraLight },
  docName: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.textPrimary },
  docSpec: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600', marginTop: 1 },
  docHospRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  docHosp: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  feeBadge: {
    backgroundColor: COLORS.primaryUltraLight,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  feeAmount: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.primary },
  feeLabel: { fontSize: 10, color: COLORS.primary, fontWeight: '600', marginTop: 1 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.primaryUltraLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight + '30',
  },
  infoBannerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight + '25',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  infoText: { fontSize: FONT_SIZES.sm, color: COLORS.primaryDark, flex: 1, lineHeight: 18 },
  section: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
  visitRow: { flexDirection: 'row', gap: SPACING.md },
  visitCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.base,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    gap: SPACING.sm,
  },
  visitActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  visitIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryUltraLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '600' },
  dateCard: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    minWidth: 62,
  },
  dateCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateDayName: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },
  dateNum: { fontSize: 20, fontWeight: '800', color: COLORS.textPrimary, marginVertical: 2 },
  dateMonth: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  symptomsInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    minHeight: 80,
    backgroundColor: COLORS.background,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.base,
    backgroundColor: COLORS.successLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  summaryIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryText: { fontSize: FONT_SIZES.sm, color: '#166534', fontWeight: '600', flex: 1 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  footerFee: { flex: 0 },
  totalLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  totalValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14,
  },
  submitBtnText: { color: '#fff', fontSize: FONT_SIZES.base, fontWeight: '700' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
    margin: SPACING.xl,
  },
  overlayText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.textPrimary },
});
