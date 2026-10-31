// An Apple-style scrolling wheel: the centred row is selected (bold), neighbours are lighter.
import { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';

const ROW = 36;
const VISIBLE = 5;

type Props = { items: string[]; index: number; onChange: (i: number) => void; width?: number };

export function WheelPicker({ items, index, onChange, width = 72 }: Props) {
  const ref = useRef<ScrollView>(null);
  const [live, setLive] = useState(index);
  const pad = ROW * ((VISIBLE - 1) / 2);

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.max(0, Math.min(items.length - 1, Math.round(e.nativeEvent.contentOffset.y / ROW)));
    setLive(i);
    if (i !== index) onChange(i);
  };
  const track = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.max(0, Math.min(items.length - 1, Math.round(e.nativeEvent.contentOffset.y / ROW)));
    if (i !== live) setLive(i);
  };

  return (
    <View style={{ width, height: ROW * VISIBLE }}>
      <ScrollView
        ref={ref}
        contentOffset={{ x: 0, y: index * ROW }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={track}
        onMomentumScrollEnd={settle}
        onScrollEndDrag={settle}
        contentContainerStyle={{ paddingVertical: pad }}>
        {items.map((label, i) => (
          <Pressable key={label} accessibilityRole="adjustable" accessibilityState={{ selected: i === live }}
            onPress={() => { ref.current?.scrollTo({ y: i * ROW, animated: true }); setLive(i); onChange(i); }}
            style={{ height: ROW, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[i === live ? type.headingH2 : type.bodyLarge, { color: i === live ? colors.text.primary : colors.text.muted }]}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
