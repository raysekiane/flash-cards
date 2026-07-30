import { useDecks } from '../features/decks/hooks/useDecks';
import { DeckList } from '../features/decks/components/DeckList';

interface DeckListPageProps {
  onStudy: (deckName: string) => void;
}

export function DeckListPage({ onStudy }: DeckListPageProps) {
  const { decks, loading, error } = useDecks();

  if (loading && decks.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Carregando decks...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }

  return <DeckList decks={decks} onStudy={onStudy} />;
}
