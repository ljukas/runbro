import { describe, expect, it } from 'bun:test';

import { contrastRatio, deltaE00, minDeltaE00 } from './color-metrics';

describe('deltaE00', () => {
  it('matches the Sharma 2005 reference pairs', () => {
    expect(deltaE00([50, 2.6772, -79.7751], [50, 0, -82.7485])).toBeCloseTo(2.0425, 4);
    expect(deltaE00([50, 0, 0], [50, -1, 2])).toBeCloseTo(2.3669, 4);
  });
});

describe('contrastRatio', () => {
  it('matches the ratios quoted in ADR 0027', () => {
    expect(contrastRatio('#FFFFFF', '#BC4A0C')).toBeCloseTo(5.09, 2);
    expect(contrastRatio('#8E8E93', '#F0F0F3')).toBeCloseTo(2.87, 2);
  });
});

describe('minDeltaE00', () => {
  it('reports the worst vision', () => {
    const a = minDeltaE00('#B2A300', '#FF7A3D');
    expect(a.deltaE).toBeCloseTo(3.06, 2);
    expect(a.vision).toBe('deutan');
    const b = minDeltaE00('#8E8E93', '#0A7C8C');
    expect(b.deltaE).toBeCloseTo(11.58, 2);
    expect(b.vision).toBe('protan');
  });
});
