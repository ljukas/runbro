import type { MaterialColors } from '@expo/ui/jetpack-compose';

import palette from './brand-palette.json';

export type MaterialRoles = (typeof palette.scheme)['light'];

// why: a compile-time guard that the JSON carries every role @expo/ui's Compose theme reads.
palette.scheme.light satisfies Record<keyof MaterialColors, string>;
palette.scheme.dark satisfies Record<keyof MaterialColors, string>;

export const BRAND_SEED: string = palette.seed;

export const BRAND_GRADIENT: (typeof palette)['gradient'] = palette.gradient;

export function brandScheme(scheme: 'light' | 'dark'): MaterialRoles {
  return palette.scheme[scheme];
}
