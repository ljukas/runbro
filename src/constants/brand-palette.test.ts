import { describe, expect, it } from 'bun:test';
import { argbFromHex, Hct } from '@material/material-color-utilities';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import accent from '../../plugins/brand-accent.json';
import { buildBrandPalette } from '../../scripts/generate-brand-palette';
import { contrastRatio, minDeltaE00 } from '@/domain/color-metrics';
import palette from './brand-palette.json';
import { Colors, SegmentColors, StatColors } from './theme';

type Scheme = 'light' | 'dark';
const SCHEMES: readonly Scheme[] = ['light', 'dark'];

type Colours = Record<string, string>;

// why: StatColors.running is the run segment's colour, so `run` is the stats surface's running.
const dataColours = (scheme: Scheme): Colours => ({
  ...palette.segments[scheme],
  ...palette.stats[scheme],
});

function pick(from: Colours, keys: string[]): Colours {
  return Object.fromEntries(keys.map((k) => [k, from[k]]));
}

const SURFACES: readonly {
  name: string;
  colours: (scheme: Scheme) => Colours;
  backgrounds: (scheme: Scheme) => Colours;
}[] = [
  {
    name: 'segments',
    colours: (s) => pick(dataColours(s), ['run', 'walk', 'warmupCooldown', 'stopped']),
    backgrounds: (s) => ({
      'ios backgroundCard': Colors[s].backgroundCard,
      'ios backgroundElement': Colors[s].backgroundElement,
      'scheme surfaceContainerHighest': palette.scheme[s].surfaceContainerHighest,
      'scheme surfaceContainerHigh': palette.scheme[s].surfaceContainerHigh,
    }),
  },
  {
    name: 'chart',
    colours: (s) => pick(dataColours(s), ['pace', 'elevation', 'run', 'walk', 'stopped']),
    backgrounds: (s) => ({
      'ios backgroundCard': Colors[s].backgroundCard,
      'scheme surfaceContainerHighest': palette.scheme[s].surfaceContainerHighest,
    }),
  },
  {
    name: 'stats',
    colours: (s) => pick(dataColours(s), ['run', 'pace', 'elevation']),
    backgrounds: (s) => ({
      'ios backgroundCard': Colors[s].backgroundCard,
      'scheme surfaceContainerHighest': palette.scheme[s].surfaceContainerHighest,
    }),
  },
  {
    name: 'screen',
    colours: (s) => pick(dataColours(s), ['run', 'walk', 'warmupCooldown', 'stopped']),
    backgrounds: (s) => ({
      'ios background': Colors[s].background,
      'scheme surface': palette.scheme[s].surface,
    }),
  },
];

