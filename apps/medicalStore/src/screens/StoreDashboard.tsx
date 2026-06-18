import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import StoreHomeTab from './StoreHomeTab';
import StoreMedicinesTab from './StoreMedicinesTab';
import StoreOrdersTab from './StoreOrdersTab';
import StoreProfileTab from './StoreProfileTab';
import NotificationsTab from './NotificationsTab';

const Tab = createBottomTabNavigator();

interface Props {
  onLogout: () => void;
  profile: any;
}

export default function StoreDashboard({ onLogout, profile }: Props) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            paddingBottom: 8,
            paddingTop: 8,
            height: 65,
          },
          tabBarActiveTintColor: '#059669',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500', marginTop: 2 },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Inventory') iconName = focused ? 'cube' : 'cube-outline';
            else if (route.name === 'Orders') iconName = focused ? 'receipt' : 'receipt-outline';
            else if (route.name === 'Alerts') iconName = focused ? 'notifications' : 'notifications-outline';
            else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size - 2} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home">
          {() => <StoreHomeTab profile={profile} />}
        </Tab.Screen>
        <Tab.Screen name="Inventory">
          {() => <StoreMedicinesTab profile={profile} />}
        </Tab.Screen>
        <Tab.Screen name="Orders">
          {() => <StoreOrdersTab profile={profile} />}
        </Tab.Screen>
        <Tab.Screen name="Alerts">
          {() => <NotificationsTab profile={profile} />}
        </Tab.Screen>
        <Tab.Screen name="Profile">
          {() => <StoreProfileTab onLogout={onLogout} profile={profile} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
