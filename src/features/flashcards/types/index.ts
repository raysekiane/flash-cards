export interface Flashcard {
  cardId: string;
  deckName: string;
  pergunta: string;
  resposta: string;
  explicacao?: string;
  categoria?: string;
}
