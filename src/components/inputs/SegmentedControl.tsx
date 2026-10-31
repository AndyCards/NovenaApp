// Figma "Segmented Control": the Active / Completed / Saved tabs on the Library screen. 46 high, grey track.
import { View } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { Segment } from './Segment';

type Item<T extends string> = { key: T; label: string; count?: number };

export function SegmentedControl<T extends string>({ items, value, onChange }: { items: Item<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', height: 46, gap: 4, padding: 4, borderRadius: radius.l, backgroundColor: colors.surface.subtle }}>
      {items.map((i) => <Segment key={i.key} label={i.label} count={i.count} selected={i.key === value} onPress={() => onChange(i.key)} />)}
    </View>
  );
}
