import { novenaPageTitle, plainTitle } from '../src/utils/novenaTitle';

describe('novena titles', () => {
  it('cards show the plain name', () => {
    expect(plainTitle('St Jude')).toBe('St Jude');
    expect(plainTitle('St Anthony Novena')).toBe('St Anthony');
    expect(plainTitle('Divine Mercy novena ')).toBe('Divine Mercy');
  });
  it('pages add Novena exactly once', () => {
    expect(novenaPageTitle('St Jude')).toBe('St Jude Novena');
    expect(novenaPageTitle('St Anthony Novena')).toBe('St Anthony Novena');
  });
  it('a title that is only "Novena" is kept', () => {
    expect(plainTitle('Novena')).toBe('Novena');
  });
});
