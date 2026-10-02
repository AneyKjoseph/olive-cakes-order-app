export function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          {Icon && <Icon className="w-6 h-6 text-pink-500" />}
          {title}
        </h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
