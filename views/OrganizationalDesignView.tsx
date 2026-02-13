
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  ArrowRight, 
  TrendingUp, 
  Settings2, 
  Briefcase, 
  CheckCircle2,
  ArrowLeft,
  Users,
  Cpu,
  DollarSign,
  Plus,
  Download,
  Edit2,
  Trash2,
  Building2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  FileSpreadsheet,
  Link as LinkIcon,
  UserPlus,
  Check,
  Search,
  MessageSquare,
  Sparkles,
  Loader2,
  Target,
  ClipboardList,
  FileText,
  Layers,
  Activity,
  Calculator,
  Wrench
} from 'lucide-react';
import { Company, OrgDesignStep, OrgNode, Employee, JobDescriptor, JobRole } from '../types';
import { GoogleGenAI } from "@google/genai";

interface OrganizationalDesignViewProps {
  company: Company;
  onBack: () => void;
}

const EXCEL_FIELDS = [
  { id: 'id', label: 'ID del colaborador' },
  { id: 'fullName', label: 'Nombre completo' },
  { id: 'email', label: 'Correo' },
  { id: 'dni', label: 'Cédula' },
  { id: 'status', label: 'Estado' },
  { id: 'hireDate', label: 'Fecha de ingreso' },
  { id: 'exitDate', label: 'Fecha de baja' },
  { id: 'area', label: 'Área' },
  { id: 'position', label: 'Puesto' },
  { id: 'supervisor', label: 'Supervisor' },
  { id: 'contractType', label: 'Tipo de contrato' },
  { id: 'baseSalary', label: 'Salario base' },
];

interface SelectionCardProps {
  category: 'comercial' | 'ops' | 'admin';
  id: string;
  title: string;
  subtitle: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ category, id, title, subtitle, selected, onSelect }) => {
  const Icon = category === 'comercial' ? TrendingUp : category === 'ops' ? Cpu : DollarSign;
  
  const styles = {
    comercial: {
      active: 'border-blue-600 bg-blue-50 ring-4 ring-blue-500/10',
      inactive: 'border-gray-100 hover:border-blue-200',
      icon: selected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-500'
    },
    ops: {
      active: 'border-orange-600 bg-orange-50 ring-4 ring-orange-500/10',
      inactive: 'border-gray-100 hover:border-orange-200',
      icon: selected ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-500'
    },
    admin: {
      active: 'border-emerald-600 bg-emerald-50 ring-4 ring-emerald-500/10',
      inactive: 'border-gray-100 hover:border-emerald-200',
      icon: selected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-500'
    }
  };

  const currentStyle = styles[category];

  return (
    <div 
      onClick={() => onSelect(id)}
      className={`p-8 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-8 ${selected ? currentStyle.active : currentStyle.inactive}`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-colors ${currentStyle.icon}`}>
        <Icon size={28} />
      </div>
      <div className="flex-1">
        <h4 className={`text-lg font-bold ${selected ? 'text-slate-900' : 'text-slate-700'}`}>{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed">{subtitle}</p>
      </div>
      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'border-slate-900 bg-slate-900 scale-110 shadow-lg' : 'border-slate-200'}`}>
        {selected && <Check size={16} className="text-white" />}
      </div>
    </div>
  );
};

