import { useCallback, useEffect, useMemo, useState } from 'react';
import { addRecentSearch, clearRecentSearches, deleteRecentSearch, listRecentSearches } from '@/data/queries';
import { searchNovenas, suggestionsFor } from '@/utils/searchRank';
import { useCatalog } from './useCatalog';

export type SearchFilter = 'all' | 'intention' | 'saint' | 'audio';

export function useSearch() {
  const { catalog } = useCatalog();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [recents, setRecents] = useState<string[]>([]);

  const loadRecents = useCallback(async () => setRecents((await listRecentSearches()).map((r) => r.query)), []);
  useEffect(() => { loadRecents(); }, [loadRecents]);

  const results = useMemo(() => searchNovenas(catalog, query, { filter }), [catalog, query, filter]);
  const suggestions = useMemo(() => suggestionsFor(catalog, query), [catalog, query]);

  return {
    query, setQuery, filter, setFilter, results, suggestions, recents,
    submit: async (q: string) => { setQuery(q); if (q.trim()) { await addRecentSearch(q.trim()); await loadRecents(); } },
    clearRecents: async () => { await clearRecentSearches(); await loadRecents(); },
    removeRecent: async (q: string) => { await deleteRecentSearch(q); await loadRecents(); },
  };
}
