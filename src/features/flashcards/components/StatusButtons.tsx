import type { ProgressStatus } from '../../progress/types';

interface StatusButtonsProps {
  onStatus: (status: ProgressStatus) => void;
}

export function StatusButtons({ onStatus }: StatusButtonsProps) {
  return (
    <div className="flex justify-center gap-3">
      <button
        type="button"
        onClick={() => onStatus('Acertou')}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Acertei
      </button>
      <button
        type="button"
        onClick={() => onStatus('Errou')}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Errei
      </button>
    </div>
  );
}
