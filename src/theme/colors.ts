export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryPressed: string;
  secondaryViolet: string;
  success: string;
  warning: string;
  danger: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  borderFocused: string;
  borderError: string;
  surfaceSubtle: string;
  overlay: string;
  modules: {
    career: string;
    academic: string;
    finance: string;
    health: string;
    learning: string;
    social: string;
    personal: string;
    ai: string;
  };
}

export const darkColors: ThemeColors = {
  background: '#11121C',
  surface: '#1B1C2B',
  surfaceElevated: '#24253A',
  primary: '#8B7CF6',
  primaryPressed: '#7969E8',
  secondaryViolet: '#B6ABFF',
  success: '#51D4B5',
  warning: '#F3B86C',
  danger: '#F07891',
  textPrimary: '#F5F5FA',
  textSecondary: '#A4A5B8',
  border: '#303146',
  borderFocused: '#8B7CF6',
  borderError: '#F07891',
  surfaceSubtle: 'rgba(139, 124, 246, 0.08)',
  overlay: 'rgba(17, 18, 28, 0.85)',
  modules: {
    career: '#818CF8',
    academic: '#60A5FA',
    finance: '#34D399',
    health: '#F472B6',
    learning: '#FBBF24',
    social: '#A78BFA',
    personal: '#38BDF8',
    ai: '#C084FC',
  },
};

export const lightColors: ThemeColors = {
  background: '#F8F9FD',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F3F9',
  primary: '#7C3AED',
  primaryPressed: '#6D28D9',
  secondaryViolet: '#8B7CF6',
  success: '#0D9488',
  warning: '#D97706',
  danger: '#E11D48',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  borderFocused: '#7C3AED',
  borderError: '#E11D48',
  surfaceSubtle: 'rgba(124, 58, 237, 0.06)',
  overlay: 'rgba(15, 23, 42, 0.6)',
  modules: {
    career: '#6366F1',
    academic: '#3B82F6',
    finance: '#10B981',
    health: '#EC4899',
    learning: '#F59E0B',
    social: '#8B5CF6',
    personal: '#0EA5E9',
    ai: '#A855F7',
  },
};

// Default export alias for backwards-compatibility
export const Colors = darkColors;
