import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import { notificationsApi } from '../../../../packages/core/src/api/api';
import DiagnosticsHomeTab from './DiagnosticsHomeTab';
import BookingsTab from './BookingsTab';
import ManageTestsTab from './ManageTestsTab';
import DiagnosticsProfileTab from './DiagnosticsProfileTab';
import PackagesTab from './PackagesTab';
import NotificationsTab from './NotificationsTab';
import InAppNotificationBanner from '../../../../packages/shared/src/components/InAppNotificationBanner';

const Tab = createBottomTabNavigator();

interface Props {
  onLogout: () => void;
  profile: any;
}

export default function DiagnosticsDashboard({ onLogout, profile }: Props) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const navRef = useRef<NavigationContainerRef<any>>(null);

  const fetchUnread = useCallback(async () => {
    if (!profile?.id) return;
    const count = await notificationsApi.getUnreadCount(profile.id, 'diagnostics');
    setUnreadCount(count);
  }, [profile?.id]);

  useEffect(() => { fetchUnread(); }, [fetchUnread]);

  // Realtime: listen for new notifications to update badge instantly
  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel('diagnostics-notif-badge')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`,
      }, (payload: any) => {
        const row = payload.new;
        if (row.role && row.role !== 'diagnostics') return;
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile?.id]);

  const onNotifRead = useCallback(() => { fetchUnread(); }, [fetchUnread]);

  const navigateToBookings = useCallback(() => {
    navRef.current?.navigate('Bookings');
  }, []);

  return (
    <NavigationContainer ref={navRef}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB', height: 60, paddingBottom: 8, paddingTop: 6 },
          tabBarActiveTintColor: '#7C3AED',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ color }) => {
            const icons: Record<string, any> = { Home: 'home-outline', Bookings: 'calendar-outline', Tests: 'flask-outline', Packages: 'clipboard-outline', Alerts: 'notifications-outline', Profile: 'person-outline' };
            const activeIcons: Record<string, any> = { Home: 'home', Bookings: 'calendar', Tests: 'flask', Packages: 'clipboard', Alerts: 'notifications', Profile: 'person' };
            const focused = color === '#7C3AED';
            return <Ionicons name={focused ? activeIcons[route.name] : icons[route.name]} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home">{() => <DiagnosticsHomeTab profile={profile} />}</Tab.Screen>
        <Tab.Screen name="Bookings">
          {() => (
            <BookingsTab
              profile={profile}
              pendingBookingId={pendingBookingId}
              onPendingBookingHandled={() => setPendingBookingId(null)}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Tests">{() => <ManageTestsTab profile={profile} />}</Tab.Screen>
        <Tab.Screen name="Packages">{() => <PackagesTab profile={profile} />}</Tab.Screen>
        <Tab.Screen
          name="Alerts"
          options={{
            tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
            tabBarBadgeStyle: { backgroundColor: '#EF4444', fontSize: 10 },
          }}
        >
          {() => (
            <NotificationsTab
              profile={profile}
              onNotifRead={onNotifRead}
              onNavigateToBookings={navigateToBookings}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Profile">{() => <DiagnosticsProfileTab profile={profile} onLogout={onLogout} />}</Tab.Screen>
      </Tab.Navigator>
      <InAppNotificationBanner
        role="diagnostics"
        onPress={(notif) => {
          if (notif.actionType === 'lab_booking' && notif.actionId) {
            setPendingBookingId(notif.actionId);
            navRef.current?.navigate('Bookings');
          }
        }}
      />
    </NavigationContainer>
  );
}
