import { describe, expect, test } from 'bun:test';

import accent from './brand-accent.json';
import { COLOR_SETS, colorSetContents } from './brand-color-sets';

const DARK = { appearance: 'luminosity', value: 'dark' };
const HIGH = { appearance: 'contrast', value: 'high' };

const ENTRIES = [
  ['light', undefined],
  ['dark', [DARK]],
  ['lightHighContrast', [HIGH]],
  ['darkHighContrast', [DARK, HIGH]],
] as const;

function components(hex: string) {
  return {
    red: `0x${hex.slice(1, 3).toUpperCase()}`,
    green: `0x${hex.slice(3, 5).toUpperCase()}`,
    blue: `0x${hex.slice(5, 7).toUpperCase()}`,
    alpha: '1.000',
  };
}

describe('colorSetContents', () => {
  test('maps each colour set to its accent key', () => {
    expect(COLOR_SETS).toEqual({
      AccentColor: 'primary',
      PrimaryFill: 'primaryFill',
      PrimaryFillForeground: 'primaryFillForeground',
    });
  });

  for (const [set, key] of Object.entries(COLOR_SETS)) {
    describe(set, () => {
      const variants = accent[key as keyof typeof accent];
      const { colors } = colorSetContents(variants, set);

      test('writes four entries', () => {
        expect(colors).toHaveLength(4);
      });

      ENTRIES.forEach(([variant, appearances], i) => {
        test(`${variant} carries its appearances and hex`, () => {
          expect(colors[i].appearances).toEqual(appearances);
          expect(colors[i].color.components).toEqual(components(variants[variant]));
        });
      });
    });
  }

  test('names the set and variant of a malformed hex', () => {
    expect(() => colorSetContents({ ...accent.primary, dark: '#FF7A3' }, 'AccentColor')).toThrow(
      'Colour set AccentColor: variant dark is not a #RRGGBB hex',
    );
  });
});
