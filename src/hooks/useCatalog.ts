import { createContext, createElement, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Catalog, Novena, Saint } from '@/content/types';
import { checkForNewCatalog, loadCatalog } from '@/utils/catalogSync';

const CatalogContext = createContext<Catalog | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  useEffect(() => {
    loadCatalog().then(setCatalog);
    checkForNewCatalog().then((fresh) => fresh && setCatalog(fresh)); // swaps in new content when found
  }, []);
  if (!catalog) return null;
  return createElement(CatalogContext.Provider, { value: catalog }, children);
}

export function useCatalog() {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error('useCatalog must be used inside CatalogProvider');
  const novenaById = (id: string): Novena | undefined => catalog.novenas.find((n) => n.id === id);
  const saintById = (id?: string): Saint | undefined => (id ? catalog.saints.find((s) => s.id === id) : undefined);
  return { catalog, novenaById, saintById };
}
