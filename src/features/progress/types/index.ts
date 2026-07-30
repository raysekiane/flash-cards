export type ProgressStatus = 'Não estudado' | 'Acertou' | 'Errou';

export interface ProgressRecord {
  cardId: string;
  status: ProgressStatus;
  reviewCount: number;
  lastReviewed?: string;
  updatedAt: string;
}
