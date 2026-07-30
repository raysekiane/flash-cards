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

// Apps Script Web Apps não expõem os headers da requisição HTTP para o
// script (doGet/doPost só recebem e.parameter), e um header custom como
// X-App-Key força o navegador a mandar um preflight OPTIONS que o Apps
// Script não responde. Por isso a chave viaja como query param, e o POST
// usa text/plain (content-type "simples") para não disparar preflight.

export async function getAll(): Promise<AppScriptResponse<GetAllData>> {
  assertConfigured();

  const url = `${APPS_SCRIPT_URL}?action=getAll&key=${encodeURIComponent(APP_KEY as string)}`;
  const response = await fetch(url);

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

  const url = `${APPS_SCRIPT_URL}?action=saveProgress&key=${encodeURIComponent(APP_KEY as string)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
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
