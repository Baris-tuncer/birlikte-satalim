import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Premium renk paleti
export const Colors = {
  primary: '#0A2540',       // Koyu lacivert-gri (ana renk)
  accent: '#FF6B4A',        // Coral (sıcak, enerjik)
  accentDark: '#E5563A',    // Accent hover/press durumu
  rent: '#3B82F6',          // Kiralık badge rengi (mavi)
  rentLight: '#3B82F6' + '14', // Kiralık badge arka plan
  background: '#F8F9FA',    // Çok açık gri arka plan
  card: '#FFFFFF',          // Kart beyazı
  text: {
    primary: '#0A2540',     // Ana metin
    secondary: '#64748B',   // İkincil metin (slate-500)
    tertiary: '#94A3B8',    // Üçüncül metin (slate-400)
    inverse: '#FFFFFF',     // Koyu arka planda beyaz metin
  },
  border: '#E2E8F0',       // Hafif border (slate-200)
  borderLight: '#F1F5F9',  // Çok hafif border
  success: '#10B981',      // Yeşil
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Kırmızı
  overlay: 'rgba(10, 37, 64, 0.5)',
} as const;

// Tipografi - System font (SF Pro / Roboto)
export const Typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
    lineHeight: 41,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
    lineHeight: 25,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
    lineHeight: 21,
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
    lineHeight: 18,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.07,
    lineHeight: 13,
  },
} as const;

// Spacing (8pt grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// Border radius
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// Premium gölgeler - web ve native uyumlu
const createShadow = (offsetY: number, opacity: number, radius: number, elevation: number) =>
  Platform.select({
    web: {
      boxShadow: `0px ${offsetY}px ${radius}px rgba(10, 37, 64, ${opacity})`,
    },
    ios: {
      shadowColor: '#0A2540',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation,
    },
  });

export const Shadows = {
  sm: createShadow(1, 0.04, 3, 1),
  md: createShadow(2, 0.06, 8, 3),
  lg: createShadow(4, 0.08, 16, 6),
  xl: createShadow(8, 0.12, 24, 10),
} as const;

// Sabit değerler
export const Layout = {
  screenWidth: SCREEN_WIDTH,
  horizontalPadding: 20,
  cardPadding: 16,
  tabBarHeight: Platform.OS === 'ios' ? 88 : 64,
} as const;
