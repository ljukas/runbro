const COLOR_SETS = {
  AccentColor: 'primary',
  PrimaryFill: 'primaryFill',
  PrimaryFillForeground: 'primaryFillForeground',
};

const DARK = { appearance: 'luminosity', value: 'dark' };
const HIGH = { appearance: 'contrast', value: 'high' };

function entry(hex, appearances) {
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

function colorSetContents(variants) {
  return {
    colors: [
      entry(variants.light),
      entry(variants.dark, [DARK]),
      entry(variants.lightHighContrast, [HIGH]),
      entry(variants.darkHighContrast, [DARK, HIGH]),
    ],
    info: { author: 'xcode', version: 1 },
  };
}

module.exports = { COLOR_SETS, colorSetContents };
