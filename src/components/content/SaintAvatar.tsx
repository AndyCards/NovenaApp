// A saint's round picture. If there is no picture, it shows the saint's initials instead.
import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { imageSource } from '@/content/localImages';

const sizes = { tiny: 28, row: 36, small: 32, medium: 48, large: 72 } as const;

export function SaintAvatar({ name, file, size = 'medium' }: { name: string; file?: string; size?: keyof typeof sizes }) {
  const d = sizes[size];
  if (file) return <Image accessibilityLabel={name} source={imageSource(file)} contentFit="cover" contentPosition="top center" style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: colors.surface.subtle }} />;
  return (
    <View accessibilityLabel={name} style={{ width: d, height: d, borderRadius: d / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.subtle }}>
      <Text style={[type.labelCaption, { color: colors.text.secondary }]}>{name.replace(/^St\.? /, '').slice(0, 1)}</Text>
    </View>
  );
}
