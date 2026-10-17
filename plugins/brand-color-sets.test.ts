import { describe, expect, test } from 'bun:test';

import accent from './brand-accent.json';
import { COLOR_SETS, colorSetContents } from './brand-color-sets';

describe('colorSetContents', () => {
  test('writes four appearance variants', () => {
    const { colors } = colorSetContents(accent.primary);
    expect(colors).toHaveLength(4);
    expect(colors[0].appearances).toBeUndefined();
    const darkHigh = colors[3];
    expect(darkHigh.appearances).toEqual([
      { appearance: 'luminosity', value: 'dark' },
      { appearance: 'contrast', value: 'high' },
    ]);
    expect(darkHigh.color.components).toEqual({
      red: '0xFF',
      green: '0xB5',
      blue: '0x98',
      alpha: '1.000',
    });
  });

  test('is idempotent', () => {
    expect(colorSetContents(accent.primary)).toEqual(colorSetContents(accent.primary));
  });

  test('names exactly three sets', () => {
    expect(Object.keys(COLOR_SETS).sort()).toEqual([
      'AccentColor',
      'PrimaryFill',
      'PrimaryFillForeground',
    ]);
    for (const key of Object.values(COLOR_SETS)) expect(accent).toHaveProperty(key);
  });
});
