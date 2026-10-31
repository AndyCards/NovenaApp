// Warnings and confirmations: missed days, novena complete, pray another, remove, pray again.
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { IconName } from '../Icon';
import { Button } from '../actions/Button';
import { FloatingCard } from './FloatingCard';
import { haptics } from '@/motion/haptics';

export type AlertKind =
  | { kind: 'missed'; days: number; continueDay: number }
  | { kind: 'complete'; novenaTitle: string }
  | { kind: 'prayAgain' }
  | { kind: 'remove' }
  | { kind: 'prayAnother'; title: string; body: string; confirmLabel: string };

type Props = { alert: AlertKind | null; onClose: () => void; onPrimary: () => void; onSecondary?: () => void };

export function AlertCard({ alert, onClose, onPrimary, onSecondary }: Props) {
  const kind = alert?.kind;
  // A finished novena gets one calm success cue when the card appears.
  useEffect(() => { if (kind === 'complete') haptics.success(); }, [kind]);
  // iOS can't show one pop-up while another is still leaving, which could leave the screen stuck. So a card waits
  // a moment (the menu's exit takes about 200ms) before it appears.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    if (!kind) return;
    const t = setTimeout(() => setReady(true), 260);
    return () => clearTimeout(t);
  }, [kind]);
  if (!alert) return null;
  const a = strings.alerts;
  const content: { title: string; body: string; primary: string; secondary: string; icon: IconName } = (() => {
    switch (alert.kind) {
      case 'missed': return { title: a.missedTitle(alert.days), body: a.missedBody, primary: a.missedContinue(alert.continueDay), secondary: a.missedPray, icon: 'calendarDate' };
      case 'complete': return { title: a.completeTitle, body: a.completeBody(alert.novenaTitle), primary: a.prayAgain, secondary: a.completeShare, icon: 'confetti' };
      case 'prayAgain': return { title: a.prayAgainTitle, body: a.prayAgainBody, primary: a.startAgain, secondary: a.notNow, icon: 'restart' };
      case 'remove': return { title: a.removeTitle, body: a.removeBody, primary: a.keepPraying, secondary: a.stopNovena, icon: 'trash' };
      case 'prayAnother': return { title: alert.title, body: alert.body, primary: alert.confirmLabel, secondary: a.notNow, icon: 'bookOpen' };
    }
  })();
  return (
    <FloatingCard visible={ready} onClose={onClose} title={content.title} icon={content.icon}>
      <Text style={[type.bodyLarge, { color: colors.text.secondary, textAlign: 'center', marginTop: -12, paddingHorizontal: 12 }]}>{content.body}</Text>
      <View style={{ gap: 10, marginTop: 20 }}>
        <Button label={content.secondary} variant="secondary" onPress={() => { if (alert.kind === 'remove') haptics.warning(); (onSecondary ?? onClose)(); }} />
        <Button label={content.primary} icon="handsPraying" onPress={onPrimary} />
      </View>
    </FloatingCard>
  );
}
