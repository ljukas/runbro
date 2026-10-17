import type { ColorValue } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function useAccentColors(): { tint: ColorValue; fill: ColorValue; onFill: ColorValue } {
  const colors = useTheme();
  return {
    tint: colors.primary,
    fill: colors.primaryFill,
    onFill: colors.primaryFillForeground,
  };
}
