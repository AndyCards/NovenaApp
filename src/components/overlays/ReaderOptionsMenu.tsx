// Figma "Reader · Options menu": a floating card under the More button (top right).
// Day stepper, Prayer mode (Listen / Read only), then Save, Download, Share, View intention.
import { Fragment } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, screenMargin, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { DownloadStatus } from '@/utils/downloadStatus';
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
};

const shadow = { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 } as const;

function Segment({ label, icon, active, onPress, disabled }: { label: string; icon: IconName; active: boolean; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected: active, disabled }} accessibilityLabel={label} onPress={disabled ? undefined : onPress}
      style={{ opacity: disabled ? 0.4 : 1, flex: 1, height: 38, borderRadius: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: active ? colors.surface.default : 'transparent', ...(active ? { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 } : null) }}>
      <Icon name={icon} size={18} color={active ? colors.text.primary : colors.text.secondary} />
      <Text style={[type.labelSmall, { color: active ? colors.text.primary : colors.text.secondary }]}>{label}</Text>
    </Pressable>
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
    { label: r.viewIntentionRow, icon: 'handsPraying', onPress: p.onViewIntention },
  ];
  return (
    <Modal visible={p.visible} transparent animationType="fade" onRequestClose={p.onClose} statusBarTranslucent>
      <Pressable accessibilityLabel={strings.common.close} onPress={p.onClose} style={{ flex: 1, backgroundColor: colors.overlay.scrim }}>
        <Pressable accessible={false} style={{ position: 'absolute', top: insets.top + 48, right: screenMargin + 14, width: 250, borderRadius: 25, overflow: 'hidden', backgroundColor: colors.surface.default, ...shadow }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 }}>
            <StepperButton direction="previous" disabled={p.day <= 1} onPress={() => p.onChangeDay(p.day - 1)} />
            <Text accessibilityRole="adjustable" style={[type.labelSmall, { color: colors.text.primary }]}>{r.dayOf(p.day, p.total)}</Text>
            <StepperButton direction="next" disabled={p.day >= p.total} onPress={() => p.onChangeDay(p.day + 1)} />
          </View>
          <View style={{ height: stroke.hairline, backgroundColor: colors.border.default }} />
          {(
            <View style={{ paddingHorizontal: 10, paddingTop: 10, paddingBottom: 6, gap: 8 }}>
              <Text style={[type.bodySmall, { color: colors.text.tertiary, paddingHorizontal: 4 }]}>{r.prayerMode}</Text>
              <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', padding: 4, borderRadius: 25, backgroundColor: colors.surface.subtle }}>
                <Segment label={r.listen} icon="headphones" active={p.canListen && p.mode === 'listen'} disabled={!p.canListen} onPress={() => p.onMode('listen')} />
                <Segment label={r.readOnly} icon="speakerSlash" active={!p.canListen || p.mode === 'read'} onPress={() => p.onMode('read')} />
              </View>
            </View>
          )}
          {rows.map((row, i) => (
            <Fragment key={row.label}>
              {i > 0 ? <View style={{ height: stroke.hairline, backgroundColor: colors.border.subtle, marginHorizontal: 14 }} /> : null}
              <Row {...row} />
            </Fragment>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
