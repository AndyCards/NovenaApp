// Figma "Popup Card": a round X above a floating white card (radius 24), inset 10 from the edges.
// Title and subtitle are centred. Never a bottom sheet.
import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, screenMargin, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { Icon } from '../Icon';

type Props = { visible: boolean; onClose: () => void; title?: string; subtitle?: string; children: ReactNode };

const softShadow = { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 2 }, elevation: 2 } as const;

export function FloatingCard({ visible, onClose, title, subtitle, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable accessibilityLabel={strings.common.close} onPress={onClose} style={{ flex: 1, backgroundColor: colors.overlay.scrim, justifyContent: 'flex-end', paddingHorizontal: screenMargin, paddingBottom: Math.max(insets.bottom, 10) + 4 }}>
        <View style={{ alignItems: 'center', gap: 20 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={strings.common.close} onPress={onClose} hitSlop={4}
            style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.default, borderWidth: stroke.hairline, borderColor: colors.border.subtle, ...softShadow }}>
            <Icon name="close" size={22} />
          </Pressable>
          <Pressable accessible={false} style={{ alignSelf: 'stretch', padding: 16, gap: 20, borderRadius: 24, backgroundColor: colors.surface.default, borderWidth: stroke.hairline, borderColor: colors.border.subtle, ...softShadow }}>
            {title ? (
              <View style={{ gap: 4 }}>
                <Text accessibilityRole="header" style={[type.titleDialog, { color: colors.text.secondary, textAlign: 'center' }]}>{title}</Text>
                {subtitle ? <Text style={[type.bodyLarge, { color: colors.text.secondary, textAlign: 'center' }]}>{subtitle}</Text> : null}
              </View>
            ) : null}
            {children}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}
