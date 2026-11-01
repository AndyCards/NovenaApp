// The pocketNovena logo: the small arched window with a cross (your picture), then the "pocketNovena" name.
// The name matches Figma "Brand / Wordmark": Poppins SemiBold 20, letter spacing -4%, grey fill that fades from #5F5F5F
// at the top to #3F3F3F at the bottom. It is drawn from outlines copied out of Figma (see wordmarkPath.ts), so it looks
// the same on every phone and needs no extra font. The whole logo is 170 wide and 50 tall.
import { Image, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { gradients } from '@/constants/theme';
import { wordmarkPath } from '@/constants/wordmarkPath';

export function BrandLogo() {
  return (
    <View accessible accessibilityLabel="pocketNovena" style={{ width: 170, height: 50 }}>
      {/* Logo mark picture, 26 x 41, sitting 4.5 down from the top. */}
      <Image source={require('../../assets/images/brand/logo-mark.png')} style={{ position: 'absolute', left: 0, top: 4.5, width: 26, height: 41 }} />
      {/* The name, placed 30 across and 10 down, in a 140 x 30 box. */}
      <Svg width={140} height={30} viewBox="0 0 140 30" style={{ position: 'absolute', left: 30, top: 10 }}>
        <Defs>
          <LinearGradient id="wordmarkFill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="30">
            {/* Figma "Gradient/Dark", from the shared gradient list. */}
            <Stop offset="0" stopColor={gradients.dark.colors[0]} />
            <Stop offset="1" stopColor={gradients.dark.colors[1]} />
          </LinearGradient>
        </Defs>
        <Path d={wordmarkPath} fill="url(#wordmarkFill)" />
      </Svg>
    </View>
  );
}
