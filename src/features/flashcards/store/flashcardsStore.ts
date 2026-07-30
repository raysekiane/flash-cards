import { create } from 'zustand';
import { db } from '../../../shared/db/dexieDb';
import { shuffle } from '../../../shared/utils/shuffle';
import type { Flashcard } from '../types';

interface FlashcardsState {
  allCards: Flashcard[];
  studyQueue: Flashcard[];
  currentIndex: number;
  isFlipped: boolean;
  loading: boolean;
  error: string | null;

  loadFlashcards: () => Promise<void>;
  setFlashcards: (cards: Flashcard[]) => Promise<void>;
  startStudySession: (deckName: string) => void;
  flip: () => void;
  next: () => void;
  reset: () => void;
}

export const useFlashcardsStore = create<FlashcardsState>((set, get) => ({
  allCards: [],
  studyQueue: [],
  currentIndex: 0,
  isFlipped: false,
  loading: false,
  error: null,

  loadFlashcards: async () => {
    set({ loading: true, error: null });
    try {
      const allCards = await db.flashcards.toArray();
      set({ allCards, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  setFlashcards: async (cards: Flashcard[]) => {
    await db.flashcards.clear();
    await db.flashcards.bulkPut(cards);
    set({ allCards: cards });
  },

  startStudySession: (deckName: string) => {
    const cards = get().allCards.filter((card) => card.deckName === deckName);
    set({ studyQueue: shuffle(cards), currentIndex: 0, isFlipped: false });
  },

  flip: () => set((state) => ({ isFlipped: !state.isFlipped })),

  next: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.studyQueue.length),
      isFlipped: false,
    })),

  reset: () => set({ studyQueue: [], currentIndex: 0, isFlipped: false }),
}));
