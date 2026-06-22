import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ChatScreen from '../../../../../../packages/shared/src/components/ChatScreen';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { PharmacyStackParamList } from '../../../../../../packages/core/src/types';
import { supabase } from '../../../../../../packages/supabase/src/client';

type Nav = NativeStackNavigationProp<PharmacyStackParamList, 'OrderTracking'>;
type Route_ = RouteProp<PharmacyStackParamList, 'OrderTracking'>;

const STEPS = [
  { status: 'pending', label: 'Order Placed', icon: 'checkmark-circle' },
  { status: 'confirmed', label: 'Confirmed', icon: 'thumbs-up-outline' },
  { status: 'processing', label: 'Processing', icon: 'cube-outline' },
  { status: 'ready', label: 'Ready', icon: 'bag-check-outline' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: 'bicycle-outline' },
  { status: 'delivered', label: 'Delivered', icon: 'home-outline' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'ready', 'out_for_delivery', 'delivered'];

export default function OrderTrackingScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route_>();
  const { orderId } = route.params;
  const { colors } = useTheme();

  const [order, setOrder] = useState<any>(null);
  const [store, setStore] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(id, quantity, price, medicine:medicines!medicine_id(name, image))')
      .eq('id', orderId)
      .single();

    if (data) {
      setOrder(data);

      if (data.store_id) {
        const { data: s } = await supabase
          .from('medical_stores')
          .select('id, store_name, phone, address')
          .eq('id', data.store_id)
          .single();
        if (s) setStore(s);
      }

      const { data: hist } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });
      if (hist) setHistory(hist);
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  // Realtime: instant update when order status changes
  useEffect(() => {
    if (!orderId) return;
    const channel = supabase
      .channel(`patient-order-tracking-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orderId, load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleCancel = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
          await supabase.from('order_status_history').insert({
            order_id: orderId,
            status: 'cancelled',
            note: 'Cancelled by customer',
          });
          load();
        },
      },
    ]);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' +
      d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Track Order</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'rejected';
  const isDelivered = order.status === 'delivered';
  const historyMap: Record<string, string> = {};
  history.forEach((h: any) => { historyMap[h.status] = h.created_at; });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Track Order</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Status banner */}
        {isCancelled && (
          <View style={[styles.banner, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="close-circle" size={20} color="#EF4444" />
            <Text style={{ flex: 1, fontSize: FONT_SIZES.sm, color: '#991B1B', fontWeight: '600' }}>
              This order has been {order.status}
            </Text>
          </View>
        )}

        {isDelivered && (
          <View style={[styles.banner, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={{ flex: 1, fontSize: FONT_SIZES.sm, color: '#065F46', fontWeight: '600' }}>
              Order delivered successfully!
            </Text>
          </View>
        )}

        {/* Estimated delivery time */}
        {order.estimated_delivery_minutes && !isCancelled && !isDelivered && (
          <View style={[styles.banner, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="time-outline" size={20} color="#2563EB" />
            <Text style={{ flex: 1, fontSize: FONT_SIZES.sm, color: '#1E40AF', fontWeight: '600' }}>
              Estimated delivery in {order.estimated_delivery_minutes} minutes
            </Text>
          </View>
        )}

        {/* OTP Section */}
        {order.status === 'out_for_delivery' && order.delivery_otp && (
          <View style={[styles.otpCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.otpLabel, { color: colors.textPrimary }]}>Delivery OTP</Text>
            <View style={styles.otpBox}>
              {order.delivery_otp.split('').map((digit: string, i: number) => (
                <View key={i} style={styles.otpDigit}>
                  <Text style={styles.otpDigitText}>{digit}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.otpHint, { color: colors.textSecondary }]}>
              Share this OTP with the delivery person to confirm delivery
            </Text>
          </View>
        )}

        {/* Timeline */}
        {!isCancelled && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Order Status</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.timeline}>
              {STEPS.map((step, i) => {
                const isDone = currentIdx >= i;
                const isCurrent = currentIdx === i;
                const ts = historyMap[step.status];
                return (
                  <View key={step.status} style={styles.step}>
                    <View style={styles.stepLeft}>
                      <View
                        style={[
                          styles.stepIcon,
                          isDone && styles.stepIconDone,
                          isCurrent && styles.stepIconCurrent,
                        ]}
                      >
                        <Ionicons
                          name={step.icon as any}
                          size={16}
                          color={isDone ? '#fff' : colors.textTertiary}
                        />
                      </View>
                      {i < STEPS.length - 1 && (
                        <View style={[styles.stepLine, isDone && i < currentIdx && styles.stepLineDone]} />
                      )}
                    </View>
                    <View style={styles.stepRight}>
                      <Text
                        style={[
                          styles.stepLabel,
                          { color: colors.textSecondary },
                          isDone && { color: '#10B981', fontWeight: '700' },
                          isCurrent && { color: COLORS.primary, fontWeight: '700' },
                        ]}
                      >
                        {step.label}
                      </Text>
                      {ts && (
                        <Text style={[styles.stepTime, { color: colors.textTertiary }]}>
                          {formatDate(ts)}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Order Details */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Order Details</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {[
            { label: 'Order ID', value: '#' + orderId.substring(0, 8) },
            { label: 'Placed', value: formatDate(order.created_at) },
            { label: 'Payment', value: order.payment_id || 'N/A' },
            { label: 'Total', value: `Rs. ${order.total_amount}`, highlight: true },
          ].map(({ label, value, highlight }) => (
            <View key={label} style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
              <Text
                style={[
                  styles.detailValue,
                  { color: colors.textPrimary },
                  highlight && { color: COLORS.primary, fontWeight: '800' },
                ]}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>

        {/* Items */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Items ({order.items?.length || 0})
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          {(order.items || []).map((item: any) => {
            const med = Array.isArray(item.medicine) ? item.medicine[0] : item.medicine;
            return (
              <View key={item.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: colors.textPrimary }]}>
                    {med?.name || 'Medicine'}
                  </Text>
                  <Text style={[styles.itemQty, { color: colors.textTertiary }]}>
                    Qty: {item.quantity} x Rs. {item.price}
                  </Text>
                </View>
                <Text style={[styles.itemTotal, { color: colors.textPrimary }]}>
                  Rs. {item.quantity * item.price}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Store Info */}
        {store && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Store</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.storeName, { color: colors.textPrimary }]}>{store.store_name}</Text>
            {store.address && (
              <Text style={[styles.storeAddress, { color: colors.textSecondary }]}>{store.address}</Text>
            )}
            {store.phone && (
              <TouchableOpacity
                style={styles.callStoreBtn}
                onPress={() => Linking.openURL(`tel:${store.phone}`)}
              >
                <Ionicons name="call" size={16} color={COLORS.primary} />
                <Text style={styles.callStoreText}>Call Store</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Chat with Store button - visible for active orders */}
        {['confirmed', 'processing', 'ready', 'out_for_delivery'].includes(order.status) && (
          <TouchableOpacity style={styles.chatBtn} onPress={() => setChatVisible(true)}>
            <Ionicons name="chatbubbles" size={18} color="#fff" />
            <Text style={styles.chatBtnText}>Chat with Store</Text>
          </TouchableOpacity>
        )}

        {/* Cancel button */}
        {order.status === 'pending' && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Chat Modal */}
      <Modal visible={chatVisible} animationType="slide">
        <ChatScreen
          entityType="order"
          entityId={orderId}
          otherPersonName={store?.store_name || 'Store'}
          isBusiness={false}
          accentColor={COLORS.primary}
          onBack={() => setChatVisible(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700' },
  scroll: { padding: SPACING.base },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.md,
  },
  otpCard: {
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, alignItems: 'center',
    marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  otpLabel: { fontSize: FONT_SIZES.md, fontWeight: '700', marginBottom: SPACING.md },
  otpBox: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  otpDigit: {
    width: 48, height: 56, borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center',
  },
  otpDigitText: { fontSize: 24, fontWeight: '800', color: '#065F46' },
  otpHint: { fontSize: FONT_SIZES.xs, textAlign: 'center', lineHeight: 18 },
  card: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, ...SHADOWS.sm, marginBottom: SPACING.md },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  divider: { height: 1, marginVertical: SPACING.sm },
  timeline: {},
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, minHeight: 56 },
  stepLeft: { alignItems: 'center', width: 32 },
  stepIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center',
  },
  stepIconDone: { backgroundColor: '#10B981' },
  stepIconCurrent: { backgroundColor: COLORS.primary },
  stepLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 2 },
  stepLineDone: { backgroundColor: '#10B981' },
  stepRight: { flex: 1, paddingTop: 4 },
  stepLabel: { fontSize: FONT_SIZES.sm },
  stepTime: { fontSize: 10, marginTop: 2 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { fontSize: FONT_SIZES.sm },
  detailValue: { fontSize: FONT_SIZES.sm, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: SPACING.sm, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0',
  },
  itemName: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  itemQty: { fontSize: 10, marginTop: 2 },
  itemTotal: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  storeName: { fontSize: FONT_SIZES.base, fontWeight: '700' },
  storeAddress: { fontSize: FONT_SIZES.xs, marginTop: 4, lineHeight: 18 },
  callStoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  callStoreText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '700' },
  chatBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14, marginBottom: SPACING.md,
  },
  chatBtnText: { fontSize: FONT_SIZES.base, color: '#fff', fontWeight: '700' },
  cancelBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#EF4444', borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14,
  },
  cancelBtnText: { fontSize: FONT_SIZES.base, color: '#EF4444', fontWeight: '700' },
});
