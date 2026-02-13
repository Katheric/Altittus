
export enum ModuleType {
  DO = 'Desarrollo Organizacional',
  ED = 'Evaluación al desempeño',
  CR = 'Compensación y recompensa',
  RS = 'Reclutamiento y selección',
  CC = 'Clima y cultura'
}

export interface ValueBehavior {
  id: string;
  description: string;
}

export interface CompanyValue {
  id: string;
  name: string;
  behaviors: ValueBehavior[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  dni: string; // Cedula
  status: 'active' | 'inactive';
  hireDate: string;
  exitDate?: string;
  area: string;
  position: string;
  supervisor: string;
  contractType: string;
  baseSalary: number;
  positionId?: string;
}

export interface JobRole {
  name: string;
  functions: string[];
  indicators: string[];
}

export interface JobDescriptor {
  positionName: string;
  hierarchyLevel: 'Operativo' | 'Táctico' | 'Estratégico' | 'Otro';
  area: string;
  objective: string;
  activities: string;
  mission: string;
  roles: JobRole[];
  reportsTo?: string;
  supervises?: string;
  salaryBand?: string;
}

export interface Company {
  id: string;
  name: string;
  subdomain: string;
  industry: string;
  size: string;
  country: string;
  status: 'active' | 'configuring' | 'inactive';
  modules: ModuleType[];
  collaboratorsCount: number;
  logo?: string;
  mission?: string;
  vision?: string;
  values: CompanyValue[];
  users: User[];
  visibleKpis: string[];
}

export type ViewType = 'login' | 'hub' | 'company-dashboard' | 'company-settings' | 'org-design';

export type OrgDesignStep = 
  | 'initial-choice' 
  | 'base-functions' 
  | 'recommendations' 
  | 'comercial-selection' 
  | 'ops-selection' 
  | 'admin-selection' 
  | 'org-chart-result';

export interface AppState {
  currentView: ViewType;
  selectedCompanyId: string | null;
  companies: Company[];
}

export interface OrgNode {
  id: string;
  title: string;
  subtitle: string;
  category: 'general' | 'comercial' | 'operations' | 'admin';
  collaborators: number;
  employeeId?: string;
  descriptor?: JobDescriptor;
  children?: OrgNode[];
}
