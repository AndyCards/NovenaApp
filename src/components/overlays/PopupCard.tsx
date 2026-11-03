// Reader pop-ups from Figma Page 34: "Your Intention" (view and edit). "Take a pause?" lives in GentleExitCard.
// The intention box saves itself as you type (see the Reader); "Add Intention" saves and closes.
import { useRef, type ComponentRef } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { Button } from '../actions/Button';
import { FloatingCard } from './FloatingCard';

type Props =
  | { type: 'intention-edit'; visible: boolean; onClose: () => void; novenaTitle: string; value: string; onChange: (t: string) => void; onSave: () => void; focus?: boolean }
  | { type: 'intention-view'; visible: boolean; onClose: () => void; novenaTitle: string; value: string; onEdit: () => void };

const r = strings.reader;

export function PopupCard(p: Props) {
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null); // the intention box, so "Add Intention" can put the cursor in it
  if (p.type === 'intention-edit') {
    // Figma Popup Card "Intention Empty" (985:35382) and "Intention Draft" (985:35418).
    // No icon circle: just the title, the novena's name, a grey writing box and "Add Intention".
    // The X is a bare cross while the box is empty and gets a light grey circle once something is written.
    const empty = !p.value.trim();
    return (
      <FloatingCard visible={p.visible} onClose={p.onClose} title={r.intentionTitle} subtitle={p.novenaTitle}
        closeLook={empty ? 'plain' : 'soft'} gap={16} subtleBorder>
        <View style={{ gap: 24 }}>
          {/* The writing box: 131 high, radius 18, grey fill. "Your intention is auto-saved" sits at its foot. */}
          <View style={{ height: 131, borderRadius: radius.m, backgroundColor: colors.surface.subtle, paddingTop: 14, paddingBottom: 12, paddingLeft: 12, paddingRight: 19, gap: 10 }}>
            <TextInput
              ref={inputRef}
              accessibilityLabel={r.intentionTitle}
              accessibilityHint={r.intentionAutoSaved}
              multiline
              autoFocus={p.focus} // the keyboard opens only when the person chose to edit, not just by opening the card
              value={p.value}
              onChangeText={p.onChange}
              style={[type.bodyInput, { flex: 1, padding: 0, color: colors.text.primary, textAlignVertical: 'top' }]}
            />
            <Text style={[type.labelXSmall, { color: colors.text.secondary, textAlign: 'center' }]}>{r.intentionAutoSaved}</Text>
          </View>
          <View style={{ gap: 6, alignItems: 'center' }}>
            <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{r.intentionPrivate}</Text>
            {/* Nothing written yet? The button puts the cursor in the box instead of closing. */}
            <Button label={r.addIntention} icon="handsPraying" onPress={() => (empty ? inputRef.current?.focus() : p.onSave())} style={{ alignSelf: 'stretch' }} />
          </View>
        </View>
      </FloatingCard>
    );
  }
  return (
    <FloatingCard visible={p.visible} onClose={p.onClose} title={r.intentionTitle} subtitle={p.novenaTitle} icon="heart">
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
