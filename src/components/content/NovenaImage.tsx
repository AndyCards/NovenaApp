// A saint's picture. Cropped from the top centre so heads are never cut off.
import { Image } from 'expo-image';
import type { ImageStyle } from 'react-native';
import { imageUrl } from '@/constants/config';
import { colors } from '@/constants/theme';
import type { ImageRef } from '@/content/types';

export function NovenaImage({ image, size = 'thumb', style, label }: { image: ImageRef; size?: 'thumb' | 'full'; style?: ImageStyle; label: string }) {
  const position = image.focus === 'top-center' ? 'top center' : { left: `${image.focus.x * 100}%`, top: `${image.focus.y * 100}%` };
  return (
    <Image
      accessibilityLabel={label}
      source={{ uri: imageUrl(size === 'thumb' ? image.thumb : image.full) }}
      contentFit="cover"
      contentPosition={position as never}
      transition={150}
      style={[{ backgroundColor: colors.surface.subtle }, style]}
    />
  );
}
