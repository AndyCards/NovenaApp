// A round button that shows just an icon (for example Back, Share or More).
// It always has a spoken label so screen readers can say what it does.
import { colors, minTouchTarget, stroke } from '@/constants/theme';
import { Icon, type IconName } from '../Icon';
import { PressableScale } from '@/motion/PressableScale';
import { pressScale } from '@/motion/tokens';

type Props = { icon: IconName; label: string; onPress: () => void; size?: 'default' | 'large' | 'bordered' | 'plain' };
// 'plain' is the Figma Nav Bar button: 44 wide, just the icon, no circle behind it.
const dims = { default: 36, large: 44, bordered: 44, plain: 44 } as const;

export function IconButton({ icon, label, onPress, size = 'default' }: Props) {
  const d = dims[size];
  return (
    <PressableScale
      scaleTo={pressScale.icon}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={Math.max(0, (minTouchTarget - d) / 2)}
      onPress={onPress}
      style={({ pressed }) => ({
        width: d, height: d, borderRadius: d / 2, alignItems: 'center', justifyContent: 'center',
        backgroundColor: size === 'plain' ? 'transparent' : pressed ? colors.surface.strong : colors.surface.subtle,
        borderWidth: size === 'bordered' ? stroke.hairline : 0, borderColor: colors.border.default,
      })}
    >
      <Icon name={icon} />
    </PressableScale>
  );
}
