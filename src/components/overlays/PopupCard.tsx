// Pause and intention pop-ups.
import { Text, TextInput } from 'react-native';
import { colors, radius, space, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { Button } from '../actions/Button';
import { FloatingCard } from './FloatingCard';

type Props =
  | { type: 'pause'; visible: boolean; onClose: () => void; onLeave: () => void }
  | { type: 'intention-edit'; visible: boolean; onClose: () => void; novenaTitle: string; value: string; onChange: (t: string) => void; onSave: () => void }
  | { type: 'intention-view'; visible: boolean; onClose: () => void; novenaTitle: string; value: string; onEdit: () => void };

export function PopupCard(p: Props) {
  if (p.type === 'pause') {
    return (
      <FloatingCard visible={p.visible} onClose={p.onClose} title={strings.reader.pauseTitle}>
        <Text style={[type.bodyLarge, { color: colors.text.tertiary }]}>{strings.reader.pauseBody}</Text>
        <Button label={strings.reader.pauseLeave} onPress={p.onLeave} />
        <Button label={strings.reader.pauseStay} variant="secondary" onPress={p.onClose} />
      </FloatingCard>
    );
  }
  if (p.type === 'intention-edit') {
    return (
      <FloatingCard visible={p.visible} onClose={p.onClose} title={strings.reader.intentionTitle}>
        <Text style={[type.bodyMedium, { color: colors.text.tertiary }]}>{p.novenaTitle}</Text>
        <TextInput
          accessibilityLabel={strings.reader.intentionTitle}
          multiline
          value={p.value}
          onChangeText={p.onChange}
          placeholder={strings.reader.intentionPrompt}
          placeholderTextColor={colors.text.muted}
          style={[type.bodyLarge, { minHeight: 96, padding: space[12], borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default, color: colors.text.primary, textAlignVertical: 'top' }]}
        />
        <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{strings.reader.intentionPrivate}</Text>
        <Button label="Save" onPress={p.onSave} />
      </FloatingCard>
    );
  }
  return (
    <FloatingCard visible={p.visible} onClose={p.onClose} title={strings.reader.intentionTitle}>
      <Text style={[type.bodyMedium, { color: colors.text.tertiary }]}>{p.novenaTitle}</Text>
      <Text style={[type.bodyLarge, { color: colors.text.body }]}>{p.value}</Text>
      <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{strings.reader.intentionPrivate}</Text>
      <Button label={strings.reader.backToPrayer} onPress={p.onClose} />
      <Button label="Edit" variant="secondary" onPress={p.onEdit} />
    </FloatingCard>
  );
}
