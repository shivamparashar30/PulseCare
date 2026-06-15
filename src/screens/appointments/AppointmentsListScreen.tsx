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
import { useTheme } from '../../context/ThemeContext';
import { useAppointments } from '../../hooks';
import { AppointmentStackParamList } from '../../types';
import { EmptyState } from '../../components/common';
import { formatDate } from '../../utils';

type Nav = NativeStackNavigationProp<AppointmentStackParamList, 'AppointmentsList'>;

const TABS = ['Upcoming', 'Completed', 'Cancelled'];

const TAB_ICONS: Record<string, string> = {
  Upcoming: 'time-outline',
  Completed: 'checkmark-circle-outline',
  Cancelled: 'close-circle-outline',
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: string }> = {
  upcoming: { bg: '#EEF2FF', text: '#4338CA', icon: 'time-outline' },
  confirmed: { bg: '#EEF2FF', text: '#4338CA', icon: 'time-outline' },
  completed: { bg: '#ECFDF5', text: '#047857', icon: 'checkmark-circle' },
  cancelled: { bg: '#FEF2F2', text: '#B91C1C', icon: 'close-circle' },
};

export default function AppointmentsListScreen() {
  const navigation = useNavigation<Nav>();
  const { colors } = useTheme();
  const { data: appointments = [], isLoading, refetch, isRefetching } = useAppointments();
  const [activeTab, setActiveTab] = useState('Upcoming');

  const filtered = appointments.filter((a) => {
    const s = a.status.toLowerCase();
    if (activeTab === 'Upcoming') return s === 'upcoming' || s === 'confirmed';
    if (activeTab === 'Completed') return s === 'completed';
    return s === 'cancelled';
  });

  const renderAppointment = ({ item }: any) => {
    const status = STATUS_CONFIG[item.status.toLowerCase()] ?? STATUS_CONFIG.upcoming;
    const isUpcoming = item.status.toLowerCase() === 'upcoming' || item.status.toLowerCase() === 'confirmed';

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
        activeOpacity={0.9}
      >
        {/* Top: Doctor info + status */}
        <View style={styles.cardHeader}>
          <View style={styles.doctorRow}>
            <Image source={{ uri: item.doctor.avatar }} style={styles.avatar} />
            <View style={styles.doctorInfo}>
              <Text style={[styles.docName, { color: colors.textPrimary }]} numberOfLines={1}>{item.doctor.name}</Text>
              <Text style={styles.spec}>{item.doctor.specialization}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Ionicons name={status.icon as any} size={12} color={status.text} />
            <Text style={[styles.statusText, { color: status.text }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Meta: Date, Time, Type */}
        <View style={styles.metaGrid}>
          <View style={[styles.metaBox, { backgroundColor: colors.background }]}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
            <View>
              <Text style={[styles.metaLabel, { color: colors.textTertiary }]}>Date</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{formatDate(item.date)}</Text>
            </View>
          </View>
          <View style={[styles.metaBox, { backgroundColor: colors.background }]}>
            <Ionicons name="time-outline" size={14} color={COLORS.primary} />
            <View>
              <Text style={[styles.metaLabel, { color: colors.textTertiary }]}>Time</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{item.time}</Text>
            </View>
          </View>
          <View style={[styles.metaBox, { backgroundColor: colors.background }]}>
            <Ionicons name={item.type === 'Video' ? 'videocam-outline' : 'business-outline'} size={14} color={COLORS.primary} />
            <View>
              <Text style={[styles.metaLabel, { color: colors.textTertiary }]}>Type</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{item.type === 'Video' ? 'Video' : 'Clinic'}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        {isUpcoming && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.rescheduleBtn, { borderColor: colors.border }]}>
              <Ionicons name="swap-horizontal-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.rescheduleBtnText, { color: colors.textSecondary }]}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.joinBtn}>
              <Ionicons name="videocam" size={14} color="#fff" />
              <Text style={styles.joinBtnText}>Join Call</Text>
            </TouchableOpacity>
          </View>
        )}
        {item.status.toLowerCase() === 'completed' && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.rescheduleBtn, { borderColor: colors.border, flex: 1 }]}>
              <Ionicons name="document-text-outline" size={14} color={COLORS.primary} />
              <Text style={[styles.rescheduleBtnText, { color: COLORS.primary }]}>View Prescription</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.rescheduleBtn, { borderColor: colors.border, flex: 1 }]}>
              <Ionicons name="repeat-outline" size={14} color={COLORS.primary} />
              <Text style={[styles.rescheduleBtnText, { color: COLORS.primary }]}>Book Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My Appointments</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={TAB_ICONS[tab] as any}
                size={16}
                color={isActive ? '#fff' : colors.textTertiary}
              />
              <Text style={[styles.tabText, { color: colors.textTertiary }, isActive && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Count */}
      <Text style={[styles.count, { color: colors.textTertiary }]}>
        {filtered.length} {filtered.length === 1 ? 'appointment' : 'appointments'}
      </Text>

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
  container: { flex: 1 },
  header: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: SPACING.base,
    borderRadius: BORDER_RADIUS.lg,
    padding: 4,
    ...SHADOWS.sm,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    gap: 5,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  count: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    paddingHorizontal: SPACING.base,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  list: {
    paddingHorizontal: SPACING.base,
    gap: SPACING.md,
    paddingBottom: 30,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  doctorInfo: { flex: 1 },
  docName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  spec: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  divider: {
    height: 1,
    marginVertical: SPACING.md,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  metaBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metaValue: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  rescheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
  },
  rescheduleBtnText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
  joinBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
  },
  joinBtnText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#fff',
  },
});
