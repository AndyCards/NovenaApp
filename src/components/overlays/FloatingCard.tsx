// The shell for every pop-up. Floating card inset 10, X top right, soft shadow. Never a bottom sheet.
import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { colors, elevation, radius, screenMargin, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { IconButton } from '../actions/IconButton';

type Props = { visible: boolean; onClose: () => void; title?: string; children: ReactNode; bottomOffset?: number };

export function FloatingCard({ visible, onClose, title, children, bottomOffset = 34 }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable accessibilityLabel={strings.common.close} onPress={onClose} style={{ flex: 1, backgroundColor: colors.overlay.scrim, justifyContent: 'flex-end' }}>
        <Pressable accessible={false} style={[{ margin: screenMargin, marginBottom: bottomOffset, padding: space[16], gap: space[12], borderRadius: radius.l, backgroundColor: colors.surface.default }, elevation.card]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text accessibilityRole="header" style={[type.titleCard, { flex: 1, color: colors.text.primary }]}>{title}</Text>
            <IconButton icon="close" label={strings.common.close} onPress={onClose} />
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
