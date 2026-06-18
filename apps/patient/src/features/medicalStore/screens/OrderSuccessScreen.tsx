import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { PharmacyStackParamList } from '../../../../../../packages/core/src/types';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { supabase } from '../../../../../../packages/supabase/src/client';

type Nav = NativeStackNavigationProp<PharmacyStackParamList, 'OrderSuccess'>;
type Route_ = RouteProp<PharmacyStackParamList, 'OrderSuccess'>;

const DELIVERY_STEPS = [
  { icon: 'checkmark-circle', label: 'Order Placed', status: 'pending' },
  { icon: 'thumbs-up-outline', label: 'Confirmed', status: 'confirmed' },
  { icon: 'cube-outline', label: 'Processing', status: 'processing' },
  { icon: 'bicycle-outline', label: 'Out for Delivery', status: 'out_for_delivery' },
  { icon: 'home-outline', label: 'Delivered', status: 'delivered' },
];

export default function OrderSuccessScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route_>();
  const { orderId } = route.params;
  const { colors } = useTheme();

  const [order, setOrder] = useState<any>(null);
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(id, quantity, price, medicine:medicines!medicine_id(name))')
      .eq('id', orderId)
      .single();

    if (data) {
      setOrder(data);
      if (data.store_id) {
        const { data: store } = await supabase
          .from('medical_stores')
          .select('store_name')
          .eq('id', data.store_id)
          .single();
        if (store) setStoreName(store.store_name);
      }
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const itemCount = order?.items?.length || 0;
  const total = order?.total_amount || 0;
  const estMinutes = order?.estimated_delivery_minutes || 45;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.successCircle}>
          <Ionicons name="bag-check-outline" size={64} color="#10B981" />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Order Placed!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your order of {itemCount} item{itemCount !== 1 ? 's' : ''} has been placed successfully.
          {storeName ? ` ${storeName} will confirm shortly.` : ''}
        </Text>

        {/* Order details */}
        <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Order Details</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {[
            { label: 'Order ID', value: orderId.substring(0, 8) + '...' },
            { label: 'Payment ID', value: order?.payment_id || 'N/A' },
            { label: 'Total Paid', value: `Rs. ${total}` },
            { label: 'Items', value: `${itemCount} item${itemCount !== 1 ? 's' : ''}` },
            { label: 'Est. Delivery', value: `${estMinutes} minutes` },
          ].map(({ label, value }) => (
            <View key={label} style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
              <Text style={[styles.rowValue, { color: colors.textPrimary }, label === 'Total Paid' && { color: COLORS.primary, fontWeight: '800' }]}>
                {value}
              </Text>
            </View>
          ))}
        </View>

        {/* Tracking timeline */}
        <View style={[styles.trackingCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Order Tracking</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.timeline}>
            {DELIVERY_STEPS.map((step, i) => {
              const isDone = i === 0; // Only "Order Placed" is done initially
              return (
                <View key={i} style={styles.step}>
                  <View style={styles.stepLeft}>
                    <View style={[styles.stepIcon, isDone && styles.stepIconDone]}>
                      <Ionicons name={step.icon as any} size={16} color={isDone ? '#fff' : colors.textTertiary} />
                    </View>
                    {i < DELIVERY_STEPS.length - 1 && (
                      <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
                    )}
                  </View>
                  <Text style={[styles.stepLabel, { color: colors.textSecondary }, isDone && { color: '#10B981', fontWeight: '700' }]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={18} color="#1E40AF" />
          <Text style={styles.infoText}>
            You'll receive an OTP when your order is out for delivery. Share it with the delivery person.
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => navigation.replace('OrderTracking', { orderId })}
            activeOpacity={0.85}
          >
            <Ionicons name="navigate-outline" size={18} color="#fff" />
            <Text style={styles.trackBtnText}>Track Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shopBtn, { borderColor: COLORS.primary }]}
            onPress={() => navigation.navigate('PharmacyHome')}
            activeOpacity={0.85}
          >
            <Text style={[styles.shopBtnText, { color: COLORS.primary }]}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: SPACING.md, alignItems: 'center', paddingBottom: SPACING.xl },
  successCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#f0fdf4', justifyContent: 'center', alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: {
    fontSize: FONT_SIZES.sm, textAlign: 'center',
    marginTop: SPACING.sm, marginBottom: SPACING.lg, lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  detailCard: {
    width: '100%', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    ...SHADOWS.sm, marginBottom: SPACING.md,
  },
  trackingCard: {
    width: '100%', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    ...SHADOWS.sm, marginBottom: SPACING.md,
  },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  divider: { height: 1, marginVertical: SPACING.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { fontSize: FONT_SIZES.sm },
  rowValue: { fontSize: FONT_SIZES.sm, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  timeline: { gap: 0 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, minHeight: 52 },
  stepLeft: { alignItems: 'center', width: 32 },
  stepIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center',
  },
  stepIconDone: { backgroundColor: '#10B981' },
  stepLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 2 },
  stepLineDone: { backgroundColor: '#10B981' },
  stepLabel: { fontSize: FONT_SIZES.sm, paddingTop: 6 },
  infoBanner: {
    width: '100%', flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: '#EFF6FF', borderRadius: BORDER_RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoText: { flex: 1, fontSize: FONT_SIZES.xs, color: '#1E40AF', lineHeight: 18 },
  actions: { width: '100%', gap: SPACING.sm },
  trackBtn: {
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  trackBtnText: { color: '#fff', fontSize: FONT_SIZES.base, fontWeight: '700' },
  shopBtn: {
    borderWidth: 1.5, borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14, alignItems: 'center',
  },
  shopBtnText: { fontSize: FONT_SIZES.base, fontWeight: '700' },
});
