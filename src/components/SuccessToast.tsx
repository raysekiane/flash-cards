interface SuccessToastProps {
  message: string;
  onDismiss?: () => void;
}

export function SuccessToast({ message, onDismiss }: SuccessToastProps) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 font-medium underline"
          aria-label="Fechar aviso de sucesso"
        >
          Fechar
        </button>
      )}
    </div>
  );
}
