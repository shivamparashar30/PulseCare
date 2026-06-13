import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { useTheme } from '../../context/ThemeContext';
import { Header, EmptyState } from '../../components/common';
import { NOTIFICATIONS } from '../../data';
import { Notification } from '../../types';

type FilterType = 'all' | 'appointment' | 'medicine' | 'lab' | 'promotion';

const NotificationIcon = ({ type, colors }: { type: string; colors: any }) => {
  const config: Record<string, { icon: string; bg: string; color: string }> = {
    appointment: { icon: 'calendar', bg: colors.primary + '20', color: colors.primary },
    medicine: { icon: 'medical', bg: colors.success + '20', color: colors.success },
    lab: { icon: 'flask', bg: '#FF6B35' + '20', color: '#FF6B35' },
    promotion: { icon: 'pricetag', bg: '#9B59B6' + '20', color: '#9B59B6' },
    reminder: { icon: 'alarm', bg: colors.warning + '20', color: colors.warning },
  };
  const cfg = config[type] || config.appointment;
  return (
    <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
    </View>
  );
};

export default function NotificationsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<FilterType>('all');
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const [notifSettings, setNotifSettings] = useState({
    appointments: true,
    medicines: true,
    lab: true,
    promotions: false,
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'appointment', label: 'Appointments' },
    { key: 'medicine', label: 'Medicines' },
    { key: 'lab', label: 'Lab' },
    { key: 'promotion', label: 'Promotions' },
  ];

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notifCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        !item.isRead && { borderLeftColor: colors.primary, borderLeftWidth: 3 },
      ]}
      onPress={() => markRead(item.id)}
      activeOpacity={0.7}
    >
      <NotificationIcon type={item.type} colors={colors} />
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </View>
        <Text style={[styles.notifMessage, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={[styles.notifTime, { color: colors.textTertiary }]}>
          {item.time}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title="Notifications"
        onBack={() => navigation.goBack()}
        rightComponent={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead}>
              <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Filter Chips */}
      <FlatList
        data={filters}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        keyExtractor={i => i.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              { borderColor: colors.border, backgroundColor: colors.card },
              filter === item.key && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setFilter(item.key)}
          >
            <Text style={[styles.filterText, { color: colors.textSecondary },
              filter === item.key && { color: '#fff' }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Notification List */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No Notifications"
            subtitle="You're all caught up! Check back later."
          />
        }
        ListFooterComponent={
          <View style={[styles.settingsSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.settingsTitle, { color: colors.text }]}>Notification Preferences</Text>
            {[
              { key: 'appointments', label: 'Appointment Reminders', icon: 'calendar-outline' },
              { key: 'medicines', label: 'Medicine Reminders', icon: 'medical-outline' },
              { key: 'lab', label: 'Lab Report Alerts', icon: 'flask-outline' },
              { key: 'promotions', label: 'Promotions & Offers', icon: 'pricetag-outline' },
            ].map((s, idx, arr) => (
              <View key={s.key}>
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <Ionicons name={s.icon as any} size={18} color={colors.primary} />
                    <Text style={[styles.settingLabel, { color: colors.text }]}>{s.label}</Text>
                  </View>
                  <Switch
                    value={notifSettings[s.key as keyof typeof notifSettings]}
                    onValueChange={v => setNotifSettings(prev => ({ ...prev, [s.key]: v }))}
                    trackColor={{ false: colors.border, true: colors.primary + '60' }}
                    thumbColor={notifSettings[s.key as keyof typeof notifSettings] ? colors.primary : colors.textTertiary}
                  />
                </View>
                {idx < arr.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterList: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  filterText: { fontSize: FONT_SIZES.sm, fontWeight: '500' },
  list: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.xl },
  notifCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  notifTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: SPACING.sm },
  notifMessage: { fontSize: FONT_SIZES.sm, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: FONT_SIZES.xs },
  markAllText: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  settingsSection: {
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.md,
  },
  settingsTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', marginBottom: SPACING.md },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.sm },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  settingLabel: { fontSize: FONT_SIZES.sm },
  divider: { height: 1 },
});
