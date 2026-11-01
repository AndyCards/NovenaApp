// Shapes of the content in catalog.json (generated from the Excel sheet).

export type DayBlock =
  | { type: 'opening' | 'prayer' | 'closing'; text: string }
  | { type: 'intention' }
  | { type: 'silence'; seconds: number };

// When one sentence is spoken in the day's recording, in seconds from the start. Written by pipeline/tts.py.
// `block` is the paragraph's position in `blocks` (counting from 0); `from`/`to` are where the sentence sits in
// that paragraph's text (characters). Without from/to the cue covers the whole paragraph.
// Used to highlight the prayer as it is read aloud.
export interface NarrationCue {
  block: number;
  start: number;
  end: number;
  from?: number;
  to?: number;
}

export interface NovenaDay {
  day: number; // 1..9
  title: string;
  blocks: DayBlock[];
  shareQuote?: string;
  audio?: { file: string; durationSec?: number; bytes?: number; cues?: NarrationCue[] };
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
  icon?: string; // e.g. "cross", see src/components/Icon.tsx
  order: number;
}

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  layout?: 'featured' | 'list' | 'cards'; // how Home shows this section (default: cards)
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
