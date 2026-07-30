import { useFlashcards } from '../features/flashcards/hooks/useFlashcards';
import { useProgress } from '../features/progress/hooks/useProgress';
import { FlashcardView } from '../features/flashcards/components/FlashcardView';
import { saveProgress } from '../shared/services/appsScriptService';
import type { ProgressStatus } from '../features/progress/types';

interface FlashcardStudyPageProps {
  deckName: string;
  onFinish: () => void;
}

export function FlashcardStudyPage({ deckName, onFinish }: FlashcardStudyPageProps) {
  const { currentCard, isFlipped, isSessionComplete, total, position, flip, next } =
    useFlashcards(deckName);
  const { setStatus } = useProgress();

  async function handleStatus(status: ProgressStatus) {
    const record = await setStatus(currentCard!.cardId, status);
    saveProgress({
      cardId: record.cardId,
      status: record.status,
      lastReviewed: record.lastReviewed,
    }).catch(() => {
      // sem conexão: syncService reenvia este registro na próxima sincronização
    });
    next();
  }

  if (isSessionComplete) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-lg font-medium">Sessão de estudo concluída!</p>
        <button
          type="button"
          onClick={onFinish}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
        >
          Voltar para os decks
        </button>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Nenhum flashcard disponível para este deck.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <button type="button" onClick={onFinish} className="underline">
          ← Voltar
        </button>
        <span>
          {position}/{total} · {deckName}
        </span>
      </div>
      <FlashcardView
        card={currentCard}
        isFlipped={isFlipped}
        onFlip={flip}
        onStatus={handleStatus}
      />
    </div>
  );
}
