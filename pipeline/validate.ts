// Checks out/catalog.json with the same rules the app uses before it accepts new content.
import { readFileSync } from 'node:fs';
import { parseCatalog } from '../src/content/schema';

const parsed = parseCatalog(JSON.parse(readFileSync(process.argv[2] ?? 'out/catalog.json', 'utf8')));
if (parsed.ok) {
  console.log(`OK: ${parsed.catalog.novenas.length} novenas, ${parsed.catalog.saints.length} saints`);
} else {
  console.error('Catalog is NOT valid:', parsed.error);
  process.exit(1);
}
