// Search, Figma Page 34 (1227:56728 results, 1227:56784 typing): field, filter chips,
// recent chips, suggestions, related novenas, browse by intention, results.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IntentionTile } from '@/components/content/IntentionTile';
import { NovenaImage } from '@/components/content/NovenaImage';
import { SearchResultRow } from '@/components/content/SearchResultRow';
import { Icon } from '@/components/Icon';
import { FilterChip } from '@/components/inputs/FilterChip';
import { RecentChip } from '@/components/inputs/RecentChip';
import { SearchField } from '@/components/inputs/SearchField';
import { SuggestionRow } from '@/components/inputs/SuggestionRow';
import { colors, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { Novena } from '@/content/types';
import { useCatalog } from '@/hooks/useCatalog';
import { useSearch, type SearchFilter } from '@/hooks/useSearch';

const S = strings.search;

const SectionTitle = ({ title }: { title: string }) => (
  <Text accessibilityRole="header" style={[type.titleMedium, { color: colors.text.secondary, paddingHorizontal: screenMargin, paddingTop: 6, paddingBottom: 4 }]}>{title}</Text>
);

function RelatedRow({ novena, onPress }: { novena: Novena; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={novena.title} onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: screenMargin, paddingVertical: 8, backgroundColor: pressed ? colors.surface.subtle : 'transparent' })}>
      <NovenaImage image={novena.image} label="" style={{ width: 44, height: 44, borderRadius: 22 }} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={[type.titleSmall, { color: colors.text.primary }]}>{novena.title}</Text>
        <Text numberOfLines={1} style={[type.bodySmall, { color: colors.text.secondary }]}>{`${novena.tagline} · ${novena.days.length} days`}</Text>
      </View>
    </Pressable>
  );
}

export default function Search() {
  const router = useRouter();
  const { q, category } = useLocalSearchParams<{ q?: string; category?: string }>();
  const { catalog } = useCatalog();
  const s = useSearch();
  // "submitted" means the person pressed search (or picked a suggestion), so we show full results.
  // While they are still typing we show suggestions instead. A category comes from tapping an intention tile.
  const [submitted, setSubmitted] = useState(!!q);
  const [categoryId, setCategoryId] = useState(category);
  useEffect(() => { if (q) s.submit(q); }, [q]); // eslint-disable-line react-hooks/exhaustive-deps
  const cat = catalog.categories.find((c) => c.id === categoryId);
  const typing = s.query.length > 0;
  const byCategory = useMemo(
    () => (cat ? catalog.novenas.filter((n) => n.categoryIds.includes(cat.id) && (s.filter !== 'audio' || n.hasAudio)) : []),
    [cat, catalog, s.filter],
  );
  const showResults = (typing && submitted) || (!typing && !!cat);
  const results = typing ? s.results : byCategory;
  const label = typing ? s.query : cat?.name ?? '';

  // Pressing search, or tapping a suggestion or recent search.
  const submit = (text: string) => { setCategoryId(undefined); setSubmitted(true); s.submit(text); };
  const change = (text: string) => { setSubmitted(false); setCategoryId(undefined); s.setQuery(text); };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surface.page }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: screenMargin, paddingTop: 4, paddingBottom: 8 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={strings.common.back} onPress={() => router.back()} style={{ width: 36, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="back" size={22} />
        </Pressable>
        <SearchField value={s.query} onChangeText={change} onSubmit={submit} autoFocus={!q && !category} />
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Under the search box: filter chips (All, By intention…) or, while typing, the recent searches. */}
        {showResults || !typing ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingHorizontal: screenMargin, paddingVertical: 8 }}>
            {(Object.keys(S.filters) as SearchFilter[]).map((f) => (
              <FilterChip key={f} label={S.filters[f]} selected={s.filter === f} onPress={() => s.setFilter(f)} />
            ))}
          </ScrollView>
        ) : s.recents.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingHorizontal: screenMargin, paddingVertical: 8 }}>
            {s.recents.map((r) => <RecentChip key={r} label={r} onPress={() => submit(r)} onRemove={() => s.removeRecent(r)} />)}
          </ScrollView>
        ) : null}

        {/* Results: "3 novenas for 'anxiety'" then one row per novena. Nothing found? A gentle message. */}
        {showResults ? (
          results.length > 0 ? (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: screenMargin, paddingVertical: 8 }}>
                <Text style={[type.titleSmall, { color: colors.text.secondary }]}>{S.resultCount(results.length, label)}</Text>
                <Text style={[type.bodyMedium, { color: colors.text.secondary }]}>{S.bestMatch}</Text>
              </View>
              {results.map((n) => <SearchResultRow key={n.id} novena={n} onPress={() => router.push(`/novena/${n.id}`)} />)}
            </>
          ) : (
            <View style={{ padding: screenMargin, gap: 8 }}>
              <Text style={[type.titleCard, { color: colors.text.primary }]}>{S.noResultsTitle(label)}</Text>
              <Text style={[type.bodyLarge, { color: colors.text.secondary }]}>{S.noResultsBody}</Text>
            </View>
          )
        ) : (
          <View style={{ gap: 16, paddingTop: 4 }}>
            {typing && s.suggestions.length > 0 ? (
              <View>
                <SectionTitle title={S.suggestions} />
                {s.suggestions.map((x) => <SuggestionRow key={x} label={x} match={s.query} onPress={() => submit(x)} />)}
              </View>
            ) : null}
            {typing && s.results.length > 0 ? (
              <View>
                <SectionTitle title={S.related} />
                {s.results.slice(0, 3).map((n) => <RelatedRow key={n.id} novena={n} onPress={() => router.push(`/novena/${n.id}`)} />)}
              </View>
            ) : null}
            <View style={{ gap: 6 }}>
              <SectionTitle title={S.browse} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: screenMargin, paddingVertical: 4 }}>
                {catalog.categories.map((c) => (
                  <View key={c.id} style={{ width: 180 }}>
                    <IntentionTile label={c.name} icon={c.icon} onPress={() => { s.setQuery(''); setCategoryId(c.id); }} />
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
