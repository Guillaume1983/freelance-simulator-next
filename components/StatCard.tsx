import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  Icon: LucideIcon;
  color: 'indigo' | 'rose' | 'emerald' | 'amber';
}

export default function StatCard({ title, value, Icon, color }: StatCardProps) {
  const themes = {
    indigo: 'border-l-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/10',
    rose: 'border-l-rose-500 text-rose-600 bg-rose-50 dark:bg-rose-900/10',
    emerald: 'border-l-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10',
    amber: 'border-l-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/10',
  };

  return (
    <div className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 ${themes[color]} shadow-sm transition-all`}>
      <div className="flex items-center gap-4">
        <div className={`${themes[color].split(' ').slice(1).join(' ')} p-3 rounded-xl`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
          <p className="font-[900] text-slate-900 dark:text-white text-xl tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}