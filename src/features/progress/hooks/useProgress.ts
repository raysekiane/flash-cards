import { useEffect, useMemo } from 'react';
import { useProgressStore } from '../store/progressStore';
import { useFlashcardsStore } from '../../flashcards/store/flashcardsStore';
import { isToday } from '../../../shared/utils/dateUtils';

export function useProgress() {
  const { progressByCardId, loading, error, loadProgress, setStatus } = useProgressStore();
  const allCards = useFlashcardsStore((state) => state.allCards);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const stats = useMemo(() => {
    const records = Object.values(progressByCardId);
    const acertou = records.filter((r) => r.status === 'Acertou').length;
    const errou = records.filter((r) => r.status === 'Errou').length;
    const naoEstudado = allCards.length - acertou - errou;
    const estudadosHoje = records.filter((r) => r.lastReviewed && isToday(r.lastReviewed)).length;

    return {
      total: allCards.length,
      acertou,
      errou,
      naoEstudado: Math.max(naoEstudado, 0),
      estudadosHoje,
    };
  }, [progressByCardId, allCards]);

  return { progressByCardId, stats, loading, error, setStatus };
}
