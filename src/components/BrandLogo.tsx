// The pocketNovena logo: the small arched window with a cross, then the "pocketNovena" name.
// Matches Figma "Brand / Wordmark": Poppins SemiBold 20, letter spacing -4%, grey fill that fades from #5F5F5F at the top
// to #3F3F3F at the bottom. The name is drawn from outlines copied out of Figma (see wordmarkPath.ts), so it looks
// the same on every phone and needs no extra font. The whole logo is 170 wide and 50 tall.
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { wordmarkPath } from '@/constants/wordmarkPath';

export function BrandLogo() {
  return (
    <Svg width={170} height={50} viewBox="0 0 170 50" accessibilityLabel="pocketNovena" accessible>
      <Defs>
        {/* Name: grey that gets a little darker towards the bottom of the letters. */}
        <LinearGradient id="wordmarkFill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="30">
          <Stop offset="0" stopColor="#5F5F5F" />
          <Stop offset="1" stopColor="#3F3F3F" />
        </LinearGradient>
        {/* The upright of the cross: light gold at the top, deeper gold at the bottom. */}
        <LinearGradient id="crossUpright" gradientUnits="userSpaceOnUse" x1="0" y1="5.5" x2="0" y2="38">
          <Stop offset="0" stopColor="#E2C27A" />
          <Stop offset="0.5" stopColor="#C99A3A" />
          <Stop offset="1" stopColor="#AE7C26" />
        </LinearGradient>
        {/* The crossbar: deep gold on the left, light gold towards the right. */}
        <LinearGradient id="crossBar" gradientUnits="userSpaceOnUse" x1="4" y1="0" x2="22" y2="0">
          <Stop offset="0" stopColor="#A8741F" />
          <Stop offset="1" stopColor="#E8CF8C" />
        </LinearGradient>
        {/* The maroon "K" stroke: darker at the top, redder at the bottom. */}
        <LinearGradient id="maroon" gradientUnits="userSpaceOnUse" x1="0" y1="14" x2="0" y2="33">
          <Stop offset="0" stopColor="#4A2323" />
          <Stop offset="1" stopColor="#7A1F1B" />
        </LinearGradient>
      </Defs>
      {/* Logo mark, 26 x 41, sitting 4.5 down from the top. */}
      <G transform="translate(0 4.5)">
        <Path d="M0.5 40.5 V13.5 A12.5 12.5 0 0 1 25.5 13.5 V40.5 Z" fill="none" stroke="#4A3535" strokeWidth={0.9} />
        <Path d="M12.8 5.6 V37.9" stroke="url(#crossUpright)" strokeWidth={1.2} strokeLinecap="round" />
        <Path d="M4.2 14.1 H21.7" stroke="url(#crossBar)" strokeWidth={1.2} strokeLinecap="round" />
        <Path d="M22.5 14.2 L12.8 23.3 L22.7 32.7" fill="none" stroke="url(#maroon)" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
      </G>
      {/* The name, placed 30 across and 10 down. */}
      <G transform="translate(30 10)">
        <Path d={wordmarkPath} fill="url(#wordmarkFill)" />
      </G>
    </Svg>
  );
}
