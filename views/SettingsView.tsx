
import React, { useState } from 'react';
import { 
  Building2, 
  Target, 
  Users, 
  ChevronRight, 
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { Company, CompanyValue, ValueBehavior } from '../types';
import { INDUSTRIES, COMPANY_SIZES, COUNTRIES } from '../constants';

interface SettingsViewProps {
  company: Company;
  onUpdateCompany: (company: Company) => void;
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ company, onUpdateCompany, onBack }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'culture' | 'users'>('general');
  const [localCompany, setLocalCompany] = useState<Company>(company);
  const [selectedValId, setSelectedValId] = useState<string | null>(null);

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'culture', label: 'Misión y Valores', icon: Target },
    { id: 'users', label: 'Usuarios', icon: Users },
  ];

  const handleSave = () => {
    onUpdateCompany(localCompany);
  };

  const addValue = () => {
    const newVal: CompanyValue = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nuevo Valor',
      behaviors: []
    };
    setLocalCompany(prev => ({ ...prev, values: [...prev.values, newVal] }));
    setSelectedValId(newVal.id);
  };

  const deleteValue = (id: string) => {
    setLocalCompany(prev => ({ ...prev, values: prev.values.filter(v => v.id !== id) }));
    if (selectedValId === id) setSelectedValId(null);
  };

  const addBehavior = (valId: string) => {
    const newBehavior: ValueBehavior = {
      id: Math.random().toString(36).substr(2, 9),
      description: 'Escribe un comportamiento observable...'
    };
    setLocalCompany(prev => ({
      ...prev,
      values: prev.values.map(v => v.id === valId ? { ...v, behaviors: [...v.behaviors, newBehavior] } : v)
    }));
  };

  const selectedValue = localCompany.values.find(v => v.id === selectedValId);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
             <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Configuración</span>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="font-semibold text-gray-900">{company.name}</span>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors"
        >
          <Save size={18} />
          Guardar Cambios
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Settings Navigation */}
        <aside className="w-64 border-r border-gray-100 p-6 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                activeTab === tab.id 
                  ? 'bg-orange-50 text-orange-600 font-bold' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#FDFDFD]">
          <div className="max-w-4xl mx-auto p-12">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <section>
                   <h2 className="text-2xl font-bold text-gray-900 mb-6">Información General</h2>
                   <div className="flex items-center gap-8 mb-8 p-6 bg-white border border-gray-100 rounded-2xl">
                      <div className="w-24 h-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-orange-300 hover:text-orange-400 cursor-pointer transition-all">
                        <ImageIcon size={32} />
                        <span className="text-[10px] mt-2 font-bold uppercase">Subir Logo</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-gray-900">Logo de la empresa</h4>
                        <p className="text-xs text-gray-500">Formato recomendado: PNG o SVG transparente. Máximo 2MB.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Empresa</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all"
                          value={localCompany.name}
                          onChange={e => setLocalCompany(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Industria</label>
                        <select 
                          className="w-full px-4 py-3 rounded-xl border border-gray-200"
                          value={localCompany.industry}
                          onChange={e => setLocalCompany(prev => ({ ...prev, industry: e.target.value }))}
                        >
                          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tamaño</label>
                        <select 
                          className="w-full px-4 py-3 rounded-xl border border-gray-200"
                          value={localCompany.size}
                          onChange={e => setLocalCompany(prev => ({ ...prev, size: e.target.value }))}
                        >
                          {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">País</label>
                        <select 
                          className="w-full px-4 py-3 rounded-xl border border-gray-200"
                          value={localCompany.country}
                          onChange={e => setLocalCompany(prev => ({ ...prev, country: e.target.value }))}
                        >
                          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                   </div>
                </section>
              </div>
            )}

            {activeTab === 'culture' && (
              <div className="space-y-12 animate-in fade-in duration-500">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Misión y Visión</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Misión</label>
                      <textarea 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 min-h-[100px]"
                        placeholder="Define el propósito de tu empresa..."
                        value={localCompany.mission || ''}
                        onChange={e => setLocalCompany(prev => ({ ...prev, mission: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Visión</label>
                      <textarea 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 min-h-[100px]"
                        placeholder="Define hacia dónde se dirige tu empresa..."
                        value={localCompany.vision || ''}
                        onChange={e => setLocalCompany(prev => ({ ...prev, vision: e.target.value }))}
                      />
                    </div>
                  </div>
                </section>

                <section>
                   <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Valores Organizacionales</h2>
                      <button 
                        onClick={addValue}
                        className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-orange-700"
                      >
                        <Plus size={16} />
                        Agregar Valor
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Left Side: Values List */}
                      <div className="space-y-3">
                         {localCompany.values.map(val => (
                           <div 
                             key={val.id} 
                             onClick={() => setSelectedValId(val.id)}
                             className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all group ${
                               selectedValId === val.id ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
                             }`}
                           >
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${selectedValId === val.id ? 'bg-orange-500' : 'bg-gray-300'}`} />
                                <input 
                                  className={`bg-transparent font-bold outline-none ${selectedValId === val.id ? 'text-orange-900' : 'text-gray-700'}`}
                                  value={val.name}
                                  onChange={e => {
                                    const name = e.target.value;
                                    setLocalCompany(prev => ({
                                      ...prev,
                                      values: prev.values.map(v => v.id === val.id ? { ...v, name } : v)
                                    }));
                                  }}
                                />
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteValue(val.id); }}
                                className="text-gray-300 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50"
                              >
                                <Trash2 size={16} />
                              </button>
                           </div>
                         ))}
                         {localCompany.values.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                               No se han registrado valores
                            </div>
                         )}
                      </div>

                      {/* Right Side: Observable Behaviors */}
                      <div className="bg-slate-50 rounded-2xl p-6 min-h-[300px] border border-slate-100">
                         {selectedValue ? (
                            <div className="space-y-6">
                               <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                     Comportamientos para <span className="text-orange-600">{selectedValue.name}</span>
                                  </h4>
                                  <button 
                                    onClick={() => addBehavior(selectedValue.id)}
                                    className="p-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                                  >
                                    <Plus size={16} />
                                  </button>
                               </div>
                               <div className="space-y-3">
                                  {selectedValue.behaviors.map((beh, idx) => (
                                    <div key={beh.id} className="flex gap-3 group">
                                       <div className="mt-1.5 shrink-0 w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                                          <CheckCircle2 size={12} className="text-orange-600" />
                                       </div>
                                       <textarea 
                                          className="flex-1 bg-transparent text-sm text-slate-600 outline-none resize-none border-b border-transparent focus:border-orange-200 py-1"
                                          value={beh.description}
                                          onChange={e => {
                                            const desc = e.target.value;
                                            setLocalCompany(prev => ({
                                              ...prev,
                                              values: prev.values.map(v => v.id === selectedValue.id ? {
                                                ...v,
                                                behaviors: v.behaviors.map(b => b.id === beh.id ? { ...b, description: desc } : b)
                                              } : v)
                                            }));
                                          }}
                                       />
                                       <button 
                                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-400 transition-opacity"
                                          onClick={() => {
                                            setLocalCompany(prev => ({
                                              ...prev,
                                              values: prev.values.map(v => v.id === selectedValue.id ? {
                                                ...v,
                                                behaviors: v.behaviors.filter(b => b.id !== beh.id)
                                              } : v)
                                            }));
                                          }}
                                       >
                                          <Trash2 size={14} />
                                       </button>
                                    </div>
                                  ))}
                                  {selectedValue.behaviors.length === 0 && (
                                     <p className="text-xs text-slate-400 text-center py-8">No hay comportamientos registrados. Haz clic en el botón +.</p>
                                  )}
                               </div>
                            </div>
                         ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                               <Target size={40} className="mb-2 opacity-20" />
                               <p className="text-sm font-medium">Selecciona un valor para editar sus comportamientos</p>
                            </div>
                         )}
                      </div>
                   </div>
                </section>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Lista de Usuarios</h2>
                  <button className="flex items-center gap-2 bg-[#111827] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm">
                    <Plus size={18} />
                    Invitar Usuario
                  </button>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                   <table className="w-full text-left">
                      <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                         <tr>
                            <th className="px-6 py-4">Usuario</th>
                            <th className="px-6 py-4">Rol / Acceso</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4"></th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {localCompany.users.length > 0 ? localCompany.users.map(user => (
                           <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">{user.name[0]}</div>
                                    <div>
                                       <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                       <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className="text-xs font-medium px-2 py-1 bg-orange-50 text-orange-600 rounded-full">{user.role}</span>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    <span className="text-xs font-medium text-gray-600">Activo</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                    <MoreVertical size={16} />
                                 </button>
                              </td>
                           </tr>
                         )) : (
                            <tr>
                               <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">No hay usuarios registrados aparte del administrador del Hub.</td>
                            </tr>
                         )}
                      </tbody>
                   </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsView;
