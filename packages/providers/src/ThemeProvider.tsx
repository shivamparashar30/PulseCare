import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { COLORS } from '../../core/src/constants';

interface ThemeColors {
  background: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  divider: string;
  primary: string;
  accent: string;
}

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightColors: ThemeColors = {
  background: COLORS.background,
  card: COLORS.card,
  border: COLORS.border,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.textSecondary,
  textTertiary: COLORS.textTertiary,
  divider: COLORS.divider,
  primary: COLORS.primary,
  accent: COLORS.accent,
};

const darkColors: ThemeColors = {
  background: COLORS.darkBackground,
  card: COLORS.darkCard,
  border: COLORS.darkBorder,
  textPrimary: COLORS.darkTextPrimary,
  textSecondary: COLORS.darkTextSecondary,
  textTertiary: '#64748B',
  divider: '#1E293B',
  primary: COLORS.primaryLight,
  accent: COLORS.accentLight,
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        colors: isDarkMode ? darkColors : lightColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
