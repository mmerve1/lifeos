export const Colors = {
  // Global Design System Tokens
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

  // Interactive / State Tokens
  borderFocused: '#8B7CF6',
  borderError: '#F07891',
  surfaceSubtle: 'rgba(139, 124, 246, 0.08)',
  overlay: 'rgba(17, 18, 28, 0.85)',

  // Module Palette (Controlled subtle accents)
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
} as const;

export type ColorToken = keyof typeof Colors;
