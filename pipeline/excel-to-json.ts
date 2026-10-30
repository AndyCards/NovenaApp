// Reads novenas.xlsx and writes out/catalog.json and out/version.json.
import { mkdirSync, writeFileSync } from 'node:fs';
import * as XLSX from 'xlsx';
import { parseCatalog } from '../src/content/schema';

const book = XLSX.readFile(process.argv[2] ?? 'pipeline/novenas.xlsx');
const rows = (name: string) => XLSX.utils.sheet_to_json<Record<string, string>>(book.Sheets[name] ?? {}, { defval: '' });
const list = (v: string) => String(v).split(',').map((x) => x.trim()).filter(Boolean);

/** Turns a Days cell into blocks. Markers: [pause N], [silence N], [intention]. */
function toBlocks(text: string) {
  return String(text).split(/\n{2,}/).flatMap((part, i, all) => {
    const t = part.trim();
    const m = t.match(/^\[(?:pause|silence) (\d+)\]$/);
    if (m) return [{ type: 'silence', seconds: Number(m[1]) }];
    if (t === '[intention]') return [{ type: 'intention' }];
    return [{ type: i === 0 ? 'opening' : i === all.length - 1 ? 'closing' : 'prayer', text: t }];
  });
}

const days = rows('Days');
const novenas = rows('Novenas').map((n, order) => ({
  id: n.id, title: n.title, saintId: n.saintId || undefined, tagline: n.tagline, about: n.about,
  minutesPerDay: Number(n.minutesPerDay) || 5, tags: list(n.tags), categoryIds: list(n.categoryIds), keywords: list(n.keywords),
  image: { thumb: `thumbs/${n.id}.jpg`, full: `images/${n.id}.jpg`, focus: 'top-center' as const },
  hasAudio: String(n.hasAudio).toLowerCase() === 'true', featured: String(n.featured).toLowerCase() === 'true', order,
  days: days.filter((d) => d.novenaId === n.id).sort((a, b) => Number(a.day) - Number(b.day)).map((d) => ({
    day: Number(d.day), title: d.title, blocks: toBlocks(d.text), shareQuote: d.shareQuote || undefined,
    audio: d.audioFile ? { file: d.audioFile } : undefined,
  })),
}));
const saints = rows('Saints').map((s) => ({ id: s.id, name: s.name, avatar: s.avatar || undefined, feastDate: s.feastDate, patronOf: list(s.patronOf) }));
const categories = rows('Categories').map((c, order) => ({ id: c.id, name: c.name, order }));
const collections = rows('Collections').map((c, order) => ({ id: c.id, title: c.title, subtitle: c.subtitle, novenaIds: list(c.novenaIds), order }));
const suggestions = rows('Suggestions').map((s) => ({ term: s.term, related: list(s.related) })).filter((s) => s.term);

const version = Number(process.env.CONTENT_VERSION ?? Date.now());
const parsed = parseCatalog({ version, minAppVersion: process.env.MIN_APP_VERSION ?? '1.0.0', novenas, saints, categories, collections, suggestions });
if (!parsed.ok) {
  console.error('Catalog is NOT valid:', parsed.error);
  process.exit(1);
}
const catalog = parsed.catalog;
mkdirSync('out', { recursive: true });
writeFileSync('out/catalog.json', JSON.stringify(catalog));
writeFileSync('out/version.json', JSON.stringify({ version }));
console.log(`Wrote ${catalog.novenas.length} novenas, version ${version}`);
