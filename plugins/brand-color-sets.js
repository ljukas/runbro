const COLOR_SETS = {
  AccentColor: 'primary',
  PrimaryFill: 'primaryFill',
  PrimaryFillForeground: 'primaryFillForeground',
};

const DARK = { appearance: 'luminosity', value: 'dark' };
const HIGH = { appearance: 'contrast', value: 'high' };

function entry(set, variant, hex, appearances) {
  if (typeof hex !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error(`Colour set ${set}: variant ${variant} is not a #RRGGBB hex (got ${hex})`);
  }
  const channel = (offset) => `0x${hex.slice(offset, offset + 2).toUpperCase()}`;
  return {
    idiom: 'universal',
    ...(appearances && { appearances }),
    color: {
      'color-space': 'srgb',
      components: { red: channel(1), green: channel(3), blue: channel(5), alpha: '1.000' },
    },
  };
}

function colorSetContents(variants, set = 'colour set') {
  return {
    colors: [
      entry(set, 'light', variants.light),
      entry(set, 'dark', variants.dark, [DARK]),
      entry(set, 'lightHighContrast', variants.lightHighContrast, [HIGH]),
      entry(set, 'darkHighContrast', variants.darkHighContrast, [DARK, HIGH]),
    ],
    info: { author: 'xcode', version: 1 },
  };
}

module.exports = { COLOR_SETS, colorSetContents };
