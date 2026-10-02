export function InfoChip({ label, value, tone = 'rose' }) {
  const tones = {
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${tones[tone] || tones.rose}`}>
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
