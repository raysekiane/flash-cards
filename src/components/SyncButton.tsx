import { useState } from 'react';
import { syncNow, type SyncResult } from '../shared/services/syncService';

interface SyncButtonProps {
  onSynced: (result: SyncResult) => void;
}

export function SyncButton({ onSynced }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false);

  async function handleClick() {
    setSyncing(true);
    const result = await syncNow();
    setSyncing(false);
    onSynced(result);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={syncing}
      className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
    >
      {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
    </button>
  );
}