const OrganizationalDesignView: React.FC<OrganizationalDesignViewProps> = ({ company, onBack }) => {
  const [currentStep, setCurrentStep] = useState<OrgDesignStep>('initial-choice');
  const [activeTab, setActiveTab] = useState<'chart' | 'collaborators'>('chart');
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>(EXCEL_FIELDS.map(f => f.id));
  const [isLinkingModalOpen, setIsLinkingModalOpen] = useState<{nodeId: string} | null>(null);
  
  const [isDescriptorChoiceOpen, setIsDescriptorChoiceOpen] = useState<string | null>(null);
  const [isDescriptorSummaryOpen, setIsDescriptorSummaryOpen] = useState<string | null>(null);
  const [activeDescriptorWizard, setActiveDescriptorWizard] = useState<{nodeId: string} | null>(null);

  const [selections, setSelections] = useState({
    comercial: '',
    ops: '',
    admin: ''
  });

  const [employees, setEmployees] = useState<Employee[]>([
    { id: 'EMP-001', fullName: 'Carlos Mendoza', email: 'carlos@altittus.com', dni: '12345678-9', status: 'active', hireDate: '2023-01-15', area: 'Dirección General', position: 'CEO', supervisor: 'Junta Directiva', contractType: 'Indefinido', baseSalary: 5000, positionId: 'root' },
    { id: 'EMP-002', fullName: 'Elena Rivas', email: 'elena@altittus.com', dni: '98765432-1', status: 'active', hireDate: '2023-06-10', area: 'Sin Asignar', position: 'Sin Asignar', supervisor: 'Sin Asignar', contractType: 'Indefinido', baseSalary: 3500 }
  ]);

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const [orgChart, setOrgChart] = useState<OrgNode>({
    id: 'root',
    title: 'Dirección General',
    subtitle: 'CEO',
    category: 'general',
    collaborators: 1,
    employeeId: 'EMP-001',
    children: []
  });

  const [editingNode, setEditingNode] = useState<{ id: string; title: string; subtitle: string } | null>(null);

  const findNodeById = (node: OrgNode, id: string): OrgNode | null => {
    if (node.id === id) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeById(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const findParentNode = (node: OrgNode, targetId: string): OrgNode | null => {
    if (!node.children) return null;
    for (const child of node.children) {
      if (child.id === targetId) return node;
      const found = findParentNode(child, targetId);
      if (found) return found;
    }
    return null;
  };

  const handleLinkEmployee = (nodeId: string, employeeId: string) => {
    const parentNode = findParentNode(orgChart, nodeId);
    const area = parentNode ? parentNode.title : 'Dirección General';
    const node = findNodeById(orgChart, nodeId);
    const supervisor = parentNode && parentNode.employeeId 
      ? employees.find(e => e.id === parentNode.employeeId)?.fullName || parentNode.title
      : parentNode?.title || 'Junta Directiva';

    setOrgChart(prev => {
      const updateRecursive = (n: OrgNode): OrgNode => {
        if (n.id === nodeId) return { ...n, employeeId, collaborators: 1 };
        if (n.children) return { ...n, children: n.children.map(updateRecursive) };
        return n;
      };
      return updateRecursive(prev);
    });

    setEmployees(prev => prev.map(emp => emp.id === employeeId ? { ...emp, positionId: nodeId, area, position: node?.title || emp.position, supervisor } : emp));
    setIsLinkingModalOpen(null);
  };

  const generateInitialChart = () => {
    const children: OrgNode[] = [];
    if (selections.comercial === 'marketing-ventas-separados') {
      children.push({ id: 'marketing', title: 'Marketing', subtitle: 'Líder de Mercadeo', category: 'comercial', collaborators: 0, children: [] });
      children.push({ id: 'ventas', title: 'Ventas', subtitle: 'Gerente Comercial', category: 'comercial', collaborators: 0, children: [] });
    } else {
      children.push({ id: 'comercial-root', title: 'Comercial', subtitle: 'Gerente Comercial', category: 'comercial', collaborators: 0, children: [] });
    }
    if (selections.ops === 'logistica-separada') {
      children.push({ id: 'ops-base', title: 'Operaciones', subtitle: 'Gerente Operativo', category: 'operations', collaborators: 0, children: [] });
      children.push({ id: 'logistica', title: 'Logística', subtitle: 'Gerente Logístico', category: 'operations', collaborators: 0, children: [] });
    } else {
      children.push({ id: 'ops-root', title: 'Operaciones', subtitle: 'Gerente Operativo', category: 'operations', collaborators: 0, children: [] });
    }
    if (selections.admin === 'admin-finanzas-rrhh') {
      children.push({ id: 'admin-finanzas', title: 'Administración y Finanzas', subtitle: 'CFO', category: 'admin', collaborators: 0, children: [] });
      children.push({ id: 'rrhh', title: 'Talento Humano', subtitle: 'Gerente RRHH', category: 'admin', collaborators: 0, children: [] });
    } else {
      children.push({ id: 'admin-root', title: 'Administración', subtitle: 'Gerente Administrativo', category: 'admin', collaborators: 0, children: [] });
    }
    setOrgChart(prev => ({ ...prev, children }));
    setCurrentStep('org-chart-result');
  };

  const addNodeDirectional = (targetId: string, direction: 'up' | 'down' | 'left' | 'right') => {
    const createNewNode = (category = 'general'): OrgNode => ({
      id: Math.random().toString(36).substr(2, 9),
      title: 'Nuevo Puesto',
      subtitle: 'Cargo',
      category: category as any,
      collaborators: 0,
      children: []
    });

    if (orgChart.id === targetId) {
      if (direction === 'down') setOrgChart(prev => ({ ...prev, children: [...(prev.children || []), createNewNode()] }));
      else if (direction === 'up') {
        const nr = createNewNode('general');
        nr.title = 'Dirección Ejecutiva';
        nr.children = [orgChart];
        setOrgChart(nr);
      }
      return;
    }

    const updateRecursive = (node: OrgNode): OrgNode => {
      // Logic for current node
      if (node.id === targetId && direction === 'down') {
         return { ...node, children: [...(node.children || []), createNewNode(node.category)] };
      }

      if (node.children) {
        const targetIndex = node.children.findIndex(c => c.id === targetId);
        // Sibling operations (up, left, right)
        if (targetIndex !== -1 && direction !== 'down') {
          const newChildren = [...node.children];
          const targetNode = newChildren[targetIndex];
          if (direction === 'left') newChildren.splice(targetIndex, 0, createNewNode(targetNode.category));
          else if (direction === 'right') newChildren.splice(targetIndex + 1, 0, createNewNode(targetNode.category));
          else if (direction === 'up') {
            const upNode = createNewNode(targetNode.category);
            upNode.title = 'Líder / Superior';
            upNode.children = [targetNode];
            newChildren[targetIndex] = upNode;
          }
          return { ...node, children: newChildren };
        }
        // Continue searching in children
        return { ...node, children: node.children.map(updateRecursive) };
      }
      return node;
    };
    setOrgChart(prev => updateRecursive(prev));
  };

  const deleteNode = (id: string) => {
    if (id === 'root') return;
    const updateNodes = (nodes: OrgNode[]): OrgNode[] => nodes.filter(n => n.id !== id).map(node => ({ ...node, children: node.children ? updateNodes(node.children) : [] }));
    setOrgChart(prev => ({ ...prev, children: updateNodes(prev.children || []) }));
  };

  const saveEdit = () => {
    if (!editingNode) return;
    const updateRecursive = (node: OrgNode): OrgNode => node.id === editingNode.id ? { ...node, title: editingNode.title, subtitle: editingNode.subtitle } : { ...node, children: node.children ? node.children.map(updateRecursive) : [] };
    setOrgChart(prev => updateRecursive(prev));
    setEditingNode(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => { e.button === 0 && (setIsDragging(true), dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y }); };
  const handleMouseMove = (e: React.MouseEvent) => isDragging && setTransform(prev => ({ ...prev, x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }));
  const handleMouseUp = () => setIsDragging(false);
  const handleWheel = (e: React.WheelEvent) => setTransform(prev => ({ ...prev, scale: Math.min(Math.max(prev.scale + (-e.deltaY * 0.001), 0.1), 2) }));

  const resetView = () => setTransform({ x: 0, y: 0, scale: 0.8 });
  const zoomIn = () => setTransform(prev => ({ ...prev, scale: Math.min(prev.scale + 0.1, 2) }));
  const zoomOut = () => setTransform(prev => ({ ...prev, scale: Math.max(prev.scale - 0.1, 0.1) }));

  const OrgBox = ({ node }: { node: OrgNode }) => {
    const categoryColors: any = { general: 'border-slate-800 text-slate-900 bg-white shadow-xl shadow-slate-200/50', comercial: 'border-blue-200 text-blue-700 bg-blue-50/50', operations: 'border-orange-200 text-orange-700 bg-orange-50/50', admin: 'border-emerald-200 text-emerald-700 bg-emerald-50/50' };
    const iconColors: any = { general: 'text-slate-600 bg-slate-100', comercial: 'text-blue-500 bg-blue-100', operations: 'text-orange-500 bg-orange-100', admin: 'text-emerald-500 bg-emerald-100' };
    const linkedEmployee = employees.find(e => e.id === node.employeeId);
    const Icon: any = node.category === 'comercial' ? TrendingUp : node.category === 'operations' ? Cpu : node.category === 'admin' ? DollarSign : Building2;
    const stopAndDo = (callback: () => void) => (e: React.MouseEvent) => { e.stopPropagation(); e.preventDefault(); callback(); };
    const handleBoxClick = () => node.descriptor ? setIsDescriptorSummaryOpen(node.id) : setIsDescriptorChoiceOpen(node.id);

    return (
      <div className="flex flex-col items-center">
        <div onMouseDown={(e) => e.stopPropagation()} onClick={handleBoxClick} className={`relative min-w-[260px] p-6 rounded-2xl border-2 transition-all group cursor-pointer hover:ring-4 hover:ring-slate-100 active:scale-95 ${categoryColors[node.category]}`}>
          {isEditorMode && (
            <>
              <button onMouseDown={stopAndDo(() => addNodeDirectional(node.id, 'up'))} className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-white border border-gray-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white shadow-lg transition-all z-10 opacity-0 group-hover:opacity-100"><ChevronUp size={14} /></button>
              <button onMouseDown={stopAndDo(() => addNodeDirectional(node.id, 'down'))} className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-white border border-gray-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white shadow-lg transition-all z-10 opacity-0 group-hover:opacity-100"><ChevronDown size={14} /></button>
              <button onMouseDown={stopAndDo(() => addNodeDirectional(node.id, 'left'))} className="absolute top-1/2 -left-3 -translate-y-1/2 w-7 h-7 bg-white border border-gray-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white shadow-lg transition-all z-10 opacity-0 group-hover:opacity-100"><ChevronLeft size={14} /></button>
              <button onMouseDown={stopAndDo(() => addNodeDirectional(node.id, 'right'))} className="absolute top-1/2 -right-3 -translate-y-1/2 w-7 h-7 bg-white border border-gray-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white shadow-lg transition-all z-10 opacity-0 group-hover:opacity-100"><ChevronRight size={14} /></button>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100">
                <button onMouseDown={stopAndDo(() => setIsLinkingModalOpen({ nodeId: node.id }))} title="Vincular Colaborador" className="p-1.5 bg-white/80 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"><LinkIcon size={12} /></button>
                <button onMouseDown={stopAndDo(() => setEditingNode({ id: node.id, title: node.title, subtitle: node.subtitle }))} title="Editar Puesto" className="p-1.5 bg-white/80 rounded-lg text-slate-400 hover:text-orange-600 transition-colors"><Edit2 size={12} /></button>
                {node.id !== 'root' && <button onMouseDown={stopAndDo(() => deleteNode(node.id))} title="Eliminar Puesto" className="p-1.5 bg-white/80 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={12} /></button>}
              </div>
            </>
          )}
          <div className="flex flex-col items-center text-center">
            <div className={`p-2.5 rounded-xl mb-3 ${iconColors[node.category]}`}><Icon size={20} /></div>
            <h4 className="font-bold text-base leading-tight">{node.title}</h4>
            <p className="text-[11px] uppercase font-bold tracking-widest opacity-50 mt-1">{node.subtitle}</p>
            {linkedEmployee ? (
              <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-white/50 rounded-full border border-gray-100 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-[10px] text-white flex items-center justify-center font-bold">{linkedEmployee.fullName[0]}</div>
                <span className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">{linkedEmployee.fullName}</span>
              </div>
            ) : <div className="mt-4 text-[10px] text-gray-400 font-medium italic">Sin asignar</div>}
            {node.descriptor && <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle2 size={10} /> Descriptor Completo</div>}
            <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-400 border-t border-gray-100/50 pt-4 w-full justify-center">
              <Users size={14} /><span className="font-medium">{node.collaborators} {node.collaborators === 1 ? 'colab' : 'colabs'}</span>
            </div>
          </div>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="flex flex-col items-center mt-12 relative">
            <div className="absolute -top-12 left-1/2 w-0.5 h-12 bg-gray-200 -translate-x-1/2" />
            {node.children.length > 1 && <div className="absolute top-0 left-[15%] right-[15%] h-0.5 bg-gray-200" />}
            <div className="flex gap-16 pt-0 relative">
              {node.children.map((child) => (
                <div key={child.id} className="relative pt-12">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gray-200" />
                  <OrgBox node={child} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const JobDescriptorWizard = ({ nodeId, onClose }: { nodeId: string; onClose: () => void }) => {
    const node = findNodeById(orgChart, nodeId);
    const parentNode = findParentNode(orgChart, nodeId);
    const [wizardStep, setWizardStep] = useState(1);
    const [isShowingSummary, setIsShowingSummary] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [descriptor, setDescriptor] = useState<JobDescriptor>(node?.descriptor || { positionName: node?.title || '', hierarchyLevel: 'Operativo', area: parentNode?.title || 'Dirección General', objective: '', activities: '', mission: '', roles: [] });
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const handleNextStep = async () => {
      if (wizardStep === 1 && !isShowingSummary) return setIsShowingSummary(true);
      if (wizardStep === 2) {
        setIsLoading(true);
        try {
          const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Actúa como un experto en diseño organizacional. Basado en el puesto "${descriptor.positionName}" en el área "${descriptor.area}" con el objetivo "${descriptor.objective}" y las siguientes actividades: "${descriptor.activities}", genera la misión del puesto siguiendo estrictamente la estructura: [Verbo en infinitivo] + [qué hace] + [para qué lo hace]. Responde solo con la misión generada en una oración concisa.` });
          setDescriptor(prev => ({ ...prev, mission: response.text || '' }));
          setWizardStep(3);
        } catch (e) { setWizardStep(3); } finally { setIsLoading(false); }
      } else if (wizardStep === 3) {
        setIsLoading(true);
        try {
          const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Analiza estas actividades de trabajo: "${descriptor.activities}". Propón de 3 a 5 ROLES clave para este puesto. Un ROL no es una actividad, es un resultado final esperado o área de responsabilidad. Responde en formato JSON: ["Nombre del Rol 1", "Nombre del Rol 2", ...]` });
          setDescriptor(prev => ({ ...prev, roles: JSON.parse(response.text?.replace(/```json|```/g, '').trim() || '[]').map((r: string) => ({ name: r, functions: [], indicators: [] })) }));
          setWizardStep(4);
        } catch (e) { setWizardStep(4); } finally { setIsLoading(false); }
      } else if (wizardStep === 4) {
        setIsLoading(true);
        try {
          const updatedRoles = [...descriptor.roles];
          for (let i = 0; i < updatedRoles.length; i++) {
             const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Para el rol "${updatedRoles[i].name}" en el puesto "${descriptor.positionName}", genera de 1 a 3 FUNCIONES principales. Responde en formato JSON: ["Función 1", "Función 2", ...]` });
             updatedRoles[i].functions = JSON.parse(response.text?.replace(/```json|```/g, '').trim() || '[]');
          }
          setDescriptor(prev => ({ ...prev, roles: updatedRoles }));
          setWizardStep(5);
        } catch (e) { setWizardStep(5); } finally { setIsLoading(false); }
      } else if (wizardStep === 5) {
        setIsLoading(true);
        try {
          const updatedRoles = [...descriptor.roles];
          for (let i = 0; i < updatedRoles.length; i++) {
             const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Para el rol "${updatedRoles[i].name}" en el puesto "${descriptor.positionName}", propón de 1 a 3 INDICADORES de desempeño medibles. Responde en formato JSON: ["Indicador 1", "Indicador 2", ...]` });
             updatedRoles[i].indicators = JSON.parse(response.text?.replace(/```json|```/g, '').trim() || '[]');
          }
          setDescriptor(prev => ({ ...prev, roles: updatedRoles }));
          setWizardStep(6);
        } catch (e) { setWizardStep(6); } finally { setIsLoading(false); }
      } else setWizardStep(prev => prev + 1);
    };

    const handleSaveDescriptor = () => {
      const updateRecursive = (n: OrgNode): OrgNode => n.id === nodeId ? { ...n, descriptor } : { ...n, children: n.children ? n.children.map(updateRecursive) : [] };
      setOrgChart(prev => updateRecursive(prev));
      onClose();
    };

    const tabs = ['General', 'Actividades', 'Misión', 'Roles', 'Funciones', 'Indicadores'];

    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-6" onMouseDown={e => e.stopPropagation()}>
        <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
          <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between shrink-0 bg-white">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Briefcase size={24} /></div>
                <div><h3 className="text-xl font-black text-slate-900 leading-tight">{descriptor.positionName || 'Configurar Puesto'}</h3><div className="flex items-center gap-2 mt-1"><span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1"><Building2 size={12} /> {descriptor.area}</span></div></div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><X size={28} /></button>
          </div>
          <div className="px-10 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-1 overflow-x-auto shrink-0">
             {tabs.map((tab, idx) => (
               <div key={tab} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${wizardStep === idx + 1 ? 'bg-white shadow-sm ring-1 ring-emerald-100' : ''}`}>
                  <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${wizardStep > idx + 1 ? 'bg-emerald-100 text-emerald-600' : wizardStep === idx + 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'}`}>{wizardStep > idx + 1 ? <Check size={12} /> : idx + 1}</div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${wizardStep >= idx + 1 ? 'text-slate-700' : 'text-slate-400'}`}>{tab}</span>
               </div>
             ))}
          </div>
          <div className="flex-1 overflow-y-auto p-12 relative">
             {isLoading && <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-[70] flex flex-col items-center justify-center animate-in fade-in"><div className="bg-white p-12 rounded-[40px] shadow-2xl flex flex-col items-center border border-slate-50"><Loader2 size={48} className="text-emerald-500 animate-spin mb-6" /><p className="text-emerald-700 font-black text-lg">IA está redactando...</p></div></div>}
             {wizardStep === 1 && (
                <div className="max-w-xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                   {isShowingSummary ? (
                    <div className="space-y-10">
                       <div className="flex gap-4 items-start mb-8"><div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><ClipboardList size={20} /></div><div><p className="text-lg font-bold text-slate-700">Resumen de Información General</p></div></div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-1"><p className="text-[10px] uppercase font-black text-slate-300 tracking-widest">Nombre</p><p className="text-lg font-bold text-slate-800">{descriptor.positionName}</p></div>
                          <div className="space-y-1"><p className="text-[10px] uppercase font-black text-slate-300 tracking-widest">Nivel</p><p className="text-lg font-bold text-slate-800">{descriptor.hierarchyLevel}</p></div>
                          <div className="space-y-1 col-span-2"><p className="text-[10px] uppercase font-black text-slate-300 tracking-widest">Área</p><p className="text-lg font-bold text-slate-800">{descriptor.area}</p></div>
                          <div className="space-y-1 col-span-2"><p className="text-[10px] uppercase font-black text-slate-300 tracking-widest">Objetivo</p><p className="text-lg font-bold text-slate-800 leading-relaxed">{descriptor.objective}</p></div>
                       </div>
                       <div className="flex justify-between items-center pt-12 border-t border-slate-50"><button onClick={() => setIsShowingSummary(false)} className="text-slate-400 font-bold">Editar</button><button onClick={() => setWizardStep(2)} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2">Confirmar <ArrowRight size={20} /></button></div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex gap-4 items-start"><div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><MessageSquare size={20} /></div><p className="text-lg font-medium text-slate-700">Datos básicos del puesto.</p></div>
                      <div className="space-y-2"><label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-4">Nombre del Puesto</label><input className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-3xl text-xl font-bold text-slate-900 outline-none" value={descriptor.positionName} onChange={e => setDescriptor(prev => ({ ...prev, positionName: e.target.value }))} /></div>
                      <div className="space-y-4"><label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-4">Nivel Jerárquico</label><div className="grid grid-cols-2 gap-3">{['Operativo', 'Táctico', 'Estratégico', 'Otro'].map(lvl => <button key={lvl} onClick={() => setDescriptor(prev => ({ ...prev, hierarchyLevel: lvl as any }))} className={`px-6 py-4 rounded-2xl border-2 font-bold text-sm ${descriptor.hierarchyLevel === lvl ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-50 bg-white text-slate-400'}`}>{lvl}</button>)}</div></div>
                      <div className="space-y-2"><label className="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-4">Objetivo</label><textarea className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent rounded-3xl text-slate-700 font-medium outline-none min-h-[140px]" value={descriptor.objective} onChange={e => setDescriptor(prev => ({ ...prev, objective: e.target.value }))} /></div>
                      <div className="flex justify-end pt-8"><button onClick={handleNextStep} disabled={!descriptor.positionName || !descriptor.objective} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 disabled:opacity-30">Siguiente <ArrowRight size={20} /></button></div>
                    </div>
                  )}
                </div>
             )}
             {wizardStep === 2 && (
               <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex gap-4 items-start"><div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><FileText size={20} /></div><p className="text-lg font-bold text-slate-700">Actividades</p></div>
                  <textarea className="w-full px-8 py-8 bg-slate-50 border-2 border-transparent rounded-[40px] text-slate-700 font-medium outline-none min-h-[300px]" value={descriptor.activities} onChange={e => setDescriptor(prev => ({ ...prev, activities: e.target.value }))} />
                  <div className="flex justify-between pt-8 border-t border-slate-50"><button onClick={() => setWizardStep(1)} className="text-slate-400 font-bold">Atrás</button><button onClick={handleNextStep} disabled={!descriptor.activities} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 disabled:opacity-30">Generar Misión <Sparkles size={20} /></button></div>
               </div>
             )}
             {wizardStep === 3 && (
               <div className="max-w-2xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex gap-4 items-start"><div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><Sparkles size={20} /></div><p className="text-lg font-bold text-slate-700">Misión Propuesta</p></div>
                  <div className="p-10 bg-emerald-50/50 border-2 border-emerald-100 rounded-[40px] shadow-sm relative group"><textarea className="w-full bg-transparent text-xl font-black text-emerald-900 leading-relaxed outline-none resize-none min-h-[160px]" value={descriptor.mission} onChange={e => setDescriptor(prev => ({ ...prev, mission: e.target.value }))} /><div className="absolute top-4 right-4 bg-white p-2 rounded-xl text-emerald-600 opacity-60"><Edit2 size={16} /></div></div>
                  <div className="flex justify-between pt-8 border-t border-slate-50"><button onClick={() => setWizardStep(2)} className="text-slate-400 font-bold">Atrás</button><button onClick={handleNextStep} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2">Continuar <ArrowRight size={20} /></button></div>
               </div>
             )}
             {wizardStep === 4 && (
               <div className="max-w-2xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex gap-4 items-start"><div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><Sparkles size={20} /></div><p className="text-lg font-bold text-slate-700">Roles Propuestos</p></div>
                  <div className="space-y-4">{descriptor.roles.map((role, idx) => (<div key={idx} className="flex items-center gap-4 p-6 bg-white border-2 border-slate-50 rounded-[32px] shadow-sm hover:border-emerald-200 transition-all group"><div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-sm">{idx + 1}</div><input className="flex-1 text-base font-bold text-slate-700 outline-none bg-transparent" value={role.name} onChange={e => { const newRoles = [...descriptor.roles]; newRoles[idx].name = e.target.value; setDescriptor(prev => ({ ...prev, roles: newRoles })); }} /><button onClick={() => setDescriptor(prev => ({ ...prev, roles: prev.roles.filter((_, i) => i !== idx) }))} className="p-2 text-slate-200 hover:text-rose-500"><Trash2 size={20} /></button></div>))}<button onClick={() => setDescriptor(prev => ({ ...prev, roles: [...prev.roles, { name: 'Nuevo Rol', functions: [], indicators: [] }] }))} className="w-full py-6 border-2 border-dashed border-slate-100 rounded-[32px] text-slate-400 font-bold hover:border-emerald-200 hover:text-emerald-500 flex items-center justify-center gap-2"><Plus size={20} /> Agregar Rol</button></div>
                  <div className="flex justify-between pt-8 border-t border-slate-50"><button onClick={() => setWizardStep(3)} className="text-slate-400 font-bold">Atrás</button><button onClick={handleNextStep} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2">Sugerir Funciones <Sparkles size={20} /></button></div>
               </div>
             )}
             {wizardStep === 5 && (
                <div className="max-w-3xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                   <div className="flex gap-4 items-start"><div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><Sparkles size={20} /></div><p className="text-lg font-bold text-slate-700">Funciones por Rol</p></div>
                   <div className="space-y-10">{descriptor.roles.map((role, rIdx) => (<div key={rIdx} className="bg-slate-50 p-10 rounded-[48px] border border-slate-100 relative shadow-inner"><div className="absolute -top-4 left-10 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">ROL: {role.name}</div><div className="space-y-4 mt-4">{role.functions.map((fn, fIdx) => (<div key={fIdx} className="flex gap-4 items-start p-5 bg-white rounded-3xl shadow-sm border border-emerald-50"><div className="mt-1.5 w-2 h-2 bg-emerald-500 rounded-full shrink-0" /><textarea className="flex-1 text-sm font-medium text-slate-600 outline-none bg-transparent resize-none h-16 leading-relaxed" value={fn} onChange={e => { const newRoles = [...descriptor.roles]; newRoles[rIdx].functions[fIdx] = e.target.value; setDescriptor(prev => ({ ...prev, roles: newRoles })); }} /></div>))}</div></div>))}</div>
                   <div className="flex justify-between pt-10 border-t border-slate-50"><button onClick={() => setWizardStep(4)} className="text-slate-400 font-bold">Atrás</button><button onClick={handleNextStep} className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2">Sugerir Indicadores <Sparkles size={20} /></button></div>
                </div>
             )}
             {wizardStep === 6 && (
                <div className="max-w-3xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                   <div className="flex gap-4 items-start"><div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0"><Sparkles size={20} /></div><p className="text-lg font-bold text-slate-700">Indicadores</p></div>
                   <div className="space-y-10">{descriptor.roles.map((role, rIdx) => (<div key={rIdx} className="bg-white p-10 rounded-[48px] border-2 border-slate-50 shadow-xl"><div className="mb-8"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ROL {rIdx + 1}</h4><p className="text-xl font-black text-slate-800">{role.name}</p></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{role.indicators.map((ind, iIdx) => (<div key={iIdx} className="p-6 bg-orange-50/40 border border-orange-100 rounded-3xl flex items-center gap-4 group hover:bg-orange-50 transition-all"><div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0"><Target size={20} /></div><input className="flex-1 text-sm font-bold text-orange-900 outline-none bg-transparent" value={ind} onChange={e => { const newRoles = [...descriptor.roles]; newRoles[rIdx].indicators[iIdx] = e.target.value; setDescriptor(prev => ({ ...prev, roles: newRoles })); }} /></div>))}</div></div>))}</div>
                   <div className="flex justify-between pt-12 border-t border-slate-50"><button onClick={() => setWizardStep(5)} className="text-slate-400 font-bold">Atrás</button><button onClick={handleSaveDescriptor} className="bg-slate-900 text-white px-12 py-5 rounded-3xl font-black shadow-2xl text-lg flex items-center gap-3">Finalizar Descriptor <CheckCircle2 size={24} /></button></div>
                </div>
             )}
          </div>
        </div>
      </div>
    );
  };

  const JobDescriptorSummary = ({ nodeId, onClose }: { nodeId: string; onClose: () => void }) => {
    const node = findNodeById(orgChart, nodeId);
    const descriptor = node?.descriptor;
    if (!descriptor) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-6" onMouseDown={e => e.stopPropagation()}>
        <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
           <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between shrink-0 bg-white"><div className="flex items-center gap-6"><div className="w-16 h-16 bg-emerald-600 text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-emerald-200"><Briefcase size={32} /></div><div><h3 className="text-2xl font-black text-slate-900 leading-tight">{descriptor.positionName}</h3><div className="flex items-center gap-3 mt-1.5"><span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full"><Building2 size={14} /> {descriptor.area}</span><span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full"><Layers size={14} /> {descriptor.hierarchyLevel}</span></div></div></div><div className="flex items-center gap-3"><button onClick={() => { setActiveDescriptorWizard({ nodeId }); onClose(); }} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all"><Edit2 size={18} /> Editar</button><button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-colors"><X size={28} /></button></div></div>
           <div className="flex-1 overflow-y-auto p-12 bg-slate-50/30"><div className="max-w-4xl mx-auto space-y-12"><section className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100"><div className="flex items-center gap-4 mb-6"><div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><Target size={20} /></div><h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Objetivo y Misión</h4></div><div className="space-y-6"><div className="space-y-2"><p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Objetivo Principal</p><p className="text-slate-600 font-medium leading-relaxed">{descriptor.objective}</p></div><div className="p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100"><p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Misión del Puesto</p><p className="text-xl font-bold text-emerald-900 leading-relaxed italic">"{descriptor.mission}"</p></div></div></section><section className="space-y-8"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><Activity size={20} /></div><h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Estructura de Roles</h4></div><div className="grid grid-cols-1 gap-6">{descriptor.roles.map((role, idx) => (<div key={idx} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-10"><div className="md:w-1/3 shrink-0"><div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Rol {idx + 1}</div><h5 className="text-xl font-black text-slate-800 mb-6">{role.name}</h5><div className="space-y-3">{role.indicators.map((ind, iIdx) => (<div key={iIdx} className="flex items-center gap-3 p-3 bg-orange-50/50 rounded-2xl border border-orange-100"><Target size={14} className="text-orange-600 shrink-0" /><span className="text-xs font-bold text-orange-900">{ind}</span></div>))}</div></div><div className="flex-1 bg-slate-50 p-8 rounded-[40px] border border-slate-100/50"><div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Funciones Específicas</div><div className="space-y-4">{role.functions.map((fn, fIdx) => (<div key={fIdx} className="flex gap-4 items-start"><div className="mt-2 w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" /><p className="text-sm text-slate-600 font-medium leading-relaxed">{fn}</p></div>))}</div></div></div>))}</div></section></div></div>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'initial-choice':
        return (
          <div className="max-w-6xl mx-auto py-16 px-6 flex flex-col items-center animate-in fade-in duration-700">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-[#111827] mb-4">¿En cuál de estas situaciones estás hoy?</h1>
              <p className="text-gray-400 text-lg">No hay respuestas correctas o incorrectas.<br/>Solo elige la que más se parezca a tu realidad.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
              <div onClick={() => setCurrentStep('recommendations')} className="bg-white rounded-[40px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 group cursor-pointer flex flex-col">
                <div className="h-64 bg-slate-50 relative flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-slate-200/20 to-transparent opacity-50" />
                   <div className="w-64 h-64 bg-orange-100/30 rounded-full blur-[80px] absolute -top-10 -right-10" />
                   <div className="w-64 h-64 bg-blue-100/20 rounded-full blur-[80px] absolute -bottom-10 -left-10" />
                   <div className="relative z-10 w-4/5 h-36 bg-white/40 backdrop-blur-xl rounded-[28px] border border-white/60 shadow-inner flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/80 rounded-2xl shadow-lg flex items-center justify-center text-orange-500"><TrendingUp size={32} /></div>
                   </div>
                </div>
                <div className="p-10 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Crear mi estructura desde cero</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-10">Diseña el organigrama de tu empresa paso a paso, sin presión y a tu ritmo.</p>
                  <button className="mt-auto text-orange-600 font-bold text-sm flex items-center gap-2 group-hover:gap-4 transition-all">Construir mi organigrama paso a paso <ArrowRight size={18} /></button>
                </div>
              </div>
              <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] hover:-translate-y-2 transition-all duration-500 group cursor-pointer flex flex-col opacity-60">
                <div className="h-64 bg-slate-50 relative flex items-center justify-center overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-slate-200/20 to-transparent opacity-50" />
                   <div className="w-64 h-64 bg-indigo-100/30 rounded-full blur-[80px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                   <div className="relative z-10 w-4/5 h-36 bg-white/40 backdrop-blur-xl rounded-[28px] border border-white/60 shadow-inner flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/80 rounded-2xl shadow-lg flex items-center justify-center text-indigo-500"><FileSpreadsheet size={32} /></div>
                   </div>
                </div>
                <div className="p-10 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Partir de una estructura existente</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-10">Ya cuentas con información de puestos y personas. Te ayudamos a convertirla en un organigrama claro y ordenado.</p>
                  <button className="mt-auto text-orange-600 font-bold text-sm flex items-center gap-2">Partir de lo que ya tengo <ArrowRight size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'recommendations':
        return (
          <div className="max-w-2xl mx-auto py-24 px-6 animate-in fade-in scale-95 duration-500">
            <div className="bg-white p-16 rounded-[48px] border border-gray-100 shadow-[0_30px_100px_rgba(0,0,0,0.08)] text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[24px] flex items-center justify-center mb-10 shadow-sm border border-indigo-100/50">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-4xl font-bold text-[#111827] mb-4">Antes de empezar...</h2>
              <p className="text-gray-400 text-base mb-12 max-w-sm font-medium">Ten en cuenta estas recomendaciones para diseñar una estructura que realmente te ayude a crecer.</p>
              <ul className="text-left space-y-8 mb-16 text-[16px] leading-relaxed max-w-md mx-auto">
                <li className="flex gap-4"><span className="text-indigo-600 font-bold mt-1 text-xl">•</span><p className="text-slate-500"><span className="font-extrabold text-slate-900">Deja el pasado atrás</span> y piensa en el futuro (6–12 meses adelante).</p></li>
                <li className="flex gap-4"><span className="text-indigo-600 font-bold mt-1 text-xl">•</span><p className="text-slate-500">Diseña la estructura que la empresa necesita, <span className="font-extrabold text-slate-900">no los puestos según las personas actuales.</span></p></li>
                <li className="flex gap-4"><span className="text-indigo-600 font-bold mt-1 text-xl">•</span><p className="text-slate-500">Iniciaremos con la estructura de la <span className="font-extrabold text-slate-900">primera línea (equipo de liderazgo).</span></p></li>
                <li className="flex gap-4"><span className="text-indigo-600 font-bold mt-1 text-xl">•</span><p className="text-slate-500"><span className="font-extrabold text-slate-900">La estructura correcta viene primero;</span> las personas vienen después.</p></li>
              </ul>
              <button onClick={() => setCurrentStep('base-functions')} className="bg-[#111827] text-white px-14 py-4.5 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl text-lg">Continuar <ArrowRight size={20} /></button>
            </div>
          </div>
        );

      case 'base-functions':
        return (
          <div className="max-w-5xl mx-auto py-24 px-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-bold text-[#111827] text-center mb-16">Toda empresa saludable tiene 3 grandes funciones</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-16 max-w-6xl">
              <div className="bg-white p-12 rounded-[40px] border border-gray-50 shadow-[0_15px_40px_rgba(0,0,0,0.03)] text-center flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-[24px] flex items-center justify-center mb-8 shadow-sm border border-blue-100/50"><TrendingUp size={36} /></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Comercial</h3>
                <p className="text-gray-400 text-base leading-relaxed px-2 font-medium">Genera demanda, clientes e ingresos</p>
              </div>
              <div className="bg-white p-12 rounded-[40px] border border-gray-50 shadow-[0_15px_40px_rgba(0,0,0,0.03)] text-center flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-[24px] flex items-center justify-center mb-8 shadow-sm border border-orange-100/50"><Wrench size={36} /></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Operaciones</h3>
                <p className="text-gray-400 text-base leading-relaxed px-2 font-medium">Entrega el producto o servicio</p>
              </div>
              <div className="bg-white p-12 rounded-[40px] border border-gray-50 shadow-[0_15px_40px_rgba(0,0,0,0.03)] text-center flex flex-col items-center hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[24px] flex items-center justify-center mb-8 shadow-sm border border-emerald-100/50"><Calculator size={36} /></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Administración</h3>
                <p className="text-gray-400 text-base leading-relaxed px-2 font-medium">Controla recursos y asegura continuidad</p>
              </div>
            </div>
            <div className="text-center mb-16 text-slate-500 text-lg max-w-xl font-medium"><p>Esta será la base de tu estructura.</p><p>Definirlas bien es el primer paso para escalar con orden.</p></div>
            <button onClick={() => setCurrentStep('comercial-selection')} className="bg-[#111827] text-white px-20 py-5 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl text-xl">Iniciar <ArrowRight size={22} /></button>
          </div>
        );

      case 'comercial-selection': return (<div className="max-w-3xl mx-auto py-12 px-6 animate-in slide-in-from-right-4 duration-500"><h2 className="text-3xl font-bold text-[#111827] text-center mb-10">Estructura Comercial</h2><div className="space-y-4"><SelectionCard category="comercial" id="marketing-ventas-separados" title="Liderazgos Separados" subtitle="Gerente de Marketing y Gerente de Ventas independientes" selected={selections.comercial === 'marketing-ventas-separados'} onSelect={(v: any) => setSelections(s => ({ ...s, comercial: v }))}/><SelectionCard category="comercial" id="unificada" title="Gerencia Unificada" subtitle="Una sola cabeza para toda el área comercial" selected={selections.comercial === 'unificada'} onSelect={(v: any) => setSelections(s => ({ ...s, comercial: v }))}/></div><div className="mt-12 flex justify-center"><button disabled={!selections.comercial} onClick={() => setCurrentStep('ops-selection')} className="bg-blue-600 text-white px-12 py-3 rounded-xl font-bold disabled:opacity-30 transition-all">Continuar</button></div></div>);
      case 'ops-selection': return (<div className="max-w-3xl mx-auto py-12 px-6 animate-in slide-in-from-right-4 duration-500"><h2 className="text-3xl font-bold text-[#111827] text-center mb-10">Estructura de Operaciones</h2><div className="space-y-4"><SelectionCard category="ops" id="logistica-separada" title="Operaciones y Logística separadas" subtitle="Divisiones independientes para producción y distribución" selected={selections.ops === 'logistica-separada'} onSelect={(v: any) => setSelections(s => ({ ...s, ops: v }))}/><SelectionCard category="ops" id="unificada" title="Gerencia de Operaciones Integral" subtitle="Control centralizado de toda la cadena" selected={selections.ops === 'unificada'} onSelect={(v: any) => setSelections(s => ({ ...s, ops: v }))}/></div><div className="mt-12 flex justify-center"><button disabled={!selections.ops} onClick={() => setCurrentStep('admin-selection')} className="bg-blue-600 text-white px-12 py-3 rounded-xl font-bold disabled:opacity-30 transition-all">Continuar</button></div></div>);
      case 'admin-selection': return (<div className="max-w-3xl mx-auto py-12 px-6 animate-in slide-in-from-right-4 duration-500"><h2 className="text-3xl font-bold text-[#111827] text-center mb-10">Estructura Administrativa</h2><div className="space-y-4"><SelectionCard category="admin" id="admin-finanzas-rrhh" title="Admin/Finanzas y RRHH separados" subtitle="Divisiones independientes para control y talento" selected={selections.admin === 'admin-finanzas-rrhh'} onSelect={(v: any) => setSelections(s => ({ ...s, admin: v }))}/><SelectionCard category="admin" id="unificada" title="Gerencia Administrativa Central" subtitle="Talento y Finanzas bajo una misma cabeza" selected={selections.admin === 'unificada'} onSelect={(v: any) => setSelections(s => ({ ...s, admin: v }))}/></div><div className="mt-12 flex justify-center"><button disabled={!selections.admin} onClick={generateInitialChart} className="bg-blue-600 text-white px-12 py-3 rounded-xl font-bold disabled:opacity-30 transition-all">Finalizar Wizard</button></div></div>);
      case 'org-chart-result': return (
          <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-gray-100 shadow-xl flex gap-1 pointer-events-auto">
              <button onClick={() => setActiveTab('chart')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'chart' ? 'bg-[#111827] text-white' : 'text-gray-400 hover:text-gray-900'}`}><Maximize2 size={14} /> Organigrama</button>
              <button onClick={() => setActiveTab('collaborators')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'collaborators' ? 'bg-[#111827] text-white' : 'text-gray-400 hover:text-gray-900'}`}><Users size={14} /> Colaboradores</button>
            </div>
            {activeTab === 'chart' ? (
              <>
                <div className="absolute top-8 left-8 z-30 pointer-events-none"><div className="pointer-events-auto bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-xl"><h2 className="text-2xl font-black text-gray-900 leading-none">Organigrama</h2><p className="text-sm text-gray-400 mt-2 font-medium flex items-center gap-2"><Building2 size={14} className="text-orange-500" />Estructura de {company.name}</p></div></div>
                <div className="absolute top-8 right-8 flex items-center gap-3 z-30 pointer-events-none"><div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100 shadow-xl flex gap-1 pointer-events-auto"><button onClick={() => setIsEditorMode(false)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${!isEditorMode ? 'bg-[#111827] text-white' : 'text-gray-400 hover:text-gray-900'}`}><Maximize2 size={14} /> Vista Previa</button><button onClick={() => setIsEditorMode(true)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isEditorMode ? 'bg-[#111827] text-white' : 'text-gray-400 hover:text-gray-900'}`}><Edit2 size={14} /> Modo Editor</button></div><button onClick={() => setIsExportModalOpen(true)} className="pointer-events-auto bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-gray-100 shadow-xl text-gray-600 hover:text-orange-600 transition-colors"><Download size={20} /></button></div>
                <div ref={containerRef} className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={handleWheel} style={{ backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}>
                  <div className="absolute origin-center transition-transform" style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, left: '50%', top: '50%', marginTop: '-200px', marginLeft: '-120px' }}><OrgBox node={orgChart} /></div>
                </div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30"><div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-gray-100 shadow-2xl flex items-center gap-2"><button onClick={zoomOut} className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-400"><ZoomOut size={18} /></button><span className="text-xs font-bold text-gray-900 w-12 text-center">{Math.round(transform.scale * 100)}%</span><button onClick={zoomIn} className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-400"><ZoomIn size={18} /></button><button onClick={resetView} className="ml-2 p-2.5 hover:bg-gray-50 rounded-xl text-gray-400"><RotateCcw size={18} /></button></div></div>
              </>
            ) : (<div className="flex-1 bg-white p-12 overflow-y-auto mt-20 animate-in fade-in duration-300"><div className="max-w-6xl mx-auto"><div className="flex items-center justify-between mb-8"><div><h2 className="text-3xl font-black text-slate-900">Colaboradores</h2><p className="text-sm text-slate-500">Gestiona la vinculación de personal.</p></div><div className="flex gap-3"><button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-all"><FileSpreadsheet size={18} /> Descargar Plantilla</button><button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all"><UserPlus size={18} /> Nuevo Colaborador</button></div></div><div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm"><table className="w-full text-left"><thead className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-widest border-b border-slate-100"><tr><th className="px-8 py-5">Colaborador</th><th className="px-8 py-5">ID Sistema</th><th className="px-8 py-5">Área / Puesto</th><th className="px-8 py-5">Supervisor</th><th className="px-8 py-5">Estado</th><th className="px-8 py-5"></th></tr></thead><tbody className="divide-y divide-slate-50">{employees.map(emp => (<tr key={emp.id} className="hover:bg-slate-50/50 transition-colors"><td className="px-8 py-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">{emp.fullName[0]}</div><div><p className="text-sm font-bold text-slate-900">{emp.fullName}</p><p className="text-xs text-slate-400">{emp.email}</p></div></div></td><td className="px-8 py-5 text-sm font-mono text-slate-400">{emp.id}</td><td className="px-8 py-5 text-sm"><p className="font-bold text-slate-700">{emp.position}</p><p className="text-[10px] uppercase text-orange-500 font-bold">{emp.area}</p></td><td className="px-8 py-5 text-sm text-slate-600 font-medium">{emp.supervisor}</td><td className="px-8 py-5"><span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">Activo</span></td><td className="px-8 py-5 text-right"><button className="p-2 text-slate-300 hover:text-slate-900 rounded-lg transition-colors"><Edit2 size={16} /></button></td></tr>))}</tbody></table></div></div></div>)}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC]">
       {currentStep !== 'org-chart-result' && (
         <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
            <div className="flex items-center gap-4"><button onClick={() => onBack()} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors"><ArrowLeft size={18} /></button><div className="flex flex-col"><span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Altittus</span><span className="text-sm font-bold text-gray-900">Diseño Organizacional</span></div></div>
         </div>
       )}
       <div className="flex-1 flex flex-col">{renderStep()}</div>
       {isExportModalOpen && (<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"><div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onMouseDown={e => e.stopPropagation()}><div className="p-8 border-b border-gray-50 flex items-center justify-between"><h3 className="font-black text-slate-900 text-xl">Exportar a Excel</h3><button onClick={() => setIsExportModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><X size={24} /></button></div><div className="p-8"><p className="text-sm text-slate-500 mb-6 font-medium text-center">Selecciona los campos para tu plantilla:</p><div className="grid grid-cols-2 gap-3">{EXCEL_FIELDS.map(field => (<label key={field.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${selectedExportFields.includes(field.id) ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}><input type="checkbox" className="hidden" checked={selectedExportFields.includes(field.id)} onChange={() => setSelectedExportFields(prev => prev.includes(field.id) ? prev.filter(f => f !== field.id) : [...prev, field.id])} />{selectedExportFields.includes(field.id) ? <CheckCircle2 size={18} className="text-blue-600" /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-200" />}<span className="text-xs font-bold">{field.label}</span></label>))}</div></div><div className="p-8 bg-slate-50 flex gap-4"><button onClick={() => setIsExportModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-slate-400">Cancelar</button><button className="flex-1 bg-blue-600 text-white py-4 rounded-2xl text-sm font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"><FileSpreadsheet size={18} /> Descargar Plantilla</button></div></div></div>)}
       {isLinkingModalOpen && (<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4"><div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onMouseDown={e => e.stopPropagation()}><div className="p-8 border-b border-gray-50 flex items-center justify-between"><h3 className="font-black text-slate-900 text-xl">Vincular Colaborador</h3><button onClick={() => setIsLinkingModalOpen(null)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><X size={24} /></button></div><div className="p-8 space-y-4 max-h-[400px] overflow-y-auto">{employees.map(emp => (<div key={emp.id} onClick={() => handleLinkEmployee(isLinkingModalOpen.nodeId, emp.id)} className="p-4 rounded-2xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">{emp.fullName[0]}</div><div><p className="text-sm font-bold text-slate-900">{emp.fullName}</p><p className="text-[10px] text-slate-500 font-mono uppercase">{emp.id}</p></div><div className="ml-auto"><Plus size={16} className="text-slate-300" /></div></div>))}</div></div></div>)}
       {isDescriptorChoiceOpen && (<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4" onMouseDown={e => e.stopPropagation()}><div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col p-12 animate-in zoom-in-95 duration-200"><div className="flex justify-between items-center mb-10"><div><h3 className="text-3xl font-black text-slate-900">Descriptor de Puesto</h3><p className="text-slate-400 text-sm mt-1">Elige cómo quieres empezar a documentar esta posición.</p></div><button onClick={() => setIsDescriptorChoiceOpen(null)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><X size={28} /></button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div onClick={() => { setActiveDescriptorWizard({ nodeId: isDescriptorChoiceOpen }); setIsDescriptorChoiceOpen(null); }} className="bg-white border-2 border-slate-100 p-10 rounded-[40px] hover:border-emerald-500 hover:bg-emerald-50/20 transition-all cursor-pointer group shadow-sm hover:shadow-xl hover:-translate-y-1"><div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"><Briefcase size={32} /></div><h4 className="text-xl font-black text-slate-900 mb-3">Crear puesto desde 0</h4><p className="text-sm text-slate-500 leading-relaxed">Ejercicio guiado paso a paso para definir la estructura ideal del puesto.</p><button className="mt-10 flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-widest transition-all">Empezar Ejercicio <ArrowRight size={18} /></button></div><div className="bg-slate-50/50 border-2 border-slate-50 p-10 rounded-[40px] opacity-50 cursor-not-allowed"><div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-3xl flex items-center justify-center mb-8"><FileSpreadsheet size={32} /></div><h4 className="text-xl font-black text-slate-300 mb-3">Carga vía Archivo</h4><p className="text-sm text-slate-300 leading-relaxed">Importa un descriptor existente (Próximamente).</p></div></div></div></div>)}
       {isDescriptorSummaryOpen && <JobDescriptorSummary nodeId={isDescriptorSummaryOpen} onClose={() => setIsDescriptorSummaryOpen(null)} />}
       {activeDescriptorWizard && <JobDescriptorWizard nodeId={activeDescriptorWizard.nodeId} onClose={() => setActiveDescriptorWizard(null)} />}
       {editingNode && (<div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4" onMouseDown={e => e.stopPropagation()}><div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"><div className="p-8 border-b border-gray-100 flex items-center justify-between"><h3 className="font-bold text-slate-800">Editar Puesto</h3><button onClick={() => setEditingNode(null)} className="p-2 hover:bg-gray-100 rounded-xl text-slate-400"><X size={18} /></button></div><div className="p-8 space-y-4"><div><label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Título</label><input className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold" value={editingNode.title} onChange={(e) => setEditingNode({ ...editingNode, title: e.target.value })} autoFocus /></div><div><label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Cargo</label><input className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none" value={editingNode.subtitle} onChange={(e) => setEditingNode({ ...editingNode, subtitle: e.target.value })} /></div></div><div className="p-8 bg-slate-50 flex gap-2"><button onClick={() => setEditingNode(null)} className="flex-1 py-3 text-sm font-bold text-slate-500">Cancelar</button><button onClick={saveEdit} className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 transition-all"><Save size={16} /> Guardar</button></div></div></div>)}
    </div>
  );
};

export default OrganizationalDesignView;
