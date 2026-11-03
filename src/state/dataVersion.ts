// A simple "something changed" counter. Every time the app saves something (a day prayed,
// a novena started, saved or removed, a reminder setting), it bumps this number.
// Every screen that shows that data is watching the number, so it reloads straight away.
// This is what keeps Home, Library and the Novena page in step with each other.
import { create } from 'zustand';

interface DataVersion {
  version: number;
  bump: () => void;
}

export const useDataVersion = create<DataVersion>((set) => ({
  version: 0,
  bump: () => set((s) => ({ version: s.version + 1 })),
}));

/** Call after any database write so every screen reloads its data. */
export const dataChanged = () => useDataVersion.getState().bump();
