import type { Flashcard } from '../types';
import type { ProgressStatus } from '../../progress/types';
import { StatusButtons } from './StatusButtons';

interface FlashcardViewProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  onStatus: (status: ProgressStatus) => void;
}

export function FlashcardView({ card, isFlipped, onFlip, onStatus }: FlashcardViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div
        role="button"
        tabIndex={0}
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onFlip();
        }}
        className="min-h-48 cursor-pointer rounded-xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        {card.categoria && (
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">{card.categoria}</p>
        )}
        <p className="text-lg font-medium">{card.pergunta}</p>

        {isFlipped && (
          <div className="mt-6 border-t border-slate-200 pt-4 text-left dark:border-slate-700">
            <p className="font-semibold text-emerald-700 dark:text-emerald-400">{card.resposta}</p>
            {card.explicacao && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{card.explicacao}</p>
            )}
          </div>
        )}

        {!isFlipped && (
          <p className="mt-6 text-xs text-slate-400">Clique para revelar a resposta</p>
        )}
      </div>

      {isFlipped && <StatusButtons onStatus={onStatus} />}
    </div>
  );
}
