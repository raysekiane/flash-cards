import { create } from 'zustand';
import { db } from '../../../shared/db/dexieDb';
import { nowISO } from '../../../shared/utils/dateUtils';
import type { ProgressRecord, ProgressStatus } from '../types';

interface ProgressState {
  progressByCardId: Record<string, ProgressRecord>;
  loading: boolean;
  error: string | null;

  loadProgress: () => Promise<void>;
  setStatus: (cardId: string, status: ProgressStatus) => Promise<ProgressRecord>;
  upsertRecords: (records: ProgressRecord[]) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressByCardId: {},
  loading: false,
  error: null,

  loadProgress: async () => {
    set({ loading: true, error: null });
    try {
      const records = await db.progress.toArray();
      const progressByCardId = Object.fromEntries(records.map((r) => [r.cardId, r]));
      set({ progressByCardId, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  setStatus: async (cardId: string, status: ProgressStatus) => {
    const existing = get().progressByCardId[cardId];
    const record: ProgressRecord = {
      cardId,
      status,
      reviewCount: (existing?.reviewCount ?? 0) + 1,
      lastReviewed: nowISO(),
      updatedAt: nowISO(),
    };
    await db.progress.put(record);
    set((state) => ({
      progressByCardId: { ...state.progressByCardId, [cardId]: record },
    }));
    return record;
  },

  upsertRecords: async (records: ProgressRecord[]) => {
    await db.progress.bulkPut(records);
    set((state) => ({
      progressByCardId: {
        ...state.progressByCardId,
        ...Object.fromEntries(records.map((r) => [r.cardId, r])),
      },
    }));
  },
}));
