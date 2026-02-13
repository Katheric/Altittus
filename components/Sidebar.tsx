
import React from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  ArrowLeft,
  Briefcase,
  Users,
  Target,
  DollarSign,
  UserPlus,
  CloudSun,
  ChevronDown
} from 'lucide-react';
import { Company, ModuleType } from '../types';

interface SidebarProps {
  activeCompany: Company;
  currentView: string;
  onNavigate: (view: string) => void;
  onBackToHub: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeCompany, currentView, onNavigate, onBackToHub }) => {
  const isModuleEnabled = (module: ModuleType) => activeCompany.modules.includes(module);

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Inicio / Dashboard', 
      icon: LayoutDashboard, 
      view: 'company-dashboard',
      enabled: true 
    },
    { 
      id: 'do', 
      label: 'Diseño Organizacional', 
      icon: Briefcase, 
      view: 'org-design',
      enabled: isModuleEnabled(ModuleType.DO),
      hasSub: true 
    },
    { 
      id: 'ed', 
      label: 'Evaluación de Desempeño', 
      icon: Target, 
      enabled: isModuleEnabled(ModuleType.ED) 
    },
    { 
      id: 'cr', 
      label: 'Compensación y Rec.', 
      icon: DollarSign, 
      enabled: isModuleEnabled(ModuleType.CR) 
    },
    { 
      id: 'rs', 
      label: 'Reclutamiento y Sel.', 
      icon: UserPlus, 
      enabled: isModuleEnabled(ModuleType.RS) 
    },
    { 
      id: 'cc', 
      label: 'Clima y Cultura', 
      icon: CloudSun, 
      enabled: isModuleEnabled(ModuleType.CC) 
    },
    { 
      id: 'settings', 
      label: 'Configuración', 
      icon: Settings, 
      view: 'company-settings',
      enabled: true 
    },
  ];

  return (
    <div className="w-64 bg-[#111827] text-white flex flex-col h-full shadow-xl">
      <div className="p-6">
        <div className="bg-orange-600 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl mb-2">
          A
        </div>
        <div className="font-bold text-lg leading-tight">Altittus</div>
        <div className="text-gray-400 text-xs truncate">{activeCompany.name}</div>
        <div className="mt-2 bg-orange-600/20 text-orange-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block">
          Super Admin
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => item.view && onNavigate(item.view)}
              disabled={!item.enabled}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                !item.enabled 
                  ? 'opacity-30 cursor-not-allowed' 
                  : currentView === item.view 
                    ? 'bg-white/10 text-white font-medium' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.hasSub && <ChevronDown size={14} className="opacity-50" />}
            </button>
            {item.id === 'do' && item.enabled && (currentView === 'org-design') && (
               <div className="ml-9 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-300">
                  <button className="w-full text-left py-1 text-xs text-orange-400 font-medium">Wizard de Inicio</button>
                  <button className="w-full text-left py-1 text-xs text-gray-500 hover:text-white">Organigrama</button>
                  <button className="w-full text-left py-1 text-xs text-gray-500 hover:text-white">Puestos</button>
                  <button className="w-full text-left py-1 text-xs text-gray-500 hover:text-white">Colaboradores</button>
               </div>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={onBackToHub}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al HUB
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
