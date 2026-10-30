// Search: suggestions while typing, filters, results, no-results message.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchResultRow } from '@/components/content/SearchResultRow';
import { FilterChip } from '@/components/inputs/FilterChip';
import { RecentChip } from '@/components/inputs/RecentChip';
import { SearchField } from '@/components/inputs/SearchField';
import { SuggestionRow } from '@/components/inputs/SuggestionRow';
import { NavBar } from '@/components/navigation/NavBar';
import { colors, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { useSearch, type SearchFilter } from '@/hooks/useSearch';

const S = strings.search;

export default function Search() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const s = useSearch();
  useEffect(() => { if (q) s.submit(q); }, [q]); // eslint-disable-line react-hooks/exhaustive-deps
  const typing = s.query.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.page }}>
      <NavBar title="Search" onBack={() => router.back()} />
      <View style={{ padding: screenMargin, gap: 10 }}>
        <SearchField value={s.query} onChangeText={s.setQuery} onSubmit={s.submit} autoFocus />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {(Object.keys(S.filters) as SearchFilter[]).map((f) => (
            <FilterChip key={f} label={S.filters[f]} selected={s.filter === f} onPress={() => s.setFilter(f)} />
          ))}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: screenMargin, paddingBottom: 140, gap: 8 }}>
        {!typing && s.recents.map((r) => <RecentChip key={r} label={r} onPress={() => s.submit(r)} />)}
        {typing && s.suggestions.map((x) => <SuggestionRow key={x} label={x} onPress={() => s.submit(x)} />)}
        {typing && s.results.length > 0 && (
          <>
            <Text style={[type.titleSmall, { color: colors.text.secondary }]}>{S.resultCount(s.results.length, s.query)}</Text>
            {s.results.map((n) => <SearchResultRow key={n.id} novena={n} onPress={() => router.push(`/novena/${n.id}`)} />)}
          </>
        )}
        {typing && s.results.length === 0 && (
          <>
            <Text style={[type.titleCard, { color: colors.text.primary }]}>{S.noResultsTitle(s.query)}</Text>
            <Text style={[type.bodyLarge, { color: colors.text.secondary }]}>{S.noResultsBody}</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
