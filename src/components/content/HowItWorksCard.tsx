// Figma "How It Works Card" (1420:9774): three steps with icon tiles and dividers.
import { Text, View } from 'react-native';
import { colors, elevation, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { Icon, type IconName } from '../Icon';

const stepIcons: IconName[] = ['handsPraying', 'bell', 'history'];

export function HowItWorksCard() {
  return (
    <View style={[{ paddingHorizontal: 14, paddingVertical: 4, borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default, backgroundColor: colors.surface.default }, elevation.card]}>
      {strings.home.steps.map((s, i) => (
        <View key={s.title}>
          {i > 0 ? <View style={{ height: 1, backgroundColor: colors.border.subtle }} /> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 }}>
            <View style={{ width: 36, height: 36, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.subtle }}>
              <Icon name={stepIcons[i]} size={20} />
            </View>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={[type.titleSmall, { color: colors.text.primary }]}>{s.title}</Text>
              <Text style={[type.bodyMedium, { color: colors.text.secondary }]}>{s.body}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
