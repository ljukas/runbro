import { PlatformColor, type ColorValue } from 'react-native';

// why: the asset-catalog sets carry the increased-contrast variants the hex tokens can't (ADR 0027 §2).
const ACCENT_COLORS = {
  tint: PlatformColor('AccentColor'),
  fill: PlatformColor('PrimaryFill'),
  onFill: PlatformColor('PrimaryFillForeground'),
};

export function useAccentColors(): { tint: ColorValue; fill: ColorValue; onFill: ColorValue } {
  return ACCENT_COLORS;
}
