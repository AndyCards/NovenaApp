// Search, Figma Page 34 (1227:56728 results, 1227:56784 typing): field, filter chips,
// recent chips, suggestions, related novenas, browse by intention, results.
// How you get here: the magnifier on Home, or an intention tile (Home) which opens Search already showing that need.
// What shows depends on three things: is anything typed (`typing`), was search pressed (`submitted`), and was an
// intention tile picked (`categoryId`). See the comments in the page below for each combination.
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
import type { Category, Novena } from '@/content/types';
import { useCatalog } from '@/hooks/useCatalog';
import { contextualSuggestions, recoverySearches, relatedNovenas } from '@/utils/searchRank';
import { useSearch, type SearchFilter } from '@/hooks/useSearch';
import { popularSearches } from '@/content/searchConcepts';
import { Reveal } from '@/motion/Reveal';

const S = strings.search;

// Section heading: 16 SemiBold in Text/Primary (Andy, 2026-11-01: both Section Header variants use Text/Primary), 6 above and below.
const SectionTitle = ({ title }: { title: string }) => (
  <Text accessibilityRole="header" style={[type.titleMedium, { color: colors.text.primary, paddingHorizontal: screenMargin, paddingVertical: 6 }]}>{title}</Text>
);

function RelatedRow({ novena, onPress }: { novena: Novena; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={novena.title} onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: screenMargin, paddingVertical: 12, backgroundColor: pressed ? colors.surface.subtle : 'transparent' })}>
      <NovenaImage image={novena.image} label="" style={{ width: 44, height: 44, borderRadius: 22 }} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={[type.titleSmall, { color: colors.text.primary }]}>{novena.title}</Text>
        <Text numberOfLines={1} style={[type.bodySmall, { color: colors.text.secondary }]}>{`${novena.tagline} · ${novena.days.length} days`}</Text>
      </View>
    </Pressable>
  );
}

// "Browse by intention": category cards, two per row. The whole card is tappable.
function IntentionGrid({ categories, onPick }: { categories: Category[]; onPick: (id: string) => void }) {
  return (
    <View style={{ paddingHorizontal: screenMargin, gap: 10 }}>
      {Array.from({ length: Math.ceil(categories.length / 2) }, (_, row) => (
        <View key={row} style={{ flexDirection: 'row', gap: 10 }}>
          {categories.slice(row * 2, row * 2 + 2).map((c) => <IntentionTile key={c.id} label={c.name} icon={c.icon} onPress={() => onPick(c.id)} />)}
        </View>
      ))}
    </View>
  );
}

// A row of tappable suggestion chips. Tapping one searches for it straight away.
function Chips({ items, onPick }: { items: string[]; onPick: (t: string) => void }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: screenMargin }}>
      {items.map((t) => <FilterChip key={t} label={t} selected={false} onPress={() => onPick(t)} />)}
    </View>
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
  const typing = s.query.trim().length > 0; // only spaces counts as an empty box, not as a search for "   "
  const byCategory = useMemo(
    () => (cat ? catalog.novenas.filter((n) => n.categoryIds.includes(cat.id) && (s.filter !== 'audio' || n.hasAudio)) : []),
    [cat, catalog, s.filter],
  );
  const showResults = (typing && submitted) || (!typing && !!cat);
  const results = typing ? s.results : byCategory;
  // Novenas that fit the need even when no title or keyword matches the typed words, and "Try searching for" chips that fit the query.
  const related = useMemo(() => (typing ? relatedNovenas(catalog, s.query, s.results.map((n) => n.id)) : []), [typing, catalog, s.query, s.results]);
  const chips = useMemo(() => { const c = contextualSuggestions(s.query); return c.length > 0 ? c : recoverySearches(); }, [s.query]);
  const label = typing ? s.query : cat?.name ?? '';
  const categories = useMemo(() => [...catalog.categories].sort((a, b) => a.order - b.order), [catalog]);
  const pickCategory = (id: string) => { s.setQuery(''); setCategoryId(id); };

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

        {/* Results: "3 novenas for 'anxiety'" then one row per novena, then related novenas that fit the need.
            Nothing matched exactly? A friendly recovery screen with related novenas, suggested searches and categories. */}
        {showResults ? (
          results.length > 0 ? (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: screenMargin, paddingVertical: 8 }}>
                <Text style={[type.titleSmall, { color: colors.text.secondary }]}>{S.resultCount(results.length, label)}</Text>
                <Text style={[type.bodyMedium, { color: colors.text.secondary }]}>{S.bestMatch}</Text>
              </View>
              {results.map((n) => <SearchResultRow key={n.id} novena={n} onPress={() => router.push(`/novena/${n.id}`)} />)}
              {typing && related.length > 0 ? (
                <View style={{ paddingTop: 16 }}>
                  <SectionTitle title={S.alsoRelated} />
                  {related.map((n) => <SearchResultRow key={n.id} novena={n} onPress={() => router.push(`/novena/${n.id}`)} />)}
                </View>
              ) : null}
            </>
          ) : (
            <Reveal slide={false} style={{ gap: 16, paddingTop: 12 }}>
              {/* "No results" message (Figma 1227:56762): 45 grey circle with a 22 magnifier, then a 16 title and a 14 line, 8 apart. */}
              <View style={{ paddingHorizontal: screenMargin, paddingTop: 16, paddingBottom: 12, gap: 8 }}>
                <View style={{ width: 45, height: 45, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.subtle }}>
                  <Icon name="search" size={22} />
                </View>
                <Text accessibilityRole="header" style={[type.titleMedium, { color: colors.text.primary }]}>{typing ? S.noExactTitle(label) : S.noResultsTitle(label)}</Text>
                <Text style={[type.bodyMedium, { color: colors.text.secondary }]}>{related.length > 0 ? S.relatedBody : S.noRelatedBody}</Text>
              </View>
              {related.length > 0 ? (
                <View>
                  <SectionTitle title={S.relatedNovenas} />
                  {related.map((n) => <SearchResultRow key={n.id} novena={n} onPress={() => router.push(`/novena/${n.id}`)} />)}
                </View>
              ) : null}
              <View style={{ gap: 10 }}>
                <SectionTitle title={S.trySearching} />
                <Chips items={chips} onPick={submit} />
              </View>
              <View style={{ gap: 10 }}>
                <SectionTitle title={S.browseOr} />
                <IntentionGrid categories={categories} onPick={pickCategory} />
              </View>
            </Reveal>
          )
        ) : (
          <View style={{ gap: 16, paddingTop: 4 }}>
            {typing && s.suggestions.length > 0 ? (
              <View style={{ gap: 8 }}>
                <SectionTitle title={S.suggestions} />
                {s.suggestions.map((x) => <SuggestionRow key={x} label={x} match={s.query} onPress={() => submit(x)} />)}
              </View>
            ) : null}
            {typing && (s.results.length > 0 || related.length > 0) ? (
              <View style={{ gap: 8 }}>
                <SectionTitle title={S.related} />
                {(s.results.length > 0 ? s.results : related).slice(0, 3).map((n) => <RelatedRow key={n.id} novena={n} onPress={() => router.push(`/novena/${n.id}`)} />)}
              </View>
            ) : null}
            {!typing ? (
              <View style={{ gap: 10 }}>
                <SectionTitle title={S.popular} />
                <Chips items={popularSearches} onPick={submit} />
              </View>
            ) : null}
            <View style={{ gap: 10 }}>
              <SectionTitle title={S.browse} />
              <IntentionGrid categories={categories} onPick={pickCategory} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
