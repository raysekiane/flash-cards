import type { ReactNode } from 'react';
import { Header } from './Header';
import type { SyncResult } from '../shared/services/syncService';
import type { Page } from '../App';

interface AppLayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onSynced: (result: SyncResult) => void;
  banner?: ReactNode;
  children: ReactNode;
}

export function AppLayout({ currentPage, onNavigate, onSynced, banner, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header currentPage={currentPage} onNavigate={onNavigate} onSynced={onSynced} />
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
        {banner}
        {children}
      </main>
    </div>
  );
}
