// The pocketNovena logo: the small arched window with a cross (your picture), then the "pocketNovena" name.
// The name matches Figma "Brand / Wordmark": Poppins SemiBold 20, letter spacing -4%, one solid grey fill
// (#5F5F5F, Andy's spec of 2026-11-01; the earlier top-to-bottom fade is gone). It is drawn from outlines copied out of Figma (see wordmarkPath.ts), so it looks
// the same on every phone and needs no extra font. The whole logo is 170 wide and 50 tall.
import { Image, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { wordmarkPath } from '@/constants/wordmarkPath';

export function BrandLogo() {
  return (
    <View accessible accessibilityLabel="pocketNovena" style={{ width: 170, height: 50 }}>
      {/* Logo mark picture, 26 x 41, sitting 4.5 down from the top. */}
      <Image source={require('../../assets/images/brand/logo-mark.png')} style={{ position: 'absolute', left: 0, top: 4.5, width: 26, height: 41 }} />
      {/* The name, placed 30 across and 10 down, in a 140 x 30 box. */}
      <Svg width={140} height={30} viewBox="0 0 140 30" style={{ position: 'absolute', left: 30, top: 10 }}>
        <Path d={wordmarkPath} fill="#5F5F5F" />
      </Svg>
    </View>
  );
}
