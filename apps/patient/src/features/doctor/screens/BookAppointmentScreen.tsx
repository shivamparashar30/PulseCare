import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useDoctor } from '../../../../../../packages/core/src/hooks';
import { DoctorsStackParamList } from '../../../../../../packages/core/src/types';
import { Button } from '../../../../../../packages/shared/src/components';
import { getNextDates } from '../../../../../../packages/core/src/utils';

type Nav = NativeStackNavigationProp<DoctorsStackParamList, 'BookAppointment'>;
type Route = RouteProp<DoctorsStackParamList, 'BookAppointment'>;

const VISIT_TYPES = [
  { id: 'clinic', label: 'Clinic Visit', icon: 'business-outline' },
  { id: 'video', label: 'Video Call', icon: 'videocam-outline' },
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
  '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
  '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM',
];

const BOOKED_SLOTS = ['10:00 AM', '11:30 AM', '03:00 PM', '05:00 PM']; // mock booked

export default function BookAppointmentScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { doctorId } = route.params;

  const { data: doctor, isLoading } = useDoctor(doctorId);

  const dates = useMemo(() => getNextDates(7), []);
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [visitType, setVisitType] = useState('clinic');

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (isLoading || !doctor) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Doctor mini card */}
        <View style={styles.doctorCard}>
          <Image source={{ uri: doctor.avatar }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.docName}>{doctor.name}</Text>
            <Text style={styles.docSpec}>{doctor.specialization}</Text>
            <Text style={styles.docHosp}>{doctor.hospital}</Text>
          </View>
          <View style={styles.feeBadge}>
            <Text style={styles.feeText}>₹{doctor.fees}</Text>
          </View>
        </View>

        {/* Visit type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Type</Text>
          <View style={styles.visitRow}>
            {VISIT_TYPES.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={[styles.visitCard, visitType === v.id && styles.visitActive]}
                onPress={() => setVisitType(v.id)}
              >
                <Ionicons
                  name={v.icon as any}
                  size={22}
                  color={visitType === v.id ? '#fff' : COLORS.primary}
                />
                <Text style={[styles.visitLabel, visitType === v.id && { color: '#fff' }]}>
                  {v.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.md }}>
            <View style={{ flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.md }}>
              {dates.map((dateStr) => {
                const d = new Date(dateStr);
                const isActive = selectedDate === dateStr;
                const isToday = dateStr === dates[0];
                return (
                  <TouchableOpacity
                    key={dateStr}
                    style={[styles.dateCard, isActive && styles.dateCardActive]}
                    onPress={() => { setSelectedDate(dateStr); setSelectedSlot(null); }}
                  >
                    <Text style={[styles.dateDayName, isActive && { color: 'rgba(255,255,255,0.8)' }]}>
                      {isToday ? 'Today' : DAY_NAMES[d.getDay()]}
                    </Text>
                    <Text style={[styles.dateNum, isActive && { color: '#fff' }]}>{d.getDate()}</Text>
                    <Text style={[styles.dateMonth, isActive && { color: 'rgba(255,255,255,0.8)' }]}>
                      {MONTH_NAMES[d.getMonth()]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Time slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time Slot</Text>
          <View style={styles.slotsGrid}>
            {TIME_SLOTS.map((slot) => {
              const booked = BOOKED_SLOTS.includes(slot);
              const active = selectedSlot === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.slotChip,
                    booked && styles.slotBooked,
                    active && styles.slotActive,
                  ]}
                  onPress={() => !booked && setSelectedSlot(slot)}
                  disabled={booked}
                >
                  <Text style={[
                    styles.slotText,
                    booked && styles.slotTextBooked,
                    active && { color: '#fff' },
                  ]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1 }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>Selected</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.border }]} />
              <Text style={styles.legendText}>Booked</Text>
            </View>
          </View>
        </View>

        {/* Summary note */}
        {selectedSlot && (
          <View style={styles.summaryCard}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.summaryText}>
              Appointment on {new Date(selectedDate).toDateString()} at {selectedSlot}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Consultation Fee</Text>
          <Text style={styles.totalValue}>₹{doctor.fees}</Text>
        </View>
        <Button
          title="Proceed to Pay"
          onPress={() =>
            navigation.navigate('AppointmentPayment', {
              doctorId: doctor.id,
              date: selectedDate,
              time: selectedSlot!,
              visitType,
              fee: doctor.fees,
            })
          }
          disabled={!selectedSlot}
          size="md"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
    gap: SPACING.md,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  docName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  docSpec: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '600' },
  docHosp: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  feeBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  feeText: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.primary },
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  visitRow: { flexDirection: 'row', gap: SPACING.md },
  visitCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    gap: 6,
  },
  visitActive: { backgroundColor: COLORS.primary },
  visitLabel: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  dateCard: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    width: 60,
    backgroundColor: COLORS.surface,
  },
  dateCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateDayName: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  dateNum: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  dateMonth: { fontSize: 10, color: COLORS.textSecondary },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  slotChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  slotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  slotBooked: { backgroundColor: COLORS.border, borderColor: COLORS.border },
  slotText: { fontSize: FONT_SIZES.xs, color: COLORS.text, fontWeight: '600' },
  slotTextBooked: { color: COLORS.textSecondary },
  legend: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    backgroundColor: '#dcfce7',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  summaryText: { fontSize: FONT_SIZES.sm, color: '#166534', fontWeight: '500' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.lg,
  },
  totalLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  totalValue: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.primary },
});
