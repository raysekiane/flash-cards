import type { Deck } from '../../features/decks/types';
import type { Flashcard } from '../../features/flashcards/types';
import type { MetadataRecord } from '../db/dexieDb';
import type { ValidationError, ValidationWarning } from '../utils/validation';

const APP_KEY = import.meta.env.VITE_APP_KEY as string | undefined;
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined;

export interface ContentChange {
  deck: string;
  previousVersion: number;
  newVersion: number;
}

export interface GetAllData {
  decks: Deck[];
  flashcards: Flashcard[];
  metadata: MetadataRecord[];
}

export interface AppScriptResponse<T = unknown> {
  success: boolean;
  error?: string;
  type?: string;
  data?: T;
  validation?: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
  };
  contentChanges?: {
    detected: boolean;
    decks: ContentChange[];
  };
  timestamp?: string;
}

function assertConfigured(): void {
  if (!APPS_SCRIPT_URL || !APP_KEY) {
    throw new Error(
      'VITE_APPS_SCRIPT_URL e VITE_APP_KEY precisam estar configurados no arquivo .env'
    );
  }
}

export async function getAll(): Promise<AppScriptResponse<GetAllData>> {
  assertConfigured();

  const response = await fetch(`${APPS_SCRIPT_URL}?action=getAll`, {
    headers: {
      'X-App-Key': APP_KEY as string,
    },
  });

  if (!response.ok) {
    throw new Error('Falha ao sincronizar com servidor');
  }

  const data = (await response.json()) as AppScriptResponse<GetAllData>;

  if (!data.success) {
    throw new Error(data.error || 'Erro desconhecido');
  }

  return data;
}

export interface SaveProgressPayload {
  cardId: string;
  status: string;
  lastReviewed?: string;
}

export async function saveProgress(
  payload: SaveProgressPayload
): Promise<AppScriptResponse> {
  assertConfigured();

  const response = await fetch(`${APPS_SCRIPT_URL}?action=saveProgress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-Key': APP_KEY as string,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Falha ao salvar progresso');
  }

  const data = (await response.json()) as AppScriptResponse;

  if (!data.success) {
    throw new Error(data.error || 'Erro ao salvar');
  }

  return data;
}
