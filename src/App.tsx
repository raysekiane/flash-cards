import { useEffect, useState } from 'react';
import { AppLayout } from './components/AppLayout';
import { ErrorAlert } from './components/ErrorAlert';
import { SuccessToast } from './components/SuccessToast';
import { DeckListPage } from './pages/DeckListPage';
import { FlashcardStudyPage } from './pages/FlashcardStudyPage';
import { ProgressPage } from './pages/ProgressPage';
import { syncNow, registerAutoSync, type SyncResult } from './shared/services/syncService';
import { useDecksStore } from './features/decks/store/decksStore';
import { useFlashcardsStore } from './features/flashcards/store/flashcardsStore';
import { useProgressStore } from './features/progress/store/progressStore';

export type Page = 'decks' | 'study' | 'progress';

export default function App() {
  const [page, setPage] = useState<Page>('decks');
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  const loadDecks = useDecksStore((state) => state.loadDecks);
  const loadFlashcards = useFlashcardsStore((state) => state.loadFlashcards);
  const loadProgress = useProgressStore((state) => state.loadProgress);

  function handleSyncResult(result: SyncResult) {
    if (result.success) {
      loadDecks();
      loadFlashcards();
      loadProgress();
      setBanner({
        type: 'success',
        message:
          result.updatedDecks.length > 0
            ? `Sincronizado! Decks atualizados: ${result.updatedDecks.join(', ')}`
            : 'Sincronizado! Nenhuma mudança de conteúdo.',
      });
    } else {
      setBanner({ type: 'error', message: result.error ?? 'Falha ao sincronizar' });
    }
  }

  useEffect(() => {
    loadDecks();
    loadFlashcards();
    loadProgress();
    syncNow().then(handleSyncResult);

    return registerAutoSync(handleSyncResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleStudy(deckName: string) {
    setSelectedDeck(deckName);
    setPage('study');
  }

  function handleFinishStudy() {
    setSelectedDeck(null);
    setPage('decks');
    syncNow().then(handleSyncResult);
  }

  const bannerNode = banner ? (
    banner.type === 'error' ? (
      <ErrorAlert message={banner.message} onDismiss={() => setBanner(null)} />
    ) : (
      <SuccessToast message={banner.message} onDismiss={() => setBanner(null)} />
    )
  ) : null;

  return (
    <AppLayout currentPage={page} onNavigate={setPage} onSynced={handleSyncResult} banner={bannerNode}>
      {page === 'decks' && <DeckListPage onStudy={handleStudy} />}
      {page === 'study' && selectedDeck && (
        <FlashcardStudyPage deckName={selectedDeck} onFinish={handleFinishStudy} />
      )}
      {page === 'progress' && <ProgressPage />}
    </AppLayout>
  );
}
