
import React from 'react';
import { Settings, Users, ExternalLink, Building2 } from 'lucide-react';
import { Company } from '../types';

interface CompanyCardProps {
  company: Company;
  onOpen: () => void;
  onSettings: () => void;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onOpen, onSettings }) => {
  const statusStyles = {
    active: 'bg-emerald-100 text-emerald-700',
    configuring: 'bg-blue-100 text-blue-700',
    inactive: 'bg-gray-100 text-gray-700'
  };

  const statusLabels = {
    active: 'Activa',
    configuring: 'En configuración',
    inactive: 'Inactiva'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white shrink-0">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="w-full h-full object-contain rounded-lg" />
            ) : (
              <Building2 size={24} />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{company.name}</h3>
            <p className="text-gray-500 text-sm">{company.industry}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusStyles[company.status]}`}>
          {statusLabels[company.status]}
        </span>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Users size={12} />
          {company.collaboratorsCount} colaboradores
        </span>
      </div>

      <div className="mt-2">
        <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Módulos habilitados:</p>
        <div className="flex flex-wrap gap-1">
          {company.modules.map((mod) => (
            <span key={mod} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[10px] rounded border border-gray-100">
              {mod}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 flex gap-2 border-t border-gray-50">
        <button 
          onClick={onOpen}
          className="flex-1 bg-[#111827] text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <ExternalLink size={16} />
          Abrir
        </button>
        <button 
          onClick={onSettings}
          className="w-10 h-10 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <Settings size={18} />
        </button>
        <button 
          className="w-10 h-10 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          title="Ver como usuario específico"
        >
          <Users size={18} />
        </button>
      </div>
    </div>
  );
};

export default CompanyCard;
