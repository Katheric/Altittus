import React, { useState, useMemo } from 'react';
import { AppState, Company, ModuleType, ViewType } from './types';
import LoginView from './views/LoginView';
import HubView from './views/HubView';
import DashboardView from './views/DashboardView';
import SettingsView from './views/SettingsView';
import OrganizationalDesignView from './views/OrganizationalDesignView';
import Sidebar from './components/Sidebar';

const MOCK_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'Altittus Demo Group',
    subdomain: 'demo',
    industry: 'Tecnología',
    size: '11-50',
    country: 'México',
    status: 'active',
    modules: [ModuleType.DO, ModuleType.ED, ModuleType.CR, ModuleType.RS, ModuleType.CC],
    collaboratorsCount: 127,
    values: [],
    users: [{ id: 'u1', name: 'Carlos Mendoza', email: 'carlos@altittus.com', role: 'Super Admin' }],
    visibleKpis: ['collaborators', 'positions', 'rotation', 'vacancies'],
  },
  {
    id: '2',
    name: 'Constructora Nova',
    subdomain: 'nova',
    industry: 'Construcción',
    size: '201-500',
    country: 'Guatemala',
    status: 'active',
    modules: [ModuleType.DO],
    collaboratorsCount: 342,
    values: [],
    users: [],
    visibleKpis: ['collaborators', 'positions', 'hiring_time'],
  },
  {
    id: '3',
    name: 'Servicios Pacific',
    subdomain: 'pacific',
    industry: 'Servicios',
    size: '11-50',
    country: 'Chile',
    status: 'configuring',
    modules: [ModuleType.DO],
    collaboratorsCount: 45,
    values: [],
    users: [],
    visibleKpis: ['collaborators', 'climate', 'culture'],
  }
];

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentView: 'login',
    selectedCompanyId: null,
    companies: MOCK_COMPANIES,
  });

  const activeCompany = useMemo(() => 
    state.companies.find(c => c.id === state.selectedCompanyId),
    [state.companies, state.selectedCompanyId]
  );

  const navigateTo = (view: ViewType, companyId: string | null = null) => {
    setState(prev => ({ ...prev, currentView: view, selectedCompanyId: companyId || prev.selectedCompanyId }));
  };

  const handleUpdateCompany = (updatedCompany: Company) => {
    setState(prev => ({
      ...prev,
      companies: prev.companies.map(c => c.id === updatedCompany.id ? updatedCompany : c)
    }));
  };

  const handleCreateCompany = (newCompany: Company) => {
    setState(prev => ({
      ...prev,
      companies: [...prev.companies, newCompany]
    }));
  };

  // Render Logic
  if (state.currentView === 'login') {
    return <LoginView onLogin={() => navigateTo('hub')} />;
  }

  // Fix: Removed redundant check for 'login' because TypeScript narrowing already knows currentView is not 'login' here.
  const isInsideCompany = state.currentView !== 'hub';

  return (
    <div className="flex h-screen bg-white">
      {isInsideCompany && activeCompany && (
        <Sidebar 
          activeCompany={activeCompany} 
          currentView={state.currentView}
          onNavigate={(view) => navigateTo(view as ViewType)}
          onBackToHub={() => navigateTo('hub')}
        />
      )}
      
      <main className="flex-1 overflow-auto bg-[#F8FAFC]">
        {state.currentView === 'hub' && (
          <HubView 
            companies={state.companies} 
            onOpenCompany={(id) => navigateTo('company-dashboard', id)}
            onOpenSettings={(id) => navigateTo('company-settings', id)}
            onCreateCompany={handleCreateCompany}
          />
        )}
        
        {state.currentView === 'company-dashboard' && activeCompany && (
          <DashboardView 
            company={activeCompany} 
            onUpdateCompany={handleUpdateCompany}
            onBack={() => navigateTo('hub')}
          />
        )}

        {state.currentView === 'company-settings' && activeCompany && (
          <SettingsView 
            company={activeCompany} 
            onUpdateCompany={handleUpdateCompany}
            onBack={() => navigateTo('company-dashboard', activeCompany.id)}
          />
        )}

        {state.currentView === 'org-design' && activeCompany && (
          <OrganizationalDesignView 
            company={activeCompany}
            onBack={() => navigateTo('company-dashboard')}
          />
        )}
      </main>
    </div>
  );
};

export default App;