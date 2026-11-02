// The search engine. It compares what the person typed with each novena's title, saint, tags and
// categories, gives each a score, and returns the best matches first.
import type { Catalog, Novena } from '@/content/types';
import { fallbackSearches, popularSearches, searchConcepts, type SearchConcept } from '@/content/searchConcepts';

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

/**
 * The "Suggestions" list while typing: up to 3 searches that complete what was typed.
 * They come from every word the app knows: the search dictionary, popular searches, novena names,
 * saints, tags, keywords and categories. Ones that START with the typed letters come first
 * (typing "anx" offers "Anxiety"), then ones where a word starts with them, then ones that merely contain them.
 * If nothing completes the text, the dictionary's related ideas are offered instead.
 */
export function suggestionsFor(catalog: Catalog, query: string, limit = 3): string[] {
  const q = normalize(query);
  if (!q) return [];
  const pool = new Set<string>();
  const add = (t?: string) => { if (t && t.trim()) pool.add(t.trim()); };
  searchConcepts.forEach((c) => { c.triggers.forEach(add); c.suggestions.forEach(add); });
  popularSearches.forEach(add);
  catalog.suggestions.forEach((s) => { add(s.term); s.related.forEach(add); });
  catalog.categories.forEach((c) => add(c.name));
  catalog.saints.forEach((s) => { add(s.name); (s.patronOf ?? []).forEach(add); });
  catalog.novenas.forEach((n) => { add(n.title); n.tags.forEach(add); n.keywords.forEach(add); });
  const rank = (t: string) => {
    const n = normalize(t);
    if (n === q) return 0; // exactly what was typed
    if (n.startsWith(q)) return 1;
    if (n.split(/\s+/).some((w) => w.startsWith(q))) return 2;
    return n.includes(q) ? 3 : 9;
  };
  const typed = Array.from(pool)
    .map((t) => ({ t, r: rank(t) }))
    .filter((x) => x.r < 9)
    .sort((a, b) => a.r - b.r || a.t.length - b.t.length || a.t.localeCompare(b.t))
    .map((x) => x.t);
  // One entry per word, whatever its capitals ("anxiety" and "Anxiety" are the same suggestion).
  const seen = new Set<string>();
  return [...typed, ...contextualSuggestions(query, limit)]
    .filter((t) => { const k = normalize(t); if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, limit);
}

// ---------------------------------------------------------------------------------------------
// Smarter matching, used when a search has no exact match (or to add related novenas under it).
// ---------------------------------------------------------------------------------------------

/** How many single-letter slips (typos) are allowed for a word of this length. */
const allowedTypos = (len: number) => (len >= 8 ? 2 : len >= 5 ? 1 : 0);

/** Number of edits (add, remove, change, swap neighbours) between two words. */
export function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** True when a typed word is close enough to a known word to be a typo of it. */
const isTypoOf = (typed: string, known: string) => typed.length >= 5 && Math.abs(typed.length - known.length) <= 2 && editDistance(typed, known) <= allowedTypos(Math.min(typed.length, known.length));

/** How strongly the query points at a concept: 3 = exactly a trigger, 2 = contains one / starts like one, 1 = a typo of one, 0 = no link. */
function conceptStrength(q: string, concept: SearchConcept): number {
  const words = q.split(/\s+/).filter(Boolean);
  let best = 0;
  for (const raw of concept.triggers) {
    const t = normalize(raw);
    if (q === t) return 3;
    if (words.includes(t) || (t.includes(' ') && q.includes(t))) best = Math.max(best, 2);
    else if (q.length >= 4 && t.startsWith(q)) best = Math.max(best, 2); // "migr" -> migraine
    else if (words.some((w) => isTypoOf(w, t))) best = Math.max(best, 1);
  }
  return best;
}

/** The needs a query is about, strongest first. Empty when the words mean nothing to us. */
export function matchConcepts(query: string): { concept: SearchConcept; strength: number }[] {
  const q = normalize(query);
  if (!q) return [];
  return searchConcepts
    .map((concept) => ({ concept, strength: conceptStrength(q, concept) }))
    .filter((m) => m.strength > 0)
    .sort((a, b) => b.strength - a.strength)
    // If the query is exactly one concept's word or phrase, ignore weaker, looser matches.
    .filter((m, _i, all) => all[0].strength < 3 || m.strength === 3);
}

/** "Try searching for" chips that fit this query (for example migraine -> Healing, Physical health, Strength during illness). */
export function contextualSuggestions(query: string, limit = 3): string[] {
  const out: string[] = [];
  for (const { concept } of matchConcepts(query)) for (const s of concept.suggestions) if (normalize(s) !== normalize(query) && !out.includes(s)) out.push(s);
  return out.slice(0, limit);
}

/**
 * Novenas that help with what the person means even when no title or keyword contains their words.
 * Never returns a novena already in `excludeIds`, and never invents anything: every result is a real novena from the catalog.
 */
export function relatedNovenas(catalog: Catalog, query: string, excludeIds: string[] = [], limit = 4): Novena[] {
  const q = normalize(query);
  if (!q) return [];
  const concepts = matchConcepts(query);
  const queryWords = q.split(/\s+/).filter(Boolean);
  const saints = new Map(catalog.saints.map((s) => [s.id, s]));
  return catalog.novenas
    .filter((n) => !excludeIds.includes(n.id))
    .map((n) => {
      let score = 0;
      const novenaTerms = [...n.keywords, ...n.tags].map(normalize);
      for (const { concept, strength } of concepts) {
        if (concept.categories.some((c) => n.categoryIds.includes(c))) score += 4 * strength;
        if (concept.keywords.some((k) => novenaTerms.includes(normalize(k)))) score += 3 * strength;
      }
      // A misspelled saint or novena name ("dymfna", "anthonny") still finds that novena.
      const names = [n.title, saints.get(n.saintId ?? '')?.name ?? '', ...n.keywords].flatMap((t) => normalize(t).split(/\s+/)).filter((w) => w.length >= 5);
      if (queryWords.some((w) => names.some((name) => isTypoOf(w, name)))) score += 12;
      return { n, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.n.order - b.n.order)
    .slice(0, limit)
    .map((x) => x.n);
}

/** Categories most relevant to a query, so the zero-results screen can lead with them. */
export function relatedCategoryIds(query: string): string[] {
  return Array.from(new Set(matchConcepts(query).flatMap((m) => m.concept.categories)));
}

/** When nothing matches at all: still give the person somewhere to go. */
export const recoverySearches = () => fallbackSearches;
