// Figma "Popup Card": a round X above a floating white card (radius 24), inset 10 from the edges.
// Title and subtitle are centred. Never a bottom sheet.
import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, screenMargin, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { PressableScale } from '@/motion/PressableScale';
import { pressScale } from '@/motion/tokens';
import { usePresence } from '@/motion/usePresence';
import { Icon, type IconName } from '../Icon';

type Props = { visible: boolean; onClose: () => void; title?: string; subtitle?: string; icon?: IconName; children: ReactNode };

const softShadow = { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: { width: 0, height: 2 }, elevation: 2 } as const;

export function FloatingCard({ visible, onClose, title, subtitle, icon, children }: Props) {
  const insets = useSafeAreaInsets();
  // Motion: the dark backdrop fades in while the card rises and settles softly; on close it slips away faster.
  const { mounted, progress, reduced } = usePresence(visible);
  const scrimStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, progress.value) }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, progress.value * 1.6),
    transform: reduced ? [] : [{ translateY: (1 - progress.value) * 56 }, { scale: 0.97 + 0.03 * progress.value }],
  }));
  return (
    <Modal visible={mounted} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay.scrim }, scrimStyle]} />
      <Pressable accessibilityLabel={strings.common.close} onPress={onClose} style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: screenMargin, paddingBottom: Math.max(insets.bottom, 10) + 4 }}>
        <Animated.View style={[{ alignItems: 'center', gap: 20 }, cardStyle]}>
          <PressableScale scaleTo={pressScale.icon} accessibilityRole="button" accessibilityLabel={strings.common.close} onPress={onClose} hitSlop={1}
            style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.default, borderWidth: stroke.hairline, borderColor: colors.border.subtle, ...softShadow }}>
            <Icon name="close" size={22} />
          </PressableScale>
          <Pressable accessible={false} style={{ alignSelf: 'stretch', padding: 16, gap: 20, borderRadius: radius.l, backgroundColor: colors.surface.default, borderWidth: stroke.hairline, borderColor: colors.border.default, ...softShadow }}>
            {title ? (
              <View style={{ gap: 4, alignItems: 'stretch' }}>
                {/* Figma "Halo": a 72 round grey circle with a 36 outlined icon, 10 above the title. */}
                {icon ? (
                  <LinearGradient colors={colors.gradient.iconCircle} style={{ alignSelf: 'center', width: 72, height: 72, borderRadius: 36, marginBottom: 6, alignItems: 'center', justifyContent: 'center', borderWidth: stroke.hairline, borderColor: colors.border.subtle }}>
                    <Icon name={icon} size={36} />
                  </LinearGradient>
                ) : null}
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
