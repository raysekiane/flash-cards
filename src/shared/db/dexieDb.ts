import Dexie, { type Table } from 'dexie';
import type { Deck } from '../../features/decks/types';
import type { Flashcard } from '../../features/flashcards/types';
import type { ProgressRecord } from '../../features/progress/types';

export interface MetadataRecord {
  deck: string;
  version: number;
  updatedAt: string;
}

export interface ConfigRecord {
  field: string;
  value: unknown;
}

export class FlashcardsDatabase extends Dexie {
  decks!: Table<Deck, string>;
  flashcards!: Table<Flashcard, string>;
  progress!: Table<ProgressRecord, string>;
  metadata!: Table<MetadataRecord, string>;
  config!: Table<ConfigRecord, string>;

  constructor() {
    super('FlashcardsDB');
    this.version(1).stores({
      decks: 'name',
      flashcards: 'cardId, deckName, categoria',
      progress: 'cardId, updatedAt',
      metadata: 'deck',
      config: 'field',
    });
  }
}

export const db = new FlashcardsDatabase();
