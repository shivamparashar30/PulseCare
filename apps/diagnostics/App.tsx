import 'text-encoding';
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from './src/supabase';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import PendingScreen from './src/screens/PendingScreen';
import DiagnosticsDashboard from './src/screens/DiagnosticsDashboard';

type AppState = 'loading' | 'login' | 'signup' | 'pending' | 'rejected' | 'home';

export default function App() {
  const [state, setState] = useState<AppState>('loading');
  const [profile, setProfile] = useState<any>(null);
  const signingUp = useRef(false);

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (!signingUp.current) checkAuth();
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setState('login'); setProfile(null); return; }

    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).eq('role', 'diagnostics').single();

    if (!data) { setState('login'); return; }
    setProfile(data);

    if (data.status === 'approved') setState('home');
    else if (data.status === 'rejected') setState('rejected');
    else setState('pending');
  };

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).eq('role', 'diagnostics').single();

    if (!p) {
      const { data: anyProfile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      await supabase.auth.signOut();
      if (anyProfile && anyProfile.role !== 'diagnostics') {
        throw new Error(`This account is registered as "${anyProfile.role}". Please use the correct app to sign in.`);
      }
      throw new Error('Your registration request has been submitted and is currently under verification by the Admin. You will be able to log in once your account is approved.');
    }

    setProfile(p);

    if (p.status === 'approved') setState('home');
    else if (p.status === 'rejected') setState('rejected');
    else setState('pending');
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setProfile(null); setState('login'); };

  if (state === 'loading') return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#7C3AED" /></View>;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {state === 'login' && <LoginScreen onLogin={handleLogin} onGoToSignup={() => { signingUp.current = true; setState('signup'); }} />}
      {state === 'signup' && <SignupScreen onGoToLogin={() => { signingUp.current = false; setState('login'); }} onSignupComplete={() => { signingUp.current = false; setState('pending'); }} />}
      {state === 'pending' && <PendingScreen status="pending" onLogout={handleLogout} />}
      {state === 'rejected' && <PendingScreen status="rejected" rejectionReason={profile?.rejection_reason} onLogout={handleLogout} />}
      {state === 'home' && <DiagnosticsDashboard onLogout={handleLogout} profile={profile} />}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
});
