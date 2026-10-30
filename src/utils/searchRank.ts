import type { Catalog, Novena } from '@/content/types';

/** Lowercase and strip accents so "Thérèse" matches "therese". */
export const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export interface SearchOptions {
  filter: 'all' | 'intention' | 'saint' | 'audio';
}

export function searchNovenas(catalog: Catalog, query: string, { filter }: SearchOptions): Novena[] {
  const q = normalize(query);
  if (!q) return [];
  const saints = new Map(catalog.saints.map((s) => [s.id, s]));
  const categories = new Map(catalog.categories.map((c) => [c.id, c]));
  const scored = catalog.novenas
    .filter((n) => filter !== 'audio' || n.hasAudio)
    .map((n) => {
      const saint = n.saintId ? saints.get(n.saintId) : undefined;
      const title = normalize(n.title);
      const saintName = normalize(saint?.name ?? '');
      const patron = (saint?.patronOf ?? []).map(normalize);
      const keywords = n.keywords.map(normalize);
      const tags = n.tags.map(normalize);
      const cats = n.categoryIds.map((id) => normalize(categories.get(id)?.name ?? ''));
      let score = 0;
      if (filter === 'all' || filter === 'saint' || filter === 'audio') {
        if (title.includes(q) || saintName.includes(q)) score += 10;
      }
      if (filter === 'all' || filter === 'intention' || filter === 'audio') {
        if (keywords.some((k) => k.includes(q) || q.includes(k))) score += 6;
        if (patron.some((p) => p.includes(q))) score += 5;
        if (tags.some((t) => t.includes(q))) score += 4;
        if (cats.some((c) => c.includes(q))) score += 3;
        if (normalize(n.tagline).includes(q)) score += 2;
      }
      return { n, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.n.order - b.n.order);
  return scored.map((x) => x.n);
}

export function suggestionsFor(catalog: Catalog, query: string, limit = 3): string[] {
  const q = normalize(query);
  if (!q) return [];
  const terms = catalog.suggestions.flatMap((s) => [s.term, ...s.related]);
  return Array.from(new Set(terms.filter((t) => normalize(t).includes(q)))).slice(0, limit);
}
