// A saint's picture. Cropped from the top centre so heads are never cut off.
import { Image } from 'expo-image';
import type { ImageStyle, StyleProp } from 'react-native';
import { colors } from '@/constants/theme';
import { imageSource } from '@/content/localImages';
import type { ImageRef } from '@/content/types';

type Props = { image: ImageRef; size?: 'thumb' | 'full'; style?: StyleProp<ImageStyle>; label: string };

export function NovenaImage({ image, size = 'thumb', style, label }: Props) {
  const position = image.focus === 'top-center' ? 'top center' : { left: `${image.focus.x * 100}%`, top: `${image.focus.y * 100}%` };
  return (
    <Image
      accessibilityLabel={label}
      source={imageSource(size === 'thumb' ? image.thumb : image.full)}
      contentFit="cover"
      contentPosition={position as never}
      transition={150}
      style={[{ backgroundColor: colors.surface.subtle }, style]}
    />
  );
}
