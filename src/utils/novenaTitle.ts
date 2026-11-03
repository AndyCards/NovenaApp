// One rule for novena names. Cards, rows and search show the plain name ("St Jude").
// The novena's own page and the reader say the full name ("St Jude Novena").
// Catalog titles may or may not already end in "Novena", so this never doubles it.

/** The plain name, without a trailing "Novena". */
export const plainTitle = (title: string) => title.trim().replace(/\s+novena$/i, '').trim() || title.trim();

/** The full name, always ending in "Novena" exactly once. */
export const novenaPageTitle = (title: string) => `${plainTitle(title)} Novena`;
