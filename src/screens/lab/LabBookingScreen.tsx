import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useLabTest } from '../../hooks';
import { LabStackParamList } from '../../types';
import { Button } from '../../components/common';
import { getNextDates, simulateRazorpayPayment, uid } from '../../utils';
import { useAuth } from '../../context/AuthContext';

type Nav = NativeStackNavigationProp<LabStackParamList, 'LabBooking'>;
type Route = RouteProp<LabStackParamList, 'LabBooking'>;

const SLOTS = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'];
const COLLECTION_TYPES = [
  { id: 'home', label: 'Home Collection', icon: 'home-outline', note: 'Phlebotomist visits your home' },
  { id: 'lab', label: 'Visit Lab', icon: 'business-outline', note: 'Visit the nearest collection center' },
];

export default function LabBookingScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { testId } = route.params;
  const { user } = useAuth();
  const { data: test, isLoading } = useLabTest(testId);

  const dates = useMemo(() => getNextDates(7), []);
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [collectionType, setCollectionType] = useState('home');
  const [paying, setPaying] = useState(false);

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const homeCollectionFee = collectionType === 'home' ? 0 : 0; // free home collection

  const handleBook = async () => {
    if (!selectedSlot) {
      Alert.alert('Select Time', 'Please select a time slot to continue.');
      return;
    }
    setPaying(true);
    try {
      const orderId = 'LAB_' + uid().toUpperCase();
      const result = await simulateRazorpayPayment(test!.price, orderId);
      navigation.replace('LabTests'); // In production, go to success screen
      Alert.alert(
        '✅ Booking Confirmed!',
        `Your ${test?.name} test has been booked for ${new Date(selectedDate).toDateString()} at ${selectedSlot}.\nPayment ID: ${result.paymentId}`,
      );
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (isLoading || !test) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Test summary */}
        <View style={styles.testCard}>
          <View style={styles.testIcon}>
            <Ionicons name="flask-outline" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.testName}>{test.name}</Text>
            <Text style={styles.testMeta}>{test.reportTime} • {test.sampleType}</Text>
          </View>
          <Text style={styles.testPrice}>₹{test.price}</Text>
        </View>

        {/* Collection type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collection Type</Text>
          {COLLECTION_TYPES.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.collectionCard, collectionType === c.id && styles.collectionActive]}
              onPress={() => setCollectionType(c.id)}
            >
              <View style={styles.collectionIcon}>
                <Ionicons name={c.icon as any} size={20} color={collectionType === c.id ? '#fff' : COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.collectionLabel, collectionType === c.id && { color: '#fff' }]}>
                  {c.label}
                </Text>
                <Text style={[styles.collectionNote, collectionType === c.id && { color: 'rgba(255,255,255,0.8)' }]}>
                  {c.note}
                </Text>
              </View>
              {collectionType === c.id && (
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Address (if home collection) */}
        {collectionType === 'home' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Collection Address</Text>
            <View style={styles.addressCard}>
              <Ionicons name="location-outline" size={18} color={COLORS.primary} />
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Text style={styles.addressName}>{user?.name}</Text>
                <Text style={styles.addressText}>
                  {user?.address?.line1}, {user?.address?.city}, {user?.address?.state} - {user?.address?.pincode}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Date */}
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
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.slotsGrid}>
            {SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[styles.slotChip, selectedSlot === slot && styles.slotActive]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Text style={[styles.slotText, selectedSlot === slot && { color: '#fff' }]}>{slot}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preparation reminder */}
        <View style={styles.prepCard}>
          <Text style={styles.prepTitle}>⚠️ Preparation Reminder</Text>
          {test.preparationInstructions.slice(0, 2).map((inst, i) => (
            <Text key={i} style={styles.prepText}>• {inst}</Text>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerPrice}>₹{test.price}</Text>
        </View>
        <Button
          title={paying ? 'Booking…' : 'Book & Pay'}
          onPress={handleBook}
          disabled={!selectedSlot || paying}
          size="md"
        />
      </View>

      {paying && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.overlayText}>Confirming your booking…</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    gap: SPACING.md,
  },
  testIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  testMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  testPrice: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.primary },
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  collectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  collectionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  collectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  collectionNote: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  addressName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  addressText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, lineHeight: 18, marginTop: 2 },
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
  },
  slotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  slotText: { fontSize: FONT_SIZES.xs, color: COLORS.text, fontWeight: '600' },
  prepCard: {
    margin: SPACING.md,
    backgroundColor: '#fef9c3',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  prepTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#854d0e', marginBottom: SPACING.xs },
  prepText: { fontSize: FONT_SIZES.xs, color: '#713f12', lineHeight: 18, marginBottom: 2 },
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
  footerLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  footerPrice: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.primary },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  overlayText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
});
