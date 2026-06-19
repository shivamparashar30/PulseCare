import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../../packages/supabase/src/client';

// ChatScreen sets this to suppress banners for the active conversation
export const activeChatEntityId = { current: null as string | null };

interface NotifData {
  id: string;
  title: string;
  message: string;
  type: string;
  actionType: string;
  actionId: string;
  avatarUrl?: string;
}

interface Props {
  role: 'patient' | 'doctor' | 'medical_store' | 'diagnostics';
  onPress: (notif: NotifData) => void;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  appointment: { label: 'Appointment', color: '#0066CC', bg: '#0066CC' },
  order: { label: 'Order', color: '#059669', bg: '#059669' },
  lab_booking: { label: 'Lab Booking', color: '#7C3AED', bg: '#7C3AED' },
  general: { label: 'Notification', color: '#F59E0B', bg: '#F59E0B' },
};

export default function InAppNotificationBanner({ role, onPress }: Props) {
  const [notif, setNotif] = useState<NotifData | null>(null);
  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-140)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let channel: any = null;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      channel = supabase
        .channel(`inapp-banner-${role}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`,
        }, async (payload: any) => {
          const row = payload.new;
          if (row.role && row.role !== role) return;
          if (activeChatEntityId.current && row.action_id === activeChatEntityId.current) return;

          // Look up sender avatar from the entity
          let avatarUrl: string | undefined;
          let displayTitle = row.title || 'New message';

          if (row.action_id && row.action_type) {
            try {
              if (row.action_type === 'appointment') {
                const col = role === 'doctor' ? 'patient_id' : 'doctor_id';
                const { data: appt } = await supabase
                  .from('appointments').select(col).eq('id', row.action_id).single();
                if (appt) {
                  const senderId = (appt as any)[col];
                  const { data: profile } = await supabase
                    .from('profiles').select('avatar_url, full_name').eq('id', senderId).single();
                  if (profile) {
                    avatarUrl = profile.avatar_url;
                    // Add "Dr." prefix for patient receiving from doctor
                    if (role === 'patient' && profile.full_name) {
                      const name = profile.full_name.replace(/^Dr\.?\s*/i, '');
                      displayTitle = `Dr. ${name}`;
                    }
                  }
                }
              } else if (row.action_type === 'order') {
                const col = role === 'patient' ? 'store_id' : 'patient_id';
                const { data: ord } = await supabase
                  .from('orders').select(col).eq('id', row.action_id).single();
                if (ord) {
                  const senderId = (ord as any)[col];
                  const { data: profile } = await supabase
                    .from('profiles').select('avatar_url').eq('id', senderId).single();
                  if (profile) avatarUrl = profile.avatar_url;
                }
              } else if (row.action_type === 'lab_booking') {
                const col = role === 'patient' ? 'center_id' : 'patient_id';
                const { data: lb } = await supabase
                  .from('lab_bookings').select(col).eq('id', row.action_id).single();
                if (lb) {
                  const senderId = (lb as any)[col];
                  const { data: profile } = await supabase
                    .from('profiles').select('avatar_url').eq('id', senderId).single();
                  if (profile) avatarUrl = profile.avatar_url;
                }
              }
            } catch { /* ignore lookup errors */ }
          }

          setNotif({
            id: row.id,
            title: displayTitle,
            message: row.message,
            type: row.type || 'general',
            actionType: row.action_type || '',
            actionId: row.action_id || '',
            avatarUrl,
          });
        })
        .subscribe();
    })();

    return () => { if (channel) supabase.removeChannel(channel); };
  }, [role]);

  // Animate banner in/out when notif changes
  useEffect(() => {
    if (!notif) return;

    setVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0, useNativeDriver: true, speed: 14, bounciness: 4,
    }).start();

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(dismiss, 4000);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [notif]);

  const dismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -160, duration: 250, useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setNotif(null);
    });
  };

  const handlePress = () => {
    if (notif) {
      onPress(notif);
      dismiss();
    }
  };

  if (!visible || !notif) return null;

  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.general;

  const avatarUri = notif.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.title)}&background=4F46E5&color=fff&size=80`;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <View style={[styles.avatarBadge, { backgroundColor: cfg.color }]}>
            <Ionicons
              name={notif.type === 'appointment' ? 'chatbubble' : notif.type === 'order' ? 'cart' : 'chatbubble'}
              size={8}
              color="#fff"
            />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{notif.title}</Text>
            <Text style={styles.timeText}>now</Text>
          </View>
          <Text style={styles.message} numberOfLines={2}>{notif.message}</Text>
          <View style={[styles.typeBadge, { backgroundColor: cfg.color + '12' }]}>
            <Text style={[styles.typeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Close */}
        <TouchableOpacity style={styles.closeBtn} onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 32,
    left: 12,
    right: 12,
    zIndex: 9999,
    elevation: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: { fontSize: 15, fontWeight: '700', color: '#1E293B', flex: 1, marginRight: 8 },
  timeText: { fontSize: 11, color: '#9CA3AF', fontWeight: '500' },
  message: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 6 },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
});
