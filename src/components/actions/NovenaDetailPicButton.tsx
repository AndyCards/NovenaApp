import { Pressable } from 'react-native';
import { colors } from '@/constants/theme';
import { Icon, type IconName } from '../Icon';

export function NovenaDetailPicButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={4}
      style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.default }}>
      <Icon name={icon} />
    </Pressable>
  );
}
