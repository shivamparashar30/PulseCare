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
import { supabase } from '../supabase';
import { notificationsApi } from '../../../../packages/core/src/api/api';
import { Notification } from '../../../../packages/core/src/types';
import { timeAgo } from '../../../../packages/core/src/utils';

const ACCENT = '#059669';

const ICON_CONFIG: Record<string, { icon: string; bg: string; color: string }> = {
  order: { icon: 'cart', bg: '#05966920', color: '#059669' },
  general: { icon: 'notifications', bg: '#F39C1220', color: '#F39C12' },
};

interface Props { profile: any; }

export default function NotificationsTab({ profile }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const userId = profile?.id;

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    const data = await notificationsApi.getByUser(userId, 'medical_store');
    setNotifications(data);
  }, [userId]);

  useEffect(() => {
    fetchNotifications().finally(() => setLoading(false));
  }, [fetchNotifications]);

  // Realtime
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('store-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload: any) => {
        const row = payload.new;
        if (row.role && row.role !== 'medical_store') return;
        setNotifications(prev => [{
          id: row.id, title: row.title, message: row.message,
          type: row.type || 'general', isRead: false,
          createdAt: row.created_at, actionType: row.action_type,
          actionId: row.action_id, role: row.role,
        }, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await notificationsApi.markRead(id);
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (userId) await notificationsApi.markAllRead(userId, 'medical_store');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const cfg = ICON_CONFIG[item.type] || ICON_CONFIG.general;
    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.cardUnread]}
        onPress={() => markRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
        </View>
        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            {!item.isRead && <View style={styles.dot} />}
          </View>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={[styles.markAll, { color: ACCENT }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={i => i.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={56} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyText}>You're all caught up!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  markAll: { fontSize: 13, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12,
    padding: 14, gap: 12, borderWidth: 1, borderColor: '#E5E7EB',
  },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: ACCENT },
  iconBox: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  title: { fontSize: 15, fontWeight: '600', color: '#1E293B', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT, marginLeft: 8 },
  message: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 4 },
  time: { fontSize: 11, color: '#9CA3AF' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginTop: 16 },
  emptyText: { fontSize: 13, color: '#9CA3AF', marginTop: 4 },
});
