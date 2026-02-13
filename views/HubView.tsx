
import React, { useState } from 'react';
import { Search, Plus, X, Globe, Bell, UserCircle } from 'lucide-react';
import { Company, ModuleType } from '../types';
import CompanyCard from '../components/CompanyCard';
import { INDUSTRIES, COMPANY_SIZES, COUNTRIES, DEFAULT_MODULES } from '../constants';

interface HubViewProps {
  companies: Company[];
  onOpenCompany: (id: string) => void;
  onOpenSettings: (id: string) => void;
  onCreateCompany: (company: Company) => void;
}

const HubView: React.FC<HubViewProps> = ({ companies, onOpenCompany, onOpenSettings, onCreateCompany }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Company Form State
  const [newCompany, setNewCompany] = useState<Partial<Company>>({
    name: '',
    industry: INDUSTRIES[0],
    size: COMPANY_SIZES[0],
    country: COUNTRIES[0],
    modules: [],
    status: 'configuring',
    subdomain: ''
  });

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const companyToAdd: Company = {
      ...newCompany as Company,
      id: Math.random().toString(36).substr(2, 9),
      collaboratorsCount: 0,
      values: [],
      users: [],
      visibleKpis: ['collaborators', 'positions']
    };
    onCreateCompany(companyToAdd);
    setIsModalOpen(false);
    setNewCompany({
      name: '',
      industry: INDUSTRIES[0],
      size: COMPANY_SIZES[0],
      country: COUNTRIES[0],
      modules: [],
      status: 'configuring',
      subdomain: ''
    });
  };

  const toggleModule = (module: ModuleType) => {
    setNewCompany(prev => ({
      ...prev,
      modules: prev.modules?.includes(module) 
        ? prev.modules.filter(m => m !== module)
        : [...(prev.modules || []), module]
    }));
  };

  return (
    <div className="min-h-full bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8 flex-1">
          <div className="bg-[#111827] w-8 h-8 rounded flex items-center justify-center text-white font-bold">A</div>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-slate-200 outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Bell className="text-gray-400 cursor-pointer hover:text-slate-600" size={20} />
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">Carlos Mendoza</p>
              <span className="text-[10px] uppercase font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Super Admin</span>
            </div>
            <UserCircle size={32} className="text-gray-300" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Empresas / Proyectos</h1>
            <p className="text-gray-500 text-sm mt-1">Gestiona y accede a tus empresas desde aquí</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#111827] text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium hover:bg-slate-800 transition-all shadow-sm"
          >
            <Plus size={20} />
            Crear Empresa
          </button>
        </div>

        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map(company => (
              <CompanyCard 
                key={company.id} 
                company={company} 
                onOpen={() => onOpenCompany(company.id)}
                onSettings={() => onOpenSettings(company.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No se encontraron empresas</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto mt-1">Intenta con otro término de búsqueda o crea una nueva empresa.</p>
          </div>
        )}
      </main>

      {/* Create Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Configurar Nueva Empresa</h2>
                <p className="text-sm text-gray-500">Completa los datos para desplegar un nuevo entorno</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre de la Empresa</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ej. Mundoflete S.A."
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                    value={newCompany.name}
                    onChange={(e) => {
                        const name = e.target.value;
                        const sub = name.toLowerCase().replace(/[^a-z0-9]/g, '');
                        setNewCompany(prev => ({ ...prev, name, subdomain: sub }));
                    }}
                  />
                </div>
                
                <div className="col-span-2 bg-slate-50 p-3 rounded-lg flex items-center gap-3 text-sm text-slate-600 border border-slate-100">
                    <Globe size={18} className="text-slate-400" />
                    <span>Dominio asignado: <strong className="text-slate-900">{newCompany.subdomain || 'empresa'}.altittus.com</strong></span>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Industria</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-100 outline-none"
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, industry: e.target.value }))}
                  >
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tamaño (Cantidad)</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-100 outline-none"
                    value={newCompany.size}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, size: e.target.value }))}
                  >
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">País</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-100 outline-none"
                    value={newCompany.country}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, country: e.target.value }))}
                  >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Módulos a Habilitar</p>
                  <div className="grid grid-cols-2 gap-3">
                    {DEFAULT_MODULES.map(mod => (
                      <label key={mod} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 accent-orange-500" 
                          checked={newCompany.modules?.includes(mod)}
                          onChange={() => toggleModule(mod)}
                        />
                        <span className="text-sm text-gray-700">{mod}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </form>

            <div className="px-8 py-6 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-[#111827] text-white hover:bg-slate-800 transition-all shadow-sm"
              >
                Crear Empresa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubView;
