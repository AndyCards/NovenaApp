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
