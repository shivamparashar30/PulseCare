import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { Header, EmptyState } from '../../../../../../packages/shared/src/components';
import { formatCurrency } from '../../../../../../packages/core/src/utils';
import { supabase } from '../../../../../../packages/supabase/src/client';

type RecordTab = 'visits' | 'prescriptions' | 'labReports' | 'orders';

const tabs: { key: RecordTab; label: string; icon: string }[] = [
  { key: 'visits', label: 'Visits', icon: 'calendar' },
  { key: 'prescriptions', label: 'Rx', icon: 'document-text' },
  { key: 'labReports', label: 'Reports', icon: 'flask' },
  { key: 'orders', label: 'Orders', icon: 'bag' },
];

export default function HealthRecordsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<RecordTab>('visits');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [visits, setVisits] = useState<any[]>([]);
  const [labReports, setLabReports] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const uid = session.user.id;

      const [apptRes, labRes, orderRes] = await Promise.all([
        supabase
          .from('appointments')
          .select('id, date, time, type, status, symptoms, payment_amount, doctor_id, profiles!appointments_doctor_id_fkey(full_name), doctor_profiles(specialization)')
          .eq('patient_id', uid)
          .in('status', ['Completed', 'Confirmed', 'Approved'])
          .order('date', { ascending: false }),
        supabase
          .from('lab_bookings')
          .select('id, date, time_slot, status, amount, lab_test_id, health_package_id, lab_tests(name), health_packages(name), diagnostics_centers(name)')
          .eq('patient_id', uid)
          .order('created_at', { ascending: false }),
        supabase
          .from('orders')
          .select('id, total_amount, status, created_at, store_id, medical_stores(store_name)')
          .eq('patient_id', uid)
          .order('created_at', { ascending: false }),
      ]);

      const mapVisits = (apptRes.data || []).map((a: any) => {
        const docProfile = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
        const docSpec = Array.isArray(a.doctor_profiles) ? a.doctor_profiles[0] : a.doctor_profiles;
        return {
          id: a.id,
          doctorName: docProfile?.full_name || 'Doctor',
          specialization: docSpec?.specialization || '',
          date: a.date,
          time: a.time,
          type: a.type,
          status: a.status,
          amount: a.payment_amount,
        };
      });

      const mapLabs = (labRes.data || []).map((l: any) => {
        const test = Array.isArray(l.lab_tests) ? l.lab_tests[0] : l.lab_tests;
        const pkg = Array.isArray(l.health_packages) ? l.health_packages[0] : l.health_packages;
        const center = Array.isArray(l.diagnostics_centers) ? l.diagnostics_centers[0] : l.diagnostics_centers;
        return {
          id: l.id,
          testName: test?.name || pkg?.name || 'Lab Test',
          center: center?.name || '',
          date: l.date,
          status: l.status,
          amount: l.amount,
        };
      });

      const mapOrders = (orderRes.data || []).map((o: any) => {
        const store = Array.isArray(o.medical_stores) ? o.medical_stores[0] : o.medical_stores;
        return {
          id: o.id,
          storeName: store?.store_name || 'Pharmacy',
          total: o.total_amount,
          status: o.status,
          date: o.created_at,
        };
      });

      setVisits(mapVisits);
      setLabReports(mapLabs);
      setOrders(mapOrders);
    } catch (e) {
      console.error('Failed to load health records:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const prescriptions = visits.filter(v => v.status === 'Completed');

  const formatDate = (d: string) => {
    if (!d) return '';
    try {
      const date = new Date(d);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return d; }
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      Completed: COLORS.success, Confirmed: COLORS.primary, Approved: '#7c3aed',
      delivered: COLORS.success, 'Report Ready': COLORS.success, Processing: '#d97706',
      Scheduled: COLORS.primary, 'Sample Collected': '#0891b2',
    };
    return map[s] || COLORS.textSecondary;
  };

  const renderVisit = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigation.getParent()?.navigate('Appointments', { screen: 'AppointmentDetail', params: { appointmentId: item.id } })}
      activeOpacity={0.7}
    >
      <View style={[styles.recordIcon, { backgroundColor: COLORS.primary + '15' }]}>
        <Ionicons name="person" size={20} color={COLORS.primary} />
      </View>
      <View style={styles.recordInfo}>
        <Text style={[styles.recordTitle, { color: colors.textPrimary }]}>{item.doctorName}</Text>
        <Text style={[styles.recordSub, { color: colors.textSecondary }]}>{item.specialization}</Text>
        <Text style={[styles.recordDate, { color: colors.textTertiary }]}>{formatDate(item.date)} {item.time !== 'To be confirmed' ? `· ${item.time}` : ''}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
        </View>
        {item.amount > 0 && <Text style={[styles.amount, { color: colors.textPrimary }]}>{formatCurrency(item.amount)}</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderPrescription = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => navigation.getParent()?.navigate('Appointments', { screen: 'AppointmentDetail', params: { appointmentId: item.id } })}
      activeOpacity={0.7}
    >
      <View style={[styles.recordIcon, { backgroundColor: '#9B59B6' + '15' }]}>
        <Ionicons name="document-text" size={20} color="#9B59B6" />
      </View>
      <View style={styles.recordInfo}>
        <Text style={[styles.recordTitle, { color: colors.textPrimary }]}>Prescription</Text>
        <Text style={[styles.recordSub, { color: colors.textSecondary }]}>Dr. {item.doctorName} · {item.specialization}</Text>
        <Text style={[styles.recordDate, { color: colors.textTertiary }]}>{formatDate(item.date)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  const renderReport = ({ item }: { item: any }) => (
    <View style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.recordIcon, { backgroundColor: '#FF6B35' + '15' }]}>
        <Ionicons name="flask" size={20} color="#FF6B35" />
      </View>
      <View style={styles.recordInfo}>
        <Text style={[styles.recordTitle, { color: colors.textPrimary }]}>{item.testName}</Text>
        <Text style={[styles.recordSub, { color: colors.textSecondary }]}>{item.center}</Text>
        <Text style={[styles.recordDate, { color: colors.textTertiary }]}>{formatDate(item.date)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
        </View>
        {item.amount > 0 && <Text style={[styles.amount, { color: colors.textPrimary }]}>{formatCurrency(item.amount)}</Text>}
      </View>
    </View>
  );

  const renderOrder = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        if (['delivered', 'cancelled', 'rejected'].includes(item.status)) return;
        navigation.getParent()?.navigate('Pharmacy', { screen: 'OrderTracking', params: { orderId: item.id } });
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.recordIcon, { backgroundColor: COLORS.success + '15' }]}>
        <Ionicons name="bag" size={20} color={COLORS.success} />
      </View>
      <View style={styles.recordInfo}>
        <Text style={[styles.recordTitle, { color: colors.textPrimary }]}>{item.storeName}</Text>
        <Text style={[styles.recordDate, { color: colors.textTertiary }]}>{formatDate(item.date)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: statusColor(item.status) }]}>{item.status}</Text>
        </View>
        <Text style={[styles.amount, { color: colors.textPrimary }]}>{formatCurrency(item.total)}</Text>
      </View>
    </TouchableOpacity>
  );

  // Determine which tabs have data
  const tabCounts: Record<RecordTab, number> = {
    visits: visits.length,
    prescriptions: prescriptions.length,
    labReports: labReports.length,
    orders: orders.length,
  };

  const visibleTabs = tabs.filter(t => tabCounts[t.key] > 0);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Health Records" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const totalRecords = visits.length + labReports.length + orders.length;

  if (totalRecords === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Health Records" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
          <EmptyState
            icon="document-text-outline"
            title="No Health Records Yet"
            subtitle="Your doctor visits, lab reports, prescriptions, and orders will appear here once you start using the app."
          />
        </View>
      </SafeAreaView>
    );
  }

  // Auto-select first visible tab if current tab has no data
  if (visibleTabs.length > 0 && tabCounts[activeTab] === 0) {
    const firstWithData = visibleTabs[0].key;
    if (firstWithData !== activeTab) {
      setActiveTab(firstWithData);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Health Records" onBack={() => navigation.goBack()} />

      {/* Stats Banner */}
      <LinearGradient colors={[COLORS.primary, '#0099FF']} style={styles.statsBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        {[
          { value: String(visits.length), label: 'Visits', show: visits.length > 0 },
          { value: String(labReports.length), label: 'Lab Reports', show: labReports.length > 0 },
          { value: String(orders.length), label: 'Orders', show: orders.length > 0 },
        ].filter(s => s.show).map((stat, i) => (
          <View key={i} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </LinearGradient>

      {/* Tabs - only show tabs that have data */}
      {visibleTabs.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsContent}>
          {visibleTabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, { borderColor: colors.border, backgroundColor: colors.card },
                activeTab === tab.key && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons name={tab.icon as any} size={14} color={activeTab === tab.key ? '#fff' : colors.textSecondary} />
              <Text style={[styles.tabText, { color: activeTab === tab.key ? '#fff' : colors.textSecondary }]}>
                {tab.label} ({tabCounts[tab.key]})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Content */}
      {activeTab === 'visits' && (
        <FlatList
          data={visits}
          keyExtractor={i => i.id}
          renderItem={renderVisit}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<EmptyState icon="calendar-outline" title="No Visit Records" subtitle="Your past doctor visits will appear here." />}
        />
      )}
      {activeTab === 'prescriptions' && (
        <FlatList
          data={prescriptions}
          keyExtractor={i => i.id}
          renderItem={renderPrescription}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<EmptyState icon="document-text-outline" title="No Prescriptions" subtitle="Your prescriptions will appear here." />}
        />
      )}
      {activeTab === 'labReports' && (
        <FlatList
          data={labReports}
          keyExtractor={i => i.id}
          renderItem={renderReport}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<EmptyState icon="flask-outline" title="No Lab Reports" subtitle="Your lab test reports will appear here." />}
        />
      )}
      {activeTab === 'orders' && (
        <FlatList
          data={orders}
          keyExtractor={i => i.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={<EmptyState icon="bag-outline" title="No Orders" subtitle="Your medicine orders will appear here." />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsBanner: { flexDirection: 'row', margin: SPACING.md, padding: SPACING.md, borderRadius: BORDER_RADIUS.xl },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '900' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FONT_SIZES.xs, textAlign: 'center', marginTop: 2 },
  tabsScroll: { maxHeight: 50 },
  tabsContent: { paddingHorizontal: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.sm },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: 8, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  tabText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  list: { padding: SPACING.md, paddingBottom: SPACING.xl },
  recordCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, gap: SPACING.md },
  recordIcon: { width: 44, height: 44, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  recordInfo: { flex: 1 },
  recordTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', marginBottom: 2 },
  recordSub: { fontSize: FONT_SIZES.sm, marginBottom: 2 },
  recordDate: { fontSize: FONT_SIZES.xs },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  statusText: { fontSize: 10, fontWeight: '700' },
  amount: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
});
