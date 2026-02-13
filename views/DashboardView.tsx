
import React, { useState } from 'react';
import { 
  Settings, 
  ChevronRight, 
  X, 
  Save, 
  ArrowLeft,
  Search,
  LayoutGrid
} from 'lucide-react';
import { Company } from '../types';
import KpiCard from '../components/KpiCard';
import { ALL_KPIS } from '../constants';

interface DashboardViewProps {
  company: Company;
  onUpdateCompany: (company: Company) => void;
  onBack: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ company, onUpdateCompany, onBack }) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [selectedKpis, setSelectedKpis] = useState<string[]>(company.visibleKpis);

  const toggleKpi = (id: string) => {
    setSelectedKpis(prev => 
      prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
    );
  };

  const handleSaveConfig = () => {
    onUpdateCompany({ ...company, visibleKpis: selectedKpis });
    setIsConfiguring(false);
  };

  const mockData: Record<string, string | number> = {
    collaborators: company.collaboratorsCount,
    positions: Math.floor(company.collaboratorsCount / 2),
    rotation: '4.2%',
    compliance: '88%',
    vacancies: 8,
    hires_exits: '12 / 3',
    gender: '60% M / 40% F',
    performance: '8.4/10',
    hiring_time: '24 días',
    education: '65% Licenciatura',
    climate: '4.2 / 5',
    culture: '92%'
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
             <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Dashboard</span>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="font-semibold text-gray-900">{company.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button 
            onClick={() => setIsConfiguring(true)}
            className="flex items-center gap-2 bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <Settings size={16} />
            Configurar Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 space-y-8 overflow-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Bienvenido a {company.name}. Aquí están tus indicadores clave.</p>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {company.visibleKpis.map(kpiId => (
            <KpiCard 
              key={kpiId} 
              id={kpiId} 
              value={mockData[kpiId] || '-'} 
              trend={{ value: Math.floor(Math.random() * 10), type: Math.random() > 0.5 ? 'up' : 'down' }}
            />
          ))}
          {company.visibleKpis.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed border-gray-100">
              <p className="text-gray-400">No hay indicadores visibles. Haz clic en Configurar Dashboard.</p>
            </div>
          )}
        </div>

        {/* Secondary Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-gray-900">Departamentos Principales</h3>
               <button className="text-xs text-orange-600 font-bold uppercase tracking-wider">Ver todos</button>
             </div>
             <div className="grid grid-cols-2 gap-4">
                {['Recursos Humanos', 'Tecnología', 'Operaciones', 'Finanzas'].map(dept => (
                   <div key={dept} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-slate-900 transition-all">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-white transition-colors">{dept}</span>
                      <span className="text-xs text-gray-400">{Math.floor(Math.random()*50)+10} colabs.</span>
                   </div>
                ))}
             </div>
           </div>

           <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
             <h3 className="font-bold text-gray-900 mb-6">Actividad Reciente</h3>
             <div className="space-y-6">
                {[
                  { user: 'Felipe Morales', action: 'fue agregado como Desarrollador Junior', time: 'Hace 2 horas' },
                  { user: 'Admin', action: 'actualizó el manual de cultura', time: 'Hace 5 horas' },
                  { user: 'Sofia Lopez', action: 'aprobó evaluación de desempeño', time: 'Ayer' },
                ].map((act, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
                    <div>
                      <p className="text-sm text-gray-800"><span className="font-bold">{act.user}</span> {act.action}</p>
                      <span className="text-[10px] text-gray-400">{act.time}</span>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>
      </main>

      {/* Configuration Slider */}
      {isConfiguring && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
             <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
                <div>
                  <h2 className="text-lg font-bold">Personalizar Dashboard</h2>
                  <p className="text-xs text-gray-400">Selecciona los indicadores que deseas monitorear</p>
                </div>
                <button onClick={() => setIsConfiguring(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X size={20} />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {ALL_KPIS.map(kpi => (
                  <label 
                    key={kpi.id} 
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedKpis.includes(kpi.id) 
                        ? 'border-orange-200 bg-orange-50/30 ring-1 ring-orange-500/20' 
                        : 'border-gray-100 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedKpis.includes(kpi.id) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                         <LayoutGrid size={18} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{kpi.label}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-orange-500"
                      checked={selectedKpis.includes(kpi.id)}
                      onChange={() => toggleKpi(kpi.id)}
                    />
                  </label>
                ))}
             </div>

             <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
                <button 
                  onClick={() => setIsConfiguring(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Descartar
                </button>
                <button 
                  onClick={handleSaveConfig}
                  className="flex-1 bg-[#111827] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 shadow-lg transition-all"
                >
                  <Save size={18} />
                  Guardar Vista
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
