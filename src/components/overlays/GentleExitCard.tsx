// The gentle "stepping away?" card, e.g. "Take a pause?" on the Reader.
// Built from the same Figma "Popup Card" as every other pop-up: round X on top, white floating card, grey halo icon,
// a quiet secondary button, then the dark primary button (closest to the thumb). No warning colours: leaving is fine.
// Closing it any way (X, tapping outside, Android back) means "stay", never "leave".
import { Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { IconName } from '../Icon';
import { Button } from '../actions/Button';
import { FloatingCard } from './FloatingCard';

// Which words to use. Add a new entry to strings.gentleExit to use this card somewhere else.
export type GentleExitContext = keyof typeof strings.gentleExit;

const icons: Record<GentleExitContext, IconName> = { prayer: 'pause', intention: 'heart', listening: 'headphones' };

type Props = { context: GentleExitContext; visible: boolean; onStay: () => void; onLeave: () => void };

export function GentleExitCard({ context, visible, onStay, onLeave }: Props) {
  const c = strings.gentleExit[context];
  return (
    <FloatingCard visible={visible} onClose={onStay} title={c.title} icon={icons[context]}>
      <Text style={[type.bodyLarge, { color: colors.text.secondary, textAlign: 'center', marginTop: -12, paddingHorizontal: 12 }]}>{c.body}</Text>
      <View style={{ gap: 10, marginTop: 20 }}>
        <Button label={c.leave} variant="secondary" onPress={onLeave} />
        <Button label={c.stay} icon="handsPraying" onPress={onStay} />
      </View>
    </FloatingCard>
  );
}
