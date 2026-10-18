import { SEGMENT_KIND_LABEL } from './format';
import type { StoredSegmentKind } from './run-motion';

const ORDER: StoredSegmentKind[] = ['warmup', 'run', 'walk', 'stopped'];

// why: warm-up and cool-down share one palette colour, so a swatch per kind would repeat itself.
const MERGED_LABEL = 'Warm Up / Cool Down';

export function segmentLegendEntries(
  kinds: Iterable<StoredSegmentKind>,
): { kind: StoredSegmentKind; label: string }[] {
  const present = new Set(kinds);
  const hasBookend = present.has('warmup') || present.has('cooldown');
  return ORDER.filter((kind) => (kind === 'warmup' ? hasBookend : present.has(kind))).map(
    (kind) => ({
      kind,
      label: kind === 'warmup' ? MERGED_LABEL : SEGMENT_KIND_LABEL[kind],
    }),
  );
}
