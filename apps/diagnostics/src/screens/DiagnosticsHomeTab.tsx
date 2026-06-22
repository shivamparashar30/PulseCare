import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';

interface Props { profile: any; }

const STATUS_COLORS: Record<string, string> = {
  Pending: '#D97706',
  Approved: '#7C3AED',
  Completed: '#059669',
  Cancelled: '#DC2626',
};

export default function DiagnosticsHomeTab({ profile }: Props) {
  const [stats, setStats] = useState({ pending: 0, approved: 0, completed: 0, today: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [centerInfo, setCenterInfo] = useState<any>(null);

  const load = useCallback(async () => {
    const userId = profile?.id;
    if (!userId) return;

    const { data: center } = await supabase.from('diagnostics_centers').select('*').eq('id', userId).single();
    setCenterInfo(center);

    const { data: bookings } = await supabase
      .from('lab_bookings')
      .select('*, test:lab_tests!lab_test_id(name, category), patient:profiles!patient_id(full_name, avatar_url, phone)')
      .eq('diagnostics_center_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    const list = bookings || [];
    const today = new Date().toISOString().split('T')[0];

    setStats({
      pending: list.filter(b => b.status === 'Pending').length,
      approved: list.filter(b => b.status === 'Approved').length,
      completed: list.filter(b => b.status === 'Completed').length,
      today: list.filter(b => b.date === today && (b.status === 'Approved' || b.status === 'Pending')).length,
    });
    setRecentBookings(list.slice(0, 5));
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  // Realtime: auto-update when lab bookings change
  useEffect(() => {
    const userId = profile?.id;
    if (!userId) return;
    const channel = supabase
      .channel('diagnostics-home-bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lab_bookings',
        filter: `diagnostics_center_id=eq.${userId}`,
      }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const statusColor = (s: string) => STATUS_COLORS[s] || '#DC2626';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},</Text>
            <Text style={styles.name}>{centerInfo?.center_name || profile?.full_name || 'Diagnostics Center'}</Text>
            <Text style={styles.spec}>{centerInfo?.address ? centerInfo.address.split(',')[0] : 'Diagnostics Center'}</Text>
          </View>
          <Image
            source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'DC')}&background=7C3AED&color=fff` }}
            style={styles.avatar}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Pending', value: stats.pending, icon: 'time', color: '#D97706', bg: '#FFFBEB' },
            { label: 'Approved', value: stats.approved, icon: 'checkmark-circle-outline', color: '#7C3AED', bg: '#F5F3FF' },
            { label: 'Completed', value: stats.completed, icon: 'checkmark-circle', color: '#059669', bg: '#ECFDF5' },
            { label: "Today's", value: stats.today, icon: 'today', color: '#2563EB', bg: '#EFF6FF' },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
              <Ionicons name={s.icon as any} size={22} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Bookings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
        </View>

        {recentBookings.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="flask-outline" size={40} color="#D1D5DB" />
            <Text style={styles.emptyText}>No bookings yet</Text>
            <Text style={styles.emptySubText}>Patient booking requests will appear here</Text>
          </View>
        ) : (
          recentBookings.map((booking) => {
            const patient = Array.isArray(booking.patient) ? booking.patient[0] : booking.patient;
            const test = Array.isArray(booking.test) ? booking.test[0] : booking.test;
            return (
              <View key={booking.id} style={styles.bookingCard}>
                <Image
                  source={{ uri: patient?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient?.full_name || 'P')}&background=E5E7EB&color=374151` }}
                  style={styles.bookingAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.bookingName}>{patient?.full_name || 'Patient'}</Text>
                  <Text style={styles.bookingTest}>{test?.name || 'Lab Test'}</Text>
                  <Text style={styles.bookingDate}>
                    {booking.date ? new Date(booking.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Date TBD'}
                    {' '}&bull;{' '}
                    {booking.time && booking.time !== 'To be confirmed' ? booking.time : 'Time TBD'}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(booking.status) + '15' }]}>
                  <Text style={[styles.statusText, { color: statusColor(booking.status) }]}>{booking.status}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 },
  greeting: { fontSize: 14, color: '#64748B' },
  name: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginTop: 2 },
  spec: { fontSize: 13, color: '#7C3AED', fontWeight: '600', marginTop: 2 },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#7C3AED' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 10, marginTop: 10 },
  statCard: { width: '47%', flexGrow: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  emptyCard: { alignItems: 'center', padding: 40, marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#6B7280', marginTop: 12 },
  emptySubText: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  bookingCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', gap: 12 },
  bookingAvatar: { width: 44, height: 44, borderRadius: 22 },
  bookingName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  bookingTest: { fontSize: 12, color: '#7C3AED', fontWeight: '600', marginTop: 1 },
  bookingDate: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
});
