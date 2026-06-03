import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, UserCheck, BookOpen, FileText, CreditCard, 
  LifeBuoy, CheckSquare, LogOut, Menu, X, RefreshCw, Briefcase, 
  DollarSign, MessageSquare, FileSpreadsheet, Award, Video, Sparkles, 
  UserCircle, Search, HelpCircle, Hammer, Shield, Eye
} from 'lucide-react';
import { cn } from '../lib/utils';
import { syncNow } from '../store';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: any;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
  onSwapProfile?: () => void;
  selectedProfile?: string | null;
}

export function Layout({ children, activeTab, setActiveTab, onLogout, onSwapProfile, selectedProfile }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Work Mode selection - stored in localStorage
  const [workMode, setWorkMode] = useState<'todos' | 'comercial' | 'suporte' | 'conteudo' | 'gestao'>(() => {
    const saved = localStorage.getItem('ilg_work_mode');
    return (saved as any) || 'todos';
  });

  const getProfileName = (id: string | null | undefined) => {
    switch(id) {
      case 'liana': return 'Liana Gomes';
      case 'luiza': return 'Luiza';
      case 'nuria': return 'Nuria';
      case 'ana': return 'Ana';
      default: return 'Usuário';
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    await syncNow();
    setTimeout(() => {
      setSyncing(false);
    }, 600);
  };

  const changeWorkMode = (mode: 'todos' | 'comercial' | 'suporte' | 'conteudo' | 'gestao') => {
    setWorkMode(mode);
    localStorage.setItem('ilg_work_mode', mode);
  };

  // 8 Suggested groups
  const suggestedGroups = [
    {
      title: "INÍCIO",
      mode: ["todos", "comercial", "suporte", "conteudo", "gestao"],
      items: [
        { id: 'dashboard', label: 'Início & Mural', icon: LayoutDashboard },
        { id: 'meu_painel', label: 'Meu Painel', icon: UserCircle },
        { id: 'prioridades_hoje', label: 'Prioridades de Hoje', icon: CheckSquare },
        { id: 'busca_global', label: 'Busca Global', icon: Search }
      ]
    },
    {
      title: "PESSOAS",
      mode: ["todos", "comercial", "suporte", "gestao"],
      items: [
        { id: 'pessoas', label: 'Base de Pessoas', icon: Users, preset: { tipoPessoa: '' } },
        { id: 'pessoas_leads', label: 'Leads', icon: Briefcase, preset: { tipoPessoa: 'lead' }, customAction: true },
        { id: 'pessoas_alunas', label: 'Alunas', icon: Award, preset: { tipoPessoa: 'aluna' }, customAction: true },
        { id: 'ficha_unica_shortcut', label: 'Ficha Única', icon: Eye, customAction: true }
      ]
    },
    {
      title: "COMERCIAL",
      mode: ["todos", "comercial", "gestao"],
      items: [
        { id: 'comercial', label: 'Funil Comercial', icon: CreditCard },
        { id: 'comercial_followups', label: 'Follow-ups', icon: Briefcase, preset: { status: 'em negociação' }, customAction: true },
        { id: 'agente_social_seller', label: 'Agente Social Seller', icon: Sparkles },
        { id: 'whatsapp', label: 'WhatsApp / Templates', icon: MessageSquare },
        { id: 'whatsapp_templates', label: 'Mensagens e Templates', icon: MessageSquare, customAction: true }
      ]
    },
    {
      title: "OPERAÇÃO",
      mode: ["todos", "suporte", "gestao"],
      items: [
        { id: 'alunos', label: 'Onboarding', icon: UserCheck },
        { id: 'suporte_shortcut', label: 'Suporte', icon: HelpCircle, filterTasks: 'suporte', customAction: true },
        { id: 'certificados', label: 'Certificados', icon: Award },
        { id: 'financeiro', label: 'Financeiro Operacional', icon: DollarSign },
        { id: 'tarefas_shortcut', label: 'Tarefas', icon: CheckSquare, filterTasks: 'tarefa', customAction: true }
      ]
    },
    {
      title: "CONTEÚDO E PRODUÇÃO",
      mode: ["todos", "conteudo"],
      items: [
        { id: 'workspace_criativo', label: 'Workspace Criativo', icon: Sparkles },
        { id: 'materiais', label: 'Materiais e Links', icon: BookOpen },
        { id: 'workspace_prompts', label: 'Prompts', icon: Sparkles, customAction: true },
        { id: 'workspace_projetos', label: 'Projetos Criativos', icon: Sparkles, customAction: true }
      ]
    },
    {
      title: "ORGANIZAÇÃO INTERNA",
      mode: ["todos", "suporte", "conteudo", "gestao"],
      items: [
        { id: 'planilhas', label: 'Planilhas Internas', icon: FileSpreadsheet },
        { id: 'comunicacao_interna', label: 'Comunicação Interna', icon: MessageSquare },
        { id: 'salas_reuniao', label: 'Salas e Reuniões', icon: Video }
      ]
    },
    {
      title: "GESTÃO",
      mode: ["todos", "gestao"],
      items: [
        { id: 'financeiro_relatorios', label: 'Relatórios', icon: FileSpreadsheet, customAction: true },
        { id: 'materiais_produtos', label: 'Produtos e Formações', icon: BookOpen, customAction: true },
        { id: 'turmas_config', label: 'Turmas', icon: Users, customAction: true },
        { id: 'espacos', label: 'Usuárias e Permissões', icon: Shield },
        { id: 'importar', label: 'Configurações', icon: FileText }
      ]
    }
  ];

  const handleCustomMenuAction = (item: any) => {
    if (item.id === 'pessoas_leads' || item.id === 'pessoas_alunas') {
      setActiveTab('pessoas');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('set_pessoas_filter', { detail: item.preset }));
      }, 50);
    } 
    else if (item.id === 'ficha_unica_shortcut') {
      setActiveTab('pessoas');
      alert('Selecione uma pessoa na lista geral para abrir sua Ficha Única completa com histórico e abas.');
    }
    else if (item.id === 'comercial_followups') {
      setActiveTab('pessoas');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('set_pessoas_filter', { detail: item.preset }));
      }, 50);
    }
    else if (item.id === 'whatsapp_templates') {
      setActiveTab('whatsapp');
    }
    else if (item.id === 'suporte_shortcut' || item.id === 'tarefas_shortcut') {
      setActiveTab('tarefas_suporte');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('set_tarefas_filter', { detail: { tipo: item.filterTasks } }));
      }, 50);
    }
    else if (item.id === 'workspace_prompts' || item.id === 'workspace_projetos') {
      setActiveTab('workspace_criativo');
    }
    else if (item.id === 'financeiro_relatorios') {
      setActiveTab('financeiro');
    }
    else if (item.id === 'materiais_produtos') {
      setActiveTab('materiais');
    }
    else if (item.id === 'turmas_config') {
      setActiveTab('alunos');
    }
  };

  const NavContent = () => (
    <div className="flex flex-col h-full bg-[#0A192F] text-slate-100">
      
      {/* Visual Header */}
      <div className="p-5 border-b border-slate-800">
        <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5 justify-between">
          <span>Central ILG</span>
          <span className="text-[9px] bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/35 px-1.5 py-0.2 rounded font-black tracking-wide">
            PRO
          </span>
        </h1>
        <p className="text-[#D4AF37] text-[9px] mt-1 font-extrabold tracking-[0.22em] uppercase">Instituto Liana Gomes</p>
      </div>
      
      {/* Profile HUD & Workplace mode selector */}
      <div className="p-4 space-y-3 border-b border-slate-800/80">
        {selectedProfile && (
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-indigo-900 text-white flex items-center justify-center font-black text-xs shadow-md">
              {getProfileName(selectedProfile).charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 leading-none">Acesso</p>
              <p className="text-xs font-black text-slate-200 truncate mt-0.5">{getProfileName(selectedProfile)}</p>
            </div>
          </div>
        )}

        {/* Modo de Trabalho Seletor */}
        <div>
          <label className="text-[9px] font-black text-slate-450 uppercase tracking-wider block mb-1">Foco / Modo de Trabalho:</label>
          <select 
            value={workMode}
            onChange={(e) => changeWorkMode(e.target.value as any)}
            className="w-full text-xs bg-slate-800/60 border border-slate-700/50 rounded-lg py-1 px-2 text-slate-200 font-bold outline-none focus:border-[#D4AF37] transition"
          >
            <option value="todos">🌐 Todos os Módulos</option>
            <option value="comercial">💼 Modo Comercial (CRM)</option>
            <option value="suporte">💻 Modo Suporte & Alunas</option>
            <option value="conteudo">🎨 Modo Conteúdo (Midia)</option>
            <option value="gestao">📈 Modo Gestão (Director)</option>
          </select>
        </div>
      </div>

      {/* Navigation Groups list */}
      <nav className="flex-1 px-3 space-y-5 overflow-y-auto custom-scrollbar pt-4 pb-6 select-none">
        {suggestedGroups
          .filter(g => g.mode.includes(workMode))
          .map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <h3 className="px-3 mb-2 text-[9px] font-black uppercase tracking-widest text-slate-450">
                {group.title}
              </h3>
              
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  // Handle active highlighting
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.customAction) {
                          handleCustomMenuAction(item);
                        } else {
                          setActiveTab(item.id);
                        }
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 group text-left",
                        isActive 
                          ? "bg-slate-800 text-[#D4AF37] border-l-2 border-[#D4AF37] shadow-inner font-extrabold" 
                          : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-100"
                      )}
                    >
                      <Icon className={cn("w-3.5 h-3.5 mr-2.5 shrink-0", isActive ? "text-[#D4AF37]" : "text-slate-500 group-hover:text-slate-350")} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
      </nav>

      {/* Footer System controls */}
      <div className="p-4 border-t border-slate-800 space-y-1 bg-slate-900/40 shrink-0">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-850 transition"
        >
          <RefreshCw className={cn("w-4 h-4 mr-2.5 text-[#D4AF37]", syncing && "animate-spin")} />
          <span>{syncing ? 'Sincronizando...' : 'Sincronizar Firestore'}</span>
        </button>
        {onSwapProfile && (
          <button
            onClick={onSwapProfile}
            className="w-full flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-850 transition"
          >
            <UserCircle className="w-4 h-4 mr-2.5" />
            <span>Mudar Perfil</span>
          </button>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-850 transition"
        >
          <LogOut className="w-4 h-4 mr-2.5 text-rose-500" />
          <span>Fazer Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      
      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64 h-full bg-[#0A192F] shadow-xl flex-col flex animate-in slide-in-from-left duration-200">
            <button className="absolute top-4 right-4 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
            <div className="h-full overflow-hidden flex flex-col">
              <NavContent />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex w-60 h-full bg-[#0A192F] flex-col border-r border-slate-800 shrink-0">
        <NavContent />
      </div>

      {/* Core main cockpit area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header navbar with quick search bar */}
        <header className="bg-white border-b border-slate-200 flex items-center justify-between p-3.5 px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-slate-600 hover:text-slate-900 pr-1 select-none">
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Quick search global redirect bar */}
            <div className="relative hidden sm:block w-72">
              <input 
                type="text"
                placeholder="Pesquisa rápida (Nome, e-mail...)"
                onClick={() => setActiveTab('busca_global')}
                className="w-full border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg py-1.5 pl-9 pr-3 text-xs outline-none cursor-pointer text-slate-700 font-bold"
              />
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-[#0A192F] text-[#D4AF37] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide flex items-center gap-1.5 shadow-sm border border-[#D4AF37]/20">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Central Operacional ILG
            </span>
          </div>
        </header>

        {/* View container */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-stone-50 w-full min-h-0">
          <div className="max-w-7xl mx-auto min-h-full w-full pb-20 lg:pb-0">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Tab Navigation */}
        <div className="lg:hidden border-t border-slate-250 bg-white/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.06)] h-16 shrink-0 flex items-center justify-around px-2 pb-safe z-30 select-none pb-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full font-bold text-[9px] transition-all", 
              activeTab === 'dashboard' ? 'text-[#0A192F]' : 'text-slate-400 hover:text-slate-650'
            )}
          >
            <LayoutDashboard className={cn("w-5 h-5 transition-transform", activeTab === 'dashboard' ? 'text-[#001D4A] stroke-[2.5px] scale-110' : 'text-slate-400')} />
            <span className="mt-0.5 scale-90">Início</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('meu_painel')}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full font-bold text-[9px] transition-all", 
              activeTab === 'meu_painel' ? 'text-[#0A192F]' : 'text-slate-400 hover:text-slate-650'
            )}
          >
            <UserCircle className={cn("w-5 h-5 transition-transform", activeTab === 'meu_painel' ? 'text-[#001D4A] stroke-[2.5px] scale-110' : 'text-slate-400')} />
            <span className="mt-0.5 scale-90">Painel</span>
          </button>

          <button 
            onClick={() => setActiveTab('pessoas')}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full font-bold text-[9px] transition-all", 
              activeTab === 'pessoas' ? 'text-[#0A192F]' : 'text-slate-400 hover:text-slate-650'
            )}
          >
            <Users className={cn("w-5 h-5 transition-transform", activeTab === 'pessoas' ? 'text-[#001D4A] stroke-[2.5px] scale-110' : 'text-slate-400')} />
            <span className="mt-0.5 scale-90">CRM</span>
          </button>

          <button 
            onClick={() => setActiveTab('prioridades_hoje')}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full font-bold text-[9px] transition-all", 
              activeTab === 'prioridades_hoje' ? 'text-[#0A192F]' : 'text-slate-400 hover:text-slate-650'
            )}
          >
            <CheckSquare className={cn("w-5 h-5 transition-transform", activeTab === 'prioridades_hoje' ? 'text-[#001D4A] stroke-[2.5px] scale-110' : 'text-slate-400')} />
            <span className="mt-0.5 scale-90">Tarefas</span>
          </button>

          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center flex-1 h-full font-bold text-[9px] text-slate-400 hover:text-slate-700"
          >
            <Menu className="w-5 h-5 text-slate-400" />
            <span className="mt-0.5 scale-90">Menu</span>
          </button>
        </div>

      </div>
    </div>
  );
}
