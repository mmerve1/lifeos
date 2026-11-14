import { TextStyle, Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
});

export const Typography: Record<string, TextStyle> = {
  hero: {
    fontFamily,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
  },
  pageTitle: {
    fontFamily,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
  },
  sectionTitle: {
    fontFamily,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },
  cardTitle: {
    fontFamily,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  bodyLarge: {
    fontFamily,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  body: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  button: {
    fontFamily,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  label: {
    fontFamily,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  caption: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  captionBold: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
};
