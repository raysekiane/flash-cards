import type { DeckWithStats } from '../hooks/useDecks';

interface DeckListProps {
  decks: DeckWithStats[];
  onStudy: (deckName: string) => void;
}

export function DeckList({ decks, onStudy }: DeckListProps) {
  if (decks.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Nenhum deck disponível. Sincronize para carregar os flashcards.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {decks.map((deck) => (
        <li
          key={deck.name}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
        >
          <div>
            <p className="font-medium">{deck.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {deck.studied}/{deck.totalCards} estudados · {deck.acertou} acertos · {deck.errou} erros
            </p>
          </div>
          <button
            type="button"
            onClick={() => onStudy(deck.name)}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Estudar
          </button>
        </li>
      ))}
    </ul>
  );
}
