import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

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

// Mock user data
const MOCK_USER: User = {
  id: 'u1',
  name: 'John Doe',
  email: 'john.doe@email.com',
  phone: '+91-9876543210',
  avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  dateOfBirth: '1990-05-15',
  gender: 'Male',
  bloodGroup: 'O+',
  address: {
    id: 'addr1',
    label: 'Home',
    line1: '123, MG Road',
    line2: 'Indiranagar',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560038',
    isDefault: true,
  },
  familyMembers: [
    { id: 'fm1', name: 'Jane Doe', relation: 'Spouse', age: 32, gender: 'Female', bloodGroup: 'A+' },
    { id: 'fm2', name: 'Tom Doe', relation: 'Son', age: 8, gender: 'Male', bloodGroup: 'O+' },
  ],
};

const AUTH_STORAGE_KEY = '@auth_user';
const GUEST_STORAGE_KEY = '@auth_guest';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted auth state on mount
  useEffect(() => {
    (async () => {
      try {
        const [storedUser, storedGuest] = await Promise.all([
          AsyncStorage.getItem(AUTH_STORAGE_KEY),
          AsyncStorage.getItem(GUEST_STORAGE_KEY),
        ]);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else if (storedGuest === 'true') {
          setIsGuest(true);
        }
      } catch {
        // ignore read errors
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const userData = { ...MOCK_USER, email };
      setUser(userData);
      setIsGuest(false);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, phone: string, _password: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const userData = { ...MOCK_USER, name, email, phone };
        setUser(userData);
        setIsGuest(false);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
        await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
        return true;
      } catch {
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
    setIsGuest(false);
    await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, GUEST_STORAGE_KEY]);
  }, []);

  const continueAsGuest = useCallback(async () => {
    setIsGuest(true);
    setUser(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    await AsyncStorage.setItem(GUEST_STORAGE_KEY, 'true');
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
      return updated;
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
