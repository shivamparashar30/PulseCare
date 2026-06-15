import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const queryClient = new QueryClient();

function DiagnosticsHome() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="flask" size={64} color="#7C3AED" />
      </View>
      <Text style={styles.title}>Healthcare Diagnostics</Text>
      <Text style={styles.subtitle}>Lab & Diagnostics Panel</Text>
      <Text style={styles.desc}>Manage test bookings, sample collection, and upload reports.</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Coming Soon</Text>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <DiagnosticsHome />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F9FC', padding: 32 },
  iconWrap: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1F36', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#7C3AED', fontWeight: '600', marginBottom: 16 },
  desc: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  badge: { backgroundColor: '#7C3AED', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
