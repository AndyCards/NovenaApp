// Shapes of the content in catalog.json (generated from the Excel sheet).

export type DayBlock =
  | { type: 'opening' | 'prayer' | 'closing'; text: string }
  | { type: 'intention' }
  | { type: 'silence'; seconds: number };

export interface NovenaDay {
  day: number; // 1..9
  title: string;
  blocks: DayBlock[];
  shareQuote?: string;
  audio?: { file: string; durationSec?: number; bytes?: number };
}

export interface ImageRef {
  thumb: string;
  full: string;
  focus: 'top-center' | { x: number; y: number };
}

export interface Novena {
  id: string; // permanent, e.g. "st-anthony"
  title: string;
  saintId?: string;
  tagline: string;
  about: string;
  minutesPerDay: number;
  tags: string[];
  categoryIds: string[];
  keywords: string[];
  image: ImageRef;
  hasAudio: boolean;
  audioSizeMb?: number;
  featured: boolean;
  order: number;
  days: NovenaDay[];
}

export interface Saint {
  id: string;
  name: string;
  avatar?: string;
  feastDate: string; // "MM-DD"
  patronOf: string[];
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  novenaIds: string[];
  order: number;
}

export interface SearchSuggestion {
  term: string;
  related: string[];
}

export interface Catalog {
  version: number;
  minAppVersion: string;
  novenas: Novena[];
  saints: Saint[];
  categories: Category[];
  collections: Collection[];
  suggestions: SearchSuggestion[];
}
