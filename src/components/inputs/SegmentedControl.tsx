// The Active / Completed / Saved tabs on the Library screen.
import { View } from 'react-native';
import { colors, radius, screenMargin } from '@/constants/theme';
import { Segment } from './Segment';

type Item<T extends string> = { key: T; label: string; count?: number };

export function SegmentedControl<T extends string>({ items, value, onChange }: { items: Item<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', marginHorizontal: screenMargin, padding: 3, borderRadius: radius.full, backgroundColor: colors.surface.subtle }}>
      {items.map((i) => <Segment key={i.key} label={i.label} count={i.count} selected={i.key === value} onPress={() => onChange(i.key)} />)}
    </View>
  );
}
