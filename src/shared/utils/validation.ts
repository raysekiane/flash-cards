export interface ValidationError {
  cardId?: string;
  field: string;
  message: string;
}

export interface ValidationWarning {
  cardId?: string;
  field: string;
  message: string;
}

export interface RawFlashcard {
  cardId?: unknown;
  deckName?: unknown;
  pergunta?: unknown;
  resposta?: unknown;
  explicacao?: unknown;
  categoria?: unknown;
}

export function validateFlashcard(raw: RawFlashcard): ValidationError[] {
  const errors: ValidationError[] = [];
  const cardId = typeof raw.cardId === 'string' ? raw.cardId : undefined;

  if (!cardId) {
    errors.push({ field: 'cardId', message: 'cardId é obrigatório' });
  }
  if (typeof raw.deckName !== 'string' || !raw.deckName) {
    errors.push({ cardId, field: 'deckName', message: 'deckName é obrigatório' });
  }
  if (typeof raw.pergunta !== 'string' || !raw.pergunta) {
    errors.push({ cardId, field: 'pergunta', message: 'pergunta é obrigatória' });
  }
  if (typeof raw.resposta !== 'string' || !raw.resposta) {
    errors.push({ cardId, field: 'resposta', message: 'resposta é obrigatória' });
  }

  return errors;
}
