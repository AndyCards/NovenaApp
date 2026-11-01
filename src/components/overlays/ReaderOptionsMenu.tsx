// Figma "Reader · Options menu": a floating card under the More button (top right).
// Day stepper, Prayer mode (Listen / Read only), then Save, Download, Share, View intention.
import { Fragment, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolateColor, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, screenMargin, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { DownloadStatus } from '@/utils/downloadStatus';
import { usePresence } from '@/motion/usePresence';
import { ease } from '@/motion/tokens';
import { haptics } from '@/motion/haptics';
import { Icon, type IconName } from '../Icon';
import { StepperButton } from '../actions/StepperButton';

type Props = {
  visible: boolean;
  day: number;
  total: number;
  mode: 'listen' | 'read';
  saved: boolean;
  download: DownloadStatus;
  sizeMb?: number;
  hasAudio: boolean; // real recordings exist (needed for Download)
  canListen: boolean; // something can be played (a real recording or the placeholder tone)
  onClose: () => void;
  onChangeDay: (day: number) => void;
  onMode: (m: 'listen' | 'read') => void;
  onToggleSave: () => void;
  onDownload: () => void;
  onRemoveDownload: () => void;
  onShare: () => void;
  onViewIntention: () => void;
  hideIntention?: boolean; // preview mode: no run yet, so there is no intention to show
};

const shadow = { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 } as const;

// Prayer mode switch. A white pill slides between Listen and Read only, and the labels' colours cross-fade.
const SLIDE = { duration: 280, easing: ease.inOut, reduceMotion: ReduceMotion.System };
const AnimatedText = Animated.createAnimatedComponent(Text);

function ModeSwitch({ value, canListen, onChange, labels }: { value: 'listen' | 'read'; canListen: boolean; onChange: (m: 'listen' | 'read') => void; labels: { listen: string; read: string } }) {
  const [width, setWidth] = useState(0);
  const [picked, setPicked] = useState(value); // moves the pill straight away, before the player catches up
  useEffect(() => setPicked(value), [value]);
  const at = useSharedValue(picked === 'listen' ? 0 : 1); // 0 = Listen, 1 = Read only
  useEffect(() => { at.value = withTiming(picked === 'listen' ? 0 : 1, SLIDE); }, [picked, at]);
  const seg = width > 0 ? (width - 8) / 2 : 0;
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: at.value * seg }] }));
  const listenColor = useAnimatedStyle(() => ({ color: interpolateColor(at.value, [0, 1], [colors.text.primary, colors.text.secondary]) }));
  const readColor = useAnimatedStyle(() => ({ color: interpolateColor(at.value, [0, 1], [colors.text.secondary, colors.text.primary]) }));
  const listenIcon = useAnimatedStyle(() => ({ opacity: 1 - at.value * 0.35 }));
  const readIcon = useAnimatedStyle(() => ({ opacity: 0.65 + at.value * 0.35 }));
  const choose = (m: 'listen' | 'read') => { if (m === picked) return; haptics.tap(); setPicked(m); onChange(m); };
  const item = (m: 'listen' | 'read', label: string, icon: IconName, textStyle: object, iconStyle: object, disabled?: boolean) => (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected: picked === m, disabled }} accessibilityLabel={label} onPress={disabled ? undefined : () => choose(m)}
      style={{ opacity: disabled ? 0.4 : 1, flex: 1, height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <Animated.View style={iconStyle}><Icon name={icon} size={18} color={picked === m ? colors.text.primary : colors.text.secondary} /></Animated.View>
      <AnimatedText style={[type.labelSmall, textStyle]}>{label}</AnimatedText>
    </Pressable>
  );
  return (
    <View accessibilityRole="radiogroup" onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', padding: 4, borderRadius: 25, backgroundColor: colors.surface.subtle }}>
      {seg > 0 ? (
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 4, top: 4, width: seg, height: 38, borderRadius: 19, backgroundColor: colors.surface.default,
          shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 }, pill]} />
      ) : null}
      {item('listen', labels.listen, 'headphones', listenColor, listenIcon, !canListen)}
      {item('read', labels.read, 'speakerSlash', readColor, readIcon)}
    </View>
  );
}

