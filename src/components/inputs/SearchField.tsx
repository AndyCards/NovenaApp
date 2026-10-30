import { TextInput, View } from 'react-native';
import { colors, radius, space, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { ClearButton } from '../actions/ClearButton';
import { Icon } from '../Icon';

type Props = { value: string; onChangeText: (t: string) => void; onSubmit?: (t: string) => void; autoFocus?: boolean; placeholder?: string };

export function SearchField({ value, onChangeText, onSubmit, autoFocus, placeholder = strings.home.searchPlaceholder }: Props) {
  return (
    <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', gap: space[8], paddingHorizontal: space[12], borderRadius: radius.full, backgroundColor: colors.surface.raised, borderWidth: stroke.hairline, borderColor: colors.border.default }}>
      <Icon name="search" color={colors.icon.secondary} />
      <TextInput
        accessibilityLabel="Search"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={() => onSubmit?.(value)}
        autoFocus={autoFocus}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        returnKeyType="search"
        style={[type.bodyLarge, { flex: 1, color: colors.text.primary }]}
      />
      {value ? <ClearButton onPress={() => onChangeText('')} /> : null}
    </View>
  );
}
