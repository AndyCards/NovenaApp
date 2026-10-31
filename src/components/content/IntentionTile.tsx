// Figma "Intention Tile": round icon circle and a label, two per row on Home.
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text } from 'react-native';
import { colors, elevation, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { Icon, isIconName } from '../Icon';

export function IntentionTile({ label, icon, onPress }: { label: string; icon?: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => [{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default, backgroundColor: pressed ? colors.surface.subtle : colors.surface.default }, elevation.card]}>
      <LinearGradient colors={colors.gradient.iconCircle} style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: colors.border.subtle }}>
        <Icon name={isIconName(icon) ? icon : 'heart'} size={26} />
      </LinearGradient>
      <Text style={[type.labelChip, { flex: 1, color: colors.text.tertiary }]}>{label}</Text>
    </Pressable>
  );
}
