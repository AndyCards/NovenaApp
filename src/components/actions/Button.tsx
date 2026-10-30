import { Pressable, Text, type ViewStyle } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'medium' | 'small';
  disabled?: boolean;
  style?: ViewStyle;
};
const heights = { default: 50, medium: 44, small: 36 } as const;

export function Button({ label, onPress, variant = 'primary', size = 'default', disabled, style }: Props) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: heights[size],
          borderRadius: radius.full,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          backgroundColor: disabled
            ? colors.action.disabled
            : primary
              ? pressed ? colors.action.primaryPressed : colors.action.primary
              : pressed ? colors.action.secondaryPressed : colors.action.secondary,
        },
        style,
      ]}
    >
      <Text style={[type.titleMedium, { color: disabled ? colors.text.disabled : primary ? colors.text.onAction : colors.text.primary }]}>{label}</Text>
    </Pressable>
  );
}