function Row({ label, detail, icon, onPress, disabled }: { label: string; detail?: string; icon: IconName; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="menuitem" accessibilityState={{ disabled }} accessibilityLabel={detail ? `${label}. ${detail}` : label} onPress={disabled ? undefined : onPress}
      style={({ pressed }) => ({ opacity: disabled ? 0.4 : 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: pressed ? colors.surface.subtle : 'transparent' })}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[type.labelSmall, { color: colors.text.primary }]}>{label}</Text>
        {detail ? <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{detail}</Text> : null}
      </View>
      <Icon name={icon} size={20} color={colors.text.secondary} />
    </Pressable>
  );
}

export function ReaderOptionsMenu(p: Props) {
  const insets = useSafeAreaInsets();
  const r = strings.reader;
  const downloadDetail =
    p.download.kind === 'downloading' ? r.downloading(p.download.pct)
    : p.download.kind === 'done' ? r.removeDownload
    : p.download.kind === 'failed' ? r.retryDownload
    : p.sizeMb ? `Text and audio · ${p.sizeMb} MB` : undefined;
  const rows: { label: string; detail?: string; icon: IconName; onPress: () => void; disabled?: boolean }[] = [
    { label: p.saved ? r.saved : r.save, icon: 'bookmark', onPress: p.onToggleSave },
    // Always shown, like Figma. Until this novena has recorded audio the row is dimmed and says so.
    { label: p.download.kind === 'done' ? r.offlineReady : r.download, detail: p.hasAudio ? downloadDetail : r.audioSoon, icon: 'download', disabled: !p.hasAudio,
      onPress: p.download.kind === 'done' ? p.onRemoveDownload : p.download.kind === 'downloading' ? () => {} : p.onDownload },
    { label: r.share, icon: 'share', onPress: p.onShare },
    ...(p.hideIntention ? [] : [{ label: r.viewIntentionRow, icon: 'handsPraying' as IconName, onPress: p.onViewIntention }]),
  ];
  // Motion: the menu grows out of the "…" button (top right) while the backdrop fades in.
  const { mounted, progress, reduced } = usePresence(p.visible);
  const scrimStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, progress.value) }));
  const menuStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, progress.value * 1.8),
    transform: reduced ? [] : [{ translateX: (1 - progress.value) * 40 }, { translateY: (1 - progress.value) * -60 }, { scale: 0.9 + 0.1 * progress.value }],
  }));
  return (
    <Modal visible={mounted} transparent animationType="fade" onRequestClose={p.onClose} statusBarTranslucent>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay.scrim }, scrimStyle]} />
      <Pressable accessibilityLabel={strings.common.close} onPress={p.onClose} style={{ flex: 1 }}>
        <Animated.View style={[{ position: 'absolute', top: insets.top + 48, right: screenMargin + 14, width: 250 }, menuStyle]}>
        <Pressable accessible={false} style={{ borderRadius: 25, overflow: 'hidden', backgroundColor: colors.surface.default, ...shadow }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 }}>
            <StepperButton direction="previous" disabled={p.day <= 1} onPress={() => p.onChangeDay(p.day - 1)} />
            <Text accessibilityRole="adjustable" style={[type.labelSmall, { color: colors.text.primary }]}>{r.dayOf(p.day, p.total)}</Text>
            <StepperButton direction="next" disabled={p.day >= p.total} onPress={() => p.onChangeDay(p.day + 1)} />
          </View>
          <View style={{ height: stroke.hairline, backgroundColor: colors.border.default }} />
          {(
            <View style={{ paddingHorizontal: 10, paddingTop: 10, paddingBottom: 6, gap: 8 }}>
              <Text style={[type.bodySmall, { color: colors.text.tertiary, paddingHorizontal: 4 }]}>{r.prayerMode}</Text>
              <ModeSwitch value={p.canListen ? p.mode : 'read'} canListen={p.canListen} onChange={p.onMode} labels={{ listen: r.listen, read: r.readOnly }} />
            </View>
          )}
          {rows.map((row, i) => (
            <Fragment key={row.label}>
              {i > 0 ? <View style={{ height: stroke.hairline, backgroundColor: colors.border.subtle, marginHorizontal: 14 }} /> : null}
              <Row {...row} />
            </Fragment>
          ))}
        </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
