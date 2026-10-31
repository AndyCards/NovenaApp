// The little round arrow buttons that move to the previous or next day ("‹ Day 1 of 9 ›").
import { Pressable } from 'react-native';
import { colors } from '@/constants/theme';
import { Icon } from '../Icon';

type Props = { direction: 'previous' | 'next'; onPress: () => void; disabled?: boolean };

export function StepperButton({ direction, onPress, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={direction === 'previous' ? 'Previous day' : 'Next day'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
        backgroundColor: pressed ? colors.surface.strong : colors.surface.subtle, opacity: disabled ? 0.4 : 1,
      })}
    >
      <Icon name={direction === 'previous' ? 'chevronLeft' : 'chevronRight'} size={14} />
    </Pressable>
  );
}
