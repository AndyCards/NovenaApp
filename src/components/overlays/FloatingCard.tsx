// Figma "Popup Card": a round X above a floating white card (radius 24), inset 10 from the edges.
// Title and subtitle are centred. Never a bottom sheet.
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, screenMargin, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { PressableScale } from '@/motion/PressableScale';
import { pressScale } from '@/motion/tokens';
import { usePresence } from '@/motion/usePresence';
import { Icon } from '../Icon';

type Props = { visible: boolean; onClose: () => void; title?: string; subtitle?: string; children: ReactNode };

const softShadow = { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 2 }, elevation: 2 } as const;

export function FloatingCard({ visible, onClose, title, subtitle, children }: Props) {
  const insets = useSafeAreaInsets();
  // Motion: the dark backdrop fades in while the card rises and settles softly; on close it slips away faster.
  const { mounted, progress, reduced } = usePresence(visible);
  const scrimStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, progress.value) }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, progress.value * 1.6),
    transform: reduced ? [] : [{ translateY: (1 - progress.value) * 56 }, { scale: 0.97 + 0.03 * progress.value }],
  }));
  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay.scrim }, scrimStyle]} />
      <Pressable accessibilityLabel={strings.common.close} onPress={onClose} style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: screenMargin, paddingBottom: Math.max(insets.bottom, 10) + 4 }}>
        <Animated.View style={[{ alignItems: 'center', gap: 20 }, cardStyle]}>
          <PressableScale scaleTo={pressScale.icon} accessibilityRole="button" accessibilityLabel={strings.common.close} onPress={onClose} hitSlop={4}
            style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.default, borderWidth: stroke.hairline, borderColor: colors.border.subtle, ...softShadow }}>
            <Icon name="close" size={22} />
          </PressableScale>
          <Pressable accessible={false} style={{ alignSelf: 'stretch', padding: 16, gap: 20, borderRadius: 24, backgroundColor: colors.surface.default, borderWidth: stroke.hairline, borderColor: colors.border.subtle, ...softShadow }}>
            {title ? (
              <View style={{ gap: 4 }}>
                <Text accessibilityRole="header" style={[type.titleDialog, { color: colors.text.secondary, textAlign: 'center' }]}>{title}</Text>
                {subtitle ? <Text style={[type.bodyLarge, { color: colors.text.secondary, textAlign: 'center' }]}>{subtitle}</Text> : null}
              </View>
            ) : null}
            {children}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
