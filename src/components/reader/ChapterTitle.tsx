// Figma "Day Header": "Day 1 of 9" in Source Serif, with the cross ornament underneath.
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { Icon } from '../Icon';

const Rule = () => <LinearGradient colors={['#5F5F5F', '#868484']} style={{ width: 48, height: 0.6 }} />;

export function ChapterTitle({ title }: { title: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 6 }}>
      <Text accessibilityRole="header" style={[type.readerDayHeading, { color: colors.text.secondary, paddingVertical: 6 }]}>{title}</Text>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Rule />
        <Icon name="cross" size={21} color={colors.text.secondary} />
        <Rule />
      </View>
    </View>
  );
}
