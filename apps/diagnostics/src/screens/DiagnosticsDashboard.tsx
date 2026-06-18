import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DiagnosticsHomeTab from './DiagnosticsHomeTab';
import BookingsTab from './BookingsTab';
import ManageTestsTab from './ManageTestsTab';
import DiagnosticsProfileTab from './DiagnosticsProfileTab';
import PackagesTab from './PackagesTab';
import NotificationsTab from './NotificationsTab';

const Tab = createBottomTabNavigator();

interface Props {
  onLogout: () => void;
  profile: any;
}

export default function DiagnosticsDashboard({ onLogout, profile }: Props) {
  return (
    <NavigationContainer>
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
        <Tab.Screen name="Bookings">{() => <BookingsTab profile={profile} />}</Tab.Screen>
        <Tab.Screen name="Tests">{() => <ManageTestsTab profile={profile} />}</Tab.Screen>
        <Tab.Screen name="Packages">{() => <PackagesTab profile={profile} />}</Tab.Screen>
        <Tab.Screen name="Alerts">{() => <NotificationsTab profile={profile} />}</Tab.Screen>
        <Tab.Screen name="Profile">{() => <DiagnosticsProfileTab profile={profile} onLogout={onLogout} />}</Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
