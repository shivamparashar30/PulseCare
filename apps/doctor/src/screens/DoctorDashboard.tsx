import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import { notificationsApi } from '../../../../packages/core/src/api/api';
import DoctorHomeTab from './DoctorHomeTab';
import AppointmentsTab from './AppointmentsTab';
import ProfileTab from './ProfileTab';
import NotificationsTab from './NotificationsTab';
import InAppNotificationBanner from '../../../../packages/shared/src/components/InAppNotificationBanner';

const Tab = createBottomTabNavigator();

interface Props {
  onLogout: () => void;
  profile: any;
}

export default function DoctorDashboard({ onLogout, profile }: Props) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingApptId, setPendingApptId] = useState<string | null>(null);
  const [apptFilter, setApptFilter] = useState<string | null>(null);
  const navRef = useRef<NavigationContainerRef<any>>(null);

  const fetchUnread = useCallback(async () => {
    if (!profile?.id) return;
    const count = await notificationsApi.getUnreadCount(profile.id, 'doctor');
    setUnreadCount(count);
  }, [profile?.id]);

  useEffect(() => { fetchUnread(); }, [fetchUnread]);

  // Realtime: listen for new notifications to update badge instantly
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('doctor-notif-badge')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`,
      }, (payload: any) => {
        const row = payload.new;
        if (row.role && row.role !== 'doctor') return;
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  // Called by NotificationsTab when user marks notifications as read
  const onNotifRead = useCallback(() => { fetchUnread(); }, [fetchUnread]);

  // Deep link: navigate to Appointments tab from notification
  const navigateToAppointments = useCallback((filter?: string) => {
    if (filter) setApptFilter(filter);
    navRef.current?.navigate('Appointments');
  }, []);

  return (
    <NavigationContainer ref={navRef}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB', height: 60, paddingBottom: 8, paddingTop: 6 },
          tabBarActiveTintColor: '#2563EB',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ color }) => {
            const icons: Record<string, any> = { Home: 'home-outline', Appointments: 'calendar-outline', Notifications: 'notifications-outline', Profile: 'person-outline' };
            const activeIcons: Record<string, any> = { Home: 'home', Appointments: 'calendar', Notifications: 'notifications', Profile: 'person' };
            const focused = color === '#2563EB';
            return <Ionicons name={focused ? activeIcons[route.name] : icons[route.name]} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home">{() => <DoctorHomeTab profile={profile} onNavigateToAppointments={navigateToAppointments} />}</Tab.Screen>
        <Tab.Screen name="Appointments">
          {() => (
            <AppointmentsTab
              profile={profile}
              pendingApptId={pendingApptId}
              onPendingApptHandled={() => setPendingApptId(null)}
              initialFilter={apptFilter}
              onInitialFilterHandled={() => setApptFilter(null)}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Notifications"
          options={{
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
            tabBarBadgeStyle: { backgroundColor: '#EF4444', fontSize: 10 },
          }}
        >
          {() => (
            <NotificationsTab
              profile={profile}
              onNotifRead={onNotifRead}
              onNavigateToAppointments={navigateToAppointments}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Profile">{() => <ProfileTab profile={profile} onLogout={onLogout} />}</Tab.Screen>
      </Tab.Navigator>
      <InAppNotificationBanner
        role="doctor"
        onPress={(notif) => {
          if (notif.actionType === 'appointment' && notif.actionId) {
            setPendingApptId(notif.actionId);
            navRef.current?.navigate('Appointments');
          }
        }}
      />
    </NavigationContainer>
  );
}
