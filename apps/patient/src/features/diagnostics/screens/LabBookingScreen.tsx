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

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useLabTest, useHealthPackage } from '../../../../../../packages/core/src/hooks';
import { HomeStackParamList } from '../../../../../../packages/core/src/types';
import { getNextDates } from '../../../../../../packages/core/src/utils';
import { supabase } from '../../../../../../packages/supabase/src/client';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'LabBooking'>;
type Route_ = RouteProp<HomeStackParamList, 'LabBooking'>;

const SLOTS = ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
const COLLECTION_TYPES = [
  { id: 'home', label: 'Home Collection', icon: 'home-outline', note: 'Phlebotomist visits your home' },
  { id: 'center', label: 'Visit Center', icon: 'business-outline', note: 'Visit the diagnostic center' },
];

export default function LabBookingScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route_>();
  const { testId, packageId } = route.params;
  const { data: test, isLoading: testLoading } = useLabTest(testId);
  const { data: pkg, isLoading: pkgLoading } = useHealthPackage(packageId);

  // Normalize: use test data or package data
  const isPackage = !!packageId;
  const isLoading = testLoading || pkgLoading;
  const bookingItem = test || (pkg ? {
    id: pkg.id,
    name: pkg.name,
    price: pkg.price,
    originalPrice: pkg.originalPrice,
    reportTime: pkg.reportTime,
    centerName: pkg.centerName || '',
    centerAddress: pkg.centerAddress || '',
    homeCollection: pkg.homeCollection ?? true,
    diagnosticsCenterId: pkg.diagnosticsCenterId || null,
    preparation: [],
    catalogTestId: null,
  } : null);

  const dates = useMemo(() => getNextDates(7), []);
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [collectionType, setCollectionType] = useState<'home' | 'center'>('center');
  const [booking, setBooking] = useState(false);

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const handleBook = async () => {
    if (!selectedSlot) {
      Alert.alert('Select Time', 'Please select a preferred time slot.');
      return;
    }

    setBooking(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { Alert.alert('Error', 'Please login to book.'); setBooking(false); return; }

      const insertData: any = {
        patient_id: session.user.id,
        diagnostics_center_id: bookingItem?.diagnosticsCenterId || null,
        date: selectedDate,
        time: selectedSlot,
        status: 'Pending',
        collection_type: collectionType,
        collection_address: collectionType === 'home' ? 'Home address (to be confirmed)' : null,
        payment_amount: bookingItem?.price || 0,
        payment_status: 'pending',
      };

      if (isPackage) {
        insertData.health_package_id = packageId;
      } else {
        insertData.lab_test_id = test?.catalogTestId || testId;
      }

      const { error } = await supabase
        .from('lab_bookings')
        .insert(insertData);

      if (error) {
        Alert.alert('Error', error.message);
        setBooking(false);
        return;
      }

      const itemLabel = isPackage ? 'package' : 'test';
      Alert.alert(
        'Booking Request Sent!',
        `Your ${bookingItem?.name} ${itemLabel} booking request has been sent to ${bookingItem?.centerName || 'the diagnostic center'}.\n\nThe center will confirm your date & time slot. You can pay at the center.`,
        [{ text: 'View Appointments', onPress: () => {
          navigation.popToTop();
          // Navigate to appointments tab
          (navigation as any).getParent()?.navigate('Appointments');
        }}, { text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Something went wrong.');
    } finally {
      setBooking(false);
    }
  };

  if (isLoading || !bookingItem) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const supportsHome = bookingItem.homeCollection;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isPackage ? 'Book Package' : 'Book Lab Test'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Test summary */}
        <View style={styles.testCard}>
          <View style={styles.testIcon}>
            <Ionicons name="flask-outline" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.testName}>{bookingItem.name}</Text>
            <Text style={styles.testMeta}>{bookingItem.reportTime} • {bookingItem.centerName}</Text>
          </View>
          <Text style={styles.testPrice}>₹{bookingItem.price}</Text>
        </View>

        {/* Center Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business-outline" size={16} color="#7C3AED" />
            <Text style={styles.sectionTitle}>Diagnostic Center</Text>
          </View>
          <Text style={styles.centerName}>{bookingItem.centerName}</Text>
          {bookingItem.centerAddress ? <Text style={styles.centerAddress}>{bookingItem.centerAddress}</Text> : null}
        </View>

        {/* Collection type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collection Type</Text>
          {COLLECTION_TYPES.map((c) => {
            const isHome = c.id === 'home';
            const disabled = isHome && !supportsHome;
            return (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.collectionCard,
                  collectionType === c.id && styles.collectionActive,
                  disabled && { opacity: 0.4 },
                ]}
                onPress={() => !disabled && setCollectionType(c.id as 'home' | 'center')}
                disabled={disabled}
              >
                <View style={[styles.collectionIcon, collectionType === c.id && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  <Ionicons name={c.icon as any} size={20} color={collectionType === c.id ? '#fff' : COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.collectionLabel, collectionType === c.id && { color: '#fff' }]}>
                    {c.label}
                  </Text>
                  <Text style={[styles.collectionNote, collectionType === c.id && { color: 'rgba(255,255,255,0.8)' }]}>
                    {disabled ? 'Not available for this test (requires equipment)' : c.note}
                  </Text>
                </View>
                {collectionType === c.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -SPACING.md }}>
            <View style={{ flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.md }}>
              {dates.map((dateStr) => {
                const d = new Date(dateStr + 'T00:00:00');
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
          <Text style={styles.sectionTitle}>Preferred Time</Text>
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

        {/* Payment info */}
        <View style={styles.payInfoCard}>
          <Ionicons name="cash-outline" size={18} color="#059669" />
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <Text style={styles.payInfoTitle}>Pay at Center</Text>
            <Text style={styles.payInfoText}>No online payment required. Pay directly at the diagnostic center after your test.</Text>
          </View>
        </View>

        {/* Preparation reminder */}
        {bookingItem.preparation && bookingItem.preparation.length > 0 && (
          <View style={styles.prepCard}>
            <Text style={styles.prepTitle}>Preparation Reminder</Text>
            {bookingItem.preparation.slice(0, 3).map((inst: string, i: number) => (
              <Text key={i} style={styles.prepText}>• {inst}</Text>
            ))}
          </View>
        )}

        {/* Flow info */}
        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>How it works</Text>
          {[
            'Submit your booking request',
            'Center reviews and confirms date & time',
            'Visit center or wait for home collection',
            'Pay at the center after your test',
          ].map((step, i) => (
            <View key={i} style={styles.flowRow}>
              <View style={styles.flowNum}><Text style={styles.flowNumText}>{i + 1}</Text></View>
              <Text style={styles.flowText}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerPrice}>₹{bookingItem.price}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedSlot || booking) && styles.bookButtonDisabled,
          ]}
          onPress={handleBook}
          disabled={!selectedSlot || booking}
          activeOpacity={0.85}
        >
          {booking ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.bookButtonText}>Book Appointment</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {booking && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.overlayText}>Submitting your request...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9',
  },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#1E293B' },
  testCard: {
    flexDirection: 'row', alignItems: 'center', margin: SPACING.md,
    backgroundColor: '#fff', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    ...SHADOWS.sm, gap: SPACING.md,
  },
  testIcon: {
    width: 48, height: 48, borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center',
  },
  testName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#1E293B' },
  testMeta: { fontSize: FONT_SIZES.xs, color: '#64748B', marginTop: 2 },
  testPrice: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#7C3AED' },
  section: {
    backgroundColor: '#fff', marginHorizontal: SPACING.md, marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, ...SHADOWS.sm,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#1E293B', marginBottom: SPACING.md },
  centerName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1E293B' },
  centerAddress: { fontSize: FONT_SIZES.xs, color: '#64748B', marginTop: 2 },
  collectionCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.md, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5, borderColor: '#E5E7EB', marginBottom: SPACING.sm,
  },
  collectionActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  collectionIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center',
  },
  collectionLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1E293B' },
  collectionNote: { fontSize: FONT_SIZES.xs, color: '#64748B', marginTop: 2 },
  dateCard: {
    alignItems: 'center', padding: SPACING.sm, borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5, borderColor: '#E5E7EB', width: 60, backgroundColor: '#fff',
  },
  dateCardActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  dateDayName: { fontSize: 10, color: '#64748B', fontWeight: '600' },
  dateNum: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#1E293B' },
  dateMonth: { fontSize: 10, color: '#64748B' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  slotChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: '#E5E7EB',
  },
  slotActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  slotText: { fontSize: FONT_SIZES.xs, color: '#1E293B', fontWeight: '600' },
  payInfoCard: {
    flexDirection: 'row', alignItems: 'flex-start', margin: SPACING.md, marginBottom: SPACING.sm,
    backgroundColor: '#ECFDF5', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    borderLeftWidth: 4, borderLeftColor: '#059669',
  },
  payInfoTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#047857' },
  payInfoText: { fontSize: FONT_SIZES.xs, color: '#065F46', marginTop: 2, lineHeight: 18 },
  prepCard: {
    margin: SPACING.md, marginBottom: SPACING.sm,
    backgroundColor: '#FEF9C3', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
  },
  prepTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#854D0E', marginBottom: SPACING.xs },
  prepText: { fontSize: FONT_SIZES.xs, color: '#713F12', lineHeight: 18, marginBottom: 2 },
  flowCard: {
    margin: SPACING.md, marginBottom: SPACING.sm,
    backgroundColor: '#fff', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, ...SHADOWS.sm,
  },
  flowTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#1E293B', marginBottom: SPACING.md },
  flowRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  flowNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#EDE9FE',
    justifyContent: 'center', alignItems: 'center',
  },
  flowNumText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#7C3AED' },
  flowText: { flex: 1, fontSize: FONT_SIZES.sm, color: '#64748B', lineHeight: 20 },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F1F5F9', ...SHADOWS.lg,
  },
  footerLabel: { fontSize: FONT_SIZES.xs, color: '#64748B' },
  footerPrice: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#7C3AED' },
  bookButton: {
    backgroundColor: '#7C3AED', borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  bookButtonDisabled: { backgroundColor: '#C4B5FD' },
  bookButtonText: { color: '#fff', fontSize: FONT_SIZES.base, fontWeight: '700' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  overlayCard: {
    backgroundColor: '#fff', borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl, alignItems: 'center', gap: SPACING.md,
  },
  overlayText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#1E293B' },
});
