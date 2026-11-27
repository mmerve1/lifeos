export interface ThemeColors {
  background: string;
  sidebar: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryPressed: string;
  primaryText: string;
  secondaryViolet: string;
  accentLight: string;
  accentLightText: string;
  accentLightSubtext: string;
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
  background: '#0E1029',
  sidebar: '#14173A',
  surface: '#181B42',
  surfaceElevated: '#21255A',
  primary: '#8FA2FF',
  primaryPressed: '#7A8FF5',
  primaryText: '#0E1029',
  secondaryViolet: '#C9A6FF',
  accentLight: '#E7E9FF',
  accentLightText: '#14173A',
  accentLightSubtext: '#3E426E',
  success: '#7BE3A1',
  warning: '#FFB454',
  danger: '#FF8FA3',
  textPrimary: '#F3F2FF',
  textSecondary: '#B9BCE0',
  border: '#30356E',
  borderFocused: '#8FA2FF',
  borderError: '#FF8FA3',
  surfaceSubtle: 'rgba(143, 162, 255, 0.12)',
  overlay: 'rgba(14, 16, 41, 0.85)',
  modules: {
    career: '#FFB454',
    academic: '#5FD6E8',
    finance: '#7BE3A1',
    health: '#FF8FA3',
    learning: '#C9A6FF',
    social: '#F5E06B',
    personal: '#8FA2FF',
    ai: '#E7E9FF',
  },
};

export const lightColors: ThemeColors = {
  background: '#F5F6FF',
  sidebar: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#EEF0FF',
  primary: '#4E62E8',
  primaryPressed: '#3F52D6',
  primaryText: '#FFFFFF',
  secondaryViolet: '#7C5CE6',
  accentLight: '#14173A',
  accentLightText: '#F3F2FF',
  accentLightSubtext: '#B9BCE0',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#E11D48',
  textPrimary: '#0E1029',
  textSecondary: '#545880',
  border: '#D8DCF5',
  borderFocused: '#4E62E8',
  borderError: '#E11D48',
  surfaceSubtle: 'rgba(78, 98, 232, 0.08)',
  overlay: 'rgba(14, 16, 41, 0.55)',
  modules: {
    career: '#F59E0B',
    academic: '#06B6D4',
    finance: '#10B981',
    health: '#F43F5E',
    learning: '#8B5CF6',
    social: '#CA8A04',
    personal: '#4E62E8',
    ai: '#6366F1',
  },
};

export const Colors = darkColors;
