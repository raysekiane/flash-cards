import { create } from 'zustand';
import { db } from '../../../shared/db/dexieDb';
import type { Deck } from '../types';

interface DecksState {
  decks: Deck[];
  loading: boolean;
  error: string | null;
  loadDecks: () => Promise<void>;
  setDecks: (decks: Deck[]) => Promise<void>;
}

export const useDecksStore = create<DecksState>((set) => ({
  decks: [],
  loading: false,
  error: null,

  loadDecks: async () => {
    set({ loading: true, error: null });
    try {
      const decks = await db.decks.toArray();
      set({ decks, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  setDecks: async (decks: Deck[]) => {
    await db.decks.clear();
    await db.decks.bulkPut(decks);
    set({ decks });
  },
}));
