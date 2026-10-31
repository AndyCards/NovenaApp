// The small round × button that empties a search box or removes a chip.
import { Pressable } from 'react-native';
import { colors } from '@/constants/theme';
import { Icon } from '../Icon';

export function ClearButton({ onPress, size = 'search' }: { onPress: () => void; size?: 'chip' | 'search' }) {
  const d = size === 'chip' ? 16 : 20;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Clear" hitSlop={12} onPress={onPress}
      style={{ width: d, height: d, borderRadius: d / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.border.strong }}>
      <Icon name="clear" size={d * 0.55} color={colors.text.onAction} />
    </Pressable>
  );
}
