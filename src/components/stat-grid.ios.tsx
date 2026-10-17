import { HStack } from '@expo/ui/swift-ui';
import { dynamicTypeSize, font } from '@expo/ui/swift-ui/modifiers';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ReactNode } from 'react';
import { PixelRatio, useWindowDimensions, View } from 'react-native';

import { Island } from '@/components/island';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/cn';

/**
 * A two-column grid of stat tiles (ADR 0013 domain component) for the run
 * summary, styled after Apple Health's summary cards: a header of an SF
 * Symbol (tinted when the tile has a colour) plus a neutral label, then a big number with a smaller gray
 * lowercase unit beside it. The value row is a SwiftUI island because SF
 * Rounded — Health's metric face — is only reachable as
 * `Font.system(design: .rounded)`; RN's `fontFamily` cannot name it. Tiles
 * wrap, so adding more later (distance, pace) grows the grid.
 */
function StatGridRoot({ children }: { children: ReactNode }) {
  return <View className="flex-row flex-wrap justify-between gap-y-3">{children}</View>;
}

function StatGridTile({
  icon,
  color,
  label,
  value,
  unit,
  width = 'half',
}: {
  /** `full` for a tile that would otherwise sit alone in the grid's last row. */
  width?: 'half' | 'full';
  icon: SymbolViewProps['name'];
  color?: string;
  label: string;
  value: string;
  unit: string;
}) {
  // C: at accessibility text sizes the 48%-wide tiles crowd the big number —
  // reflow to a single full-width column so the Dynamic-Type value has room.
  const { fontScale } = useWindowDimensions();
  const stacked = fontScale >= 1.6;
  const colors = useTheme();
  return (
    <Card
      surface="card"
      className={cn(stacked || width === 'full' ? 'w-full' : 'w-[48%]', 'gap-5')}
    >
      <View className="flex-row items-center gap-1.5">
        {/* B: glyph scales with the OS font-size setting instead of a frozen 16 pt. */}
        <SymbolView
          name={icon}
          size={16 * PixelRatio.getFontScale()}
          tintColor={color ?? colors.textSecondary}
        />
        {/* A: cap at AX3 to match the value's cap so the value stays larger. The glyph carries the
            accent; the label stays neutral so no text depends on a data colour's contrast. */}
        <Text
          variant="footnote"
          tone="secondary"
          className="font-semibold"
          maxFontSizeMultiplier={2.35}
        >
          {label}
        </Text>
      </View>
      <Island matchContents>
        <HStack spacing={5} alignment="lastTextBaseline">
          {/* A: Dynamic-Type text styles (scale with the OS setting) capped at AX3;
              relax the cap toward AX5 once C's full-width reflow lands. */}
          <Island.Text
            modifiers={[
              font({ design: 'rounded', textStyle: 'title', weight: 'bold' }),
              dynamicTypeSize({ max: 'accessibility3' }),
            ]}
          >
            {value}
          </Island.Text>
          <Island.Text
            tone="secondary"
            modifiers={[
              font({ design: 'rounded', textStyle: 'subheadline', weight: 'semibold' }),
              dynamicTypeSize({ max: 'accessibility3' }),
            ]}
          >
            {unit}
          </Island.Text>
        </HStack>
      </Island>
    </Card>
  );
}

export const StatGrid = Object.assign(StatGridRoot, { Tile: StatGridTile });
