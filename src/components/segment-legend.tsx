import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import type { StoredSegmentKind } from '@/domain/run-motion';
import { segmentLegendEntries } from '@/domain/segment-legend';
import { useSegmentColors } from '@/hooks/use-theme';

/**
 * Colour key for the SegmentBar (ADR 0013 domain component). One swatch + label per kind present,
 * in `ORDER` — a single continuous-run week shows no "Walk".
 */
export function SegmentLegend({
  segments,
}: {
  segments: { kind: StoredSegmentKind; seconds: number }[];
}) {
  const segmentColors = useSegmentColors();
  const entries = segmentLegendEntries(segments.map((s) => s.kind));
  return (
    <View className="flex-row flex-wrap gap-x-4 gap-y-1">
      {entries.map((entry) => (
        <View key={entry.kind} className="flex-row items-center gap-1.5">
          <View
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: segmentColors[entry.kind] }}
          />
          <Text variant="footnote" tone="secondary">
            {entry.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
