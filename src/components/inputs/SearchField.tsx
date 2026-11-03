// Figma "Search Field": white pill, hairline border; clear (×) circle and magnifier on the right.
import { Pressable, TextInput, View } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { Icon } from '../Icon';

type Props = { value: string; onChangeText: (t: string) => void; onSubmit?: (t: string) => void; autoFocus?: boolean; placeholder?: string };

export function SearchField({ value, onChangeText, onSubmit, autoFocus, placeholder = strings.home.searchPlaceholder }: Props) {
  return (
    <View style={{ flex: 1, height: 45, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: radius.full, backgroundColor: colors.surface.raised, borderWidth: 0.7, borderColor: colors.progress.track }}>
      <TextInput
        accessibilityLabel="Search"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={() => onSubmit?.(value)}
        autoFocus={autoFocus}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        returnKeyType="search"
        style={[type.bodyLarge, { flex: 1, height: 45, paddingVertical: 0, lineHeight: 20, textAlignVertical: 'center', color: colors.text.primary }]}
      />
      {value ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => onChangeText('')} hitSlop={8}
          style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.subtle }}>
          <Icon name="clear" size={14} color={colors.text.secondary} />
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" accessibilityLabel="Search" onPress={() => onSubmit?.(value)} hitSlop={6}>
        <Icon name="search" size={22} />
      </Pressable>
    </View>
  );
}
