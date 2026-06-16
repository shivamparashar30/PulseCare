import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'indigo' | 'green' | 'amber' | 'red' | 'blue' | 'purple';
  subtitle?: string;
}

const COLORS = {
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-500/20' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-500/20' },
  amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-500/20' },
  red: { bg: 'bg-red-50', icon: 'text-red-600', ring: 'ring-red-500/20' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-500/20' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'ring-purple-500/20' },
};

export default function StatsCard({ title, value, icon: Icon, color, subtitle }: StatsCardProps) {
  const c = COLORS[color];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${c.bg} ring-1 ${c.ring}`}>
          <Icon size={20} className={c.icon} />
        </div>
      </div>
    </div>
  );
}
