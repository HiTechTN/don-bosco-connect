import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  color: string;
  iconTextColor: string;
  onClick?: () => void;
}

export function StatCard({ label, value, sub, icon, color, iconTextColor, onClick }: StatCardProps) {
  return (
    <div
      className={`bg-white p-5 rounded-xl shadow-sm cursor-pointer hover:shadow-lg transition-all group ${onClick ? 'pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
          <div className={iconTextColor}>{icon}</div>
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-slate-800">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
          {sub && <p className="text-xs text-slate-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  icon?: ReactNode;
  iconColor?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, icon, iconColor = 'text-indigo-500', children, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm ${className}`}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        {icon && <span className={iconColor}>{icon}</span>}
        {title}
      </h3>
      {children}
    </div>
  );
}