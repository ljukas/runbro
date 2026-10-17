import {
  argbFromHex,
  hexFromArgb,
  Hct,
  MaterialDynamicColors,
  SchemeContent,
} from '@material/material-color-utilities';
import type { MaterialColors } from '@expo/ui/jetpack-compose';

// Generated, never hand-edited: `bun scripts/generate-brand-palette.ts` (ADR 0027).
// Deliberately not a package.json script — `scripts` is a fingerprint source.

const SEED = '#FF7A3D';

type Pair = { light: string; dark: string };
type Variants = Pair & { lightHighContrast: string; darkHighContrast: string };

export type BrandAccent = Record<
  'primary' | 'primaryForeground' | 'primaryFill' | 'primaryFillForeground',
  Variants
>;

export type BrandPalette = {
  seed: string;
  scheme: Record<'light' | 'dark', Record<keyof MaterialColors, string>>;
  segments: Record<'light' | 'dark', Record<'run' | 'walk' | 'warmupCooldown' | 'stopped', string>>;
  stats: Record<'light' | 'dark', Record<'pace' | 'elevation', string>>;
};

const variants = (
  light: string,
  dark: string,
  lightHighContrast: string,
  darkHighContrast: string,
): Variants => ({ light, dark, lightHighContrast, darkHighContrast });

const ACCENT: BrandAccent = {
  primary: variants('#BC4A0C', '#FF7A3D', '#A53C00', '#FFB598'),
  primaryForeground: variants('#FFFFFF', '#000000', '#FFFFFF', '#000000'),
  primaryFill: variants('#BC4A0C', '#C75115', '#A53C00', '#FFB598'),
  primaryFillForeground: variants('#FFFFFF', '#FFFFFF', '#FFFFFF', '#000000'),
};

const SEGMENTS = {
  run: { light: '#C75115', dark: '#FF7A3D' },
  walk: { light: '#636366', dark: '#8E8E93' },
  warmupCooldown: { light: '#0A7C8C', dark: '#40C8E0' },
  stopped: { light: '#5856D6', dark: '#7D7AFF' },
} satisfies Record<string, Pair>;

const STATS = {
  pace: { light: '#AF0F8A', dark: '#FF97D8' },
  elevation: { light: '#008954', dark: '#00D385' },
} satisfies Record<string, Pair>;

// Typed against @expo/ui so a role it adds or drops fails typecheck.
const ROLES = [
  'primary',
  'onPrimary',
  'primaryContainer',
  'onPrimaryContainer',
  'inversePrimary',
  'secondary',
  'onSecondary',
  'secondaryContainer',
  'onSecondaryContainer',
  'tertiary',
  'onTertiary',
  'tertiaryContainer',
  'onTertiaryContainer',
  'background',
  'onBackground',
  'surface',
  'onSurface',
  'surfaceVariant',
  'onSurfaceVariant',
  'surfaceTint',
  'inverseSurface',
  'inverseOnSurface',
  'error',
  'onError',
  'errorContainer',
  'onErrorContainer',
  'outline',
  'outlineVariant',
  'scrim',
  'surfaceBright',
  'surfaceDim',
  'surfaceContainer',
  'surfaceContainerHigh',
  'surfaceContainerHighest',
  'surfaceContainerLow',
  'surfaceContainerLowest',
  'primaryFixed',
  'primaryFixedDim',
  'onPrimaryFixed',
  'onPrimaryFixedVariant',
  'secondaryFixed',
  'secondaryFixedDim',
  'onSecondaryFixed',
  'onSecondaryFixedVariant',
  'tertiaryFixed',
  'tertiaryFixedDim',
  'onTertiaryFixed',
  'onTertiaryFixedVariant',
] as const satisfies readonly (keyof MaterialColors)[];

type AllRolesListed = Exclude<keyof MaterialColors, (typeof ROLES)[number]> extends never
  ? true
  : never;
const allRolesListed: AllRolesListed = true;
void allRolesListed;

function schemeColors(isDark: boolean): Record<keyof MaterialColors, string> {
  const scheme = new SchemeContent(Hct.fromInt(argbFromHex(SEED)), isDark, 0);
  return Object.fromEntries(
    ROLES.map((role) => [
      role,
      hexFromArgb(MaterialDynamicColors[role].getArgb(scheme)).toUpperCase(),
    ]),
  ) as Record<keyof MaterialColors, string>;
}

const split = <K extends string>(pairs: Record<K, Pair>) => ({
  light: Object.fromEntries(Object.entries<Pair>(pairs).map(([k, v]) => [k, v.light])) as Record<
    K,
    string
  >,
  dark: Object.fromEntries(Object.entries<Pair>(pairs).map(([k, v]) => [k, v.dark])) as Record<
    K,
    string
  >,
});

export function buildBrandPalette(): { accent: BrandAccent; palette: BrandPalette } {
  return {
    accent: ACCENT,
    palette: {
      seed: SEED,
      scheme: { light: schemeColors(false), dark: schemeColors(true) },
      segments: split(SEGMENTS),
      stats: split(STATS),
    },
  };
}

if (import.meta.main) {
  const { accent, palette } = buildBrandPalette();
  const write = async (path: string, value: unknown) =>
    Bun.write(new URL(path, import.meta.url), JSON.stringify(value, null, 2) + '\n');
  await write('../plugins/brand-accent.json', accent);
  await write('../src/constants/brand-palette.json', palette);
}
