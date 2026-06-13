import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { PharmacyStackParamList } from '../../types';
import { Button } from '../../components/common';

type Nav = NativeStackNavigationProp<PharmacyStackParamList, 'OrderSuccess'>;
type Route = RouteProp<PharmacyStackParamList, 'OrderSuccess'>;

const DELIVERY_STEPS = [
  { icon: 'checkmark-circle', label: 'Order Placed', done: true },
  { icon: 'cube-outline', label: 'Packed', done: false },
  { icon: 'bicycle-outline', label: 'Out for Delivery', done: false },
  { icon: 'home-outline', label: 'Delivered', done: false },
];

export default function OrderSuccessScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { orderId, paymentId, total, itemCount } = route.params;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.successCircle}>
          <Ionicons name="bag-check-outline" size={64} color={COLORS.success} />
        </View>
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>
          Your order of {itemCount} item{itemCount > 1 ? 's' : ''} has been placed successfully.
          Expected delivery in 2-4 hours.
        </Text>

        {/* Order details */}
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>Order Details</Text>
          <View style={styles.divider} />
          {[
            { label: 'Order ID', value: orderId },
            { label: 'Payment ID', value: paymentId },
            { label: 'Total Paid', value: `₹${total}` },
            { label: 'Items', value: `${itemCount} item${itemCount > 1 ? 's' : ''}` },
            { label: 'Est. Delivery', value: '2-4 hours' },
          ].map(({ label, value }) => (
            <View key={label} style={styles.row}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={[styles.rowValue, label === 'Total Paid' && { color: COLORS.primary, fontWeight: '800' }]}>
                {value}
              </Text>
            </View>
          ))}
        </View>

        {/* Tracking timeline */}
        <View style={styles.trackingCard}>
          <Text style={styles.cardTitle}>Order Tracking</Text>
          <View style={styles.divider} />
          <View style={styles.timeline}>
            {DELIVERY_STEPS.map((step, i) => (
              <View key={i} style={styles.step}>
                <View style={styles.stepLeft}>
                  <View style={[styles.stepIcon, step.done && styles.stepIconDone]}>
                    <Ionicons
                      name={step.icon as any}
                      size={16}
                      color={step.done ? '#fff' : COLORS.textSecondary}
                    />
                  </View>
                  {i < DELIVERY_STEPS.length - 1 && (
                    <View style={[styles.stepLine, step.done && styles.stepLineDone]} />
                  )}
                </View>
                <Text style={[styles.stepLabel, step.done && { color: COLORS.success, fontWeight: '700' }]}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Continue Shopping"
            onPress={() => navigation.navigate('PharmacyHome')}
            variant="primary"
          />
          <Button
            title="Go to Home"
            onPress={() => navigation.navigate('PharmacyHome' as any)}
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
  title: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text },
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
  trackingCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    marginBottom: SPACING.lg,
  },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  rowValue: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  timeline: { gap: 0 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, minHeight: 52 },
  stepLeft: { alignItems: 'center', width: 32 },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconDone: { backgroundColor: COLORS.success },
  stepLine: { width: 2, flex: 1, backgroundColor: COLORS.border, marginVertical: 2 },
  stepLineDone: { backgroundColor: COLORS.success },
  stepLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, paddingTop: 6 },
  actions: { width: '100%', gap: SPACING.sm },
});
