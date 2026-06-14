import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Home Screens
import HomeScreen from '../screens/home/HomeScreen';
import NotificationsScreen from '../screens/home/NotificationsScreen';
import SearchScreen from '../screens/home/SearchScreen';
import MedicalStoresScreen from '../screens/home/MedicalStoresScreen';
import HealthPackagesScreen from '../screens/home/HealthPackagesScreen';

// Doctor Screens
import DoctorsListScreen from '../screens/doctors/DoctorsListScreen';
import DoctorDetailScreen from '../screens/doctors/DoctorDetailScreen';
import BookAppointmentScreen from '../screens/doctors/BookAppointmentScreen';
import AppointmentPaymentScreen from '../screens/doctors/AppointmentPaymentScreen';
import AppointmentSuccessScreen from '../screens/doctors/AppointmentSuccessScreen';

// Pharmacy Screens
import PharmacyHomeScreen from '../screens/pharmacy/PharmacyHomeScreen';
import MedicineDetailScreen from '../screens/pharmacy/MedicineDetailScreen';
import CartScreen from '../screens/pharmacy/CartScreen';
import CheckoutScreen from '../screens/pharmacy/CheckoutScreen';
import OrderSuccessScreen from '../screens/pharmacy/OrderSuccessScreen';
import WishlistScreen from '../screens/pharmacy/WishlistScreen';

// Appointment Screens
import AppointmentsListScreen from '../screens/appointments/AppointmentsListScreen';
import AppointmentDetailScreen from '../screens/appointments/AppointmentDetailScreen';

// Lab Screens
import LabTestsScreen from '../screens/lab/LabTestsScreen';
import LabTestDetailScreen from '../screens/lab/LabTestDetailScreen';
import LabBookingScreen from '../screens/lab/LabBookingScreen';

// Profile Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import HealthRecordsScreen from '../screens/profile/HealthRecordsScreen';
import HelpCenterScreen from '../screens/profile/HelpCenterScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ============================================
// TAB BAR COMPONENT
// ============================================

function TabBarIcon({ name, color, size }: { name: any; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

// ============================================
// HOME STACK
// ============================================

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="LabTests" component={LabTestsScreen} />
      <Stack.Screen name="LabTestDetail" component={LabTestDetailScreen} />
      <Stack.Screen name="LabBooking" component={LabBookingScreen} />
      <Stack.Screen name="MedicalStores" component={MedicalStoresScreen} />
      <Stack.Screen name="HealthPackages" component={HealthPackagesScreen} />
      <Stack.Screen name="HealthRecords" component={HealthRecordsScreen} />
    </Stack.Navigator>
  );
}

// ============================================
// DOCTOR STACK
// ============================================

function DoctorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DoctorsList" component={DoctorsListScreen} />
      <Stack.Screen name="DoctorDetail" component={DoctorDetailScreen} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
      <Stack.Screen name="AppointmentPayment" component={AppointmentPaymentScreen} />
      <Stack.Screen name="AppointmentSuccess" component={AppointmentSuccessScreen} />
    </Stack.Navigator>
  );
}

// ============================================
// PHARMACY STACK
// ============================================

function PharmacyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PharmacyHome" component={PharmacyHomeScreen} />
      <Stack.Screen name="MedicineDetail" component={MedicineDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
    </Stack.Navigator>
  );
}

// ============================================
// APPOINTMENTS STACK
// ============================================

function AppointmentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AppointmentsList" component={AppointmentsListScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
    </Stack.Navigator>
  );
}

// ============================================
// PROFILE STACK
// ============================================

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="HealthRecords" component={HealthRecordsScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
}

// ============================================
// MAIN TAB NAVIGATOR
// ============================================

function MainTabs() {
  const { colors, isDarkMode } = useTheme();
  const { totalItems } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? COLORS.darkCard : COLORS.white,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.xs,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Doctors') iconName = focused ? 'medkit' : 'medkit-outline';
          else if (route.name === 'Pharmacy') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Appointments') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <TabBarIcon name={iconName} color={color} size={size - 2} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Doctors" component={DoctorStack} />
      <Tab.Screen
        name="Pharmacy"
        component={PharmacyStack}
        options={{
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.error,
            fontSize: 10,
          },
        }}
      />
      <Tab.Screen name="Appointments" component={AppointmentsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// ============================================
// AUTH STACK
// ============================================

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// ============================================
// ROOT NAVIGATOR
// ============================================

export default function AppNavigator() {
  const { isAuthenticated, isGuest } = useAuth();
  const { isDarkMode } = useTheme();

  const isLoggedIn = isAuthenticated || isGuest;

  return (
    <NavigationContainer
      theme={{
        dark: isDarkMode,
        colors: {
          primary: COLORS.primary,
          background: isDarkMode ? COLORS.darkBackground : COLORS.background,
          card: isDarkMode ? COLORS.darkCard : COLORS.white,
          text: isDarkMode ? COLORS.darkTextPrimary : COLORS.textPrimary,
          border: isDarkMode ? COLORS.darkBorder : COLORS.border,
          notification: COLORS.error,
        },
      }}
    >
      {isLoggedIn ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
