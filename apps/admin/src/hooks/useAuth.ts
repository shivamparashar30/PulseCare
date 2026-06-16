import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AdminProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('role', 'admin')
      .single();
    return data as AdminProfile | null;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        if (p) {
          setUser(session.user);
          setProfile(p);
        }
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const p = await fetchProfile(session.user.id);
        if (p) {
          setUser(session.user);
          setProfile(p);
        } else {
          setUser(null);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const p = await fetchProfile(data.user.id);
    if (!p) {
      await supabase.auth.signOut();
      throw new Error('Access denied. Admin accounts only.');
    }
    setUser(data.user);
    setProfile(p);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return { user, profile, loading, signIn, signOut };
}
