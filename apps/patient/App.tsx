import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { AuthProvider } from '../../packages/providers/src/AuthProvider';
import { CartProvider } from './src/features/medicalStore/context/CartContext';
import { ThemeProvider, useTheme } from '../../packages/providers/src/ThemeProvider';
import AppNavigator from '../../packages/core/src/navigation/AppNavigator';

// ============================================
// QUERY CLIENT — global React Query config
// ============================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ============================================
// STATUS BAR: reads theme to auto-flip style
// ============================================
function ThemedStatusBar() {
  const { isDarkMode } = useTheme();
  return <StatusBar style={isDarkMode ? 'light' : 'dark'} />;
}

// ============================================
// APP ROOT
// ============================================
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {/* ThemeProvider first — everything else reads isDarkMode */}
          <ThemeProvider>
            {/* AuthProvider next — navigation reads isAuthenticated */}
            <AuthProvider>
              {/* CartProvider — Pharmacy tab reads totalItems for badge */}
              <CartProvider>
                <ThemedStatusBar />
                <AppNavigator />
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
