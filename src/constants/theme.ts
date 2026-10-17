/**
 * JS mirror of the app theme. The main styling mechanism is Uniwind
 * (Tailwind classes via `className`); the theme tokens live in src/global.css.
 * `Colors` below mirrors those tokens for the places that need color values
 * in JS (`useTheme`, @expo/ui SwiftUI islands) — keep both in sync.
 */

import type { AndroidSymbol } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';

import type { StoredSegmentKind } from '@/domain/run-motion';

import palette from './brand-palette.json';

const PRIMARY = '#3c87f7';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    backgroundGrouped: '#F2F2F7',
    backgroundCard: '#ffffff',
    textSecondary: '#60646C',
    primary: PRIMARY,
    primaryForeground: '#ffffff',
    primaryFill: '#0071E3',
    success: '#34C759',
    successForeground: '#ffffff',
    destructive: '#FF3B30',
    destructiveForeground: '#ffffff',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    backgroundGrouped: '#000000',
    backgroundCard: '#1C1C1E',
    textSecondary: '#B0B4BA',
    primary: '#5C9DFF',
    primaryForeground: '#ffffff',
    primaryFill: '#0071E3',
    success: '#30D158',
    successForeground: '#ffffff',
    destructive: '#FF453A',
    destructiveForeground: '#ffffff',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

const segmentColorsFor = (scheme: 'light' | 'dark'): Record<StoredSegmentKind, string> => {
  const c = palette.segments[scheme];
  return {
    warmup: c.warmupCooldown,
    run: c.run,
    walk: c.walk,
    cooldown: c.warmupCooldown,
    stopped: c.stopped,
  };
};

/** Segment-kind accents from the generated brand palette (ADR 0027); warm-up and cool-down share
 * one colour. Read via `useSegmentColors()` so they follow light/dark. */
export const SegmentColors: Record<'light' | 'dark', Record<StoredSegmentKind, string>> = {
  light: segmentColorsFor('light'),
  dark: segmentColorsFor('dark'),
};

/** Run intervals are drawn thicker so phase never depends on hue alone (spec §7.3). */
export const ROUTE_STROKE_W = 4;
export const ROUTE_STROKE_W_RUN = 7;

/** Extra width of the casing drawn under every route line. */
export const ROUTE_CASING_W = 3;

/** Stat accents from the brand palette (ADR 0027's amendment): `running` is the run segment's
 * colour, so the Running tile and the run intervals read as one thing, and `pace`/`elevation` are
 * the chart's two series. Other tiles stay neutral. Access via `useStatColors()`. */
export const StatColors: Record<
  'light' | 'dark',
  { running: string; pace: string; elevation: string }
> = {
  light: { running: palette.segments.light.run, ...palette.stats.light },
  dark: { running: palette.segments.dark.run, ...palette.stats.dark },
};

/** Chart gridlines, per color scheme. Deliberately far fainter than any data drawn over them —
 * victory-native's own default and Apple's Swift Charts both sit near 25% of the text color, and
 * a grid at full `textSecondary` out-contrasted the pace line it exists to measure.
 * Access via `useChartGridColor()`. */
export const ChartGridColors: Record<'light' | 'dark', string> = {
  light: 'hsla(0, 0%, 0%, 0.25)',
  dark: 'hsla(0, 0%, 100%, 0.25)',
};

/** Segment-kind symbols for the run screen phase label, per platform glyph set; only the run
 * intervals get the running figure. */
export const SegmentSymbols: Record<StoredSegmentKind, { ios: SFSymbol; android: AndroidSymbol }> =
  {
    warmup: { ios: 'figure.walk', android: 'directions_walk' },
    run: { ios: 'figure.run', android: 'directions_run' },
    walk: { ios: 'figure.walk', android: 'directions_walk' },
    cooldown: { ios: 'figure.cooldown', android: 'self_improvement' },
    stopped: { ios: 'figure.stand', android: 'accessibility_new' },
  };
