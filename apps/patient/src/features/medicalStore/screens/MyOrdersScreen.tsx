import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { PharmacyStackParamList } from '../../../../../../packages/core/src/types';
import { supabase } from '../../../../../../packages/supabase/src/client';

type Nav = NativeStackNavigationProp<PharmacyStackParamList, 'MyOrders'>;

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  processing: '#8B5CF6',
  ready: '#14B8A6',
  out_for_delivery: '#F97316',
  delivered: '#10B981',
  cancelled: '#6B7280',
  rejected: '#EF4444',
};

const STATUS_BG: Record<string, string> = {
  pending: '#FEF3C7',
  confirmed: '#DBEAFE',
  processing: '#EDE9FE',
  ready: '#CCFBF1',
  out_for_delivery: '#FFEDD5',
  delivered: '#D1FAE5',
  cancelled: '#F3F4F6',
  rejected: '#FEE2E2',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  ready: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

const FILTERS = ['All', 'Active', 'Delivered', 'Cancelled'];

export default function MyOrdersScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const storeIds = [...new Set(data.map((o: any) => o.store_id).filter(Boolean))];
      let storeMap: Record<string, string> = {};
      if (storeIds.length > 0) {
        const { data: stores } = await supabase
          .from('medical_stores')
          .select('id, store_name')
          .in('id', storeIds);
        if (stores) stores.forEach((s: any) => { storeMap[s.id] = s.store_name; });
      }

      setOrders(data.map((o: any) => ({
        id: o.id,
        status: o.status,
        totalAmount: o.total_amount,
        itemCount: o.items?.length || 0,
        storeName: storeMap[o.store_id] || 'Unknown Store',
        createdAt: o.created_at,
        paymentId: o.payment_id,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const filtered = useMemo(() => {
    if (filter === 'All') return orders;
    if (filter === 'Active') return orders.filter((o) =>
      ['pending', 'confirmed', 'processing', 'ready', 'out_for_delivery'].includes(o.status)
    );
    if (filter === 'Delivered') return orders.filter((o) => o.status === 'delivered');
    if (filter === 'Cancelled') return orders.filter((o) => ['cancelled', 'rejected'].includes(o.status));
    return orders;
  }, [orders, filter]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isActive = (status: string) =>
    ['pending', 'confirmed', 'processing', 'ready', 'out_for_delivery'].includes(status);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My Orders</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && { color: '#fff' }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No orders found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {filter === 'All' ? 'Your orders will appear here' : `No ${filter.toLowerCase()} orders`}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.orderCard, { backgroundColor: colors.card }]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
          >
            <View style={styles.orderTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.orderStore, { color: colors.textPrimary }]}>{item.storeName}</Text>
                <Text style={[styles.orderId, { color: colors.textTertiary }]}>
                  #{item.id.substring(0, 8)} · {formatDate(item.createdAt)}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[item.status] || '#F3F4F6' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] || '#6B7280' }]}>
                  {STATUS_LABELS[item.status] || item.status}
                </Text>
              </View>
            </View>

            <View style={[styles.orderDivider, { backgroundColor: colors.border }]} />

            <View style={styles.orderBottom}>
              <View>
                <Text style={[styles.orderTotal, { color: colors.textPrimary }]}>Rs. {item.totalAmount}</Text>
                <Text style={[styles.orderItems, { color: colors.textTertiary }]}>
                  {item.itemCount} item{item.itemCount !== 1 ? 's' : ''}
                </Text>
              </View>
              {isActive(item.status) ? (
                <TouchableOpacity
                  style={styles.trackBtn}
                  onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
                >
                  <Ionicons name="navigate-outline" size={14} color="#fff" />
                  <Text style={styles.trackBtnText}>Track</Text>
                </TouchableOpacity>
              ) : item.status === 'delivered' ? (
                <View style={styles.reorderBtn}>
                  <Ionicons name="refresh-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.reorderBtnText}>Reorder</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
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
  filterRow: {
    flexDirection: 'row', paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: '#E2E8F0',
  },
  filterText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#64748B' },
  list: { paddingHorizontal: SPACING.base, gap: SPACING.md, paddingBottom: 30 },
  orderCard: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, ...SHADOWS.sm },
  orderTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  orderStore: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  orderId: { fontSize: FONT_SIZES.xs, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BORDER_RADIUS.full },
  statusText: { fontSize: 10, fontWeight: '700' },
  orderDivider: { height: 1, marginVertical: SPACING.sm },
  orderBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderTotal: { fontSize: FONT_SIZES.base, fontWeight: '800' },
  orderItems: { fontSize: FONT_SIZES.xs, marginTop: 2 },
  trackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 8,
  },
  trackBtnText: { color: '#fff', fontSize: FONT_SIZES.xs, fontWeight: '700' },
  reorderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 8,
  },
  reorderBtnText: { color: COLORS.primary, fontSize: FONT_SIZES.xs, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingVertical: SPACING['3xl'] },
  emptyTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', marginTop: SPACING.md },
  emptySubtitle: { fontSize: FONT_SIZES.sm, marginTop: 4 },
});
