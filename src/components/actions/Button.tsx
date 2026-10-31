// Figma "Button": 50 high pill. Primary = dark top-to-bottom gradient, optional icon after the label.
// Secondary = light grey fill with a hairline border.
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { colors, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { Icon, type IconName } from '../Icon';

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
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }, style]}>
      {primary ? (
        <LinearGradient colors={colors.gradient.button} style={[shape, { borderWidth: stroke.hairline, borderColor: colors.border.subtle }]}>{inner}</LinearGradient>
      ) : (
        <View style={[shape, { backgroundColor: disabled ? colors.action.disabled : colors.action.secondary, borderWidth: stroke.hairline, borderColor: colors.border.default }]}>{inner}</View>
      )}
    </Pressable>
  );
}
