import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../store';
import { 
  Users, UserCheck, BookOpen, FileText, CheckSquare, 
  Sparkles, Plus, Check, Play, Terminal, ArrowUpRight, 
  Briefcase, Heart, Send, Award, TrendingUp, AlertTriangle, 
  Linkedin, Shield, CheckCircle2, ChevronRight, CheckSquare as CheckIcon, Clock, Bell,
  Edit, Camera, Mail, Phone, Instagram, X, MessageCircle,
  Video, ExternalLink, Share2, Copy, Trash2, Maximize2, VideoOff, Info, Edit3, Save, Tag, Calendar
} from 'lucide-react';
import { cn } from '../../lib/utils';

export function EspacosModule() {
  const { data, updateModuleData } = useStore();
  const pessoas = data.pessoas || [];
  const tarefas = data.tarefas_suporte || [];
  const materiais = data.materiais || [];
  const perfis = data.perfis || [];

  // Local states
  const [activeSubTab, setActiveSubTab] = useState<'liana' | 'ana' | 'nuria' | 'luiza'>('liana');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  
  // Auto-seed profiles dynamically if empty
  useEffect(() => {
    if (perfis.length === 0) {
      const initialPerfis = [
        {
          id: 'liana',
          nome: 'Liana Gomes',
          cargo: 'Fundadora & Diretora Geral',
          foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300',
          perfil: 'Advogada especialista em Compliance de Gênero, Combate ao Assédio Corporativo e Desenvolvimento de Mulheres Líderes.',
          linkedin: 'liana-gomes-compliance',
          instagram: 'lianagomes.ilg',
          email: 'liana@institutolianagomes.com.br',
          telefone: '11 99999-5555'
        },
        {
          id: 'ana',
          nome: 'Ana',
          cargo: 'Head de Negócios & Comercial',
          foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300&h=300',
          perfil: 'Responsável pelo gerenciamento do CRM do Instituto, conversão de novos leads quentes, negociações de combos corporativos e faturamento inicial.',
          linkedin: 'ana-ilg-comercial',
          instagram: 'ana.comercial',
          email: 'comercial@institutolianagomes.com.br',
          telefone: '11 98888-4444'
        },
        {
          id: 'nuria',
          nome: 'Núria',
          cargo: 'Client Success, Mídias & Operação',
          foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300',
          perfil: 'Supervisora de Onboarding de novas alunas. Responsável por liberar acessos ao Nutror, alimentar o MRP Tracker, além de coordenar pautas de mídia e Instagram.',
          linkedin: 'nuria-ilg-suporte',
          instagram: 'nuria.suporte',
          email: 'nuria@institutolianagomes.com.br',
          telefone: '11 97777-3333'
        },
        {
          id: 'luiza',
          nome: 'Luiza',
          cargo: 'Tech Lead / Administradora',
          foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300',
          perfil: 'Arquiteta de software e mantendedora deste Portal Integrado. Gerencia as integrações de banco de dados, regras e logs operacionais.',
          linkedin: 'luiza-ft',
          instagram: 'luiza.tech',
          email: 'luizaftessele@gmail.com',
          telefone: '11 96666-2222'
        }
      ];
      updateModuleData('perfis', initialPerfis);
    }
  }, [perfis, updateModuleData]);

  // Determine active profile detail with immediate fallback representation
  const activeProfile = useMemo(() => {
    const found = perfis.find((p: any) => p.id === activeSubTab);
    if (found) return found;

    // Hardcode fallback representation if Firestore didn't populate yet
    const fallbacks = {
      liana: {
        id: 'liana',
        nome: 'Liana Gomes',
        cargo: 'Fundadora & Diretora Geral',
        foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300',
        perfil: 'Advogada especialista em Compliance de Gênero, Combate ao Assédio Corporativo e Desenvolvimento de Mulheres Líderes.',
        linkedin: 'liana-gomes-compliance',
        instagram: 'lianagomes.ilg',
        email: 'liana@institutolianagomes.com.br',
        telefone: '11 99999-5555'
      },
      ana: {
        id: 'ana',
        nome: 'Ana',
        cargo: 'Head de Negócios & Comercial',
        foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300&h=300',
        perfil: 'Responsável pelo gerenciamento do CRM do Instituto, conversão de novos leads quentes, negociações de combos corporativos e faturamento inicial.',
        linkedin: 'ana-ilg-comercial',
        instagram: 'ana.comercial',
        email: 'comercial@institutolianagomes.com.br',
        telefone: '11 98888-4444'
      },
      nuria: {
        id: 'nuria',
        nome: 'Núria',
        cargo: 'Client Success, Mídias & Operação',
        foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300',
        perfil: 'Supervisora de Onboarding de novas alunas. Responsável por liberar acessos ao Nutror, alimentar o MRP Tracker, além de coordenar pautas de mídia e Instagram.',
        linkedin: 'nuria-ilg-suporte',
        instagram: 'nuria.suporte',
        email: 'nuria@institutolianagomes.com.br',
        telefone: '11 97777-3333'
      },
      luiza: {
        id: 'luiza',
        nome: 'Luiza',
        cargo: 'Tech Lead / Administradora',
        foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300',
        perfil: 'Arquiteta de software e mantenedora deste Portal Integrado. Gerencia as integrações de banco de dados, regras e logs operacionais.',
        linkedin: 'luiza-ft',
        instagram: 'luiza.tech',
        email: 'luizaftessele@gmail.com',
        telefone: '11 96666-2222'
      }
    };
    return fallbacks[activeSubTab];
  }, [perfis, activeSubTab]);

  // Terminal developer simulator for Luiza
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'System initialization successful.',
    'Ready. Active Firestore rules deployed securely.',
    'Authorized user session: luizaftessele@gmail.com'
  ]);
  const [systemScanning, setSystemScanning] = useState(false);

  // Forms states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskResp, setNewTaskResp] = useState('Ana');
  const [newTaskPrio, setNewTaskPrio] = useState('alta');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('comercial');

  const [newInstagramIdea, setNewInstagramIdea] = useState('');
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialLink, setNewMaterialLink] = useState('');
  const [newMaterialCat, setNewMaterialCat] = useState('ebook');

  // LinkedIn Planner state
  const [newLinkedinTitle, setNewLinkedinTitle] = useState('');
  const [newLinkedinContent, setNewLinkedinContent] = useState('');
  const [newLinkedinDate, setNewLinkedinDate] = useState('');
  const [newLinkedinTheme, setNewLinkedinTheme] = useState('');
  const [linkedinView, setLinkedinView] = useState<'editor' | 'grade'>('editor');

  const [editingLinkedinId, setEditingLinkedinId] = useState<string | null>(null);
  const [editingLinkedinTitle, setEditingLinkedinTitle] = useState('');
  const [editingLinkedinContent, setEditingLinkedinContent] = useState('');
  const [editingLinkedinDate, setEditingLinkedinDate] = useState('');
  const [editingLinkedinTheme, setEditingLinkedinTheme] = useState('');

  // Virtual meetings (Jitsi Meet) integration states
  const [jitsiMeetings, setJitsiMeetings] = useState<any[]>([]);
  const [newMeetingTopic, setNewMeetingTopic] = useState('');
  const [newMeetingType, setNewMeetingType] = useState('Grupo');
  const [newMeetingHost, setNewMeetingHost] = useState('Liana Gomes');
  const [activeIframeMeeting, setActiveIframeMeeting] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ilg_jitsi_meetings');
    if (saved) {
      try {
        setJitsiMeetings(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading meetings', e);
      }
    } else {
      const initial = [
        {
          id: 'meet_1',
          tema: 'Reunião de Alinhamento Geral ILG',
          anfitria: 'Liana Gomes',
          tipo: 'Grupo',
          salaId: 'ilg-reuniao-equipe-semanal',
          dataCriacao: new Date().toLocaleDateString('pt-BR')
        },
        {
          id: 'meet_2',
          tema: 'Espaço Mentoria de Liana (1-on-1)',
          anfitria: 'Liana Gomes',
          tipo: 'Individual',
          salaId: 'ilg-atendimento-liana-gomes',
          dataCriacao: new Date().toLocaleDateString('pt-BR')
        }
      ];
      localStorage.setItem('ilg_jitsi_meetings', JSON.stringify(initial));
      setJitsiMeetings(initial);
    }
  }, []);

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingTopic.trim()) return;

    const cleanTopic = newMeetingTopic
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const uniqueId = Math.random().toString(36).substring(2, 6);
    const roomSlug = `ilg-meet-${cleanTopic || 'reuniao'}-${uniqueId}`;

    const newMeet = {
      id: 'meet_' + Date.now(),
      tema: newMeetingTopic,
      anfitria: newMeetingHost,
      tipo: newMeetingType,
      salaId: roomSlug,
      dataCriacao: new Date().toLocaleDateString('pt-BR')
    };

    const updated = [newMeet, ...jitsiMeetings];
    setJitsiMeetings(updated);
    localStorage.setItem('ilg_jitsi_meetings', JSON.stringify(updated));
    setNewMeetingTopic('');
    alert(`Sala de reunião "${newMeetingTopic}" gerada com sucesso! Você pode iniciar por aqui, usar o iframe integrado ou copiar o link de convite para os convidados.`);
  };

  const handleDeleteMeeting = (id: string) => {
    if (confirm(`Deseja mesmo remover a sala "${jitsiMeetings.find(m => m.id === id)?.tema}" do histórico?`)) {
      const filtered = jitsiMeetings.filter(m => m.id !== id);
      setJitsiMeetings(filtered);
      localStorage.setItem('ilg_jitsi_meetings', JSON.stringify(filtered));
      if (activeIframeMeeting && activeIframeMeeting.id === id) {
        setActiveIframeMeeting(null);
      }
    }
  };

  const handleCopyLink = (text: string, meetId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(meetId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Interactive logs trigger for Luiza
  const triggerSystemScan = () => {
    setSystemScanning(true);
    setTerminalLogs(prev => [...prev, 'Starting health diagnostics...']);
    setTimeout(() => {
      setTerminalLogs(prev => [
        ...prev,
        'Checking memory state leaks... NONE.',
        'Analyzing Firestore latency: 120ms (EXCELLENT).',
        `Querying ${pessoas.length} people documents and ${tarefas.length} task documents...`,
        'All client routes matched. Sandbox execution clean.',
        'Optimization: complete. Build green.'
      ]);
      setSystemScanning(false);
    }, 2000);
  };

  // Global delegate action for Liana
  const handleDelegateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: 'ts_' + Date.now(),
      titulo: newTaskTitle,
      responsavel: newTaskResp,
      prioridade: newTaskPrio,
      descricao: newTaskDesc,
      categoria: newTaskCategory,
      tipo: 'tarefa',
      status: 'a fazer',
      prazo: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // default 2 days
    };

    const updated = [...tarefas, newTask];
    await updateModuleData('tarefas_suporte', updated);
    
    // reset form
    setNewTaskTitle('');
    setNewTaskDesc('');
    alert('Nova tarefa delegada com sucesso à equipe e sincronizada no Firebase!');
  };

  // Quick Action: Settle/Complete a Task
  const handleCompleteTask = async (taskId: string) => {
    const updated = tarefas.map(t => {
      if (t.id === taskId) {
        return { ...t, status: 'concluído' };
      }
      return t;
    });
    await updateModuleData('tarefas_suporte', updated);
  };

  // Quick Action: Onboarding step toggle for Nuria
  const handleToggleOnboarding = async (pessoaId: string, field: 'entrouGrupo' | 'respondeuInicial' | 'acessoNutror' | 'acessoMRP') => {
    const updated = pessoas.map(p => {
      if (p.id === pessoaId) {
        const nextVal = !p[field];
        // If all onboarding tasks completed, maybe change status
        let nextStatus = p.status || 'novo';
        if (field === 'entrouGrupo' && nextVal && p.respondeuInicial && p.acessoNutror && p.acessoMRP) {
          nextStatus = 'concluido';
        }
        return { ...p, [field]: nextVal, status: nextStatus };
      }
      return p;
    });
    await updateModuleData('pessoas', updated);
  };

  // Quick Action: Transform Lead into Student for Ana
  const handleTransformLead = async (pessoaId: string) => {
    const updated = pessoas.map(p => {
      if (p.id === pessoaId) {
        return { 
          ...p, 
          tipoPessoa: 'aluna', 
          status: 'em onboarding',
          produtoComprado: p.produtoInteresse || 'TREINAMENTO ASSÉDIO / COMBO',
          turma: 'Turma Nova',
          entrouGrupo: false,
          respondeuInicial: false,
          acessoNutror: false,
          acessoMRP: false
        };
      }
      return p;
    });
    await updateModuleData('pessoas', updated);
    alert('Parabéns! Lead convertido em Aluna com sucesso. A ficha agora está na fila de onboarding da Núria!');
  };

  // Add new Instagram Idea
  const handleAddInstagramIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstagramIdea.trim()) return;

    const newTask = {
      id: 'ts_insta_' + Date.now(),
      titulo: `Instagram: ${newInstagramIdea}`,
      responsavel: 'Núria',
      prioridade: 'média',
      categoria: 'instagram',
      tipo: 'tarefa',
      status: 'a fazer'
    };

    const updated = [...tarefas, newTask];
    await updateModuleData('tarefas_suporte', updated);
    setNewInstagramIdea('');
  };

  // Create didactic material instantly
  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialName.trim()) return;

    const newMat = {
      id: 'mat_' + Date.now(),
      nome: newMaterialName,
      link: newMaterialLink || 'https://drive.google.com',
      categoria: newMaterialCat,
      responsavel: 'Núria',
      status: 'concorrido'
    };

    const updated = [...materiais, newMat];
    await updateModuleData('materiais', updated);
    
    setNewMaterialName('');
    setNewMaterialLink('');
    alert('Material didático cadastrado e disponibilizado para o time!');
  };

  // Create LinkedIn post
  const handleAddLinkedinPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkedinTitle.trim()) return;

    const newTask = {
      id: 'lnkd_' + Date.now(),
      titulo: newLinkedinTitle,
      descricao: newLinkedinContent,
      prazo: newLinkedinDate || new Date().toISOString().split('T')[0],
      tema: newLinkedinTheme || 'Geral',
      responsavel: 'Luiza',
      prioridade: 'média',
      categoria: 'linkedin_post',
      tipo: 'tarefa',
      status: 'Aguardando Liana'
    };

    const updated = [newTask, ...tarefas];
    await updateModuleData('tarefas_suporte', updated);
    
    setNewLinkedinTitle('');
    setNewLinkedinContent('');
    setNewLinkedinDate('');
    setNewLinkedinTheme('');
  };

  const handleSaveLinkedinEdit = async () => {
    if (!editingLinkedinTitle.trim()) return;
    const updated = tarefas.map(t => t.id === editingLinkedinId ? {
      ...t,
      titulo: editingLinkedinTitle,
      descricao: editingLinkedinContent,
      prazo: editingLinkedinDate,
      tema: editingLinkedinTheme
    } : t);
    await updateModuleData('tarefas_suporte', updated);
    setEditingLinkedinId(null);
  };

  // Change LinkedIn Status
  const handleUpdateLinkedinStatus = async (id: string, novoStatus: string) => {
    const updated = tarefas.map(t => t.id === id ? { ...t, status: novoStatus } : t);
    await updateModuleData('tarefas_suporte', updated);
  };

  // Calculations for dashboards
  const activeLeads = useMemo(() => pessoas.filter(p => p.tipoPessoa === 'lead'), [pessoas]);
  const hotLeads = useMemo(() => activeLeads.filter(l => l.temperatura === 'quente'), [activeLeads]);
  
  const incompleteOnboardings = useMemo(() => {
    return pessoas.filter(p => p.tipoPessoa === 'aluna' && (!p.entrouGrupo || !p.respondeuInicial || !p.acessoNutror || !p.acessoMRP));
  }, [pessoas]);

  return (
    <div className="flex flex-col min-h-full space-y-6 pb-12">
      
      {/* Module Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#0A192F] tracking-tight flex items-center gap-2">
          <Briefcase className="w-8 h-8 text-[#D4AF37]" /> Espaços de Trabalho
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Painéis integrados e de uso prático para a gestão de lógicas individuais de cada colaborador e diretora.
        </p>
      </div>

      {/* Tabs Header - Modern Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* Liana */}
        <button
          onClick={() => setActiveSubTab('liana')}
          className={cn(
            "p-4 rounded-xl border text-left transition-all relative overflow-hidden group",
            activeSubTab === 'liana'
              ? "bg-[#0A192F] border-[#D4AF37] text-white shadow-md shadow-[#D4AF37]/10"
              : "bg-white border-slate-200 text-slate-700 hover:border-[#0A192F]/30 hover:bg-slate-50"
          )}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="p-1.5 bg-yellow-500/10 rounded-lg text-amber-500">
              <Award className="w-5 h-5" />
            </span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-[#D4AF37]/25 text-[#D4AF37] px-2 py-0.5 rounded-full">Direção</span>
          </div>
          <h3 className="font-bold text-sm">Liana Gomes</h3>
          <p className="text-xs text-slate-400 mt-1 truncate">Cockpit Geral & Delegação</p>
        </button>

        {/* Ana */}
        <button
          onClick={() => setActiveSubTab('ana')}
          className={cn(
            "p-4 rounded-xl border text-left transition-all relative overflow-hidden group",
            activeSubTab === 'ana'
              ? "bg-[#0A192F] border-orange-500 text-white shadow-md"
              : "bg-white border-slate-200 text-slate-700 hover:border-orange-200 hover:bg-slate-50"
          )}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="p-1.5 bg-orange-500/10 rounded-lg text-orange-500">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">CRM</span>
          </div>
          <h3 className="font-bold text-sm">Ana</h3>
          <p className="text-xs text-slate-400 mt-1 truncate">Jornada Comercial</p>
        </button>

        {/* Núria */}
        <button
          onClick={() => setActiveSubTab('nuria')}
          className={cn(
            "p-4 rounded-xl border text-left transition-all relative overflow-hidden group",
            activeSubTab === 'nuria'
              ? "bg-[#0A192F] border-emerald-500 text-white shadow-md"
              : "bg-white border-slate-200 text-slate-700 hover:border-emerald-200 hover:bg-slate-50"
          )}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500">
              <Heart className="w-5 h-5" />
            </span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">CS / Ops</span>
          </div>
          <h3 className="font-bold text-sm">Núria</h3>
          <p className="text-xs text-slate-400 mt-1 truncate">Alunos, Mídia & Materiais</p>
        </button>

        {/* Luiza */}
        <button
          onClick={() => setActiveSubTab('luiza')}
          className={cn(
            "p-4 rounded-xl border text-left transition-all relative overflow-hidden group",
            activeSubTab === 'luiza'
              ? "bg-[#0A192F] border-indigo-500 text-white shadow-md"
              : "bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-slate-50"
          )}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-500">
              <Terminal className="w-5 h-5" />
            </span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Tech</span>
          </div>
          <h3 className="font-bold text-sm">Luiza</h3>
          <p className="text-xs text-slate-400 mt-1 truncate">Software Backlog & LinkedIn</p>
        </button>

      </div>

      {/* ======================================================== */}
      {/* COLLABORATOR PROFILE HEADER & BIO PORTRAIT CARD          */}
      {/* ======================================================== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden relative animate-in fade-in duration-300">
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500",
          activeSubTab === 'liana' && "bg-[#D4AF37]",
          activeSubTab === 'ana' && "bg-orange-500",
          activeSubTab === 'nuria' && "bg-emerald-500",
          activeSubTab === 'luiza' && "bg-indigo-500"
        )} />
        
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-1 text-center sm:text-left">
            
            {/* Avatar container with interactive ring */}
            <div className={cn(
              "relative w-24 h-24 rounded-full p-1 border-2 transition-transform hover:scale-105 shadow-md flex-shrink-0 bg-white",
              activeSubTab === 'liana' && "border-[#D4AF37]/60",
              activeSubTab === 'ana' && "border-orange-500/60",
              activeSubTab === 'nuria' && "border-emerald-500/60",
              activeSubTab === 'luiza' && "border-indigo-500/60"
            )}>
              <img 
                src={activeProfile.foto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300'} 
                alt={activeProfile.nome}
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover"
              />
              <button 
                onClick={() => setIsEditProfileOpen(true)}
                className="absolute bottom-0 right-0 p-1.5 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] rounded-full transition-all shadow-md"
                title="Alterar Foto e Bio"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile Data */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-2xl font-bold text-[#0A192F] tracking-tight">{activeProfile.nome}</h2>
                <span className={cn(
                  "px-2.5 py-0.5 text-xs font-bold rounded-full w-fit mx-auto sm:mx-0 uppercase",
                  activeSubTab === 'liana' && "bg-[#D4AF37]/10 text-amber-700 border border-[#D4AF37]/30",
                  activeSubTab === 'ana' && "bg-orange-50 text-orange-700 border border-orange-200",
                  activeSubTab === 'nuria' && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                  activeSubTab === 'luiza' && "bg-indigo-50 text-indigo-700 border border-indigo-200"
                )}>
                  {activeProfile.cargo}
                </span>
              </div>
              
              <p className="text-slate-600 text-sm leading-relaxed max-w-4xl font-normal">
                {activeProfile.perfil}
              </p>
              
              {/* Profile Contact info links */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 pt-2 text-xs text-slate-500">
                {activeProfile.email && (
                  <span className="flex items-center gap-1.5 hover:text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {activeProfile.email}
                  </span>
                )}
                {activeProfile.telefone && (
                  <span className="flex items-center gap-1.5 hover:text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {activeProfile.telefone}
                  </span>
                )}
                
                {/* Social anchors */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  {activeProfile.linkedin && (
                    <a 
                      href={activeProfile.linkedin.startsWith('http') ? activeProfile.linkedin : `https://linkedin.com/in/${activeProfile.linkedin}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      title="LinkedIn Profissional"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {activeProfile.instagram && (
                    <a 
                      href={activeProfile.instagram.startsWith('http') ? activeProfile.instagram : `https://instagram.com/${activeProfile.instagram}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                      title="Instagram Profissional"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

            </div>

          </div>

          <div className="w-full md:w-auto flex-shrink-0">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold bg-white hover:bg-slate-50 shadow-xs text-xs transition"
            >
              <Edit className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Editar Foto e Perfil
            </button>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* PORTRAIT & BIO EDIT MODAL DRAWER                         */}
      {/* ======================================================== */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs" onClick={() => setIsEditProfileOpen(false)} />
          
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl z-10 mx-4 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Editar Perfil Operacional</h3>
                <p className="text-slate-500 text-xs mt-0.5">Atualize a foto e detalhes exibidos no seu espaço de trabalho.</p>
              </div>
              <button 
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-150 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="overflow-y-auto flex-1 p-6">
              <form 
                id="profileEditForm" 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  
                  const updatedModel = {
                    id: activeSubTab,
                    nome: formData.get('nome') as string,
                    cargo: formData.get('cargo') as string,
                    foto: formData.get('foto') as string,
                    perfil: formData.get('perfil') as string,
                    linkedin: formData.get('linkedin') as string,
                    instagram: formData.get('instagram') as string,
                    email: formData.get('email') as string,
                    telefone: formData.get('telefone') as string,
                  };

                  const updatedPerfisList = perfis.some((p: any) => p.id === activeSubTab)
                    ? perfis.map((p: any) => p.id === activeSubTab ? updatedModel : p)
                    : [...perfis, updatedModel];

                  await updateModuleData('perfis', updatedPerfisList);
                  setIsEditProfileOpen(false);
                }}
                className="space-y-4 text-left"
              >
                {/* Nome & Cargo */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Nome Completo *</label>
                    <input 
                      type="text" 
                      name="nome"
                      required
                      defaultValue={activeProfile.nome}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] text-slate-850"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Cargo / Função *</label>
                    <input 
                      type="text" 
                      name="cargo"
                      required
                      defaultValue={activeProfile.cargo}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] text-slate-850"
                    />
                  </div>
                </div>

                {/* Biography Bio text */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Minha Biografia / Perfil profissional</label>
                  <textarea 
                    name="perfil"
                    rows={3}
                    required
                    maxLength={350}
                    defaultValue={activeProfile.perfil}
                    placeholder="Conte um pouco sobre sua formação, foco ou responsabilidades..."
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] text-slate-850 leading-relaxed"
                  />
                </div>

                {/* Photo URL Input & Real-time suggestion */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">URL da Imagem / Foto do Perfil</label>
                  <input 
                    type="url" 
                    name="foto"
                    id="profilePhotoField"
                    required
                    key={activeProfile.foto}
                    defaultValue={activeProfile.foto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300'}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] text-slate-850"
                  />
                  
                  {/* Avatar dynamic click selection template tool */}
                  <div className="mt-2.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">Escolher de nossas sugestões corporativas:</span>
                    <div className="flex gap-2 items-center flex-wrap">
                      {[
                        { 
                          img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300', 
                          title: 'Classic Liana' 
                        },
                        { 
                          img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300&h=300', 
                          title: 'Cozy Ana' 
                        },
                        { 
                          img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300', 
                          title: 'CS Núria' 
                        },
                        { 
                          img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300', 
                          title: 'Developer Luiza' 
                        },
                        {
                          img: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=300&h=300',
                          title: 'Smile Executive'
                        }
                      ].map((item, id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            const field = document.getElementById('profilePhotoField') as HTMLInputElement;
                            if (field) {
                              field.value = item.img;
                            }
                          }}
                          className="group relative cursor-pointer border-2 border-transparent hover:border-blue-500 rounded-full overflow-hidden"
                          title={item.title}
                        >
                          <img src={item.img} alt={item.title} className="w-8 h-8 rounded-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Email & Telefone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">E-mail Profissional</label>
                    <input 
                      type="email" 
                      name="email"
                      defaultValue={activeProfile.email}
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] text-slate-850"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Celular / WhatsApp (c/ DDD)</label>
                    <input 
                      type="text" 
                      name="telefone"
                      defaultValue={activeProfile.telefone}
                      placeholder="Ex: 11 99999-9999"
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] text-slate-850"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">LinkedIn (Usuário ou Link)</label>
                    <input 
                      type="text" 
                      name="linkedin"
                      defaultValue={activeProfile.linkedin}
                      placeholder="Ex: liana-gomes"
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] text-slate-850"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Instagram (Sem @)</label>
                    <input 
                      type="text" 
                      name="instagram"
                      defaultValue={activeProfile.instagram}
                      placeholder="Ex: lianagomes.ilg"
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] text-slate-850"
                    />
                  </div>
                </div>

              </form>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-slate-150 bg-slate-50 flex justify-end gap-2 text-right">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="px-4 py-2 border border-slate-300 bg-white rounded-lg text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                form="profileEditForm"
                type="submit"
                className="px-4 py-2 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] rounded-lg font-bold text-xs transition shadow-sm"
              >
                Salvar Perfil
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1">
        
        {/* ======================================================== */}
        {/* LIANA WORKSPACE (THE BOSS)                               */}
        {/* ======================================================== */}
        {activeSubTab === 'liana' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Row 1: Manager stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-xl">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Leads Ativos</span>
                <span className="text-3xl font-extrabold text-[#0A192F] block mt-1">{activeLeads.length}</span>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" /> {hotLeads.length} Quentes na fila
                </span>
              </div>
              <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-xl">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Suportes Pendentes</span>
                <span className="text-3xl font-extrabold text-amber-600 block mt-1">
                  {tarefas.filter(t => t.tipo === 'suporte' && t.status !== 'resolvido' && t.status !== 'concluído').length}
                </span>
                <span className="text-xs text-slate-400 block mt-1">Atendimento ao aluno ativo</span>
              </div>
              <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-xl">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block">Demandas Pendentes do Time</span>
                <span className="text-3xl font-extrabold text-indigo-600 block mt-1">
                  {tarefas.filter(t => t.status !== 'concluído').length}
                </span>
                <span className="text-xs text-slate-400 block mt-1">Tarefas de operação em aberto</span>
              </div>
            </div>

            {/* Row 2: Delegate Quick Form & Team Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form de Delegação */}
              <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-[#0A192F] mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Delegar Nova Tarefa
                </h2>
                
                <form onSubmit={handleDelegateTask} className="space-y-4 text-left">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Título da Demanda</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Liberar acesso à nova planilha de vendas"
                      value={newTaskTitle}
                      onChange={e => setNewTaskTitle(e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1D4E89]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Responsável</label>
                      <select 
                        value={newTaskResp} 
                        onChange={e => setNewTaskResp(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
                      >
                        <option value="Ana">Ana (Comercial)</option>
                        <option value="Núria">Núria (Alunas/Mídias)</option>
                        <option value="Luiza">Luiza (LinkedIn/Tech)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Prioridade</label>
                      <select 
                        value={newTaskPrio} 
                        onChange={e => setNewTaskPrio(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
                      >
                        <option value="alta">Alta 🔥</option>
                        <option value="média">Média ⚡</option>
                        <option value="baixa">Baixa 🍃</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Área / Setor</label>
                    <select 
                      value={newTaskCategory} 
                      onChange={e => setNewTaskCategory(e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white"
                    >
                      <option value="comercial">Comercial & CRM</option>
                      <option value="onboarding">Suporte/Alunas</option>
                      <option value="instagram">Instagram / Conteúdo</option>
                      <option value="didatico">Material Didático</option>
                      <option value="financeiro">Financeiro / Faturamentos</option>
                      <option value="tech">Tech / Desenvolvimento</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Instruções / Descrição</label>
                    <textarea 
                      placeholder="Instruções adicionais detalhadas..."
                      rows={3}
                      value={newTaskDesc}
                      onChange={e => setNewTaskDesc(e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1D4E89]"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-[#D4AF37] hover:bg-opacity-95 text-[#0A192F] font-bold text-sm rounded shadow-sm flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Enviar para Área de Trabalho
                  </button>
                </form>
              </div>

              {/* Status do Time */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#0A192F] mb-4">Quadro de Supervisão Operacional (Liana)</h2>
                  
                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                    {['Ana', 'Núria', 'Luiza'].map(membro => {
                      const tarefasMembro = tarefas.filter(t => t.responsavel?.toLowerCase() === membro.toLowerCase());
                      const concluidas = tarefasMembro.filter(t => t.status === 'concluído' || t.status === 'resolvido').length;
                      const total = tarefasMembro.length;
                      const pct = total ? Math.round((concluidas / total) * 100) : 0;

                      return (
                        <div key={membro} className="border border-slate-100 p-4 rounded-lg bg-stone-50">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-800 text-sm">{membro}</span>
                            <span className="text-xs text-slate-500 font-semibold">{concluidas}/{total} Tarefas ({pct}%)</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                            <div className="h-full bg-cyan-900 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>

                          {/* List of active tasks inline */}
                          <div className="space-y-1.5">
                            {tarefasMembro.filter(t => t.status !== 'concluído' && t.status !== 'resolvido').map(t => (
                              <div key={t.id} className="flex justify-between items-center text-xs text-slate-600 bg-white p-2 rounded border border-slate-100 shadow-xs">
                                <span className="font-medium truncate max-w-[250px]">{t.titulo}</span>
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "px-1.5 py-0.2 rounded text-[9px] uppercase font-bold",
                                    t.prioridade === 'alta' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                                  )}>{t.prioridade}</span>
                                  <button 
                                    onClick={() => handleCompleteTask(t.id)}
                                    className="p-1 text-slate-400 hover:text-emerald-600"
                                    title="Marcar como Concluída"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {tarefasMembro.filter(t => t.status !== 'concluído' && t.status !== 'resolvido').length === 0 && (
                              <p className="text-[11px] text-slate-400 italic">Nenhuma atividade pendente cadastrada no quadro.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-slate-400 text-xs italic">
                  Você está logada na visão de Gerenciamento Geral (Diretoria). Qualquer alteração de dados reflete imediatamente no Firebase.
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* ANA WORKSPACE (COMERCIAL)                                */}
        {/* ======================================================== */}
        {activeSubTab === 'ana' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Header / Intro */}
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex items-center gap-3">
              <span className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </span>
              <div>
                <h2 className="font-bold text-orange-950">Ana • Central Comercial (Leads Ativos)</h2>
                <p className="text-xs text-orange-800">Gerenciamento ágil de negociações quentes, contatos imediatos e conversão de novos alunos.</p>
              </div>
            </div>

            {/* Pipeline de Negociação */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Coluna 1: Leads Quentes para Fechamento */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 text-orange-600">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                      Foco: Leads Quentes
                    </h3>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {pessoas.filter(p => p.tipoPessoa === 'lead' && p.temperatura === 'quente').length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {pessoas.filter(p => p.tipoPessoa === 'lead' && p.temperatura === 'quente').map(lead => (
                      <div key={lead.id} className="p-3 border border-slate-100 rounded-lg bg-stone-50 hover:border-[#1D4E89] transition-all">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900 text-sm">{lead.nome}</h4>
                          <span className="text-[10px] text-amber-600 bg-amber-50 font-bold px-1.5 py-0.2 rounded capitalize">{lead.status}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-slate-500">{lead.telefone || 'Sem telefone'}</p>
                          {lead.telefone && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                let cleanPhone = String(lead.telefone).replace(/\D/g, '');
                                if (cleanPhone.length > 0 && !cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
                                  cleanPhone = '55' + cleanPhone;
                                }
                                const greeting = `Olá, ${lead.nome}! Tudo bem? Aqui é a Ana do Instituto Liana Gomes. 😊 Gostaria de conversar sobre o seu interesse em nossa formação de *${lead.produtoInteresse || 'Compliance / Liderança'}*. Podemos bater um papo rápido hoje?`;
                                window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(greeting)}`, '_blank', 'noreferrer,noopener');
                              }}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors flex items-center gap-1 text-[11px] px-2 border border-emerald-150 bg-emerald-50/30"
                              title="Chamar no WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="font-semibold text-emerald-700">Chamar</span>
                            </button>
                          )}
                        </div>
                        
                        <div className="border-t border-slate-200/50 mt-3 pt-2 flex justify-between items-center text-xs">
                          <span className="text-slate-400">Interesse: <strong className="text-slate-700">{lead.produtoInteresse || 'Combo'}</strong></span>
                        </div>

                        {/* Convert client action */}
                        <button 
                          onClick={() => handleTransformLead(lead.id)}
                          className="mt-3 w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow-sm flex items-center justify-center gap-1.5 transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Comprou / Virou Aluna!
                        </button>
                      </div>
                    ))}
                    {pessoas.filter(p => p.tipoPessoa === 'lead' && p.temperatura === 'quente').length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs">Sem leads quentes cadastrados. Cadastre um novo no módulo Comercial!</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Coluna 2: Lista de Ações e Follow-ups */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Follow-ups Agendados</h3>
                
                <div className="space-y-3">
                  {pessoas.filter(p => p.tipoPessoa === 'lead' && p.proximoContato).map(lead => (
                    <div key={lead.id} className="p-3 border border-slate-100 rounded-lg bg-stone-50 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{lead.nome}</h4>
                        <p className="text-xs text-slate-500">Próximo Contato: {lead.proximoContato}</p>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">
                        {lead.responsavel || 'Ana'}
                      </span>
                    </div>
                  ))}
                  {pessoas.filter(p => p.tipoPessoa === 'lead' && p.proximoContato).length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs">Sem follow-ups agendados para os próximos dias.</div>
                  )}
                </div>
              </div>

              {/* Coluna 3: Minhas Tarefas de Venda */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-800 text-sm mb-4">Minhas Atividades Pendentes</h3>
                
                <div className="space-y-3">
                  {tarefas.filter(t => t.responsavel?.toLowerCase() === 'ana' && t.status !== 'concluído').map(task => (
                    <div key={task.id} className="p-3 border border-slate-100 rounded-lg bg-red-50/40 border-red-100 flex items-start gap-2">
                      <div className="mt-0.5">
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="font-bold text-slate-800 text-xs line-clamp-2">{task.titulo}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Prazo: {task.prazo || 'Urgente'}</p>
                        
                        <button 
                          onClick={() => handleCompleteTask(task.id)}
                          className="mt-2 text-[10px] border border-slate-300 hover:border-emerald-500 hover:text-emerald-600 bg-white px-2 py-0.5 rounded font-semibold transition"
                        >
                          Concluir Atividade
                        </button>
                      </div>
                    </div>
                  ))}
                  {tarefas.filter(t => t.responsavel?.toLowerCase() === 'ana' && t.status !== 'concluído').length === 0 && (
                    <div className="text-center py-8 text-slate-450 text-xs italic">Você concluiu todas as suas tarefas do comercial de hoje! 🌟</div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* NÚRIA WORKSPACE (CLIENT SUCCESS / ALUNOS)                */}
        {/* ======================================================== */}
        {activeSubTab === 'nuria' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Header / Intro */}
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
              <span className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Heart className="w-6 h-6" />
              </span>
              <div>
                <h2 className="font-bold text-emerald-950">Núria • Suporte aos Alunos & Conteúdo</h2>
                <p className="text-xs text-emerald-800">Controle completo do onboarding de novas alunas, calendário de publicações do Instagram e aprovação de materiais de aula.</p>
              </div>
            </div>

            {/* Banner para Workspace Criativo */}
            <div className="p-5 bg-gradient-to-r from-[#0a192f] via-[#102441] to-[#1F4E89] text-white rounded-xl border border-slate-750 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[#D4AF37]/5 shadow-md">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="bg-[#D4AF37]/25 border border-[#D4AF37]/45 text-[#D4AF37] text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider font-sans">
                    PRODUTIVIDADE CRIATIVA
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#FCFBF9]">Workspace Criativo Integrado</h3>
                <p className="text-xs text-slate-300">Centralize ferramentas externas de IA e design, gerencie prompts estratégicos de equipe e acompanhe tarefas criativas.</p>
              </div>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('change_active_tab', { detail: 'workspace_criativo' }));
                }}
                className="px-4 py-2 bg-[#D4AF37] hover:bg-white text-slate-950 hover:text-[#0A192F] tracking-tight text-xs font-black rounded-lg transition duration-200 flex items-center gap-1.5 border border-[#D4AF37] shrink-0 outline-none"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Acessar Workspace Criativo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Box 1: Onboarding Monitor (Alunas faltantes) */}
              <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200">
                <h3 className="font-bold text-[#0A192F] text-sm mb-4">Acompanhamento e Checklists de Onboarding de Novas Alunas</h3>
                
                <div className="space-y-3">
                  {incompleteOnboardings.map(aluna => (
                    <div key={aluna.id} className="p-4 border border-slate-100 rounded-lg bg-stone-50 text-left">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-slate-800 text-sm">{aluna.nome}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">{aluna.turma || 'Sem Turma'}</span>
                          {aluna.telefone && (
                            <button
                              onClick={() => {
                                let cleanPhone = String(aluna.telefone).replace(/\D/g, '');
                                if (cleanPhone.length > 0 && !cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
                                  cleanPhone = '55' + cleanPhone;
                                }
                                // Smart copy context depending on what key checks are lacking:
                                let templateText = '';
                                if (!aluna.entrouGrupo) {
                                  templateText = `Olá, ${aluna.nome}! Aqui é a Núria do suporte do *Instituto Liana Gomes*. 😊 Passando para te lembrar de entrar no grupo oficial de WhatsApp da sua turma pelo convite: https://chat.whatsapp.com/ExemploGrupoILG. Te aguardamos lá para darmos início!`;
                                } else if (!aluna.respondeuInicial) {
                                  templateText = `Olá, ${aluna.nome}! Aqui é a Núria do suporte. 🥰 Notei que ainda falta preencher nosso *Formulário de Diagnóstico Inicial* para que as mentoras preparem suas aulas práticas. Responda pelo link rápido: https://forms.gle/ExemploDiagnosticoILG. Obrigado!`;
                                } else {
                                  templateText = `Olá, ${aluna.nome}! Tudo bem? Gostaria de saber se você teve alguma dúvida no acesso ao Nutror ou ao MRP Tracker? Estou por aqui para apoiar seu onboarding! Beijo.`;
                                }
                                window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(templateText)}`, '_blank', 'noreferrer,noopener');
                              }}
                              className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded px-2 py-0.5 transition"
                              title="Enviar cobrança operacional inteligente via WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Notificar Whats</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                        <button 
                          onClick={() => handleToggleOnboarding(aluna.id, 'entrouGrupo')}
                          className={cn(
                            "flex items-center gap-1.5 p-2 rounded border text-xs font-semibold justify-center transition-colors",
                            aluna.entrouGrupo 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          <Check className={cn("w-3.5 h-3.5", aluna.entrouGrupo ? 'opacity-100' : 'opacity-0')} />
                          Ign. Grupo Whats
                        </button>

                        <button 
                          onClick={() => handleToggleOnboarding(aluna.id, 'respondeuInicial')}
                          className={cn(
                            "flex items-center gap-1.5 p-2 rounded border text-xs font-semibold justify-center transition-colors",
                            aluna.respondeuInicial 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          <Check className={cn("w-3.5 h-3.5", aluna.respondeuInicial ? 'opacity-100' : 'opacity-0')} />
                          Formulário Inicial
                        </button>

                        <button 
                          onClick={() => handleToggleOnboarding(aluna.id, 'acessoNutror')}
                          className={cn(
                            "flex items-center gap-1.5 p-2 rounded border text-xs font-semibold justify-center transition-colors",
                            aluna.acessoNutror 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          <Check className={cn("w-3.5 h-3.5", aluna.acessoNutror ? 'opacity-100' : 'opacity-0')} />
                          Nutror Liberado
                        </button>

                        <button 
                          onClick={() => handleToggleOnboarding(aluna.id, 'acessoMRP')}
                          className={cn(
                            "flex items-center gap-1.5 p-2 rounded border text-xs font-semibold justify-center transition-colors",
                            aluna.acessoMRP 
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          <Check className={cn("w-3.5 h-3.5", aluna.acessoMRP ? 'opacity-100' : 'opacity-0')} />
                          MRP Tracker
                        </button>
                      </div>
                    </div>
                  ))}
                  {incompleteOnboardings.length === 0 && (
                    <div className="text-center py-10 text-slate-400 text-xs">Nenhum onboarding pendente! Todas as alunas estão 100% integradas. ✨</div>
                  )}
                </div>
              </div>

              {/* Box 2: Instagram Content Engine */}
              <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 space-y-6">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-3">Instagram & Pautas de Conteúdo</h3>
                  <form onSubmit={handleAddInstagramIdea} className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      required
                      placeholder="Ideia de Post..." 
                      value={newInstagramIdea}
                      onChange={e => setNewInstagramIdea(e.target.value)}
                      className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-xs outline-none"
                    />
                    <button className="px-3 bg-[#0A192F] text-white rounded text-xs font-bold hover:bg-slate-800">
                      Adicionar
                    </button>
                  </form>

                  <div className="space-y-1.5">
                    {tarefas.filter(t => t.categoria === 'instagram' && t.status !== 'concluído').map(task => (
                      <div key={task.id} className="flex justify-between items-center bg-stone-50 border border-slate-100 p-2.5 rounded text-xs select-none">
                        <span className="truncate max-w-[180px] font-medium text-slate-700">{task.titulo.replace('Instagram: ', '')}</span>
                        <button 
                          onClick={() => handleCompleteTask(task.id)}
                          className="p-1 hover:bg-emerald-50 hover:text-emerald-600 rounded text-slate-400"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {tarefas.filter(t => t.categoria === 'instagram' && t.status !== 'concluído').length === 0 && (
                      <div className="text-[11px] text-slate-400 italic">Sem pautas pendentes no momento.</div>
                    )}
                  </div>
                </div>

                {/* Materials input */}
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-slate-800 text-sm mb-3">Criar Novo Material Didático</h3>
                  <form onSubmit={handleAddMaterial} className="space-y-3 text-left">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Nome do Arquivo</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Ebook Lei de Importunação Sexual"
                        value={newMaterialName}
                        onChange={e => setNewMaterialName(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Link do Drive</label>
                      <input 
                        type="url" 
                        placeholder="Ex: https://drive.google.com/..."
                        value={newMaterialLink}
                        onChange={e => setNewMaterialLink(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Categoria</label>
                      <select 
                        value={newMaterialCat}
                        onChange={e => setNewMaterialCat(e.target.value)}
                        className="w-full border border-slate-300 rounded px-2.5 py-1 text-xs bg-white"
                      >
                        <option value="ebook">Ebook</option>
                        <option value="planos">Planos & Modelos</option>
                        <option value="materiais editáveis">Planilhas & Editáveis</option>
                        <option value="gravacoes">Gravações de Aula</option>
                      </select>
                    </div>
                    <button className="w-full py-1.5 bg-[#D4AF37] text-white text-xs font-bold rounded hover:bg-opacity-95 shadow-sm">
                      Publicar para Alunas
                    </button>
                  </form>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ======================================================== */}
        {/* LUIZA WORKSPACE (TECH & LINKEDIN)                         */}
        {/* ======================================================== */}
        {activeSubTab === 'luiza' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Header / Intro */}
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center gap-3">
              <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Terminal className="w-6 h-6" />
              </span>
              <div>
                <h2 className="font-bold text-indigo-950">Luiza • Administração de Tech & LinkedIn</h2>
                <p className="text-xs text-indigo-800">Manutenção de código-fonte, status de integridade do Firebase, banco de dados local e controle das pautas de liderança no LinkedIn.</p>
              </div>
            </div>

            {/* Developer Sandbox */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col lg:flex-row gap-6 justify-between w-full">
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" /> Ambiente Backlog de Engenharia (Luiza)
                </h3>
                
                {/* Active code tasks filtered from database */}
                <div className="space-y-2 mb-4">
                  {tarefas.filter(t => t.responsavel?.toLowerCase() === 'luiza' && t.status !== 'concluído' && t.categoria !== 'linkedin_post').map(task => (
                    <div key={task.id} className="p-3 border border-slate-100 rounded-lg bg-indigo-50/20 text-left flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-xs">{task.titulo}</h4>
                        <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50 px-1 py-0.2 rounded mt-1 inline-block capitalize">{task.prioridade || 'Média'}</span>
                      </div>
                      <button 
                        onClick={() => handleCompleteTask(task.id)}
                        className="p-1 hover:text-emerald-600 text-slate-400"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {tarefas.filter(t => t.responsavel?.toLowerCase() === 'luiza' && t.status !== 'concluído' && t.categoria !== 'linkedin_post').length === 0 && (
                    <p className="text-xs text-slate-400 italic">Sem tarefas ativas de tecnologia designadas para você. Bom trabalho!</p>
                  )}
                </div>
              </div>

              {/* Terminal output mockup */}
              <div className="flex-1 bg-slate-950 rounded-lg p-4 font-mono text-[10px] text-green-400 space-y-1 text-left min-h-[140px] border border-slate-850 flex flex-col">
                <div className="flex items-center justify-between text-slate-500 border-b border-slate-900 pb-1.5 mb-1.5 shrink-0">
                  <span>CMD_LINE: ~/luiza_ilg_v3</span>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
                <div className="flex-1 overflow-y-hidden">
                  {terminalLogs.slice(-6).map((log, id) => (
                    <p key={id} className="truncate">{log}</p>
                  ))}
                  {systemScanning && (
                    <p className="animate-pulse text-indigo-400">... Executing diagnostic pipeline ...</p>
                  )}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 shrink-0">
                  <button 
                    onClick={triggerSystemScan}
                    disabled={systemScanning}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs rounded border border-slate-800 flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3 h-3 text-green-400" /> Diagnóstico do Sistema
                  </button>
                </div>
              </div>
            </div>

            {/* LinkedIn Copy Board & Planner */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[700px] w-full mt-6">
              <div className="bg-indigo-900 p-4 border-b border-indigo-800 text-white shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Linkedin className="w-5 h-5 text-indigo-300" />
                  <h3 className="font-bold text-sm">Estúdio de Conteúdo Institucional (LinkedIn)</h3>
                </div>
                <div className="flex bg-indigo-950/50 p-1 rounded-lg">
                  <button 
                    onClick={() => setLinkedinView('editor')}
                    className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-all", linkedinView === 'editor' ? "bg-indigo-600 text-white shadow" : "text-indigo-300 hover:text-white")}
                  >
                    Editor & Revisão
                  </button>
                  <button 
                    onClick={() => setLinkedinView('grade')}
                    className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-all", linkedinView === 'grade' ? "bg-indigo-600 text-white shadow" : "text-indigo-300 hover:text-white")}
                  >
                    Grade de Planejamento
                  </button>
                </div>
              </div>
              
              {linkedinView === 'editor' ? (
              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* Left Column: Cronograma & Board */}
                <div className="w-full md:w-80 lg:w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
                  <div className="p-4 shrink-0 border-b border-slate-200 bg-white">
                    <form onSubmit={handleAddLinkedinPost} className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Adicionar Pauta</h4>
                      <input 
                        type="text" 
                        placeholder="Título da Pauta..." 
                        required
                        value={newLinkedinTitle}
                        onChange={e => setNewLinkedinTitle(e.target.value)}
                        className="w-full text-xs box-border border border-slate-300 rounded px-2 py-1.5 outline-none focus:border-indigo-500" 
                      />
                      <input 
                        type="text" 
                        placeholder="Tema (ex: Mulheres na Liderança)..." 
                        value={newLinkedinTheme}
                        onChange={e => setNewLinkedinTheme(e.target.value)}
                        className="w-full text-xs box-border border border-slate-300 rounded px-2 py-1.5 outline-none focus:border-indigo-500" 
                      />
                      <div className="flex gap-2">
                        <input 
                          type="date"
                          value={newLinkedinDate}
                          onChange={e => setNewLinkedinDate(e.target.value)}
                          className="w-1/2 text-[10px] box-border border border-slate-300 rounded px-2 py-1.5 outline-none focus:border-indigo-500 text-slate-600"
                          title="Agendamento"
                        />
                        <button type="submit" className="w-1/2 bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs py-1.5 rounded transition">
                          Criar
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="p-3 flex-1 overflow-y-auto space-y-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Selecione para Editar</h4>
                    {tarefas.filter(t => t.categoria === 'linkedin_post').sort((a, b) => new Date(a.prazo || 0).getTime() - new Date(b.prazo || 0).getTime()).map(pauta => (
                      <div 
                        key={pauta.id} 
                        onClick={() => {
                          setEditingLinkedinId(pauta.id);
                          setEditingLinkedinTitle(pauta.titulo);
                          setEditingLinkedinContent(pauta.descricao || '');
                          if (window.innerWidth < 768) {
                              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                          }
                        }}
                        className={cn(
                          "p-3 rounded-lg border text-left cursor-pointer transition-all",
                          editingLinkedinId === pauta.id 
                            ? "bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500" 
                            : "bg-white border-slate-200 shadow-sm hover:border-indigo-300"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-xs text-slate-800 line-clamp-2 pr-2">{pauta.titulo}</span>
                        </div>
                        <div className="flex justify-between items-end mt-1">
                          {pauta.prazo ? (
                            <span className="text-[10px] text-slate-500 font-medium">📅 {new Date(pauta.prazo).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                          ) : <span/>}
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 whitespace-nowrap",
                            pauta.status === 'Aguardando Liana' && "bg-amber-100 text-amber-700",
                            pauta.status === 'Aprovado' && "bg-emerald-100 text-emerald-700",
                            pauta.status === 'Revisar' && "bg-rose-100 text-rose-700",
                            pauta.status === 'Publicado' && "bg-indigo-100 text-indigo-700"
                          )}>
                            {pauta.status || 'Aguardando Liana'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {tarefas.filter(t => t.categoria === 'linkedin_post').length === 0 && (
                      <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-lg">
                        Nenhuma pauta adicionada ao cronograma.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Editor & Sugestões */}
                <div className="flex-1 bg-white flex flex-col overflow-hidden relative">
                  {!editingLinkedinId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                      <Edit3 className="w-12 h-12 mb-3 text-slate-200" />
                      <p className="text-sm font-medium">Selecione uma pauta no cronograma para iniciar a edição.</p>
                    </div>
                  ) : (
                    <>
                      {/* Editor Header */}
                      {(() => {
                        const post = tarefas.find(t => t.id === editingLinkedinId);
                        if (!post) return null;
                        return (
                          <div className="p-4 border-b border-slate-200 shrink-0 flex items-center justify-between bg-white z-10 shadow-sm relative">
                            <input 
                              type="text" 
                              value={editingLinkedinTitle}
                              onChange={e => setEditingLinkedinTitle(e.target.value)}
                              className="text-lg font-bold text-slate-800 bg-transparent border-none outline-none flex-1 truncate"
                            />
                            <div className="flex gap-2 ml-4 shrink-0">
                               <button 
                                  onClick={() => {
                                      if (confirm('Excluir esta pauta?')) {
                                          const updated = tarefas.filter(t => t.id !== editingLinkedinId);
                                          updateModuleData('tarefas_suporte', updated);
                                          setEditingLinkedinId(null);
                                      }
                                  }}
                                  className="text-[10px] text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-2 py-1.5 rounded font-bold transition-all"
                                >
                                    <Trash2 className="w-3 h-3"/>
                                </button>
                                <button onClick={handleSaveLinkedinEdit} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded font-bold hover:bg-indigo-700 flex items-center gap-1 shadow-sm transition">
                                  <Save className="w-4 h-4" /> Atualizar Título/Base
                                </button>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {/* Editor Body Split */}
                      {(() => {
                        const post = tarefas.find(t => t.id === editingLinkedinId);
                        if (!post) return null;
                        
                        return (
                          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
                            {/* Texto Original Luiza */}
                            <div className="flex-1 flex flex-col border-r border-slate-200 h-1/2 md:h-full bg-white shadow-sm ring-1 ring-slate-100 m-2 md:m-4 rounded-xl overflow-hidden">
                              <div className="bg-slate-50 p-2 border-b border-slate-200 shrink-0 text-xs font-bold text-slate-600 px-4 uppercase tracking-wider flex justify-between items-center">
                                <span className="flex items-center gap-2"><Edit3 className="w-3 h-3"/> Texto Base (Luiza)</span>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(editingLinkedinContent);
                                    alert('Texto copiado!');
                                  }}
                                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 normal-case font-medium"
                                ><Copy className="w-3 h-3"/> Copiar</button>
                              </div>
                              <textarea
                                value={editingLinkedinContent}
                                onChange={e => setEditingLinkedinContent(e.target.value)}
                                className="flex-1 w-full bg-transparent p-4 resize-none outline-none text-sm text-slate-700 placeholder-slate-300 leading-relaxed"
                                placeholder={`Escreva o texto base para a publicação: \n"${editingLinkedinTitle}"`}
                              />
                            </div>

                            {/* Sugestões da Liana */}
                            <div className="flex-1 flex flex-col h-1/2 md:h-full bg-amber-50/50 shadow-sm ring-1 ring-amber-100 m-2 md:m-4 md:ml-0 rounded-xl overflow-hidden">
                              <div className="bg-amber-100 p-2 border-b border-amber-200 shrink-0 text-xs font-bold text-amber-800 px-4 uppercase tracking-wider flex justify-between items-center">
                                <span className="flex items-center gap-2"><MessageCircle className="w-3 h-3"/> Revisão e Aprovação (Liana)</span>
                              </div>
                              <textarea
                                value={post.observacoes || ''}
                                onChange={async (e) => {
                                  const updated = tarefas.map(t => t.id === editingLinkedinId ? { ...t, observacoes: e.target.value } : t);
                                  await updateModuleData('tarefas_suporte', updated);
                                }}
                                className="flex-1 w-full bg-transparent p-4 resize-none outline-none text-sm text-amber-950 placeholder-amber-700/50 font-medium leading-relaxed"
                                placeholder="Liana, escreva aqui os ajustes, reescritas e notas de aprovação! O texto original ao lado ficará preservado."
                              />
                              
                              <div className="p-3 bg-amber-50 border-t border-amber-200 shrink-0 flex items-center justify-between gap-2 shadow-inner">
                                <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Mudar Status:</span>
                                <div className="flex gap-1.5 flex-wrap justify-end">
                                  <button onClick={() => handleUpdateLinkedinStatus(post.id, 'Aguardando Liana')} className={cn("text-[10px] px-2 py-1 rounded font-bold border", post.status === 'Aguardando Liana' ? "bg-amber-600 border-amber-700 text-white" : "bg-white text-slate-500 hover:bg-slate-50")}>Aguardando</button>
                                  <button onClick={() => handleUpdateLinkedinStatus(post.id, 'Revisar')} className={cn("text-[10px] px-2 py-1 rounded font-bold border", post.status === 'Revisar' ? "bg-rose-500 border-rose-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50")}>Revisar</button>
                                  <button onClick={() => handleUpdateLinkedinStatus(post.id, 'Aprovado')} className={cn("text-[10px] px-2 py-1 rounded font-bold border", post.status === 'Aprovado' ? "bg-emerald-500 border-emerald-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50")}>Aprovado</button>
                                  <button onClick={() => handleUpdateLinkedinStatus(post.id, 'Publicado')} className={cn("text-[10px] px-2 py-1 rounded font-bold border", post.status === 'Publicado' ? "bg-indigo-600 border-indigo-700 text-white" : "bg-white text-slate-500 hover:bg-slate-50")}>Publicado</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              </div>
              ) : (
                <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                  <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800">Cronograma Mensal de Conteúdo</h4>
                      <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                        {tarefas.filter((t: any) => t.categoria === 'linkedin_post').length} Pautas Mapeadas
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <div className="grid grid-cols-5 text-xs font-bold text-slate-500 bg-slate-100 border-b border-slate-200">
                        <div className="p-3">Data Prevista</div>
                        <div className="p-3 col-span-2">Tema / Pauta</div>
                        <div className="p-3">Status</div>
                        <div className="p-3 text-right">Ações</div>
                      </div>
                      
                      <div className="divide-y divide-slate-100">
                        {tarefas
                          .filter((t: any) => t.categoria === 'linkedin_post')
                          .sort((a: any, b: any) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime())
                          .map((post: any) => (
                          <div key={post.id} className="grid grid-cols-5 items-center hover:bg-slate-50/50 transition-colors">
                            <div className="p-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {post.prazo ? new Date(post.prazo).toLocaleDateString('pt-BR') : 'Sem data'}
                            </div>
                            <div className="p-3 col-span-2">
                              <h5 className="text-sm font-bold text-slate-800">{post.titulo}</h5>
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider mt-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                <Tag className="w-3 h-3" /> {post.tema || 'Geral'}
                              </span>
                            </div>
                            <div className="p-3">
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                                post.status === 'Aguardando Liana' ? "bg-amber-100 text-amber-700" :
                                post.status === 'Revisar' ? "bg-rose-100 text-rose-700" :
                                post.status === 'Aprovado' ? "bg-emerald-100 text-emerald-700" :
                                post.status === 'Publicado' ? "bg-indigo-100 text-indigo-700 hover:opacity-100" :
                                "bg-slate-100 text-slate-700"
                              )}>
                                {post.status}
                              </span>
                            </div>
                            <div className="p-3 text-right">
                              <button 
                                onClick={() => {
                                  setLinkedinView('editor');
                                  setEditingLinkedinId(post.id);
                                  setEditingLinkedinTitle(post.titulo || '');
                                  setEditingLinkedinContent(post.descricao || '');
                                  setEditingLinkedinDate(post.prazo || '');
                                  setEditingLinkedinTheme(post.tema || '');
                                }}
                                className="text-xs bg-white text-indigo-600 hover:text-white hover:bg-indigo-600 border border-indigo-200 hover:border-indigo-600 px-3 py-1.5 rounded-lg transition-colors font-medium shadow-sm"
                              >
                                Editar na Grade
                              </button>
                            </div>
                          </div>
                        ))}

                        {tarefas.filter((t: any) => t.categoria === 'linkedin_post').length === 0 && (
                          <div className="p-8 text-center text-slate-400 text-sm">
                            Nenhuma pauta mapeada para o cronograma ainda.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}