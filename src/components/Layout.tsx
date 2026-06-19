import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, UserCheck, BookOpen, FileText, CreditCard, 
  LifeBuoy, CheckSquare, LogOut, Menu, X, RefreshCw, Briefcase, 
  DollarSign, MessageSquare, FileSpreadsheet, Award, Video, Sparkles, 
  UserCircle, Search, HelpCircle, Hammer, Shield, Eye, Bell, Layers, BarChart3, Tag,
  TrendingUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { syncNow, useStore } from '../store';
import { NotificationPanel } from './NotificationPanel';
import { GlobalSearchModal } from './GlobalSearchModal';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: any;
  setActiveTab: (tab: any) => void;
  onLogout: () => void;
  selectedProfile?: string | null;
}

export function Layout({ children, activeTab, setActiveTab, onLogout, selectedProfile }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Search and Notification visibility states
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileNotificationsOpen, setProfileNotificationsOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState('');
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);

  const { data, isLocalFallbackMode, isOnline } = useStore();
  const pessoas = data.pessoas || [];
  const tarefas = data.tarefas_suporte || [];
  const pagamentos = data.pagamentos || [];

  const getProfileHandle = (profileId: string | null | undefined) => {
    if (!profileId) return '';
    const profileLower = profileId.toLowerCase();
    if (profileLower.includes('liana')) return '@Liana';
    if (profileLower.includes('nuria')) return '@Nuria';
    if (profileLower.includes('ana')) return '@Ana';
    if (profileLower.includes('luiza')) return '@Luiza';
    return `@${profileId}`;
  };

  const isTaskAssignedToMe = (t: any, profileId: string | null | undefined) => {
    if (!profileId) return false;
    const rawResp = (t.responsavel || t.colaborador || '').toLowerCase().trim();
    const rawId = profileId.toLowerCase().trim();
    
    if (rawResp.includes(rawId)) return true;
    if (rawId.includes(rawResp) && rawResp.length > 2) return true;
    
    if (rawId.includes('liana') && (rawResp.includes('liana') || rawResp.includes('director'))) return true;
    if (rawId.includes('nuria') && (rawResp.includes('nuria') || rawResp.includes('núria') || rawResp.includes('onboarding'))) return true;
    if (rawId.includes('ana') && (rawResp.includes('ana') || rawResp.includes('comercial'))) return true;
    if (rawId.includes('luiza') && (rawResp.includes('luiza') || rawResp.includes('coordena'))) return true;
    
    return false;
  };

  const myPendingNotifications = useMemo(() => {
    if (!selectedProfile) return [];
    const list: any[] = [];
    const handle = getProfileHandle(selectedProfile).toLowerCase();

    // 1. Uncompleted Tasks assigned to me
    tarefas.forEach(t => {
      const isCompleted = t.status === 'concluído' || t.status === 'resolvido' || t.status === 'feito';
      if (!isCompleted && isTaskAssignedToMe(t, selectedProfile)) {
        list.push({
          id: `profile-task-${t.id}`,
          type: 'task',
          title: t.titulo,
          description: t.descricao || 'Sem descrição.',
          date: t.prazo || 'Sem prazo',
          origin: t.categoria || 'Tarefa',
          originalRecord: t,
        });
      }
    });

    // 2. Mentions in Communication Module
    const messages = data.ilgc_mensagens || [];
    messages.forEach(m => {
      if (m.autorId !== selectedProfile) {
        if (m.texto && m.texto.toLowerCase().includes(handle)) {
          const channel = (data.ilgc_canais || []).find((c: any) => c.id === m.channelId);
          list.push({
            id: `profile-mention-msg-${m.id}`,
            type: 'mention',
            title: `Mencionada por ${m.autorNome}`,
            description: m.texto,
            date: m.dataHora || '',
            origin: channel ? `#${channel.nome}` : '#geral',
            originalRecord: m,
            channelId: m.channelId
          });
        }
        
        if (m.replies && m.replies.length > 0) {
          m.replies.forEach(rep => {
            if (rep.autorId !== selectedProfile && rep.texto && rep.texto.toLowerCase().includes(handle)) {
              const channel = (data.ilgc_canais || []).find((c: any) => c.id === m.channelId);
              list.push({
                id: `profile-mention-rep-${rep.id}`,
                type: 'mention',
                title: `Mencionada em Thread por ${rep.autorNome}`,
                description: rep.texto,
                date: rep.dataHora || '',
                origin: channel ? `#${channel.nome}` : '#geral',
                originalRecord: m,
                channelId: m.channelId
              });
            }
          });
        }
      }
    });

    return list;
  }, [selectedProfile, tarefas, data.ilgc_mensagens, data.ilgc_canais]);

  const myPendingNotificationsCount = myPendingNotifications.length;

  // Helper date parsing for alarms
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const badgeCount = useMemo(() => {
    let count = 0;

    // 1. Leads followups due today or overdue
    pessoas.forEach(p => {
      if (p.tipoPessoa === 'lead' && p.status !== 'vendido' && p.status !== 'perdido') {
        const contactDate = p.proximoContato || p.proximoFollowUp;
        if (contactDate && contactDate <= todayStr) {
          count++;
        }
      }
    });

    // 2. Overdue or urgent tasks
    tarefas.forEach(t => {
      const isCompleted = t.status === 'concluído' || t.status === 'resolvido' || t.status === 'feito';
      if (!isCompleted && t.prazo && t.prazo <= todayStr) {
        count++;
      }
    });

    // 3. Late payments
    pagamentos.forEach(pag => {
      const isPaid = pag.status === 'pago';
      if (!isPaid && pag.vencimento && pag.vencimento <= todayStr) {
        count++;
      }
    });

    return count;
  }, [pessoas, tarefas, pagamentos, todayStr]);

  const matchedResults = useMemo(() => {
    if (!headerSearch.trim() || headerSearch.trim().length < 2) return null;
    const query = headerSearch.toLowerCase().trim();

    const matchVal = (val: any, q: string) => {
      if (!val) return false;
      return String(val).toLowerCase().includes(q);
    };

    const turmasList = data.turmas || [];
    const materiaisList = data.materiais || [];
    const pagamentosList = data.pagamentos || [];
    const tarefasSuporteList = data.tarefas_suporte || [];

    return {
      leads: pessoas.filter(p => 
        p.tipoPessoa === 'lead' && (
          matchVal(p.nome, query) ||
          matchVal(p.email, query) ||
          matchVal(p.telefone, query) ||
          matchVal(p.status, query) ||
          matchVal(p.produtoInteresse, query) ||
          matchVal(p.responsavel, query)
        )
      ),
      alunos: pessoas.filter(p => 
        p.tipoPessoa === 'aluna' && (
          matchVal(p.nome, query) ||
          matchVal(p.email, query) ||
          matchVal(p.telefone, query) ||
          matchVal(p.turma, query) ||
          matchVal(p.produtoComprado, query) ||
          matchVal(p.formacao, query)
        )
      ),
      turmas: turmasList.filter(t => 
        matchVal(t.nome, query) || 
        matchVal(t.formacao, query) || 
        matchVal(t.status, query)
      ),
      materiais: materiaisList.filter(m => {
        const nomeStr = m.nome ?? m.titulo ?? '';
        const catStr = m.categoria ?? m.tipo ?? '';
        return (
          matchVal(nomeStr, query) ||
          matchVal(catStr, query) ||
          matchVal(m.responsavel, query)
        );
      }),
      pagamentos: pagamentosList.filter(pag => 
        matchVal(pag.aluno, query) || 
        matchVal(pag.formacao, query) || 
        matchVal(pag.status, query)
      ),
      suporte: tarefasSuporteList.filter(t => 
        t.tipo === 'suporte' && (
          matchVal(t.titulo, query) || 
          matchVal(t.descricao, query) || 
          matchVal(t.categoria, query)
        )
      ),
      tarefas: tarefasSuporteList.filter(t => 
        t.tipo === 'tarefa' && (
          matchVal(t.titulo, query) || 
          matchVal(t.descricao, query) || 
          matchVal(t.prioridade, query)
        )
      )
    };
  }, [headerSearch, pessoas, data]);

  const totalFound = useMemo(() => {
    if (!matchedResults) return 0;
    return (
      matchedResults.leads.length +
      matchedResults.alunos.length +
      matchedResults.turmas.length +
      matchedResults.materiais.length +
      matchedResults.pagamentos.length +
      matchedResults.suporte.length +
      matchedResults.tarefas.length
    );
  }, [matchedResults]);

  const handleDropdownRowAction = (type: string, item: any) => {
    setHeaderSearch('');
    setShowResultsDropdown(false);

    if (type === 'lead' || type === 'aluno') {
      window.dispatchEvent(new CustomEvent('open_pessoa_ficha', { detail: item }));
    } else if (type === 'turma') {
      setActiveTab('certificados');
    } else if (type === 'material') {
      const url = item.linkDrive || item.link;
      if (url) {
        window.open(url, '_blank', 'noreferrer,noopener');
      } else {
        setActiveTab('materiais');
      }
    } else if (type === 'pagamento') {
      const matched = pessoas.find(p => p.nome && item.aluno && p.nome.toLowerCase().trim() === item.aluno.toLowerCase().trim());
      if (matched) {
        window.dispatchEvent(new CustomEvent('open_pessoa_ficha', { detail: matched }));
      } else {
        setActiveTab('financeiro');
      }
    } else if (type === 'suporte') {
      const matched = pessoas.find(p => p.id === item.pessoaId || (p.email && item.email && p.email.toLowerCase() === item.email.toLowerCase()));
      if (matched) {
        window.dispatchEvent(new CustomEvent('open_pessoa_ficha', { detail: matched }));
      } else {
        setActiveTab('alunos');
      }
    } else if (type === 'tarefa') {
      const matched = pessoas.find(p => p.id === item.pessoaId);
      if (matched) {
        window.dispatchEvent(new CustomEvent('open_pessoa_ficha', { detail: matched }));
      } else {
        setActiveTab('prioridades_hoje');
      }
    }
  };

  // Swipe Gestures for Mobile Navigation between Main Tab Modules
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.changedTouches[0];
    const diffX = touchStart.x - touch.clientX;
    const diffY = touchStart.y - touch.clientY;

    const swipeThreshold = 65; // minimum horizontal px
    const maxVerticalDiff = 45; // prevent trigger during list scrolling

    if (Math.abs(diffY) < maxVerticalDiff) {
      const mobileNavTabs = ['dashboard', 'meu_painel', 'pessoas', 'prioridades_hoje'];
      const currentIdx = mobileNavTabs.indexOf(activeTab);
      
      if (currentIdx !== -1) {
        if (diffX > swipeThreshold) {
          // Swiped Left -> next page
          const nextIdx = Math.min(currentIdx + 1, mobileNavTabs.length - 1);
          if (nextIdx !== currentIdx) {
            setActiveTab(mobileNavTabs[nextIdx]);
            if (typeof window !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate(10); } catch (_) {}
            }
          }
        } else if (diffX < -swipeThreshold) {
          // Swiped Right -> prev page
          const prevIdx = Math.max(currentIdx - 1, 0);
          if (prevIdx !== currentIdx) {
            setActiveTab(mobileNavTabs[prevIdx]);
            if (typeof window !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate(10); } catch (_) {}
            }
          }
        }
      }
    }
    setTouchStart(null);
  };
  
  // Work Mode selection - stored in localStorage
  const [workMode, setWorkMode] = useState<'todos' | 'comercial' | 'suporte' | 'conteudo' | 'gestao'>(() => {
    const saved = localStorage.getItem('ilg_work_mode');
    return (saved as any) || 'todos';
  });

  const perfis = data.perfis || [];
  
  const getProfileName = (id: string | null | undefined) => {
    if (!id) return 'Usuário';
    const profileDoc = perfis.find((p: any) => p.id === id);
    if (profileDoc && profileDoc.nome) return profileDoc.nome.split(' ')[0]; // first name
    switch(id) {
      case 'liana': return 'Liana Gomes';
      case 'luiza': return 'Luiza';
      case 'nuria': return 'Nuria';
      case 'ana': return 'Ana';
      default: return id;
    }
  };

  const getProfilePhoto = (id: string | null | undefined) => {
    if (!id) return null;
    const profileDoc = perfis.find((p: any) => p.id === id);
    if (profileDoc && profileDoc.foto) return profileDoc.foto;
    return null;
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
        { id: 'meu_perfil', label: 'Meu Perfil', icon: UserCircle },
        { id: 'relatorio_performance', label: 'Performance', icon: BarChart3 },
        { id: 'relatorio_engajamento', label: 'Engajamento por Origem', icon: TrendingUp },
        { id: 'prioridades_hoje', label: 'Prioridades de Hoje', icon: CheckSquare },
        { id: 'busca_global', label: 'Busca Global', icon: Search },
        { id: 'tag_manager', label: 'Gerenciador de Tags', icon: Tag }
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
        { id: 'importar', label: 'Cruzador de Dados (Nutror)', icon: Layers }
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
          <div className="relative">
            <button 
              type="button"
              onClick={() => setProfileNotificationsOpen(!profileNotificationsOpen)}
              className="w-full text-left bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/30 rounded-xl p-2.5 flex items-center gap-3 transition cursor-pointer focus:outline-none relative"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-indigo-900 text-white flex items-center justify-center font-black text-xs shadow-md overflow-hidden shrink-0 relative">
                {getProfilePhoto(selectedProfile) ? (
                  <img src={getProfilePhoto(selectedProfile)!} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  getProfileName(selectedProfile).charAt(0)
                )}
                {myPendingNotificationsCount > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border border-slate-850 animate-pulse" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 leading-none">Acesso</p>
                  {myPendingNotificationsCount > 0 && (
                    <span className="text-[9px] bg-rose-500 text-white font-extrabold px-1.5 py-0.5 rounded-full leading-none scale-90">
                      {myPendingNotificationsCount}
                    </span>
                  )}
                </div>
                <p className="text-xs font-black text-slate-200 truncate mt-1">{getProfileName(selectedProfile)}</p>
                <p className="text-[9px] text-[#D4AF37] font-bold font-mono tracking-wider uppercase mt-0.5">{getProfileHandle(selectedProfile)}</p>
              </div>
            </button>
            
            {profileNotificationsOpen && (
              <div className="absolute left-0 bottom-full mb-2 w-[280px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-left flex flex-col max-h-[420px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="p-3 bg-[#0A192F] text-white flex items-center justify-between select-none">
                  <span className="text-xs font-black text-slate-100 flex items-center gap-1.5">
                    <UserCircle className="w-4 h-4 text-[#D4AF37]" /> Pendências de {getProfileName(selectedProfile)}
                  </span>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileNotificationsOpen(false);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-850 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2 max-h-[300px] bg-stone-50">
                  {myPendingNotifications.length === 0 ? (
                    <div className="p-5 text-center space-y-1.5 select-none">
                      <span className="text-xl">✅</span>
                      <p className="text-xs font-extrabold text-slate-700">Tudo em dia!</p>
                      <p className="text-[10px] text-slate-550">Nenhuma tarefa pendente ou menção no chat sob seu perfil.</p>
                    </div>
                  ) : (
                    myPendingNotifications.map(n => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          setProfileNotificationsOpen(false);
                          if (n.type === 'task') {
                            setActiveTab('prioridades_hoje');
                          } else {
                            setActiveTab('comunicacao_interna');
                            if (n.channelId) {
                              setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('set_comunicacao_canal', { detail: n.channelId }));
                              }, 150);
                            }
                          }
                        }}
                        className="w-full text-left p-2.5 bg-white hover:bg-[#D4AF37]/5 border border-slate-200 rounded-xl hover:border-[#D4AF37]/30 transition flex gap-2 items-start shadow-2xs group cursor-pointer"
                      >
                        <div className={cn(
                          "p-1.5 rounded-lg shrink-0 mt-0.5",
                          n.type === 'task' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                        )}>
                          {n.type === 'task' ? <CheckSquare className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-extrabold text-[#1F4E89] bg-slate-100 px-1.5 py-0.2 rounded font-mono uppercase">{n.origin}</span>
                            <span className="text-[9px] text-slate-400 font-mono">{n.date.split(' ')[0]}</span>
                          </div>
                          <p className="text-xs font-black text-slate-800 leading-snug mt-1 truncate group-hover:text-indigo-800 transition">{n.title}</p>
                          <p className="text-[10px] text-slate-500 leading-normal mt-0.5 truncate">{n.description}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                
                <div className="p-2 bg-stone-100 text-center text-[9px] text-slate-500 font-bold border-t border-slate-200 select-none">
                  Total de {myPendingNotifications.length} pendências operacionais
                </div>
              </div>
            )}
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
                {group.items
                  .filter(item => {
                    if (item.id === 'relatorio_performance') {
                      return selectedProfile === 'liana' || selectedProfile === 'ericocavalheiro.psico';
                    }
                    if (item.id === 'relatorio_engajamento') {
                      return selectedProfile === 'liana' || selectedProfile === 'luiza' || selectedProfile === 'ericocavalheiro.psico';
                    }
                    return true;
                  })
                  .map((item) => {
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
            
            {/* Interactive Always-Visible Search Bar (both mobile and desktop) */}
            <div className="relative w-40 xs:w-52 sm:w-72 md:w-80 z-40">
              <input 
                type="text"
                placeholder="Pesquisa unificada..."
                value={headerSearch}
                onChange={e => {
                  setHeaderSearch(e.target.value);
                  setShowResultsDropdown(true);
                }}
                onFocus={() => setShowResultsDropdown(true)}
                className="w-full border border-slate-205 bg-slate-50 hover:bg-slate-100 rounded-lg py-1.5 pl-8 pr-7 text-xs outline-none text-slate-705 font-bold transition-all focus:bg-white focus:ring-1 focus:ring-[#0A192F]/20 focus:border-[#0A192F]"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              {headerSearch && (
                <button 
                  onClick={() => setHeaderSearch('')} 
                  className="absolute right-2 top-2 p-0.5 rounded-full text-slate-400 hover:text-slate-750 hover:bg-slate-205"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Float Dropdown Menu */}
              {showResultsDropdown && headerSearch.trim().length >= 2 && (
                <div className="absolute left-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-2xl z-55 max-h-96 overflow-y-auto p-3 space-y-4 animate-in fade-in slide-in-from-top-1 duration-150 w-[280px] xs:w-[320px] sm:w-[450px] md:w-[500px]">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-404 uppercase tracking-widest pb-1.5 border-b border-slate-100 select-none">
                    <span>Resultados ({totalFound})</span>
                    <span>Módulo de Origem</span>
                  </div>

                  {totalFound === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500 italic leading-snug">
                      Nenhum registro localizado para "{headerSearch}"
                    </div>
                  ) : (
                    <div className="space-y-3.5 pr-1">
                      {/* LEADS */}
                      {matchedResults?.leads && matchedResults.leads.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase text-orange-600 tracking-wider flex items-center gap-1 select-none">
                            <Briefcase className="w-3 h-3 text-orange-600" /> Leads Comerciais
                          </span>
                          {matchedResults.leads.slice(0, 3).map((item: any) => (
                            <div 
                              key={item.id}
                              onClick={() => handleDropdownRowAction('lead', item)}
                              className="p-2 hover:bg-orange-50/50 rounded-lg border border-transparent hover:border-orange-100 transition duration-150 cursor-pointer flex justify-between items-center text-left"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate">{item.nome}</p>
                                <p className="text-[10px] text-slate-500 truncate">{item.email || 'Sem e-mail'} • {item.telefone || 'Sem fone'}</p>
                              </div>
                              <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 select-none uppercase tracking-wider shrink-0 ml-2">Lead</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* ALUNOS */}
                      {matchedResults?.alunos && matchedResults.alunos.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase text-emerald-600 tracking-wider flex items-center gap-1 select-none">
                            <Users className="w-3 h-3 text-emerald-600" /> Alunas Registradas
                          </span>
                          {matchedResults.alunos.slice(0, 3).map((item: any) => (
                            <div 
                              key={item.id}
                              onClick={() => handleDropdownRowAction('aluno', item)}
                              className="p-2 hover:bg-emerald-50/50 rounded-lg border border-transparent hover:border-emerald-100 transition duration-150 cursor-pointer flex justify-between items-center text-left"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate">{item.nome}</p>
                                <p className="text-[10px] text-slate-500 truncate">{item.email || 'Sem e-mail'} • Turma: {item.turma || '-'}</p>
                              </div>
                              <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 select-none uppercase tracking-wider shrink-0 ml-2">Aluna</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* TURMAS */}
                      {matchedResults?.turmas && matchedResults.turmas.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1 select-none">
                            <Layers className="w-3 h-3 text-indigo-600" /> Turmas / Calendário
                          </span>
                          {matchedResults.turmas.slice(0, 3).map((item: any) => (
                            <div 
                              key={item.id}
                              onClick={() => handleDropdownRowAction('turma', item)}
                              className="p-2 hover:bg-indigo-50/50 rounded-lg border border-transparent hover:border-indigo-100 transition duration-150 cursor-pointer flex justify-between items-center text-left"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate">{item.nome}</p>
                                <p className="text-[10px] text-slate-500 truncate">{item.formacao || 'Formação Geral'}</p>
                              </div>
                              <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 select-none uppercase tracking-wider shrink-0 ml-2">Turma</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* MATERIAIS */}
                      {matchedResults?.materiais && matchedResults.materiais.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase text-teal-650 tracking-wider flex items-center gap-1 select-none">
                            <BookOpen className="w-3 h-3 text-teal-600" /> Biblioteca & Materiais
                          </span>
                          {matchedResults.materiais.slice(0, 3).map((item: any) => (
                            <div 
                              key={item.id}
                              onClick={() => handleDropdownRowAction('material', item)}
                              className="p-2 hover:bg-teal-50/40 rounded-lg border border-transparent hover:border-teal-100 transition duration-150 cursor-pointer flex justify-between items-center text-left"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate">{item.nome ?? item.titulo}</p>
                                <p className="text-[10px] text-slate-505 truncate">Categoria: {item.categoria ?? item.tipo ?? '-'}</p>
                              </div>
                              <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 select-none uppercase tracking-wider shrink-0 ml-2">Material</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* FINANCEIRO */}
                      {matchedResults?.pagamentos && matchedResults.pagamentos.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider flex items-center gap-1 select-none">
                            <DollarSign className="w-3 h-3 text-[#D4AF37]" /> Faturamento & Parcelas
                          </span>
                          {matchedResults.pagamentos.slice(0, 3).map((item: any) => (
                            <div 
                              key={item.id}
                              onClick={() => handleDropdownRowAction('pagamento', item)}
                              className="p-2 hover:bg-amber-50/40 rounded-lg border border-transparent hover:border-amber-100 transition duration-150 cursor-pointer flex justify-between items-center text-left"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate">{item.aluno}</p>
                                <p className="text-[10px] text-slate-505 truncate">Mapeamento {item.formacao} - {item.status}</p>
                              </div>
                              <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-[#856404] select-none uppercase tracking-wider shrink-0 ml-2">Financeiro</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* SUPORTE / TAREFAS */}
                      {((matchedResults?.suporte && matchedResults.suporte.length > 0) || (matchedResults?.tarefas && matchedResults.tarefas.length > 0)) && (
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-black uppercase text-purple-600 tracking-wider flex items-center gap-1 select-none">
                            <CheckSquare className="w-3 h-3 text-purple-600" /> Chamados & Demandas de Suporte
                          </span>
                          {matchedResults.suporte?.slice(0, 2).map((item: any) => (
                            <div 
                              key={item.id}
                              onClick={() => handleDropdownRowAction('suporte', item)}
                              className="p-2 hover:bg-purple-50/40 rounded-lg border border-transparent hover:border-purple-100 transition duration-150 cursor-pointer flex justify-between items-center text-left"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate">{item.titulo}</p>
                                <p className="text-[10px] text-slate-505 truncate">Canal de Atendimento de Alunos</p>
                              </div>
                              <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 select-none uppercase tracking-wider shrink-0 ml-2">Suporte</span>
                            </div>
                          ))}
                          {matchedResults.tarefas?.slice(0, 2).map((item: any) => (
                            <div 
                              key={item.id}
                              onClick={() => handleDropdownRowAction('tarefa', item)}
                              className="p-2 hover:bg-purple-50/40 rounded-lg border border-transparent hover:border-purple-100 transition duration-150 cursor-pointer flex justify-between items-center text-left"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 truncate">{item.titulo}</p>
                                <p className="text-[10px] text-slate-505 truncate">Prazo: {item.prazo?.split('-').reverse().join('/') || 'Sem prazo'}</p>
                              </div>
                              <span className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 select-none uppercase tracking-wider shrink-0 ml-2">Tarefa</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer links to full advanced search view */}
                  <div className="p-2 bg-slate-50 rounded-lg text-center border-t border-slate-100 pt-2.5">
                    <button 
                      onClick={() => {
                        setSearchOpen(true);
                        setShowResultsDropdown(false);
                      }}
                      className="w-full text-center text-[#1D4E89] hover:text-[#0A192F] font-extrabold text-[10px] uppercase tracking-wider transition"
                    >
                      🚀 Abrir Painel de Busca Avançada (Filtro por Tags)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Float Backdrop to close search dropdown when clicking outside */}
            {showResultsDropdown && headerSearch.trim().length >= 2 && (
              <div 
                className="fixed inset-0 z-30 cursor-default bg-slate-900/10 backdrop-blur-2xs" 
                onClick={() => setShowResultsDropdown(false)} 
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Badge Trigger */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={cn(
                  "p-2 text-slate-600 hover:text-[#1F4E89] hover:bg-slate-100 rounded-full transition relative cursor-pointer select-none",
                  badgeCount > 0 ? "bg-red-50/40 text-red-650" : ""
                )}
                title="Notificações e Alertas Operacionais"
              >
                <Bell className={cn("w-5 h-5", badgeCount > 0 && "animate-pulse")} />
                {badgeCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-600 border-2 border-white text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {badgeCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <NotificationPanel 
                  onClose={() => setNotificationsOpen(false)} 
                  setActiveTab={setActiveTab} 
                />
              )}
            </div>

            {/* Profile Notifications Dropdown Trigger */}
            {selectedProfile && (
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setProfileNotificationsOpen(!profileNotificationsOpen)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-indigo-950 border border-slate-200 text-white flex items-center justify-center font-black text-xs shadow-sm hover:ring-2 hover:ring-[#D4AF37]/45 hover:border-[#D4AF37] transition cursor-pointer overflow-hidden relative shrink-0 focus:outline-none"
                  title="Minhas Pendências (Tarefas & Menções)"
                >
                  {getProfilePhoto(selectedProfile) ? (
                    <img src={getProfilePhoto(selectedProfile)!} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    getProfileName(selectedProfile).charAt(0)
                  )}
                  {myPendingNotificationsCount > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white animate-pulse" />
                  )}
                </button>
                {profileNotificationsOpen && (
                  <div className="absolute right-0 top-12 w-[300px] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-left flex flex-col max-h-[420px] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 bg-[#0A192F] text-white flex items-center justify-between select-none">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-indigo-900 text-white flex items-center justify-center font-black text-[9px] overflow-hidden shrink-0">
                          {getProfilePhoto(selectedProfile) ? (
                            <img src={getProfilePhoto(selectedProfile)!} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            getProfileName(selectedProfile).charAt(0)
                          )}
                        </div>
                        <span className="text-xs font-black text-slate-100">
                          Pendências de {getProfileName(selectedProfile)}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setProfileNotificationsOpen(false)}
                        className="p-1 rounded text-slate-450 hover:text-white hover:bg-slate-850 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[300px] bg-stone-50">
                      {myPendingNotifications.length === 0 ? (
                        <div className="p-6 text-center h-44 flex flex-col items-center justify-center space-y-1.5 select-none font-sans">
                          <span className="text-2xl">🎉</span>
                          <p className="text-xs font-extrabold text-slate-700">Tudo em dia!</p>
                          <p className="text-[10px] text-slate-500 max-w-[200px]">Como colaborador do Instituto Liana Gomes, você não possui pendências ou menções pendentes.</p>
                        </div>
                      ) : (
                        myPendingNotifications.map(n => (
                          <button
                            key={n.id}
                            type="button"
                            onClick={() => {
                              setProfileNotificationsOpen(false);
                              if (n.type === 'task') {
                                setActiveTab('prioridades_hoje');
                              } else {
                                setActiveTab('comunicacao_interna');
                                if (n.channelId) {
                                  setTimeout(() => {
                                    window.dispatchEvent(new CustomEvent('set_comunicacao_canal', { detail: n.channelId }));
                                  }, 150);
                                }
                              }
                            }}
                            className="w-full text-left p-2.5 bg-white hover:bg-[#D4AF37]/5 border border-slate-200 rounded-xl hover:border-[#D4AF37]/35 transition flex gap-2.5 items-start shadow-3xs group cursor-pointer"
                          >
                            <div className={cn(
                              "p-1.5 rounded-lg shrink-0 mt-0.5",
                              n.type === 'task' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                            )}>
                              {n.type === 'task' ? <CheckSquare className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[9px] font-extrabold text-[#1F4E89] bg-slate-100 px-1.5 py-0.2 rounded font-mono uppercase pr-1 block truncate max-w-[130px]">{n.origin}</span>
                                <span className="text-[9px] text-slate-400 font-mono scale-90 shrink-0">{n.date.split(' ')[0]}</span>
                              </div>
                              <p className="text-xs font-black text-slate-800 leading-snug mt-1 truncate group-hover:text-[#1F4E89] transition">{n.title}</p>
                              <p className="text-[10px] text-slate-500 leading-normal mt-0.5 truncate">{n.description}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                    
                    <div className="p-2 bg-stone-100 text-center text-[9px] text-slate-500 font-bold border-t border-slate-200 select-none">
                      Total de {myPendingNotifications.length} pendências ativas
                    </div>
                  </div>
                )}
              </div>
            )}

            {isLocalFallbackMode ? (
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-600 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm select-none" title="Conexão com Firestore indisponível. O portal está operando em modo offline Sandbox com dados 100% seguros!">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                Modo Offline (Sandbox)
              </span>
            ) : !isOnline ? (
              <span className="text-[10px] bg-orange-500/10 border border-orange-500/25 text-orange-600 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm select-none animate-pulse" title="Você está desconectada da internet. O portal continuará funcionando perfeitamente lendo e salvando alterações no cache offline local.">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                Modo Offline (Lendo Cache)
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm select-none" title="Sua conexão está ativa! Toda a base do Firestore está sincronizada de forma transparente em tempo real.">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Online (Sincronizado)
              </span>
            )}

            <span className="text-[10px] bg-[#0A192F] text-[#D4AF37] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide flex items-center gap-1.5 shadow-sm border border-[#D4AF37]/20 select-none">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Central Operacional ILG
            </span>
          </div>
        </header>

        {/* View container with responsive swipe gesture navigation */}
        <main 
          onTouchStart={handleTouchStart} 
          onTouchEnd={handleTouchEnd}
          className="flex-1 overflow-y-auto p-4 lg:p-8 bg-stone-50 w-full min-h-0"
        >
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

      {/* Global Search Overlay visible across all views */}
      {searchOpen && (
        <GlobalSearchModal 
          onClose={() => setSearchOpen(false)} 
          setActiveTab={setActiveTab} 
        />
      )}

    </div>
  );
}
