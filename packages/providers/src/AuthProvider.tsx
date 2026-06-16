import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase, signIn, signUp, signOut, getProfile, onAuthStateChange } from '../../supabase/src';
import { User } from '../../core/src/types';
import { UserRole } from '../../supabase/src/database.types';

// ============================================
// AUTH CONTEXT
// ============================================

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  continueAsGuest: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Supabase profile to app User type
  const profileToUser = (profile: any, email: string): User => ({
    id: profile.id,
    name: profile.full_name || '',
    email: email,
    phone: profile.phone || '',
    avatar: profile.avatar_url || 'https://randomuser.me/api/portraits/men/1.jpg',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: undefined,
    familyMembers: [],
  });

  // Listen for auth state changes
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        getProfile(session.user.id)
          .then(profile => {
            setUser(profileToUser(profile, session.user.email || ''));
          })
          .catch(() => {
            // Profile might not exist yet, use basic info
            setUser({
              id: session.user.id,
              name: session.user.user_metadata?.full_name || '',
              email: session.user.email || '',
              phone: session.user.user_metadata?.phone || '',
              avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
              dateOfBirth: '',
              gender: '',
              bloodGroup: '',
              address: undefined,
              familyMembers: [],
            });
          })
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange((session) => {
      if (session?.user) {
        getProfile(session.user.id)
          .then(profile => {
            setUser(profileToUser(profile, session.user.email || ''));
          })
          .catch(() => {});
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { session } = await signIn({ email, password });
      if (session?.user) {
        const profile = await getProfile(session.user.id);
        setUser(profileToUser(profile, email));
        setIsGuest(false);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        await signUp({
          email,
          password,
          fullName: name,
          phone,
          role: 'patient' as UserRole,
        });
        // Auto sign in after signup
        const { session } = await signIn({ email, password });
        if (session?.user) {
          const profile = await getProfile(session.user.id);
          setUser(profileToUser(profile, email));
          setIsGuest(false);
          return true;
        }
        return true;
      } catch (error: any) {
        console.error('Signup error:', error.message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch {}
    setUser(null);
    setIsGuest(false);
  }, []);

  const continueAsGuest = useCallback(() => {
    setIsGuest(true);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isGuest,
        isLoading,
        login,
        signup,
        logout,
        continueAsGuest,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
