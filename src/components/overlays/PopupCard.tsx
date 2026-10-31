// Reader pop-ups from Figma Page 34: "Continue another time?" and "Your Intention".
import { Pressable, Text, TextInput, View } from 'react-native';
import { colors, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { Button } from '../actions/Button';
import { FloatingCard } from './FloatingCard';

type Props =
  | { type: 'pause'; visible: boolean; onClose: () => void; onLeave: () => void }
  | { type: 'intention-edit'; visible: boolean; onClose: () => void; novenaTitle: string; value: string; onChange: (t: string) => void; onSave: () => void }
  | { type: 'intention-view'; visible: boolean; onClose: () => void; novenaTitle: string; value: string; onEdit: () => void };

const r = strings.reader;

export function PopupCard(p: Props) {
  if (p.type === 'pause') {
    return (
      <FloatingCard visible={p.visible} onClose={p.onClose} title={r.pauseTitle}>
        <Text style={[type.bodyLarge, { color: colors.text.secondary, textAlign: 'center', marginTop: -12, paddingHorizontal: 12 }]}>{r.pauseBody}</Text>
        <View style={{ gap: 10, marginTop: 20 }}>
          <Button label={r.pauseLeave} variant="secondary" onPress={p.onLeave} />
          <Button label={r.pauseStay} icon="handsPraying" onPress={p.onClose} />
        </View>
      </FloatingCard>
    );
  }
  if (p.type === 'intention-edit') {
    return (
      <FloatingCard visible={p.visible} onClose={p.onClose} title={r.intentionTitle} subtitle={p.novenaTitle}>
        <TextInput
          accessibilityLabel={r.intentionTitle}
          multiline
          autoFocus
          value={p.value}
          onChangeText={p.onChange}
          placeholder={r.intentionPlaceholder}
          placeholderTextColor={colors.text.muted}
          style={[type.titleQuote, { minHeight: 96, padding: 12, borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default, color: colors.text.primary, textAlign: 'center', textAlignVertical: 'top' }]}
        />
        <View style={{ gap: 6, alignItems: 'center' }}>
          <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{r.intentionPrivate}</Text>
          <Button label={r.saveIntention} icon="handsPraying" onPress={p.onSave} style={{ alignSelf: 'stretch' }} />
        </View>
      </FloatingCard>
    );
  }
  return (
    <FloatingCard visible={p.visible} onClose={p.onClose} title={r.intentionTitle} subtitle={p.novenaTitle}>
      <Pressable accessibilityRole="button" accessibilityHint="Edit your intention" onPress={p.onEdit} style={{ paddingTop: 14, paddingBottom: 12, paddingLeft: 12, paddingRight: 19 }}>
        <Text style={[type.titleQuote, { color: colors.text.primary, textAlign: 'center' }]}>{`“${p.value}”`}</Text>
      </Pressable>
      <View style={{ gap: 6, alignItems: 'center' }}>
        <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{r.intentionPrivate}</Text>
        <Button label={r.backToPrayer} icon="handsPraying" onPress={p.onClose} style={{ alignSelf: 'stretch' }} />
      </View>
    </FloatingCard>
  );
}
