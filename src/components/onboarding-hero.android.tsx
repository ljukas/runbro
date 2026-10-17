import { Box, RNHostView } from '@expo/ui/jetpack-compose';
import { background, clip, Shapes, size } from '@expo/ui/jetpack-compose/modifiers';
import { Canvas, LinearGradient, Rect, vec } from '@shopify/react-native-skia';
import type { SymbolViewProps } from 'expo-symbols';
import { View } from 'react-native';

import { ComposeSymbol } from '@/components/compose-symbol';
import { BRAND_GRADIENT } from '@/constants/brand-scheme';
import { useBrandScheme } from '@/hooks/use-brand-scheme';

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

function SunriseFill({ side }: { side: number }) {
  return (
    <Box modifiers={[size(side, side)]}>
      <RNHostView>
        <View className="flex-1" importantForAccessibility="no-hide-descendants">
          <Canvas style={{ width: side, height: side }}>
            <Rect x={0} y={0} width={side} height={side}>
              {/* why: corner to corner on a square is the brand's 135° (docs/brand/brand.json). */}
              <LinearGradient
                start={vec(0, 0)}
                end={vec(side, side)}
                colors={[BRAND_GRADIENT.from, BRAND_GRADIENT.to]}
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
        tint={sunrise ? BRAND_GRADIENT.on : colors.onPrimaryContainer}
      />
    </Box>
  );
}
