import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Accept any email/password for demo
      setUser({ ...MOCK_USER, email });
      setIsGuest(false);
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
        setUser({ ...MOCK_USER, name, email, phone });
        setIsGuest(false);
        return true;
      } catch {
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setIsGuest(false);
  }, []);

  const continueAsGuest = useCallback(() => {
    setIsGuest(true);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
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
