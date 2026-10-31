// Figma "Audio Player": white card, 44 thumbnail, title + status, round pause/play, scrubber with knob.
// States: playing, paused, loading, finished, offline, error. Never autoplays.
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, LinearTransition, ReduceMotion, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import type { ImageRef } from '@/content/types';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';
import type { PlayerState } from '@/state/playerStore';
import { PressableScale } from '@/motion/PressableScale';
import { duration, ease, pressScale } from '@/motion/tokens';
import { NovenaImage } from '../content/NovenaImage';
import { Icon } from '../Icon';

type Props = {
  state: Exclude<PlayerState, 'hidden'>;
  title: string;
  image?: ImageRef;
  positionSec: number;
  durationSec: number;
  layout?: 'full' | 'compact';
  onPlay: () => void;
  onPause: () => void;
  onSeek: (sec: number) => void;
  onClose: () => void;
};

const label = (state: Props['state'], left: string) =>
  state === 'playing' ? `Playing · ${left} left`
  : state === 'paused' ? `Paused · ${left} left`
  : state === 'loading' ? 'Loading…'
  : state === 'finished' ? 'Finished'
  : state === 'offline' ? "Offline · can't stream. Download to listen"
  : "Can't play right now. Read instead";

const mmss = (s: number) => { const t = Math.max(0, Math.floor(s)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };

// Round button. The play and pause icons are stacked and cross-fade (with a tiny scale) when the state flips.
function RoundButton({ icon, label: a11y, onPress }: { icon: 'play' | 'pause' | 'close'; label: string; onPress: () => void }) {
  const toggles = icon === 'play' || icon === 'pause';
  const p = useSharedValue(icon === 'pause' ? 1 : 0); // 1 = pause icon showing
  useEffect(() => { p.value = withTiming(icon === 'pause' ? 1 : 0, { duration: duration.quick, easing: ease.out }); }, [icon, p]);
  const playIcon = useAnimatedStyle(() => ({ opacity: 1 - p.value, transform: [{ scale: 0.8 + 0.2 * (1 - p.value) }] }));
  const pauseIcon = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ scale: 0.8 + 0.2 * p.value }] }));
  return (
    <PressableScale scaleTo={pressScale.icon} accessibilityRole="button" accessibilityLabel={a11y} onPress={onPress} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 0.6, borderColor: colors.border.default, alignItems: 'center', justifyContent: 'center' }}>
        {toggles ? (
          <>
            <Animated.View style={[{ position: 'absolute' }, playIcon]}><Icon name="play" size={22} /></Animated.View>
            <Animated.View style={[{ position: 'absolute' }, pauseIcon]}><Icon name="pause" size={22} /></Animated.View>
          </>
        ) : <Icon name={icon} size={22} />}
      </View>
    </PressableScale>
  );
}

