// Figma "Button": 50 high pill. Primary = dark top-to-bottom gradient, optional icon after the label.
// Secondary = light grey fill with a hairline border.
// While a finger is on the primary button it switches to the darker Figma "Gradient/Button Pressed".
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import { colors, gradients, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { Icon, type IconName } from '../Icon';
import { PressableScale } from '@/motion/PressableScale';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'default' | 'medium' | 'small';
  icon?: IconName;
  disabled?: boolean;
  style?: ViewStyle;
};
const heights = { default: 50, medium: 44, small: 34 } as const;

export function Button({ label, onPress, variant = 'primary', size = 'default', icon, disabled, style }: Props) {
  const primary = variant === 'primary' && !disabled;
  const [pressed, setPressed] = useState(false); // finger down: show the pressed gradient
  const h = heights[size];
  const textStyle = size === 'default' ? type.labelLarge : type.labelSmall;
  const fg = primary ? colors.text.onAction : disabled ? colors.text.disabled : colors.text.body;
  const inner = (
    <>
      <Text style={[textStyle, { color: fg }]}>{label}</Text>
      {icon ? <Icon name={icon} size={size === 'default' ? 20 : 16} color={fg} /> : null}
    </>
  );
  const shape: ViewStyle = { height: h, borderRadius: radius.full, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: size === 'default' ? 24 : 16 };
  return (
    <PressableScale dimTo={primary ? 1 : 0.92} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      style={style}>
      {primary ? (
        <LinearGradient {...(pressed ? gradients.buttonPressed : gradients.button)} style={[shape, { borderWidth: stroke.hairline, borderColor: colors.border.subtle }]}>{inner}</LinearGradient>
      ) : (
        <View style={[shape, { backgroundColor: disabled ? colors.action.disabled : colors.action.secondary, borderWidth: stroke.hairline, borderColor: colors.border.default }]}>{inner}</View>
      )}
    </PressableScale>
  );
}
