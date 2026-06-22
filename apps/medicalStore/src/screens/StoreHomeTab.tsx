import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';

interface Props { profile: any; }

const GREEN = '#059669';

export default function StoreHomeTab({ profile }: Props) {
  const [stats, setStats] = useState({ medicines: 0, pendingOrders: 0, activeOrders: 0, todayRevenue: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const storeId = profile.id;

    const [medRes, pendingRes, activeRes, revenueRes, recentRes] = await Promise.all([
      supabase.from('medicines').select('id', { count: 'exact', head: true }).eq('store_id', storeId),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('store_id', storeId).eq('status', 'pending'),
      supabase.from('orders').select('id', { count: 'exact', head: true }).eq('store_id', storeId).in('status', ['confirmed', 'processing', 'ready', 'out_for_delivery']),
      supabase.from('orders').select('total_amount').eq('store_id', storeId).eq('status', 'delivered').gte('created_at', new Date().toISOString().split('T')[0]),
      supabase.from('orders').select('id, status, total_amount, created_at').eq('store_id', storeId).order('created_at', { ascending: false }).limit(5),
    ]);

    const todayRev = (revenueRes.data || []).reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);

    setStats({
      medicines: medRes.count || 0,
      pendingOrders: pendingRes.count || 0,
      activeOrders: activeRes.count || 0,
      todayRevenue: todayRev,
    });

    setRecentOrders(recentRes.data || []);
    setLoading(false);
  }, [profile.id]);

  useEffect(() => { load(); }, [load]);

  // Realtime: auto-update dashboard when orders change
  useEffect(() => {
    const storeId = profile?.id;
    if (!storeId) return;
    const channel = supabase
      .channel('store-home-orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `store_id=eq.${storeId}`,
      }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const statusColor: Record<string, string> = {
    pending: '#F59E0B', confirmed: '#3B82F6', processing: '#8B5CF6',
    ready: '#14B8A6', out_for_delivery: '#F97316', delivered: '#10B981',
    cancelled: '#6B7280', rejected: '#EF4444',
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={GREEN} /></View>;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[GREEN]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {profile.full_name || 'Store Owner'}</Text>
            <Text style={styles.subGreeting}>Welcome to your store dashboard</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Ionicons name="storefront" size={24} color={GREEN} />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Total Medicines', value: stats.medicines, icon: 'medical', color: '#3B82F6', bg: '#DBEAFE' },
            { label: 'Pending Orders', value: stats.pendingOrders, icon: 'time', color: '#F59E0B', bg: '#FEF3C7' },
            { label: 'Active Orders', value: stats.activeOrders, icon: 'bicycle', color: '#8B5CF6', bg: '#EDE9FE' },
            { label: "Today's Revenue", value: `Rs. ${stats.todayRevenue}`, icon: 'cash', color: '#10B981', bg: '#D1FAE5' },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIconWrap, { backgroundColor: stat.bg }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {recentOrders.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="receipt-outline" size={32} color="#D1D5DB" />
              <Text style={styles.emptyText}>No orders yet</Text>
            </View>
          ) : (
            recentOrders.map((order) => (
              <View key={order.id} style={styles.orderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderId}>#{order.id.substring(0, 8)}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
                </View>
                <Text style={styles.orderAmount}>Rs. {order.total_amount}</Text>
                <View style={[styles.statusBadge, { backgroundColor: (statusColor[order.status] || '#6B7280') + '20' }]}>
                  <Text style={[styles.statusText, { color: statusColor[order.status] || '#6B7280' }]}>
                    {order.status.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  scroll: { padding: 16, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  subGreeting: { fontSize: 13, color: '#64748B', marginTop: 2 },
  avatarCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#ECFDF5',
    justifyContent: 'center', alignItems: 'center',
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  statIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 13, color: '#9CA3AF', marginTop: 8 },
  orderRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: '#F0F4F8',
  },
  orderId: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  orderDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  orderAmount: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
});
