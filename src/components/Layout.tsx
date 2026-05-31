import React, { useState } from 'react';
import { LayoutDashboard, Users, UserCheck, BookOpen, FileText, CreditCard, LifeBuoy, CheckSquare, LogOut, Menu, X, RefreshCw, Briefcase, DollarSign, MessageSquare, FileSpreadsheet, Award, Video, Sparkles, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppData } from '../types';
import { syncNow } from '../store';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'pessoas' | 'comercial' | 'alunos' | 'tarefas_suporte' | 'materiais' | 'importar' | 'espacos' | 'financeiro' | 'whatsapp' | 'planilhas' | 'certificados' | 'salas_reuniao' | 'workspace_criativo' | 'comunicacao_interna' | 'agente_social_seller';
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
  onSwapProfile?: () => void;
  selectedProfile?: string | null;
}

export function Layout({ children, activeTab, setActiveTab, onLogout, onSwapProfile, selectedProfile }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

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

  const navGroups = [
    {
      title: "Visão Geral",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'espacos', label: 'Espaços de Trabalho', icon: Briefcase },
        { id: 'workspace_criativo', label: 'Workspace Criativo', icon: Sparkles },
        { id: 'comunicacao_interna', label: 'Comunicação Interna', icon: MessageSquare },
      ]
    },
    {
      title: "Social & IA",
      items: [
        { id: 'agente_social_seller', label: 'Agente Social Seller', icon: Sparkles },
        { id: 'whatsapp', label: 'Central WhatsApp', icon: MessageSquare },
      ]
    },
    {
      title: "CRM & Operação",
      items: [
        { id: 'pessoas', label: 'Base de Pessoas', icon: Users },
        { id: 'comercial', label: 'Jornada Comercial', icon: CreditCard },
        { id: 'alunos', label: 'Jornada do Aluno', icon: UserCheck },
        { id: 'tarefas_suporte', label: 'Tarefas & Suporte', icon: CheckSquare },
        { id: 'certificados', label: 'Certificados', icon: Award },
        { id: 'salas_reuniao', label: 'Salas Reunião (Jitsi)', icon: Video },
      ]
    },
    {
      title: "Recursos & Gestão",
      items: [
        { id: 'materiais', label: 'Materiais & Links', icon: BookOpen },
        { id: 'planilhas', label: 'Planilhas Internas', icon: FileSpreadsheet },
        { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
        { id: 'importar', label: 'Importar...', icon: FileText },
      ]
    }
  ] as const;

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Central ILG</h1>
        <p className="text-amber-500 text-[10px] mt-1 font-bold tracking-[0.2em] uppercase">Operacional</p>
      </div>
      
      {selectedProfile && (
        <div className="px-6 pb-6">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3 shadow-inner">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {getProfileName(selectedProfile).charAt(0)}
            </div>
            <div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Acesso Logado</p>
              <p className="text-sm font-bold text-slate-100">{getProfileName(selectedProfile)}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-4 space-y-6 overflow-y-auto custom-scrollbar pb-6">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx}>
            <h3 className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group",
                      isActive 
                        ? "bg-gradient-to-r from-cyan-900 to-indigo-900 text-white shadow-md border border-cyan-800/30" 
                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 border border-transparent"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 mr-3 transition-colors", isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-cyan-400")} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-5 h-5 mr-3 text-amber-500", syncing && "animate-spin")} />
          {syncing ? 'Sincronizando...' : 'Sincronizar'}
        </button>
        {onSwapProfile && (
          <button
            onClick={onSwapProfile}
            className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <UserCircle className="w-5 h-5 mr-3" />
            Mudar Perfil
          </button>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3 text-rose-500" />
          Sair / Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-64 h-full bg-[#0A192F] shadow-xl flex-col flex">
            <button className="absolute top-4 right-4 text-slate-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 h-full bg-[#0A192F] flex-col border-r border-slate-800 shrink-0">
        <NavContent />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 lg:hidden flex items-center p-4">
          <button onClick={() => setMobileMenuOpen(true)} className="text-slate-600 hover:text-slate-900">
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="ml-4 text-lg font-semibold text-slate-800">Central ILG</h2>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-stone-50">
          <div className="max-w-7xl mx-auto min-h-full w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
