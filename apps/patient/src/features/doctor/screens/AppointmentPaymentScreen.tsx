import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useDoctor } from '../../../../../../packages/core/src/hooks';
import { DoctorsStackParamList } from '../../../../../../packages/core/src/types';
import { Button } from '../../../../../../packages/shared/src/components';
import { simulateRazorpayPayment, uid } from '../../../../../../packages/core/src/utils';

type Nav = NativeStackNavigationProp<DoctorsStackParamList, 'AppointmentPayment'>;
type Route = RouteProp<DoctorsStackParamList, 'AppointmentPayment'>;

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / GPay / PhonePe', icon: 'phone-portrait-outline' },
  { id: 'card', label: 'Credit / Debit Card', icon: 'card-outline' },
  { id: 'netbanking', label: 'Net Banking', icon: 'globe-outline' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet-outline' },
];

export default function AppointmentPaymentScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { doctorId, date, time, visitType, fee } = route.params;

  const { data: doctor } = useDoctor(doctorId);
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [paying, setPaying] = useState(false);

  const platformFee = 30;
  const gst = Math.round(fee * 0.18);
  const total = fee + platformFee + gst;

  const handlePay = async () => {
    setPaying(true);
    try {
      const orderId = 'order_' + uid();
      const result = await simulateRazorpayPayment(total, orderId);
      if (result.status === 'success') {
        navigation.replace('AppointmentSuccess', {
          doctorId,
          date,
          time,
          visitType,
          fee: total,
          paymentId: result.paymentId,
          orderId: result.orderId,
        });
      } else {
        Alert.alert('Payment Failed', 'Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Booking summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.summaryLabel}>Doctor</Text>
            <Text style={styles.summaryValue}>{doctor?.name ?? '...'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="medical-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.summaryLabel}>Specialization</Text>
            <Text style={styles.summaryValue}>{doctor?.specialization ?? '...'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{new Date(date).toDateString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.summaryLabel}>Time</Text>
            <Text style={styles.summaryValue}>{time}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="videocam-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.summaryLabel}>Type</Text>
            <Text style={styles.summaryValue}>
              {visitType === 'video' ? 'Video Consultation' : 'Clinic Visit'}
            </Text>
          </View>
        </View>

        {/* Price breakdown */}
        <View style={styles.priceCard}>
          <Text style={styles.summaryTitle}>Price Breakdown</Text>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Consultation Fee</Text>
            <Text style={styles.priceValue}>₹{fee}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Platform Fee</Text>
            <Text style={styles.priceValue}>₹{platformFee}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>GST (18%)</Text>
            <Text style={styles.priceValue}>₹{gst}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { fontWeight: '700', color: COLORS.text }]}>Total</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </View>

        {/* Payment methods */}
        <View style={styles.methodCard}>
          <Text style={styles.summaryTitle}>Payment Method</Text>
          <View style={styles.divider} />
          {PAYMENT_METHODS.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.methodRow}
              onPress={() => setSelectedMethod(m.id)}
            >
              <View style={styles.methodLeft}>
                <View style={styles.methodIcon}>
                  <Ionicons name={m.icon as any} size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.methodLabel}>{m.label}</Text>
              </View>
              <View style={[styles.radio, selectedMethod === m.id && styles.radioActive]}>
                {selectedMethod === m.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Razorpay test badge */}
        <View style={styles.testBadge}>
          <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.success} />
          <Text style={styles.testText}>
            🧪 Test Mode — Razorpay (no real payment will be charged)
          </Text>
        </View>
      </ScrollView>

      {/* Pay button */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.payLabel}>Total Payable</Text>
          <Text style={styles.payValue}>₹{total}</Text>
        </View>
        <Button
          title={paying ? 'Processing…' : `Pay ₹${total}`}
          onPress={handlePay}
          disabled={paying}
          size="md"
        />
      </View>

      {paying && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.overlayText}>Processing payment…</Text>
            <Text style={styles.overlaySubText}>Please do not go back</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  summaryCard: {
    margin: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  priceCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  methodCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  summaryTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 8 },
  summaryLabel: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  summaryValue: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  priceValue: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  totalValue: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.primary },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodLabel: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  testBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    backgroundColor: '#f0fdf4',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  testText: { fontSize: FONT_SIZES.xs, color: '#166534', flex: 1 },
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
  payLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  payValue: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.primary },
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
    margin: SPACING.xl,
  },
  overlayText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  overlaySubText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
});
