import { Text, View } from 'react-native';
import { colors, radius, screenMargin, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { StepRow } from './StepRow';

export function HowItWorksCard() {
  return (
    <View style={{ marginHorizontal: screenMargin, padding: space[16], gap: space[12], borderRadius: radius.m, backgroundColor: colors.surface.raised }}>
      <View>
        <Text accessibilityRole="header" style={[type.titleCard, { color: colors.text.primary }]}>{strings.home.howItWorksTitle}</Text>
        <Text style={[type.bodyLarge, { color: colors.text.tertiary }]}>{strings.home.howItWorksSubtitle}</Text>
      </View>
      {strings.home.steps.map((s) => <StepRow key={s.title} title={s.title} body={s.body} />)}
    </View>
  );
}
