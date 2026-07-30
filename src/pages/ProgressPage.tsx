import { useProgress } from '../features/progress/hooks/useProgress';
import { ProgressStats } from '../features/progress/components/ProgressStats';

export function ProgressPage() {
  const { stats, loading, error } = useProgress();

  if (loading && stats.total === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Carregando estatísticas...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }

  return <ProgressStats stats={stats} />;
}
