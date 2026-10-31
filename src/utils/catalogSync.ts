// Checks for new content. The app always starts from the bundled catalog and keeps the last good copy.
import * as FileSystem from 'expo-file-system/legacy';
import { parseCatalog } from '@/content/schema';
import type { Catalog } from '@/content/types';
import { CATALOG_URL, VERSION_URL } from '@/constants/config';
import { getMeta, setMeta } from '@/data/queries';

const STORED = `${FileSystem.documentDirectory}catalog.json`;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bundled = require('../../assets/catalog.json');

let current: Catalog | null = null;

export async function loadCatalog(): Promise<Catalog> {
  if (current) return current;
  try {
    const info = await FileSystem.getInfoAsync(STORED);
    if (info.exists) {
      const parsed = parseCatalog(JSON.parse(await FileSystem.readAsStringAsync(STORED)));
      if (parsed.ok) return (current = parsed.catalog);
    }
  } catch {}
  const parsed = parseCatalog(bundled);
  if (!parsed.ok) throw new Error(`Bundled catalog is invalid: ${parsed.error}`);
  return (current = parsed.catalog);
}

/** Returns the new catalog if one was found, otherwise null. Never throws. */
export async function checkForNewCatalog(): Promise<Catalog | null> {
  try {
    const have = (await loadCatalog()).version;
    const remote = await (await fetch(VERSION_URL)).json();
    if (!(typeof remote.version === 'number' && remote.version > have)) return null;
    const parsed = parseCatalog(await (await fetch(CATALOG_URL)).json());
    if (!parsed.ok || parsed.catalog.version <= have) return null; // keep the last good copy
    await FileSystem.writeAsStringAsync(STORED, JSON.stringify(parsed.catalog));
    await setMeta('contentVersion', String(parsed.catalog.version));
    current = parsed.catalog;
    return parsed.catalog;
  } catch {
    return null; // offline or server problem: carry on with what we have
  }
}

export const currentContentVersion = async () => Number((await getMeta('contentVersion')) ?? 0);
