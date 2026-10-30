import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { imageUrl } from '@/constants/config';

export function SaintAvatar({ name, file, size = 'medium' }: { name: string; file?: string; size?: 'small' | 'medium' }) {
  const d = size === 'small' ? 32 : 48;
  if (file) return <Image accessibilityLabel={name} source={{ uri: imageUrl(file) }} contentPosition="top center" style={{ width: d, height: d, borderRadius: d / 2 }} />;
  return (
    <View accessibilityLabel={name} style={{ width: d, height: d, borderRadius: d / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.subtle }}>
      <Text style={[type.labelCaption, { color: colors.text.secondary }]}>{name.replace(/^St\.? /, '').slice(0, 1)}</Text>
    </View>
  );
}
