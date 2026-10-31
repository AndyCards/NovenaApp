// The "..." menu on a Library card (Figma "Library · Active card menu"): a small white card that pops up
// right under the "..." button, with the action on the left and its icon on the right.
import { Modal, Pressable, Text, View } from 'react-native';
import { colors, elevation, radius, screenMargin, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { Icon, type IconName } from '../Icon';

type Props = { visible: boolean; anchorBottom: number; paused?: boolean; onClose: () => void; onPause: () => void; onResume: () => void; onRestart: () => void; onRemove: () => void };

function Row({ label, icon, onPress, last }: { label: string; icon: IconName; onPress: () => void; last?: boolean }) {
  return (
    <Pressable accessibilityRole="menuitem" accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => ({ height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16,
        backgroundColor: pressed ? colors.surface.subtle : 'transparent', borderBottomWidth: last ? 0 : stroke.hairline, borderBottomColor: colors.border.subtle })}>
      <Text style={[type.bodyLarge, { color: colors.text.primary }]}>{label}</Text>
      <Icon name={icon} size={20} color={colors.text.secondary} />
    </Pressable>
  );
}

export function CardMenu({ visible, anchorBottom, paused, onClose, onPause, onResume, onRestart, onRemove }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      {/* Tap anywhere outside the menu to close it. */}
      <Pressable accessibilityLabel={strings.common.close} onPress={onClose} style={{ flex: 1 }}>
        <View style={[{ position: 'absolute', top: anchorBottom + 4, right: screenMargin + 10, width: 250, overflow: 'hidden', borderRadius: radius.m,
          backgroundColor: colors.surface.default, borderWidth: stroke.hairline, borderColor: colors.border.subtle }, elevation.card, { shadowOpacity: 0.12, shadowRadius: 12 }]}>
          <Row label={paused ? 'Resume novena' : strings.library.menuPause} icon={paused ? 'play' : 'pause'} onPress={paused ? onResume : onPause} />
          <Row label={strings.library.menuRestart} icon="restart" onPress={onRestart} />
          <Row label={strings.library.menuRemove} icon="trash" onPress={onRemove} last />
        </View>
      </Pressable>
    </Modal>
  );
}
