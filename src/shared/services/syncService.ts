import { db } from '../db/dexieDb';
import { getAll, saveProgress, type GetAllData } from './appsScriptService';
import { nowISO } from '../utils/dateUtils';

export interface SyncResult {
  success: boolean;
  error?: string;
  updatedDecks: string[];
  pushedCount: number;
}

const LAST_SYNC_KEY = 'lastSyncedAt';
const EPOCH = '1970-01-01T00:00:00.000Z';

async function getLastSyncedAt(): Promise<string> {
  const record = await db.config.get(LAST_SYNC_KEY);
  return (record?.value as string | undefined) ?? EPOCH;
}

async function setLastSyncedAt(value: string): Promise<void> {
  await db.config.put({ field: LAST_SYNC_KEY, value });
}

async function pushPendingProgress(): Promise<number> {
  const lastSyncedAt = await getLastSyncedAt();
  const pending = (await db.progress.toArray()).filter(
    (record) => record.updatedAt > lastSyncedAt
  );

  for (const record of pending) {
    await saveProgress({
      cardId: record.cardId,
      status: record.status,
      lastReviewed: record.lastReviewed,
    });
  }

  return pending.length;
}

export async function syncNow(): Promise<SyncResult> {
  try {
    const pushedCount = await pushPendingProgress();

    const response = await getAll();
    const data = response.data as GetAllData;

    const previousMetadata = await db.metadata.toArray();
    const previousVersions = Object.fromEntries(
      previousMetadata.map((m) => [m.deck, m.version])
    );

    const updatedDecks = data.metadata
      .filter((m) => previousVersions[m.deck] !== m.version)
      .map((m) => m.deck);

    await db.decks.clear();
    await db.decks.bulkPut(data.decks);

    await db.flashcards.clear();
    await db.flashcards.bulkPut(data.flashcards);

    await db.metadata.clear();
    await db.metadata.bulkPut(data.metadata);

    await setLastSyncedAt(nowISO());

    return { success: true, updatedDecks, pushedCount };
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message,
      updatedDecks: [],
      pushedCount: 0,
    };
  }
}

export function registerAutoSync(onSync: (result: SyncResult) => void): () => void {
  const handleOnline = () => {
    syncNow().then(onSync);
  };
  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}
