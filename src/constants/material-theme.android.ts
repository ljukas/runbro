import { brandScheme } from './brand-scheme';
import { Colors, type ThemeColor } from './theme';

export type Scheme = 'light' | 'dark';

function build(scheme: Scheme): Record<ThemeColor, string> {
  const m = brandScheme(scheme);
  return {
    text: m.onSurface,
    background: m.surface,
    // Filled cards sit two tonal steps above the page, or they read as the same surface.
    backgroundElement: m.surfaceContainerHigh,
    backgroundSelected: m.surfaceContainerHighest,
    backgroundGrouped: m.surface,
    backgroundCard: m.surfaceContainerHighest,
    textSecondary: m.onSurfaceVariant,
    primary: m.primary,
    primaryForeground: m.onPrimary,
    primaryFill: m.primary,
    primaryFillForeground: m.onPrimary,
    success: Colors[scheme].success,
    successForeground: Colors[scheme].successForeground,
    destructive: m.error,
    destructiveForeground: m.onError,
  };
}

// why module scope: a stable object per scheme keeps useTheme() consumers' memo dependencies and
// compiler memo blocks from invalidating every render.
const THEMES: Record<Scheme, Record<ThemeColor, string>> = {
  light: build('light'),
  dark: build('dark'),
};

/** Colour tokens filled from the generated brand scheme (ADR 0027 §4); `success` has no Material role and keeps the shared value. */
export function materialTheme(scheme: Scheme): Record<ThemeColor, string> {
  return THEMES[scheme];
}
