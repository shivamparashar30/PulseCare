import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../../providers/src/AuthProvider';
import { useTheme } from '../../../providers/src/ThemeProvider';
import { useCart } from '../../../../apps/patient/src/features/medicalStore/context/CartContext';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

// Auth Screens
import LoginScreen from '../../../../apps/patient/src/features/auth/screens/LoginScreen';
import SignupScreen from '../../../../apps/patient/src/features/auth/screens/SignupScreen';
import ForgotPasswordScreen from '../../../../apps/patient/src/features/auth/screens/ForgotPasswordScreen';

// Home Screens
import HomeScreen from '../../../../apps/patient/src/features/patient/screens/HomeScreen';
import NotificationsScreen from '../../../../apps/patient/src/features/patient/screens/NotificationsScreen';
import SearchScreen from '../../../../apps/patient/src/features/patient/screens/SearchScreen';
import MedicalStoresScreen from '../../../../apps/patient/src/features/patient/screens/MedicalStoresScreen';
import HealthPackagesScreen from '../../../../apps/patient/src/features/patient/screens/HealthPackagesScreen';

// Doctor Screens
import DoctorsListScreen from '../../../../apps/patient/src/features/doctor/screens/DoctorsListScreen';
import DoctorDetailScreen from '../../../../apps/patient/src/features/doctor/screens/DoctorDetailScreen';
import BookAppointmentScreen from '../../../../apps/patient/src/features/doctor/screens/BookAppointmentScreen';
import AppointmentPaymentScreen from '../../../../apps/patient/src/features/doctor/screens/AppointmentPaymentScreen';
import AppointmentSuccessScreen from '../../../../apps/patient/src/features/doctor/screens/AppointmentSuccessScreen';

// Pharmacy Screens
import PharmacyHomeScreen from '../../../../apps/patient/src/features/medicalStore/screens/PharmacyHomeScreen';
import MedicineDetailScreen from '../../../../apps/patient/src/features/medicalStore/screens/MedicineDetailScreen';
import CartScreen from '../../../../apps/patient/src/features/medicalStore/screens/CartScreen';
import CheckoutScreen from '../../../../apps/patient/src/features/medicalStore/screens/CheckoutScreen';
import OrderSuccessScreen from '../../../../apps/patient/src/features/medicalStore/screens/OrderSuccessScreen';
import WishlistScreen from '../../../../apps/patient/src/features/medicalStore/screens/WishlistScreen';
import StoreDetailScreen from '../../../../apps/patient/src/features/medicalStore/screens/StoreDetailScreen';
import MyOrdersScreen from '../../../../apps/patient/src/features/medicalStore/screens/MyOrdersScreen';
import OrderTrackingScreen from '../../../../apps/patient/src/features/medicalStore/screens/OrderTrackingScreen';

// Appointment Screens
import AppointmentsListScreen from '../../../../apps/patient/src/features/patient/screens/AppointmentsListScreen';
import AppointmentDetailScreen from '../../../../apps/patient/src/features/patient/screens/AppointmentDetailScreen';
import AppointmentChatScreen from '../../../../apps/patient/src/features/patient/screens/AppointmentChatScreen';

// Lab / Diagnostics Screens
import DiagnosticCentersScreen from '../../../../apps/patient/src/features/diagnostics/screens/DiagnosticCentersScreen';
import CenterTestsScreen from '../../../../apps/patient/src/features/diagnostics/screens/CenterTestsScreen';
import LabTestsScreen from '../../../../apps/patient/src/features/diagnostics/screens/LabTestsScreen';
import LabTestDetailScreen from '../../../../apps/patient/src/features/diagnostics/screens/LabTestDetailScreen';
import LabBookingScreen from '../../../../apps/patient/src/features/diagnostics/screens/LabBookingScreen';

// Profile Screens
import ProfileScreen from '../../../../apps/patient/src/features/patient/screens/ProfileScreen';
import EditProfileScreen from '../../../../apps/patient/src/features/patient/screens/EditProfileScreen';
import HealthRecordsScreen from '../../../../apps/patient/src/features/patient/screens/HealthRecordsScreen';
import HelpCenterScreen from '../../../../apps/patient/src/features/patient/screens/HelpCenterScreen';
import PrivacyPolicyScreen from '../../../../apps/patient/src/features/patient/screens/PrivacyPolicyScreen';

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
      <Stack.Screen name="DiagnosticCenters" component={DiagnosticCentersScreen} />
      <Stack.Screen name="CenterTests" component={CenterTestsScreen} />
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
      <Stack.Screen name="StoreDetail" component={StoreDetailScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
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
      <Stack.Screen name="AppointmentChat" component={AppointmentChatScreen} />
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
        tabBarHideOnKeyboard: true,
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
