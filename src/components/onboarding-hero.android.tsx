import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import { Box, RNHostView } from '@expo/ui/jetpack-compose';
import { View } from 'react-native';
import { useBrandScheme } from '@/hooks/use-brand-scheme';
import { background, clip, Shapes, size } from '@expo/ui/jetpack-compose/modifiers';
import type { SymbolViewProps } from 'expo-symbols';

import { ComposeSymbol } from '@/components/compose-symbol';
import palette from '@/constants/brand-palette.json';

const SHAPES = {
  clover: Shapes.Material.Clover4Leaf,
  pillStar: Shapes.Material.Clover8Leaf,
  squircle: Shapes.Material.Cookie4Sided,
  scallop: Shapes.Material.Cookie6Sided,
};

export type OnboardingHeroFill = 'container' | 'sunrise';

export type OnboardingHeroShape = keyof typeof SHAPES;

// The spec's 92 dp symbol on a 260 dp hero and 64 dp on 180 dp, kept as one ratio.
const SYMBOL_RATIO = 0.355;

/** The brand gradient corner to corner, which is 135° on a square. */
function SunriseFill({ side }: { side: number }) {
  return (
    <Box modifiers={[size(side, side)]}>
      <RNHostView>
        <View className="flex-1" importantForAccessibility="no-hide-descendants">
          <Canvas style={{ width: side, height: side }}>
            <Rect x={0} y={0} width={side} height={side}>
              <LinearGradient
                start={vec(0, 0)}
                end={vec(side, side)}
                colors={[palette.gradient.from, palette.gradient.to]}
              />
            </Rect>
          </Canvas>
        </View>
      </RNHostView>
    </Box>
  );
}

/**
 * A Material 3 Expressive shape with a centred symbol, for a Compose tree: a Compose `Host`
 * inside an RN view that is itself inside Compose lays out but never paints, so the hero cannot
 * be its own island on a pager page.
 */
export function OnboardingHero({
  shape,
  symbol,
  side,
  fill = 'container',
}: {
  shape: OnboardingHeroShape;
  symbol: SymbolViewProps['name'];
  side: number;
  fill?: OnboardingHeroFill;
}) {
  const colors = useBrandScheme();
  const sunrise = fill === 'sunrise';
  return (
    <Box
      contentAlignment="center"
      modifiers={[size(side, side), clip(SHAPES[shape]), background(colors.primaryContainer)]}
    >
      {sunrise && <SunriseFill side={side} />}
      <ComposeSymbol
        name={symbol}
        size={Math.round(side * SYMBOL_RATIO)}
        tint={sunrise ? '#FFFFFF' : colors.onPrimaryContainer}
      />
    </Box>
  );
}
