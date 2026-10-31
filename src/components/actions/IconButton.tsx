// A round button that shows just an icon (for example Back, Share or More).
// It always has a spoken label so screen readers can say what it does.
import { Pressable } from 'react-native';
import { colors, minTouchTarget, stroke } from '@/constants/theme';
import { Icon, type IconName } from '../Icon';

type Props = { icon: IconName; label: string; onPress: () => void; size?: 'default' | 'large' | 'bordered' };
const dims = { default: 36, large: 44, bordered: 44 } as const;

export function IconButton({ icon, label, onPress, size = 'default' }: Props) {
  const d = dims[size];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={Math.max(0, (minTouchTarget - d) / 2)}
      onPress={onPress}
      style={({ pressed }) => ({
        width: d, height: d, borderRadius: d / 2, alignItems: 'center', justifyContent: 'center',
        backgroundColor: pressed ? colors.surface.strong : colors.surface.subtle,
        borderWidth: size === 'bordered' ? stroke.hairline : 0, borderColor: colors.border.default,
      })}
    >
      <Icon name={icon} />
    </Pressable>
  );
}
