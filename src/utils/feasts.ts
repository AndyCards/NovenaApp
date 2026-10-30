import { addDays, parseISO } from 'date-fns';
import type { Catalog, Novena, Saint } from '@/content/types';
import { NOVENA_LENGTH } from '@/constants/config';
import { toDayString } from './dateUtils';

/** Feast date in a given year as "YYYY-MM-DD". */
export const feastOn = (saint: Saint, year: number) => `${year}-${saint.feastDate}`;

/** A novena ends the day before the feast, so it starts feast − 9 days. */
export const novenaStartFor = (saint: Saint, year: number) =>
  toDayString(addDays(parseISO(feastOn(saint, year)), -NOVENA_LENGTH));

export interface FeastEntry {
  saint: Saint;
  novena?: Novena;
  feastDate: string;
  startDate: string;
}

export function feastsInMonth(catalog: Catalog, year: number, month1to12: number): FeastEntry[] {
  const mm = String(month1to12).padStart(2, '0');
  return catalog.saints
    .filter((s) => s.feastDate.startsWith(mm))
    .map((saint) => ({
      saint,
      novena: catalog.novenas.find((n) => n.saintId === saint.id),
      feastDate: feastOn(saint, year),
      startDate: novenaStartFor(saint, year),
    }))
    .sort((a, b) => a.feastDate.localeCompare(b.feastDate));
}

/** Upcoming feasts from today (wraps into next year). */
export function upcomingFeasts(catalog: Catalog, today: string, limit = 4): FeastEntry[] {
  const year = Number(today.slice(0, 4));
  const all = catalog.saints.flatMap((saint) =>
    [year, year + 1].map((y) => ({
      saint,
      novena: catalog.novenas.find((n) => n.saintId === saint.id),
      feastDate: feastOn(saint, y),
      startDate: novenaStartFor(saint, y),
    })),
  );
  return all.filter((f) => f.feastDate >= today).sort((a, b) => a.feastDate.localeCompare(b.feastDate)).slice(0, limit);
}
