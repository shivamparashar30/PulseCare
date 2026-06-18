import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';

interface Props { profile: any; }

const STATUS_COLORS: Record<string, string> = {
  Pending: '#D97706',
  Approved: '#2563EB',
  Confirmed: '#059669',
  Completed: '#4338CA',
  Cancelled: '#DC2626',
  Upcoming: '#2563EB',
};

export default function DoctorHomeTab({ profile }: Props) {
  const [stats, setStats] = useState({ pending: 0, approved: 0, confirmed: 0, today: 0 });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  const load = useCallback(async () => {
    const userId = profile?.id;
    if (!userId) return;

    const { data: dp } = await supabase.from('doctor_profiles').select('*').eq('id', userId).single();
    setDoctorProfile(dp);

    const { data: appts } = await supabase
      .from('appointments')
      .select('*, patient:profiles!patient_id(full_name, avatar_url, phone)')
      .eq('doctor_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    const list = appts || [];
    const today = new Date().toISOString().split('T')[0];

    setStats({
      pending: list.filter(a => a.status === 'Pending').length,
      approved: list.filter(a => a.status === 'Approved').length,
      confirmed: list.filter(a => a.status === 'Confirmed').length,
      today: list.filter(a => a.date === today && (a.status === 'Confirmed' || a.status === 'Approved')).length,
    });
    setRecentAppointments(list.slice(0, 5));
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const statusColor = (s: string) => STATUS_COLORS[s] || '#DC2626';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},</Text>
            <Text style={styles.name}>Dr. {profile?.full_name?.replace(/^Dr\.?\s*/i, '') || 'Doctor'}</Text>
            <Text style={styles.spec}>{doctorProfile?.specialization || 'Doctor'}</Text>
          </View>
          <Image
            source={{ uri: profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'Dr')}&background=2563EB&color=fff` }}
            style={styles.avatar}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Pending', value: stats.pending, icon: 'time', color: '#D97706', bg: '#FFFBEB' },
            { label: 'Approved', value: stats.approved, icon: 'checkmark-circle-outline', color: '#2563EB', bg: '#EFF6FF' },
            { label: 'Confirmed', value: stats.confirmed, icon: 'checkmark-circle', color: '#059669', bg: '#ECFDF5' },
            { label: "Today's", value: stats.today, icon: 'today', color: '#7C3AED', bg: '#F5F3FF' },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
              <Ionicons name={s.icon as any} size={22} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Appointments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Appointments</Text>
        </View>

        {recentAppointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={40} color="#D1D5DB" />
            <Text style={styles.emptyText}>No appointments yet</Text>
            <Text style={styles.emptySubText}>Patient appointment requests will appear here</Text>
          </View>
        ) : (
          recentAppointments.map((appt) => {
            const patient = Array.isArray(appt.patient) ? appt.patient[0] : appt.patient;
            return (
              <View key={appt.id} style={styles.apptCard}>
                <Image
                  source={{ uri: patient?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient?.full_name || 'P')}&background=E5E7EB&color=374151` }}
                  style={styles.apptAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.apptName}>{patient?.full_name || 'Patient'}</Text>
                  <Text style={styles.apptDate}>
                    {new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {appt.time && appt.time !== 'To be confirmed' ? appt.time : 'TBD'}
                  </Text>
                  {appt.symptoms ? <Text style={styles.apptSymptoms} numberOfLines={1}>{appt.symptoms}</Text> : null}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(appt.status) + '15' }]}>
                  <Text style={[styles.statusText, { color: statusColor(appt.status) }]}>{appt.status}</Text>
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
  name: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 2 },
  spec: { fontSize: 13, color: '#2563EB', fontWeight: '600', marginTop: 2 },
  avatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#2563EB' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 10, marginTop: 10 },
  statCard: { width: '47%', flexGrow: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  emptyCard: { alignItems: 'center', padding: 40, marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#6B7280', marginTop: 12 },
  emptySubText: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  apptCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 10, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', gap: 12 },
  apptAvatar: { width: 44, height: 44, borderRadius: 22 },
  apptName: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  apptDate: { fontSize: 12, color: '#64748B', marginTop: 2 },
  apptSymptoms: { fontSize: 11, color: '#9CA3AF', marginTop: 2, fontStyle: 'italic' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
});
