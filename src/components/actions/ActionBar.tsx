// The bottom row on the Novena page: a main button plus small icon buttons (save, share).
import { View } from 'react-native';
import { screenMargin, space } from '@/constants/theme';
import { Button } from './Button';
import { IconButton } from './IconButton';
import type { IconName } from '../Icon';

type Props = {
  primaryLabel: string;
  onPrimary: () => void;
  actions?: { icon: IconName; label: string; onPress: () => void }[];
};

export function ActionBar({ primaryLabel, onPrimary, actions = [] }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[10], paddingHorizontal: screenMargin }}>
      <Button label={primaryLabel} onPress={onPrimary} style={{ flex: 1 }} />
      {actions.map((a) => <IconButton key={a.label} icon={a.icon} label={a.label} onPress={a.onPress} size="large" />)}
    </View>
  );
}
