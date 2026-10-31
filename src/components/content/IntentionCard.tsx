// A grey card that shows what the person wrote as their prayer intention (older layout, kept for reuse).
import { Pressable, Text } from 'react-native';
import { colors, radius, screenMargin, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';

export function IntentionCard({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={strings.reader.viewIntention} onPress={onPress}
      style={{ marginHorizontal: screenMargin, padding: space[12], gap: space[4], borderRadius: radius.m, backgroundColor: colors.surface.raised }}>
      <Text style={[type.labelCaption, { color: colors.text.tertiary }]}>{strings.reader.intentionTitle}</Text>
      <Text numberOfLines={3} style={[type.bodyLarge, { color: colors.text.body }]}>{text || strings.reader.intentionPrompt}</Text>
    </Pressable>
  );
}
