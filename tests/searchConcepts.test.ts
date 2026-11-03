// Checks that search finds helpful novenas for real-life needs, adapts suggestions, and recovers from typos.
import { contextualSuggestions, relatedNovenas, searchNovenas, suggestionsFor } from '../src/utils/searchRank';
import { popularSearches, searchConcepts } from '../src/content/searchConcepts';
import { parseCatalog } from '../src/content/schema';

const parsed = parseCatalog(require('../assets/catalog.json'));
if (!parsed.ok) throw new Error(parsed.error);
const catalog = parsed.catalog;

// What the screen shows: exact matches first, then related novenas not already listed.
const find = (q: string) => {
  const exact = searchNovenas(catalog, q, { filter: 'all' }).map((n) => n.id);
  const related = relatedNovenas(catalog, q, exact).map((n) => n.id);
  return { exact, related, all: [...exact, ...related], chips: contextualSuggestions(q) };
};

describe('search for needs, not just titles', () => {
  it('migraine -> health novenas and the right chips', () => {
    const r = find('Migraine');
    expect(r.exact).toEqual([]);
    expect(r.all).toContain('st-dymphna');
    expect(r.chips).toEqual(['Healing', 'Physical health', 'Strength during illness']);
  });
  it('anxiety -> Dymphna first, with peace, strength, comfort', () => {
    const r = find('anxiety');
    expect(r.all[0]).toBe('st-dymphna');
    expect(r.chips).toEqual(['Peace', 'Strength', 'Comfort']);
  });
  it('depression -> mental health novena', () => expect(find('depression').all).toContain('st-dymphna'));
  it('marriage -> St Monica', () => expect(find('marriage').all).toContain('st-monica'));
  it('job -> work novenas', () => expect(find('job').all).toEqual(expect.arrayContaining(['st-joseph', 'st-cajetan'])));
  it('exams -> students novenas', () => expect(find('exams').all).toContain('st-john-bosco'));
  it('family -> family novenas', () => expect(find('family').all).toEqual(expect.arrayContaining(['st-joseph', 'st-monica'])));
  it('healing -> health novenas', () => expect(find('healing').all).toContain('st-dymphna'));
  it('a misspelled need still works', () => {
    expect(find('anxeity').all).toContain('st-dymphna');
    expect(find('depresion').all).toContain('st-dymphna');
  });
  it('a misspelled saint still finds the saint', () => expect(find('dimphna').all[0]).toBe('st-dymphna'));
  it('a completely unrelated query finds nothing and invents nothing', () => {
    const r = find('pizza');
    expect(r.all).toEqual([]);
    expect(r.chips).toEqual([]);
  });
  it('never lists the same novena twice', () => {
    for (const q of ['marriage', 'family', 'work', 'anxiety']) {
      const all = find(q).all;
      expect(new Set(all).size).toBe(all.length);
    }
  });
});

describe('suggestion chips', () => {
  it('every chip, when tapped, finds at least one novena', () => {
    for (const c of searchConcepts) for (const s of c.suggestions) expect(find(s).all.length).toBeGreaterThan(0);
  });
  it('popular searches all find novenas', () => {
    for (const s of popularSearches) expect(find(s).all.length).toBeGreaterThan(0);
  });
  it('while typing, chips adapt to the query', () => {
    expect(suggestionsFor(catalog, 'lonely').length).toBeGreaterThan(0);
  });
  it('concepts only point at categories that exist', () => {
    const ids = catalog.categories.map((c) => c.id);
    for (const c of searchConcepts) for (const cat of c.categories) expect(ids).toContain(cat);
  });
});
