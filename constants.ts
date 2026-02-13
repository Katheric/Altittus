
import { ModuleType } from './types';

export const INDUSTRIES = [
  'Tecnología',
  'Manufactura',
  'Servicios',
  'Construcción',
  'Retail',
  'Educación',
  'Salud',
  'Finanzas'
];

export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
];

export const COUNTRIES = [
  'Guatemala',
  'México',
  'Colombia',
  'España',
  'Estados Unidos',
  'Argentina',
  'Chile',
  'Perú'
];

export const ALL_KPIS = [
  { id: 'collaborators', label: 'Cantidad de colaboradores', icon: 'Users' },
  { id: 'positions', label: 'Cantidad de puestos', icon: 'Briefcase' },
  { id: 'rotation', label: '% Rotación', icon: 'RefreshCw' },
  { id: 'compliance', label: '% Cumplimiento plan', icon: 'Target' },
  { id: 'vacancies', label: 'Cantidad de vacantes', icon: 'UserPlus' },
  { id: 'hires_exits', label: 'Altas / Bajas', icon: 'Activity' },
  { id: 'gender', label: 'Género', icon: 'UserCircle' },
  { id: 'performance', label: 'Nota de desempeño', icon: 'Star' },
  { id: 'hiring_time', label: 'Tiempo de cobertura', icon: 'Clock' },
  { id: 'education', label: 'Nivel educativo', icon: 'GraduationCap' },
  { id: 'climate', label: 'Nota de clima', icon: 'Sun' },
  { id: 'culture', label: 'Nota de cultura', icon: 'Globe' }
];

export const DEFAULT_MODULES = Object.values(ModuleType);
