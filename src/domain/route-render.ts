import { ROUTE_CASING_W, ROUTE_STROKE_W, ROUTE_STROKE_W_RUN } from '@/constants/theme';

import type { LatLng, SegmentPolyline } from './geo';
import type { StoredSegmentKind } from './run-motion';

export interface RouteLine {
  id: string;
  points: LatLng[];
  color: string;
  width: number;
}

/** Casings first, then the coloured lines: a casing drawn between two lines would cut into the
 * neighbour (ADR 0027 amendment). A chunk matching no segment row draws as `walk` (ADR 0021 §4). */
export function toRouteLines(
  chunks: readonly SegmentPolyline[],
  segments: readonly { seq: number; kind: StoredSegmentKind }[],
  colors: Record<StoredSegmentKind, string>,
  casingColor: string,
): RouteLine[] {
  const kindBySeq = new Map(segments.map((segment) => [segment.seq, segment.kind]));
  const lines = chunks.map((chunk, index) => {
    const kind = kindBySeq.get(chunk.segmentSeq) ?? 'walk';
    return {
      id: `seg-${index}`,
      points: chunk.points,
      color: colors[kind],
      width: kind === 'run' ? ROUTE_STROKE_W_RUN : ROUTE_STROKE_W,
    };
  });
  const casings = lines.map((line, index) => ({
    ...line,
    id: `case-${index}`,
    color: casingColor,
    width: line.width + ROUTE_CASING_W,
  }));

  return [...casings, ...lines];
}
