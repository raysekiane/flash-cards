import { useEffect, useMemo } from 'react';
import { useDecksStore } from '../store/decksStore';
import { useFlashcardsStore } from '../../flashcards/store/flashcardsStore';
import { useProgressStore } from '../../progress/store/progressStore';

export interface DeckWithStats {
  name: string;
  totalCards: number;
  studied: number;
  acertou: number;
  errou: number;
}

export function useDecks() {
  const { decks, loading, error, loadDecks } = useDecksStore();
  const allCards = useFlashcardsStore((state) => state.allCards);
  const progressByCardId = useProgressStore((state) => state.progressByCardId);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const decksWithStats: DeckWithStats[] = useMemo(() => {
    return decks.map((deck) => {
      const cards = allCards.filter((card) => card.deckName === deck.name);
      let acertou = 0;
      let errou = 0;
      let studied = 0;

      for (const card of cards) {
        const progress = progressByCardId[card.cardId];
        if (!progress || progress.status === 'Não estudado') continue;
        studied += 1;
        if (progress.status === 'Acertou') acertou += 1;
        if (progress.status === 'Errou') errou += 1;
      }

      return { name: deck.name, totalCards: deck.totalCards, studied, acertou, errou };
    });
  }, [decks, allCards, progressByCardId]);

  return { decks: decksWithStats, loading, error };
}
