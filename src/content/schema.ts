// Checks a downloaded catalog before the app uses it. A bad file never replaces the last good copy.
import { z } from 'zod';
import type { Catalog } from './types';

const block = z.discriminatedUnion('type', [
  z.object({ type: z.enum(['opening', 'prayer', 'closing']), text: z.string().min(1) }),
  z.object({ type: z.literal('intention') }),
  z.object({ type: z.literal('silence'), seconds: z.number().positive() }),
]);

const day = z.object({
  day: z.number().int().min(1).max(9),
  title: z.string().min(1),
  blocks: z.array(block).min(1),
  shareQuote: z.string().optional(),
  audio: z
    .object({
      file: z.string(),
      durationSec: z.number().optional(),
      bytes: z.number().optional(),
      // Follow-along timings: when each paragraph is spoken (see src/utils/narrationCues.ts).
      cues: z.array(z.object({
        block: z.number().int().min(0), start: z.number().min(0), end: z.number().min(0),
        from: z.number().int().min(0).optional(), to: z.number().int().min(0).optional(),
      })).optional(),
    })
    .optional(),
});

const novena = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  saintId: z.string().optional(),
  tagline: z.string(),
  about: z.string(),
  minutesPerDay: z.number().positive(),
  tags: z.array(z.string()),
  categoryIds: z.array(z.string()),
  keywords: z.array(z.string()),
  image: z.object({
    thumb: z.string(),
    full: z.string(),
    focus: z.union([z.literal('top-center'), z.object({ x: z.number(), y: z.number() })]),
  }),
  hasAudio: z.boolean(),
  audioSizeMb: z.number().optional(),
  featured: z.boolean(),
  order: z.number(),
  days: z.array(day).length(9),
});

export const catalogSchema = z.object({
  version: z.number().int().positive(),
  minAppVersion: z.string(),
  novenas: z.array(novena),
  saints: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      avatar: z.string().optional(),
      feastDate: z.string().regex(/^\d{2}-\d{2}$/),
      patronOf: z.array(z.string()),
    }),
  ),
  categories: z.array(z.object({ id: z.string(), name: z.string(), icon: z.string().optional(), order: z.number() })),
  collections: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      subtitle: z.string(),
      layout: z.enum(['featured', 'list', 'cards']).optional(),
      novenaIds: z.array(z.string()),
      order: z.number(),
    }),
  ),
  suggestions: z.array(z.object({ term: z.string(), related: z.array(z.string()) })),
});

/** Returns the parsed catalog, or null (with a reason) if anything is wrong. */
export function parseCatalog(input: unknown): { ok: true; catalog: Catalog } | { ok: false; error: string } {
  const result = catalogSchema.safeParse(input);
  if (!result.success) return { ok: false, error: result.error.message };
  const c = result.data as Catalog;
  const novenaIds = new Set(c.novenas.map((n) => n.id));
  const saintIds = new Set(c.saints.map((s) => s.id));
  const categoryIds = new Set(c.categories.map((x) => x.id));
  if (novenaIds.size !== c.novenas.length) return { ok: false, error: 'Duplicate novena ids' };
  for (const n of c.novenas) {
    if (n.saintId && !saintIds.has(n.saintId)) return { ok: false, error: `${n.id}: unknown saint ${n.saintId}` };
    for (const id of n.categoryIds) if (!categoryIds.has(id)) return { ok: false, error: `${n.id}: unknown category ${id}` };
  }
  for (const col of c.collections)
    for (const id of col.novenaIds) if (!novenaIds.has(id)) return { ok: false, error: `${col.id}: unknown novena ${id}` };
  return { ok: true, catalog: c };
}
