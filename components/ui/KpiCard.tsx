import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from './Card';

type Accent = 'primary' | 'secondary' | 'accent' | 'blue' | 'amber' | 'slate';

const accents: Record<Accent, string> = {
  primary: 'bg-primary-50 text-primary-600',
  secondary: 'bg-secondary-50 text-secondary-600',
  accent: 'bg-accent-50 text-accent-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-600',
};

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: number;
  sub?: string;
  icon?: React.ElementType;
  accent?: Accent;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, delta, sub, icon: Icon, accent = 'primary' }) => (
  <Card>
    <div className="flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
        <h3 className="text-2xl font-black text-slate-800 font-display animate-count-up">{value}</h3>
        {delta != null && (
          <span className={`mt-1 inline-flex items-center gap-1 text-xs font-bold ${delta >= 0 ? 'text-success' : 'text-error'}`}>
            {delta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(delta)}%
          </span>
        )}
        {sub && !delta && <p className="mt-1 text-xs font-semibold text-slate-400">{sub}</p>}
      </div>
      {Icon && (
        <div className={`p-3 rounded-lg ${accents[accent]}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  </Card>
);

export default KpiCard;
