// Automatic checks that search finds the right novenas and ranks them sensibly.
import { normalize, searchNovenas } from '../src/utils/searchRank';
import type { Catalog } from '../src/content/types';

const mk = (id: string, title: string, keywords: string[], saintId?: string): any => ({
  id, title, saintId, tagline: '', about: '', minutesPerDay: 5, tags: [], categoryIds: [], keywords,
  image: { thumb: '', full: '', focus: 'top-center' }, hasAudio: false, featured: false, order: 1, days: [],
});
const catalog: Catalog = {
  version: 1, minAppVersion: '1.0.0',
  novenas: [mk('st-dymphna', 'St Dymphna Novena', ['anxiety'], 'dymphna'), mk('st-therese', 'St. Thérèse Novena', [], 'therese')],
  saints: [{ id: 'dymphna', name: 'St Dymphna', feastDate: '05-15', patronOf: ['mental health'] }, { id: 'therese', name: 'St Thérèse', feastDate: '10-01', patronOf: [] }],
  categories: [], collections: [], suggestions: [],
};

describe('searchRank', () => {
  it('ignores accents', () => expect(normalize('Thérèse')).toBe('therese'));
  it('finds a novena by need', () => {
    expect(searchNovenas(catalog, 'anxiety', { filter: 'all' }).map((n) => n.id)).toEqual(['st-dymphna']);
  });
  it('finds a novena by saint without accents', () => {
    expect(searchNovenas(catalog, 'therese', { filter: 'saint' }).map((n) => n.id)).toEqual(['st-therese']);
  });
  it('returns nothing for an empty query', () => {
    expect(searchNovenas(catalog, '  ', { filter: 'all' })).toEqual([]);
  });
});
