// Checks out/catalog.json with the same rules the app uses before it accepts new content.
import { readFileSync } from 'node:fs';
import { parseCatalog } from '../src/content/schema';

try {
  const c = parseCatalog(JSON.parse(readFileSync(process.argv[2] ?? 'out/catalog.json', 'utf8')));
  console.log(`OK: ${c.novenas.length} novenas, ${c.saints.length} saints`);
} catch (e) {
  console.error('Catalog is NOT valid:', e);
  process.exit(1);
}
