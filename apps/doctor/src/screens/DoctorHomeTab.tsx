import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';

interface Props {
  profile: any;
  onNavigateToAppointments?: (filter?: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: '#F59E0B',
  Approved: '#3B82F6',
  Confirmed: '#10B981',
  Completed: '#6366F1',
  Cancelled: '#EF4444',
};

export default function DoctorHomeTab({ profile, onNavigateToAppointments }: Props) {
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0, today: 0 });
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
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
      .limit(50);

    const list = appts || [];
    const today = new Date().toISOString().split('T')[0];
    const todayList = list.filter(a => a.date === today && ['Confirmed', 'Approved'].includes(a.status));

    setStats({
      pending: list.filter(a => a.status === 'Pending').length,
      confirmed: list.filter(a => a.status === 'Confirmed').length,
      completed: list.filter(a => a.status === 'Completed').length,
      today: todayList.length,
    });
    setTodayAppointments(todayList.slice(0, 5));
    setPendingAppointments(list.filter(a => a.status === 'Pending').slice(0, 4));
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const userId = profile?.id;
    if (!userId) return;
    const channel = supabase
      .channel('doctor-home-appointments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `doctor_id=eq.${userId}` }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const doctorName = profile?.full_name?.replace(/^Dr\.?\s*/i, '') || 'Doctor';
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'Dr')}&background=2563EB&color=fff&size=200`;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* --- HEADER --- */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.greet}>{getGreeting()}</Text>
            <Text style={s.docName} numberOfLines={1}>Dr. {doctorName}</Text>
            <Text style={s.spec}>{doctorProfile?.specialization || 'Doctor'}</Text>
          </View>
          <Image source={{ uri: avatarUrl }} style={s.avatar} />
        </View>

        {/* --- STATS ROW --- */}
        <View style={s.statsRow}>
          {([
            { label: 'Today', val: stats.today, color: '#3B82F6', bg: '#EFF6FF', icon: 'today', filter: 'Confirmed' },
            { label: 'Pending', val: stats.pending, color: '#F59E0B', bg: '#FFFBEB', icon: 'time', filter: 'Pending' },
            { label: 'Active', val: stats.confirmed, color: '#10B981', bg: '#ECFDF5', icon: 'pulse', filter: 'Confirmed' },
            { label: 'Done', val: stats.completed, color: '#6366F1', bg: '#EEF2FF', icon: 'checkmark-done', filter: 'Completed' },
          ] as const).map(item => (
            <TouchableOpacity
              key={item.label}
              style={[s.statCard, { backgroundColor: item.bg }]}
              onPress={() => onNavigateToAppointments?.(item.filter)}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon as any} size={16} color={item.color} />
              <Text style={[s.statVal, { color: item.color }]}>{item.val}</Text>
              <Text style={s.statLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- TODAY'S SCHEDULE --- */}
        <View style={s.card}>
          <View style={s.cardTitleRow}>
            <Text style={s.cardTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => onNavigateToAppointments?.('Confirmed')} activeOpacity={0.6}>
              <Text style={s.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {todayAppointments.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="calendar-outline" size={28} color="#CBD5E1" />
              <Text style={s.emptyText}>No appointments today</Text>
            </View>
          ) : (
            todayAppointments.map((appt, i) => {
              const patient = Array.isArray(appt.patient) ? appt.patient[0] : appt.patient;
              const time = appt.time && appt.time !== 'To be confirmed' ? appt.time : 'TBD';
              const color = STATUS_COLORS[appt.status] || '#3B82F6';
              return (
                <View key={appt.id} style={[s.listItem, i === todayAppointments.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <View style={[s.dot, { backgroundColor: color }]} />
                  <Image
                    source={{ uri: patient?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient?.full_name || 'P')}&background=E5E7EB&color=374151&size=80` }}
                    style={s.listAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={s.listName} numberOfLines={1}>{patient?.full_name || 'Patient'}</Text>
                    <View style={s.metaRow}>
                      <Ionicons name="time-outline" size={11} color="#94A3B8" />
                      <Text style={s.metaText}>{time}</Text>
                      <Text style={s.metaSep}>|</Text>
                      <Ionicons name={appt.type === 'video' ? 'videocam-outline' : 'business-outline'} size={11} color="#94A3B8" />
                      <Text style={s.metaText}>{appt.type === 'video' ? 'Video' : 'Clinic'}</Text>
                    </View>
                  </View>
                  <View style={[s.statusPill, { backgroundColor: color + '14' }]}>
                    <Text style={[s.statusPillText, { color }]}>{appt.status}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* --- PENDING REQUESTS --- */}
        {pendingAppointments.length > 0 && (
          <View style={s.card}>
            <View style={s.cardTitleRow}>
              <Text style={s.cardTitle}>Pending Requests</Text>
              <TouchableOpacity
                onPress={() => onNavigateToAppointments?.('Pending')}
                activeOpacity={0.6}
                style={s.viewAllRow}
              >
                <View style={s.pendingBadge}>
                  <Text style={s.pendingBadgeText}>{stats.pending}</Text>
                </View>
                <Text style={s.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {pendingAppointments.map((appt, i) => {
              const patient = Array.isArray(appt.patient) ? appt.patient[0] : appt.patient;
              return (
                <View key={appt.id} style={[s.listItem, i === pendingAppointments.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <Image
                    source={{ uri: patient?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient?.full_name || 'P')}&background=E5E7EB&color=374151&size=80` }}
                    style={s.listAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={s.listName} numberOfLines={1}>{patient?.full_name || 'Patient'}</Text>
                    <View style={s.metaRow}>
                      <Ionicons name="calendar-outline" size={11} color="#94A3B8" />
                      <Text style={s.metaText}>
                        {new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </Text>
                      {appt.type && (
                        <>
                          <Text style={s.metaSep}>|</Text>
                          <Ionicons name={appt.type === 'video' ? 'videocam-outline' : 'business-outline'} size={11} color="#94A3B8" />
                          <Text style={s.metaText}>{appt.type === 'video' ? 'Video' : 'Clinic'}</Text>
                        </>
                      )}
                    </View>
                    {appt.symptoms ? <Text style={s.symptoms} numberOfLines={1}>{appt.symptoms}</Text> : null}
                  </View>
                  <View style={[s.statusPill, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[s.statusPillText, { color: '#D97706' }]}>Pending</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* --- OVERVIEW --- */}
        <View style={s.card}>
          <Text style={[s.cardTitle, { marginBottom: 12 }]}>Your Profile</Text>
          <View style={s.overviewRow}>
            {([
              { label: 'Experience', val: `${doctorProfile?.experience_years || 0} yrs`, icon: 'ribbon-outline' as const, color: '#6366F1' },
              { label: 'Reviews', val: `${doctorProfile?.total_reviews || 0}`, icon: 'chatbubble-outline' as const, color: '#3B82F6' },
              { label: 'Rating', val: doctorProfile?.rating ? Number(doctorProfile.rating).toFixed(1) : '--', icon: 'star' as const, color: '#F59E0B' },
            ]).map(item => (
              <View key={item.label} style={s.overviewCell}>
                <Ionicons name={item.icon} size={16} color={item.color} />
                <Text style={s.overviewVal}>{item.val}</Text>
                <Text style={s.overviewLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greet: { fontSize: 13, color: '#94A3B8', fontWeight: '500', letterSpacing: 0.2 },
  docName: { fontSize: 21, fontWeight: '700', color: '#0F172A', marginTop: 2 },
  spec: { fontSize: 13, color: '#3B82F6', fontWeight: '600', marginTop: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#BFDBFE' },

  /* Stats */
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 2,
  },
  statVal: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', color: '#64748B', letterSpacing: 0.3 },

  /* Shared card */
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  viewAll: { fontSize: 12, fontWeight: '600', color: '#3B82F6' },
  viewAllRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  /* Empty */
  empty: { alignItems: 'center', paddingVertical: 20, gap: 6 },
  emptyText: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },

  /* List item (shared for today + pending) */
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  listAvatar: { width: 36, height: 36, borderRadius: 18 },
  listName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  metaSep: { fontSize: 11, color: '#D1D5DB', marginHorizontal: 2 },
  symptoms: { fontSize: 11, color: '#CBD5E1', marginTop: 3, fontStyle: 'italic' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusPillText: { fontSize: 10, fontWeight: '700' },

  /* Pending badge */
  pendingBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  pendingBadgeText: { fontSize: 12, fontWeight: '700', color: '#D97706' },

  /* Overview */
  overviewRow: { flexDirection: 'row', gap: 8 },
  overviewCell: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  overviewVal: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  overviewLabel: { fontSize: 10, fontWeight: '600', color: '#94A3B8' },
});
