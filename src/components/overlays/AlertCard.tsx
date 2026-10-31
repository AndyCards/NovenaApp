// Warnings and confirmations: missed days, novena complete, pray another, remove, pray again.
import { Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { Button } from '../actions/Button';
import { FloatingCard } from './FloatingCard';

export type AlertKind =
  | { kind: 'missed'; days: number; continueDay: number }
  | { kind: 'complete'; novenaTitle: string }
  | { kind: 'prayAgain' }
  | { kind: 'remove' }
  | { kind: 'prayAnother'; title: string; body: string; confirmLabel: string };

type Props = { alert: AlertKind | null; onClose: () => void; onPrimary: () => void; onSecondary?: () => void };

export function AlertCard({ alert, onClose, onPrimary, onSecondary }: Props) {
  if (!alert) return null;
  const a = strings.alerts;
  const content = (() => {
    switch (alert.kind) {
      case 'missed': return { title: a.missedTitle(alert.days), body: a.missedBody, primary: a.missedContinue(alert.continueDay), secondary: a.missedPray };
      case 'complete': return { title: a.completeTitle, body: a.completeBody(alert.novenaTitle), primary: a.prayAgain, secondary: a.completeShare };
      case 'prayAgain': return { title: a.prayAgainTitle, body: a.prayAgainBody, primary: a.startAgain, secondary: a.notNow };
      case 'remove': return { title: a.removeTitle, body: a.removeBody, primary: a.keepPraying, secondary: a.stopNovena };
      case 'prayAnother': return { title: alert.title, body: alert.body, primary: alert.confirmLabel, secondary: a.notNow };
    }
  })();
  return (
    <FloatingCard visible onClose={onClose} title={content.title}>
      <Text style={[type.bodyMedium, { color: colors.text.secondary, textAlign: 'center', marginTop: -12, paddingHorizontal: 12 }]}>{content.body}</Text>
      <View style={{ gap: 10, marginTop: 20 }}>
        <Button label={content.secondary} variant="secondary" onPress={onSecondary ?? onClose} />
        <Button label={content.primary} icon="handsPraying" onPress={onPrimary} />
      </View>
    </FloatingCard>
  );
}
