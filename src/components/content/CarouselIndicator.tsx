import { View } from 'react-native';
import { colors } from '@/constants/theme';

export function CarouselIndicator({ count, active }: { count: number; active: number }) {
  return (
    <View accessible accessibilityLabel={`Page ${active} of ${count}`} style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: i + 1 === active ? colors.action.selected : colors.action.disabled }} />
      ))}
    </View>
  );
}
