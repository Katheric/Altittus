
import React from 'react';
import * as LucideIcons from 'lucide-react';
import { ALL_KPIS } from '../constants';

interface KpiCardProps {
  id: string;
  value: string | number;
  trend?: { value: number; type: 'up' | 'down' | 'neutral' };
  isNew?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ id, value, trend }) => {
  const kpiInfo = ALL_KPIS.find(k => k.id === id);
  if (!kpiInfo) return null;

  const Icon = (LucideIcons as any)[kpiInfo.icon];

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
      <div className="flex items-start justify-between">
        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
          {Icon && <Icon size={20} />}
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${
            trend.type === 'up' ? 'text-emerald-500' : trend.type === 'down' ? 'text-rose-500' : 'text-gray-400'
          }`}>
            {trend.type === 'up' ? '+' : trend.type === 'down' ? '-' : ''}
            {trend.value}%
            {trend.type === 'up' && <LucideIcons.ArrowUpRight size={14} className="ml-1" />}
            {trend.type === 'down' && <LucideIcons.ArrowDownRight size={14} className="ml-1" />}
          </div>
        )}
      </div>
      
      <div>
        <div className="text-2xl font-bold text-gray-900 leading-none">{value}</div>
        <div className="text-xs text-gray-400 mt-1">{kpiInfo.label}</div>
      </div>
    </div>
  );
};

export default KpiCard;