describe('brand palette', () => {
  it('committed palette files match the generator', () => {
    const built = buildBrandPalette();
    expect(accent).toEqual(built.accent);
    expect(palette).toEqual(built.palette);
  });

  it('every data colour clears 3:1 on every background of its surface', () => {
    const failures: string[] = [];
    for (const scheme of SCHEMES) {
      for (const surface of SURFACES) {
        for (const [colourName, colour] of Object.entries(surface.colours(scheme))) {
          for (const [bgName, bg] of Object.entries(surface.backgrounds(scheme))) {
            const ratio = contrastRatio(colour, bg);
            if (ratio < 3)
              failures.push(
                `${scheme} ${surface.name}: ${colourName} ${colour} on ${bgName} ${bg} = ${ratio.toFixed(2)}`,
              );
          }
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('every pair on one surface stays ≥ 10 ΔE00 under every vision', () => {
    const failures: string[] = [];
    for (const scheme of SCHEMES) {
      for (const surface of SURFACES) {
        const entries = Object.entries(surface.colours(scheme));
        for (const [i, [nameA, a]] of entries.entries()) {
          for (const [nameB, b] of entries.slice(i + 1)) {
            const { deltaE, vision } = minDeltaE00(a, b);
            if (deltaE < 10)
              failures.push(
                `${scheme} ${surface.name}: ${nameA} ${a} vs ${nameB} ${b} = ${deltaE.toFixed(1)} under ${vision}`,
              );
          }
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('only run sits on the brand hue', () => {
    const failures: string[] = [];
    const hct = (hex: string) => Hct.fromInt(argbFromHex(hex));
    for (const scheme of SCHEMES) {
      const colours = dataColours(scheme);
      const runHue = hct(colours.run).hue;
      for (const [name, hex] of Object.entries(colours)) {
        const { hue, chroma } = hct(hex);
        if (name === 'run' || chroma < 10) continue;
        const raw = Math.abs(hue - runHue);
        const distance = Math.min(raw, 360 - raw);
        if (distance < 45)
          failures.push(
            `${scheme}: ${name} ${hex} hue ${hue.toFixed(0)} is ${distance.toFixed(0)}° from run ${runHue.toFixed(0)}`,
          );
      }
    }
    expect(failures).toEqual([]);
  });

  it('each label clears 4.5:1 on its fill in every variant', () => {
    const failures: string[] = [];
    const variants = ['light', 'dark', 'lightHighContrast', 'darkHighContrast'] as const;
    const pairs = [
      ['primaryForeground', 'primary'],
      ['primaryFillForeground', 'primaryFill'],
    ] as const;
    for (const variant of variants) {
      for (const [label, fill] of pairs) {
        const ratio = contrastRatio(accent[label][variant], accent[fill][variant]);
        if (ratio < 4.5) failures.push(`${variant}: ${label} on ${fill} = ${ratio.toFixed(2)}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('primary as text clears 4.5:1 on background, grouped and card', () => {
    const failures: string[] = [];
    const variants: readonly [Scheme, string, keyof typeof accent.primary][] = [
      ['light', 'standard', 'light'],
      ['dark', 'standard', 'dark'],
      ['light', 'high contrast', 'lightHighContrast'],
      ['dark', 'high contrast', 'darkHighContrast'],
    ];
    for (const [scheme, label, variant] of variants) {
      const { background, backgroundGrouped, backgroundCard } = Colors[scheme];
      for (const [bgName, bg] of Object.entries({
        background,
        backgroundGrouped,
        backgroundCard,
      })) {
        const ratio = contrastRatio(accent.primary[variant], bg);
        if (ratio < 4.5)
          failures.push(
            `${scheme} ${label}: primary ${accent.primary[variant]} on ${bgName} ${bg} = ${ratio.toFixed(2)}`,
          );
      }
    }
    expect(failures).toEqual([]);
  });

  it('global.css tokens equal Colors', () => {
    const css = readFileSync(join(import.meta.dir, '../global.css'), 'utf8');
    const cssName: Record<string, string> = {
      text: 'foreground',
      textSecondary: 'foreground-secondary',
    };
    const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

    for (const scheme of SCHEMES) {
      const block = new RegExp(`@variant ${scheme} \\{([^}]*)\\}`).exec(css);
      expect(block).not.toBeNull();
      const tokens = Object.fromEntries(
        [...block![1].matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{3,8});/g)].map((m) => [
          m[1],
          m[2].toLowerCase(),
        ]),
      );
      const expected = Object.fromEntries(
        Object.entries(Colors[scheme]).map(([key, hex]) => [
          cssName[key] ?? kebab(key),
          hex.toLowerCase(),
        ]),
      );
      expect(tokens).toEqual(expected);
    }
  });
});

describe('theme mapping', () => {
  for (const scheme of SCHEMES) {
    it(`${scheme}: SegmentColors and StatColors come from the palette`, () => {
      const seg = palette.segments[scheme];
      const segmentColors = SegmentColors[scheme];
      expect(segmentColors.warmup).toBe(seg.warmupCooldown);
      expect(segmentColors.cooldown).toBe(seg.warmupCooldown);
      expect(segmentColors.run).toBe(seg.run);
      expect(segmentColors.walk).toBe(seg.walk);
      expect(segmentColors.stopped).toBe(seg.stopped);
      expect(StatColors[scheme].running).toBe(seg.run);
      expect(StatColors[scheme].pace).toBe(palette.stats[scheme].pace);
      expect(StatColors[scheme].elevation).toBe(palette.stats[scheme].elevation);
    });
  }
});
