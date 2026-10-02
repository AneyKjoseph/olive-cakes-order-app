export function StatCard({ label, value, tone = 'rose' }) {
  const styles = {
    rose: {
      shell: 'bg-rose-100/50 border-rose-100/80',
      label: 'text-rose-500',
      value: 'text-rose-600'
    },
    amber: {
      shell: 'bg-amber-100/50 border-amber-100/80',
      label: 'text-amber-600',
      value: 'text-amber-700'
    },
    slate: {
      shell: 'bg-slate-100/70 border-slate-200',
      label: 'text-slate-500',
      value: 'text-slate-700'
    }
  };

  const current = styles[tone] || styles.rose;

  return (
    <div className={`border px-4 py-2.5 rounded-2xl text-center min-w-[100px] ${current.shell}`}>
      <span className={`block text-[10px] font-bold uppercase tracking-wider ${current.label}`}>
        {label}
      </span>
      <span className={`text-2xl font-black ${current.value}`}>{value}</span>
    </div>
  );
}
