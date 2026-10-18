import { describe, expect, test } from 'bun:test';

import { ROUTE_CASING_W, ROUTE_STROKE_W, ROUTE_STROKE_W_RUN } from '@/constants/theme';

import type { SegmentPolyline } from './geo';
import { toRouteLines } from './route-render';
import type { StoredSegmentKind } from './run-motion';

const CASING = '#casing';

const COLORS: Record<StoredSegmentKind, string> = {
  warmup: '#warmup',
  run: '#run',
  walk: '#walk',
  cooldown: '#cooldown',
  stopped: '#stopped',
};

function chunk(segmentSeq: number): SegmentPolyline {
  return {
    segmentSeq,
    points: [
      { lat: 59.33, lng: 18.07 },
      { lat: 59.331, lng: 18.071 },
    ],
    gapBefore: false,
  };
}

const SEGMENTS: { seq: number; kind: StoredSegmentKind }[] = [
  { seq: 0, kind: 'warmup' },
  { seq: 1, kind: 'run' },
  { seq: 2, kind: 'walk' },
  { seq: 3, kind: 'cooldown' },
];

function coloured(chunks: SegmentPolyline[]) {
  return toRouteLines(chunks, SEGMENTS, COLORS, CASING).slice(chunks.length);
}

describe('toRouteLines', () => {
  test('cases every line beneath all lines', () => {
    const lines = toRouteLines([chunk(1), chunk(2)], SEGMENTS, COLORS, CASING);
    expect(lines.map((line) => line.id)).toEqual(['case-0', 'case-1', 'seg-0', 'seg-1']);
    expect(lines.slice(0, 2).map((line) => line.color)).toEqual([CASING, CASING]);
    expect(lines.slice(0, 2).map((line) => line.width)).toEqual([
      ROUTE_STROKE_W_RUN + ROUTE_CASING_W,
      ROUTE_STROKE_W + ROUTE_CASING_W,
    ]);
  });

  test('unmatched chunk is cased walk', () => {
    const [casing, line] = toRouteLines([chunk(99)], SEGMENTS, COLORS, CASING);
    expect(casing).toMatchObject({
      id: 'case-0',
      color: CASING,
      width: ROUTE_STROKE_W + ROUTE_CASING_W,
    });
    expect(line.color).toBe('#walk');
  });

  test('colours each chunk from its segment kind', () => {
    const lines = coloured([chunk(0), chunk(1), chunk(2), chunk(3)]);
    expect(lines.map((line) => line.color)).toEqual(['#warmup', '#run', '#walk', '#cooldown']);
  });

  test("draws a free run's stopped stretch in its own colour, at the thin width", () => {
    const [line] = toRouteLines([chunk(0)], [{ seq: 0, kind: 'stopped' }], COLORS, CASING).slice(1);
    expect(line).toMatchObject({ color: '#stopped', width: ROUTE_STROKE_W });
  });

  test('draws a chunk whose segmentSeq has no segment row as walk', () => {
    // The fallback is load-bearing: save-run.ts warns about this misalignment in __DEV__.
    const [line] = toRouteLines([chunk(99)], SEGMENTS, COLORS, CASING).slice(1);
    expect(line.color).toBe('#walk');
    expect(line.width).toBe(ROUTE_STROKE_W);
  });

  test('falls back to walk when the segments have not loaded at all', () => {
    expect(toRouteLines([chunk(1)], [], COLORS, CASING)[1].color).toBe('#walk');
  });

  test('only run intervals get the thick stroke', () => {
    const lines = coloured([chunk(0), chunk(1), chunk(2), chunk(3)]);
    expect(lines.map((line) => line.width)).toEqual([
      ROUTE_STROKE_W,
      ROUTE_STROKE_W_RUN,
      ROUTE_STROKE_W,
      ROUTE_STROKE_W,
    ]);
  });

  test('ids are deterministic and follow drawing order', () => {
    const lines = toRouteLines([chunk(2), chunk(2), chunk(1)], SEGMENTS, COLORS, CASING);
    expect(lines.map((line) => line.id)).toEqual([
      'case-0',
      'case-1',
      'case-2',
      'seg-0',
      'seg-1',
      'seg-2',
    ]);
  });

  test('passes the chunk points through by reference', () => {
    // Adjacent chunks share their boundary vertex by object identity; copying here would not break
    // rendering, but it would silently end the guarantee the seam tests in geo.test.ts pin.
    const chunks = [chunk(0)];
    expect(toRouteLines(chunks, SEGMENTS, COLORS, CASING)[1].points).toBe(chunks[0].points);
  });

  test('no chunks, no lines', () => {
    expect(toRouteLines([], SEGMENTS, COLORS, CASING)).toEqual([]);
  });
});
