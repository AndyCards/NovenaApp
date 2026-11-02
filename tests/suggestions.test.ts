import { suggestionsFor } from '../src/utils/searchRank';

const catalog: any = {
  suggestions: [{ term: 'lost', related: ['lost items'] }],
  categories: [{ id: 'health', name: 'Health' }],
  saints: [{ id: 'dymphna', name: 'St Dymphna', patronOf: ['anxiety'] }],
  novenas: [{ id: 'n1', title: 'St Dymphna', tags: ['Mental health'], keywords: ['anxious thoughts'] }],
};

describe('suggestionsFor', () => {
  it('offers completions while typing a few letters', () => {
    const out = suggestionsFor(catalog, 'anx');
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((t) => t.toLowerCase().includes('anx'))).toBe(true);
    expect(out[0].toLowerCase().startsWith('anx')).toBe(true);
  });
  it('puts names that start with the text first', () => {
    expect(suggestionsFor(catalog, 'dym')).toContain('St Dymphna');
  });
  it('returns nothing for an empty box and at most 3', () => {
    expect(suggestionsFor(catalog, '')).toEqual([]);
    expect(suggestionsFor(catalog, 'a').length).toBeLessThanOrEqual(3);
  });
});

// The real dictionary and catalog, as on Andy's phone (Figma "Home · Search suggestions while typing", 1227:56784).
import realCatalog from '../assets/catalog.json';
import { novenasWhileTyping } from '../src/utils/searchRank';

describe('autosuggest with the real catalog', () => {
  const c: any = realCatalog;
  it('typing "anxi" offers the three Figma suggestions in order', () => {
    expect(suggestionsFor(c, 'anxi')).toEqual(['anxiety', 'anxiety and worry', 'anxious thoughts']);
  });
  it('never offers the same word twice in different capitals', () => {
    const out = suggestionsFor(c, 'wor').map((t) => t.toLowerCase());
    expect(new Set(out).size).toBe(out.length);
  });
  it('matches the start of a word, not the middle', () => {
    expect(suggestionsFor(c, 'oan')).toEqual([]);
  });
  it('shows related novenas for a need, St Dymphna first for anxiety', () => {
    const ids = novenasWhileTyping(c, 'anxi').map((n) => n.id);
    expect(ids[0]).toBe('st-dymphna');
    expect(ids.length).toBeLessThanOrEqual(3);
  });
  it('shows nothing for an empty box', () => {
    expect(novenasWhileTyping(c, '')).toEqual([]);
  });
});
