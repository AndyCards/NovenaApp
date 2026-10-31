// A short message with an optional Undo, for example "Removed from Saved · Undo".
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, elevation, radius, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';

type Props = { message: string | null; onUndo?: () => void; onDismiss: () => void; durationMs?: number };

export function Toast({ message, onUndo, onDismiss, durationMs = 4000 }: Props) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(t);
  }, [message, onDismiss, durationMs]);
  if (!message) return null;
  return (
    <View accessibilityLiveRegion="polite" style={[{ position: 'absolute', left: screenMargin, right: screenMargin, bottom: 100, flexDirection: 'row', alignItems: 'center', minHeight: 50, paddingHorizontal: 20, paddingVertical: 14, borderRadius: radius.full, backgroundColor: colors.action.media }, elevation.card]}>
      <Text style={[type.bodyLarge, { flex: 1, color: colors.text.onAction }]}>{message}</Text>
      {onUndo ? (
        <Pressable accessibilityRole="button" onPress={() => { onUndo(); onDismiss(); }} hitSlop={12}>
          <Text style={[type.labelMedium, { color: colors.text.onAction }]}>{strings.library.undo}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
