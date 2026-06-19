import React, { useState, useEffect, useCallback } from 'react';
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
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../../../../packages/core/src/constants';
import { useTheme } from '../../../../../../packages/providers/src/ThemeProvider';
import { Header, EmptyState } from '../../../../../../packages/shared/src/components';
import { notificationsApi } from '../../../../../../packages/core/src/api/api';
import { Notification } from '../../../../../../packages/core/src/types';
import { timeAgo } from '../../../../../../packages/core/src/utils';
import { supabase } from '../../../../../../packages/supabase/src/client';

type FilterType = 'all' | 'appointment' | 'order' | 'lab' | 'general';

const ICON_CONFIG: Record<string, { icon: string; bg: string; color: string }> = {
  appointment: { icon: 'calendar', bg: '#0066CC20', color: '#0066CC' },
  order: { icon: 'cart', bg: '#05966920', color: '#059669' },
  lab: { icon: 'flask', bg: '#7C3AED20', color: '#7C3AED' },
  general: { icon: 'notifications', bg: '#F39C1220', color: '#F39C12' },
};

export default function NotificationsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [filter, setFilter] = useState<FilterType>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    setUserId(session.user.id);
    const data = await notificationsApi.getByUser(session.user.id, 'patient');
    setNotifications(data);
  }, []);

  useEffect(() => {
    fetchNotifications().finally(() => setLoading(false));
  }, [fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('patient-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload: any) => {
        const row = payload.new;
        if (row.role && row.role !== 'patient') return;
        const newNotif: Notification = {
          id: row.id,
          title: row.title,
          message: row.message,
          type: row.type || 'general',
          isRead: row.read ?? false,
          createdAt: row.created_at,
          actionType: row.action_type,
          actionId: row.action_id,
          role: row.role,
        };
        setNotifications(prev => {
          if (prev.some(n => n.id === newNotif.id)) return prev;
          return [newNotif, ...prev];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const filtered = filter === 'all'
    ? notifications
    : notifications.filter(n => n.type === filter);

  const handleNotifPress = async (item: Notification) => {
    // Mark as read
    if (!item.isRead) {
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, isRead: true } : n));
      await notificationsApi.markRead(item.id);
    }

    // Deep link based on action_type
    if (item.actionType === 'appointment' && item.actionId) {
      // Navigate to Appointments tab → AppointmentDetail
      const parent = navigation.getParent?.();
      if (parent) {
        parent.navigate('Appointments', { screen: 'AppointmentDetail', params: { appointmentId: item.actionId } });
      }
    } else if (item.actionType === 'order' && item.actionId) {
      const parent = navigation.getParent?.();
      if (parent) {
        parent.navigate('Pharmacy', { screen: 'OrderTracking', params: { orderId: item.actionId } });
      }
    }
  };

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await notificationsApi.markRead(id);
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (userId) await notificationsApi.markAllRead(userId, 'patient');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'appointment', label: 'Appointments' },
    { key: 'order', label: 'Orders' },
    { key: 'lab', label: 'Lab' },
    { key: 'general', label: 'General' },
  ];

  const renderNotification = ({ item }: { item: Notification }) => {
    const cfg = ICON_CONFIG[item.type] || ICON_CONFIG.general;
    return (
      <TouchableOpacity
        style={[
          styles.notifCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          !item.isRead && { borderLeftColor: COLORS.primary, borderLeftWidth: 3 },
        ]}
        onPress={() => handleNotifPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
        </View>
        <View style={styles.notifContent}>
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: COLORS.primary }]} />}
          </View>
          <Text style={[styles.notifMessage, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={[styles.notifTime, { color: colors.textTertiary }]}>
            {timeAgo(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <Header title="Notifications" onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header
        title="Notifications"
        onBack={() => navigation.goBack()}
        rightComponent={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead}>
              <Text style={[styles.markAllText, { color: COLORS.primary }]}>Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {filters.map(item => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.filterChip,
              { borderColor: colors.border, backgroundColor: colors.card },
              filter === item.key && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
            ]}
            onPress={() => setFilter(item.key)}
          >
            <Text style={[styles.filterText, { color: colors.textSecondary },
              filter === item.key && { color: '#fff' }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notification List */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No Notifications"
            subtitle="You're all caught up! Check back later."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontWeight: '500' },
  list: { padding: SPACING.md, paddingBottom: SPACING.xl },
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
});
