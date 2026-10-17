import { describe, expect, it } from 'bun:test';

import accent from '../../plugins/brand-accent.json';
import { buildBrandPalette } from '../../scripts/generate-brand-palette';
import palette from './brand-palette.json';

describe('brand palette', () => {
  it('committed palette files match the generator', () => {
    const built = buildBrandPalette();
    expect(accent).toEqual(built.accent);
    expect(palette).toEqual(built.palette);
  });
});
