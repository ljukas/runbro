import { DarkTheme, DefaultTheme } from 'expo-router';
import type { ColorSchemeName } from 'react-native';

import { Colors } from '@/constants/theme';

// why: React Navigation parses `colors.primary` with Color(), so it stays hex, not the iOS
// named colour set (ADR 0027 §2).
export function navigationTheme(scheme: ColorSchemeName): typeof DefaultTheme {
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const palette = scheme === 'dark' ? Colors.dark : Colors.light;
  return {
    ...base,
    colors: { ...base.colors, primary: palette.primary },
  };
}
