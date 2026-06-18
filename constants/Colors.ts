import { Colors as ThemeColors } from './Theme';

export default {
  light: {
    text: ThemeColors.text.primary,
    background: ThemeColors.background,
    tint: ThemeColors.accent,
    tabIconDefault: ThemeColors.text.tertiary,
    tabIconSelected: ThemeColors.accent,
  },
  dark: {
    text: '#FFFFFF',
    background: '#0A2540',
    tint: '#00D4C5',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#00D4C5',
  },
};
