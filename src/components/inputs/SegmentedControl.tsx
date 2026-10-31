// Figma "Segmented Control": the Active / Completed / Saved tabs on the Library screen. 46 high, grey track.
// Motion: the white selected pill slides from one segment to the next.
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, radius, stroke } from '@/constants/theme';
import { spring } from '@/motion/tokens';
import { Segment } from './Segment';

type Item<T extends string> = { key: T; label: string; count?: number };

const PAD = 4; // space around the segments inside the grey track
const GAP = 4; // space between segments

export function SegmentedControl<T extends string>({ items, value, onChange }: { items: Item<T>[]; value: T; onChange: (v: T) => void }) {
  const [width, setWidth] = useState(0);
  const x = useSharedValue(0); // where the pill sits, from the left edge of the first segment
  const segWidth = width > 0 ? (width - PAD * 2 - GAP * (items.length - 1)) / items.length : 0;
  const index = Math.max(0, items.findIndex((i) => i.key === value));
  const target = index * (segWidth + GAP);
  const first = useRef(true);
  // The first time the width is known the pill jumps into place; after that it glides.
  useEffect(() => {
    if (segWidth <= 0) return;
    if (first.current) { x.value = target; first.current = false; }
    else x.value = withSpring(target, spring.settle);
  }, [target, segWidth, x]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <View accessibilityRole="tablist" onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ flexDirection: 'row', height: 46, gap: GAP, padding: PAD, borderRadius: radius.l, backgroundColor: colors.surface.subtle }}>
      {segWidth > 0 ? (
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: PAD, top: PAD, width: segWidth, height: 38, borderRadius: radius.m, backgroundColor: colors.surface.default,
          borderWidth: stroke.hairline, borderColor: colors.border.default, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 2 }, elevation: 1 }, pill]} />
      ) : null}
      {items.map((i) => <Segment key={i.key} label={i.label} count={i.count} selected={i.key === value} onPress={() => onChange(i.key)} />)}
    </View>
  );
}
