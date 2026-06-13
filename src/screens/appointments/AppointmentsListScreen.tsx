import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useAppointments } from '../../hooks';
import { AppointmentsStackParamList } from '../../types';
import { EmptyState } from '../../components/common';
import { formatDate } from '../../utils';

type Nav = NativeStackNavigationProp<AppointmentsStackParamList, 'AppointmentsList'>;

const TABS = ['Upcoming', 'Completed', 'Cancelled'];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  upcoming: { bg: '#dbeafe', text: '#1d4ed8' },
  completed: { bg: '#dcfce7', text: '#15803d' },
  cancelled: { bg: '#fee2e2', text: '#dc2626' },
};

export default function AppointmentsListScreen() {
  const navigation = useNavigation<Nav>();
  const { data: appointments = [], isLoading, refetch, isRefetching } = useAppointments();
  const [activeTab, setActiveTab] = useState('Upcoming');

  const filtered = appointments.filter((a) => {
    const s = a.status.toLowerCase();
    if (activeTab === 'Upcoming') return s === 'upcoming' || s === 'confirmed';
    if (activeTab === 'Completed') return s === 'completed';
    return s === 'cancelled';
  });

  const renderAppointment = ({ item }: any) => {
    const colors = STATUS_COLORS[item.status.toLowerCase()] ?? STATUS_COLORS.upcoming;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.doctor.avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <View style={styles.topRow}>
            <Text style={styles.docName} numberOfLines={1}>{item.doctor.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
              <Text style={[styles.statusText, { color: colors.text }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.spec}>{item.doctor.specialization}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{formatDate(item.date)}</Text>
            <Ionicons name="time-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{item.time}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="business-outline" size={12} color={COLORS.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>{item.doctor.hospital}</Text>
          </View>
          <View style={styles.actionRow}>
            {item.status === 'upcoming' && (
              <>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>Reschedule</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.callBtn}>
                  <Ionicons name="videocam-outline" size={14} color="#fff" />
                  <Text style={styles.callBtnText}>Join</Text>
                </TouchableOpacity>
              </>
            )}
            {item.status === 'completed' && (
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>View Prescription</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title={`No ${activeTab.toLowerCase()} appointments`}
          subtitle="Book an appointment with a doctor"
          actionLabel="Find Doctors"
          onAction={() => {}}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderAppointment}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[COLORS.primary]} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    ...SHADOWS.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  list: { padding: SPACING.md, paddingTop: 0, gap: SPACING.sm, paddingBottom: 80 },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    gap: SPACING.md,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  info: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  docName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, flex: 1 },
  statusBadge: { borderRadius: BORDER_RADIUS.sm, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: '700' },
  spec: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '600', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  metaText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  actionRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  actionBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
  },
  actionBtnText: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '600' },
  callBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  callBtnText: { fontSize: FONT_SIZES.xs, color: '#fff', fontWeight: '600' },
});
