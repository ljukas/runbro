import { describe, expect, it } from 'bun:test';

import { segmentLegendEntries } from './segment-legend';

describe('segmentLegendEntries', () => {
  it('legend merges warm-up and cool-down', () => {
    const entries = segmentLegendEntries(['warmup', 'run', 'walk', 'cooldown']);
    expect(entries.map((e) => e.kind)).toEqual(['warmup', 'run', 'walk']);
    expect(entries[0]?.label).toBe('Warm Up / Cool Down');
  });

  it('a lone cool-down still yields the merged entry first', () => {
    const entries = segmentLegendEntries(['cooldown', 'run']);
    expect(entries.map((e) => [e.kind, e.label])).toEqual([
      ['warmup', 'Warm Up / Cool Down'],
      ['run', 'Run'],
    ]);
  });

  it('a lone warm-up yields one merged entry', () => {
    expect(segmentLegendEntries(['warmup'])).toEqual([
      { kind: 'warmup', label: 'Warm Up / Cool Down' },
    ]);
  });

  it('no merged entry without warm-up or cool-down', () => {
    const entries = segmentLegendEntries(['run', 'stopped']);
    expect(entries.map((e) => e.kind)).toEqual(['run', 'stopped']);
    expect(entries.map((e) => e.label)).toEqual(['Run', 'Stopped']);
  });
});
