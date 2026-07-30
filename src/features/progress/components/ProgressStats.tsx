interface ProgressStatsProps {
  stats: {
    total: number;
    acertou: number;
    errou: number;
    naoEstudado: number;
    estudadosHoje: number;
  };
}

export function ProgressStats({ stats }: ProgressStatsProps) {
  const cards = [
    { label: 'Total de cartões', value: stats.total },
    { label: 'Acertos', value: stats.acertou },
    { label: 'Erros', value: stats.errou },
    { label: 'Não estudados', value: stats.naoEstudado },
    { label: 'Estudados hoje', value: stats.estudadosHoje },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
        >
          <p className="text-2xl font-semibold">{card.value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
