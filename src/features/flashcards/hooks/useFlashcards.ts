import { useEffect } from 'react';
import { useFlashcardsStore } from '../store/flashcardsStore';

export function useFlashcards(deckName?: string) {
  const {
    studyQueue,
    currentIndex,
    isFlipped,
    loading,
    error,
    loadFlashcards,
    startStudySession,
    flip,
    next,
    reset,
  } = useFlashcardsStore();

  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  useEffect(() => {
    if (deckName) {
      startStudySession(deckName);
    }
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckName]);

  const currentCard = studyQueue[currentIndex] ?? null;
  const isSessionComplete = studyQueue.length > 0 && currentIndex >= studyQueue.length;

  return {
    currentCard,
    isFlipped,
    isSessionComplete,
    total: studyQueue.length,
    position: Math.min(currentIndex + 1, studyQueue.length),
    loading,
    error,
    flip,
    next,
  };
}