export function AudioPlayer({ state, title, image, positionSec, durationSec, layout = 'full', onPlay, onPause, onSeek, onClose }: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [scrub, setScrub] = useState<number | null>(null); // 0 to 1 while a finger is dragging the bar, otherwise null
  const left = mmss(Math.max(0, durationSec - positionSec));
  const progress = durationSec > 0 ? Math.min(1, positionSec / durationSec) : 0;
  const shown = scrub ?? progress; // while dragging, the bar follows the finger
  const fraction = (x: number) => (trackWidth > 0 ? Math.min(1, Math.max(0, x / trackWidth)) : 0);
  const playing = state === 'playing';
  const disabled = state === 'offline' || state === 'error' || state === 'loading';
  const canClose = state === 'paused' || state === 'finished' || state === 'error';

  // Motion. The bar and knob follow `shownSv` on the UI thread: it glides between the player's updates,
  // and follows the finger exactly while dragging. The knob grows a little while held.
  const reduced = useReducedMotion();
  const shownSv = useSharedValue(shown);
  const held = useSharedValue(0);
  useEffect(() => {
    shownSv.value = scrub !== null || reduced ? shown : withTiming(shown, { duration: 300, easing: Easing.linear, reduceMotion: ReduceMotion.System });
  }, [shown, scrub, reduced, shownSv]);
  useEffect(() => { held.value = withTiming(scrub !== null ? 1 : 0, { duration: duration.quick, easing: ease.out }); }, [scrub, held]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${shownSv.value * 100}%` }));
  const knobStyle = useAnimatedStyle(() => ({ transform: [{ translateX: Math.max(0, shownSv.value * trackWidth - 8) }, { scale: 1 + 0.25 * held.value }] }));
  // While the audio is loading, the status line gently breathes.
  const breathe = useSharedValue(1);
  useEffect(() => {
    breathe.value = state === 'loading' && !reduced
      ? withRepeat(withSequence(withTiming(0.45, { duration: 700, easing: ease.inOut }), withTiming(1, { duration: 700, easing: ease.inOut })), -1)
      : withTiming(1, { duration: duration.quick });
  }, [state, reduced, breathe]);
  const statusStyle = useAnimatedStyle(() => ({ opacity: breathe.value }));
  return (
    <Animated.View layout={reduced ? undefined : LinearTransition.duration(duration.fade).easing(ease.out)} style={{ borderRadius: radius.m, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', backgroundColor: colors.surface.default, paddingLeft: 10, paddingRight: 6, paddingVertical: 10, gap: 12,
      shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {image ? <NovenaImage image={image} label="" style={{ width: 44, height: 44, borderRadius: radius.s }} /> : null}
        <View style={{ flex: 1, gap: 2 }}>
          <Text numberOfLines={1} style={[type.labelSmall, { color: colors.text.body }]}>{title}</Text>
          <Animated.View key={state} entering={reduced ? undefined : FadeIn.duration(duration.fade)}>
            <Animated.Text numberOfLines={1} style={[type.bodySmall, { color: colors.text.secondary }, statusStyle]}>{label(state, left)}</Animated.Text>
          </Animated.View>
        </View>
        {canClose ? <RoundButton icon="close" label="Close player" onPress={onClose} /> : null}
        <RoundButton icon={playing ? 'pause' : 'play'} label={playing ? 'Pause' : 'Play'} onPress={disabled ? () => {} : playing ? onPause : onPlay} />
      </View>
      {layout === 'full' ? (
        <Animated.View entering={reduced ? undefined : FadeIn.duration(duration.fade)} exiting={reduced ? undefined : FadeOut.duration(duration.quick)} style={{ gap: 2 }}>
          {/* The progress bar. Tap anywhere on it to jump there, or drag the knob to move forward and back. */}
          <View accessibilityRole="adjustable" accessibilityLabel="Audio position"
            accessibilityValue={{ min: 0, max: Math.round(durationSec), now: Math.round(positionSec) }}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            onStartShouldSetResponder={() => !disabled && durationSec > 0}
            onResponderGrant={(e) => setScrub(fraction(e.nativeEvent.locationX))}
            onResponderMove={(e) => setScrub(fraction(e.nativeEvent.locationX))}
            onResponderRelease={(e) => { const f = fraction(e.nativeEvent.locationX); setScrub(null); onSeek(f * durationSec); }}
            onResponderTerminate={() => setScrub(null)}
            style={{ height: 24, justifyContent: 'center', marginRight: 4 }}>
            {/* The bar and knob ignore touches, so the finger position is measured across the whole bar. */}
            <View pointerEvents="none" style={{ height: 4, borderRadius: 2, backgroundColor: colors.progress.track }}>
              <Animated.View style={[{ height: 4, borderRadius: 2, backgroundColor: colors.progress.fill }, fillStyle]} />
            </View>
            <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.surface.default, borderWidth: 0.6, borderColor: colors.border.strong,
              shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } }, knobStyle]} />
          </View>
          {/* Time passed on the left, total length on the right. */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 4 }}>
            <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{mmss(shown * durationSec)}</Text>
            <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{mmss(durationSec)}</Text>
          </View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}
