import { ThemeToggle } from './ThemeToggle';
import { SyncButton } from './SyncButton';
import type { SyncResult } from '../shared/services/syncService';
import type { Page } from '../App';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onSynced: (result: SyncResult) => void;
}

const NAV_ITEMS: { page: Page; label: string }[] = [
  { page: 'decks', label: 'Decks' },
  { page: 'progress', label: 'Progresso' },
];

export function Header({ currentPage, onNavigate, onSynced }: HeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Flashcards ENEM
        </h1>
        <nav className="flex gap-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => onNavigate(item.page)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                currentPage === item.page
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <SyncButton onSynced={onSynced} />
        <ThemeToggle />
      </div>
    </header>
  );
}
