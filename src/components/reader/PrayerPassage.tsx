// One day's prayer. Shows the intention moment and silence as their own blocks.
import { Pressable, Text, View } from 'react-native';
import { colors, screenMargin, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { DayBlock } from '@/content/types';
import { PrayerParagraph } from './PrayerParagraph';

type Props = { blocks: DayBlock[]; onViewIntention: () => void };

export function PrayerPassage({ blocks, onViewIntention }: Props) {
  return (
    <View style={{ paddingHorizontal: screenMargin, gap: space[16] }}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'intention':
            return (
              <Pressable key={i} accessibilityRole="button" accessibilityLabel={strings.reader.viewIntention} onPress={onViewIntention} style={{ gap: 2 }}>
                <Text style={[type.titleSmall, { color: colors.text.primary }]}>{strings.reader.viewIntention}</Text>
                <Text style={[type.bodyMedium, { color: colors.text.tertiary }]}>{strings.reader.intentionPrompt}</Text>
              </Pressable>
            );
          case 'silence':
            return <View key={i} accessibilityLabel="A moment of silence" style={{ height: space[24] }} />;
          default:
            return <PrayerParagraph key={i} text={b.text} />;
        }
      })}
    </View>
  );
}
