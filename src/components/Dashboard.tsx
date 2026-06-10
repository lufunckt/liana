import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { 
  Briefcase, MessageSquare, Sparkles, Trash2, Pin, CheckSquare, 
  Send, User, AlertTriangle, Lightbulb, Check, Plus, Loader2, TrendingUp,
  Activity, ShieldAlert, ShieldCheck, RefreshCw, UserCheck, CreditCard,
  ArrowRight, CheckCircle2, Award, HeartPulse, Lock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function Dashboard({ selectedProfile }: { selectedProfile?: string | null }) {
  const { data, updateModuleData, updateSingleField } = useStore();
  const tarefas = data.tarefas_suporte || [];
  const pagamentos = data.pagamentos || [];
  const pessoas = data.pessoas || [];

  const [dashboardTab, setDashboardTab] = useState<'mural' | 'health' | 'performance'>('mural');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const { monthlyData, totalPrevistoPeriodo, totalRealizadoPeriodo } = useMemo(() => {
    const monthsMap: Record<string, { previsto: number; realizado: number }> = {};
    let totalPrevisto = 0;
    let totalRealizado = 0;

    pagamentos.forEach((p: any) => {
      // Find or assign month
      let monthKey = '2026-05'; // Default for seed objects without vencimento
      if (p.vencimento) {
        const parts = p.vencimento.split('-');
        if (parts.length >= 2) {
          monthKey = `${parts[0]}-${parts[1]}`;
        }
      }

      const valor = parseFloat(p.valorCombinado) || 0;

      if (!monthsMap[monthKey]) {
        monthsMap[monthKey] = { previsto: 0, realizado: 0 };
      }

      monthsMap[monthKey].previsto += valor;
      totalPrevisto += valor;

      if (p.status === 'pago') {
        monthsMap[monthKey].realizado += valor;
        totalRealizado += valor;
      }
    });

    const sorted = Object.keys(monthsMap)
      .sort()
      .map(key => {
        const [year, month] = key.split('-');
        const monthNames = [
          'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        const mIdx = parseInt(month, 10) - 1;
        const label = (mIdx >= 0 && mIdx < 12) ? `${monthNames[mIdx]}/${year}` : key;

        return {
          monthKey: key,
          label,
          previsto: parseFloat(monthsMap[key].previsto.toFixed(2)),
          realizado: parseFloat(monthsMap[key].realizado.toFixed(2))
        };
      });

    return {
      monthlyData: sorted,
      totalPrevistoPeriodo: totalPrevisto,
      totalRealizadoPeriodo: totalRealizado
    };
  }, [pagamentos]);

  // Team Profiles
  const profiles = [
    { 
      id: 'liana', 
      name: 'Liana Gomes', 
      role: 'Fundadora & Diretora Geral', 
      foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300',
      description: 'Diretoria Executiva, Estratégia Corporativa & Delegar Tarefas',
      pills: 'Direção Geral',
      color: 'border-[#D4AF37]/40 hover:border-[#D4AF37]',
      glow: 'shadow-[#D4AF37]/5'
    },
    { 
      id: 'ana', 
      name: 'Ana', 
      role: 'Head de Negócios & Comercial', 
      foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300&h=300',
      description: 'Gestão comercial, CRM, Leads quentes & Faturamento',
      pills: 'Comercial & Vendas',
      color: 'border-orange-500/30 hover:border-orange-500',
      glow: 'shadow-orange-500/5'
    },
    { 
      id: 'nuria', 
      name: 'Núria', 
      role: 'Client Success, Mídias & Operação', 
      foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300',
      description: 'Onboarding de alunas, Nutror, MRP Tracker & Redes sociais',
      pills: 'Sucesso & Midia',
      color: 'border-emerald-500/30 hover:border-emerald-500',
      glow: 'shadow-emerald-500/5'
    },
    { 
      id: 'luiza', 
      name: 'Luiza', 
      role: 'Tech Lead / Administradora', 
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300',
      description: 'Manutenção do Portal, Logs de segurança & LinkedIn pautas',
      pills: 'Tech & Admin',
      color: 'border-indigo-500/30 hover:border-indigo-500',
      glow: 'shadow-indigo-500/5'
    }
  ];

  // Filter Mural items from generic database tarefas_suporte
  const recados = tarefas.filter(t => t.tipo === 'mural_recado');
  const muralTarefas = tarefas.filter(t => t.categoria === 'mural_tarefa');

  // Input States for Manual Adding
  const [newRecado, setNewRecado] = useState('');
  const [newRecadoColor, setNewRecadoColor] = useState('yellow'); // yellow, blue, pink, green
  
  const [newTarefaTitle, setNewTarefaTitle] = useState('');
  const [newTarefaResponsavel, setNewTarefaResponsavel] = useState('Geral');
  const [newTarefaPrioridade, setNewTarefaPrioridade] = useState('média');

  // IA Diagnostics Inputs
  const [aiInputText, setAiInputText] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  // Local Storage workspace action
  const handleSelectWorkspace = (profileId: string) => {
    localStorage.setItem('ilg_selected_profile', profileId);
    // Switch to spaces tab dynamically
    window.dispatchEvent(new CustomEvent('change_active_tab', { detail: 'espacos' }));
    // Wait slightly and refresh page so layouts and store get completely syncd for the active profile
    setTimeout(() => {
      window.location.reload();
    }, 120);
  };

  const handleAccessComunicacaoInterna = () => {
    window.dispatchEvent(new CustomEvent('change_active_tab', { detail: 'comunicacao_interna' }));
  };

  // Insert a new manual notice
  const handleAddManualRecado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecado.trim()) return;

    const newItem = {
      id: 'mural_recado_' + Date.now(),
      titulo: newRecado,
      descricao: newRecadoColor, // encode sticky color here
      tipo: 'mural_recado',
      categoria: 'mural_recado',
      status: 'ativo',
      responsavel: 'Geral',
      prioridade: 'média',
      prazo: ''
    };

    const updated = [...tarefas, newItem];
    await updateModuleData('tarefas_suporte', updated);
    setNewRecado('');
  };

  // Add a new mural task manually
  const handleAddManualMuralTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarefaTitle.trim()) return;

    const newItem = {
      id: 'mural_tarefa_' + Date.now(),
      titulo: newTarefaTitle,
      descricao: 'Adicionada manualmente no Mural Coletivo.',
      tipo: 'tarefa',
      categoria: 'mural_tarefa',
      status: 'a fazer',
      responsavel: newTarefaResponsavel,
      prioridade: newTarefaPrioridade,
      prazo: new Date().toISOString().split('T')[0]
    };

    const updated = [...tarefas, newItem];
    await updateModuleData('tarefas_suporte', updated);
    setNewTarefaTitle('');
  };

  // Complete a mural task
  const handleToggleMuralTarefa = async (id: string, currentStatus: string) => {
    const updated = tarefas.map(t => {
      if (t.id === id) {
        return { ...t, status: currentStatus === 'concluído' ? 'a fazer' : 'concluído' };
      }
      return t;
    });
    await updateModuleData('tarefas_suporte', updated);
  };

  // Delete any mural item
  const handleDeleteMuralItem = async (id: string) => {
    const updated = tarefas.filter(t => t.id !== id);
    await updateModuleData('tarefas_suporte', updated);
  };

  // IA Generator Trigger
  const handleAiDiagnosticMuralGeneration = async () => {
    if (!aiInputText.trim()) {
      setAiError('Por favor, informe alguma pauta, áudio transcrito ou notas de diálogos.');
      return;
    }

    setIsAiGenerating(true);
    setAiError('');

    try {
      const response = await fetch('/api/diagnostico-mural', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ texto: aiInputText })
      });

      if (!response.ok) {
        const errBody = await response.json();
        throw new Error(errBody.error || 'Falha ao processar resumo com IA.');
      }

      const generated = await response.json();

      let itemsToAdd: any[] = [];

      // Map recados
      if (Array.isArray(generated.recados)) {
        generated.recados.forEach((rec: string, idx: number) => {
          itemsToAdd.push({
            id: 'mural_recado_ai_' + Date.now() + '_' + idx,
            titulo: rec,
            descricao: 'yellow', // Default safe post-it color
            tipo: 'mural_recado',
            categoria: 'mural_recado',
            status: 'ativo',
            responsavel: 'Geral',
            prioridade: 'média',
            prazo: ''
          });
        });
      }

      // Map tarefas
      if (Array.isArray(generated.tarefas)) {
        generated.tarefas.forEach((task: any, idx: number) => {
          itemsToAdd.push({
            id: 'mural_tarefa_ai_' + Date.now() + '_' + idx,
            titulo: task.titulo,
            descricao: 'Gerada automaticamente por inteligência artificial através de diagnósticos de pautas.',
            tipo: 'tarefa',
            categoria: 'mural_tarefa',
            status: 'a fazer',
            responsavel: task.responsavel || 'Geral',
            prioridade: task.prioridade || 'média',
            prazo: new Date().toISOString().split('T')[0]
          });
        });
      }

      if (itemsToAdd.length === 0) {
        throw new Error('A inteligência artificial não identificou itens ou tarefas acionáveis neste texto. Tente detalhar um pouco mais.');
      }

      const updated = [...tarefas, ...itemsToAdd];
      await updateModuleData('tarefas_suporte', updated);
      
      setAiInputText('');
      alert(`Mural atualizado com sucesso via Inteligência Artificial! Foram adicionadas ${itemsToAdd.length} novas notas coletivas.`);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Houve um erro de comunicação ou processamento no servidor de inteligência artificial.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // --- SISTEMA DE PERFORMANCE E ATIVIDADES DAS COLABORADORAS (EXCLUSIVO LIANA) ---
  const activeProfile = selectedProfile || localStorage.getItem('ilg_selected_profile') || 'liana';
  const isLiana = activeProfile === 'liana';

  const [performancePeriod, setPerformancePeriod] = useState<'hoje' | 'ontem' | 'mes' | 'todos'>('hoje');

  const dateIntervals = useMemo(() => {
    return {
      todayStr: '2026-06-04',
      yesterdayStr: '2026-06-03',
      currentMonth: '2026-06'
    };
  }, []);

  const [targetColaborador, setTargetColaborador] = useState('ana');
  const [manualDate, setManualDate] = useState('2026-06-04');
  const [manualAbordagens, setManualAbordagens] = useState('0');
  const [manualFollowups, setManualFollowups] = useState('0');
  const [manualFechamentos, setManualFechamentos] = useState('0');
  const [manualAtendimentos, setManualAtendimentos] = useState('0');
  const [manualNota, setManualNota] = useState('');

  const perfis = data.perfis || [];

  const calculatedPerformance = useMemo(() => {
    const { todayStr, yesterdayStr, currentMonth } = dateIntervals;
    
    const cols = [
      { id: 'liana', name: 'Liana Gomes', role: 'Diretoria Geral', color: '#D4AF37' },
      { id: 'ana', name: 'Ana', role: 'Head de Negócios & Comercial', color: '#1D4E89' },
      { id: 'fabi', name: 'Fabi', role: 'Operadora de Vendas', color: '#EA580C' },
      { id: 'nuria', name: 'Núria', role: 'CS & Sucesso', color: '#10B981' },
      { id: 'luiza', name: 'Luiza', role: 'Tech Lead / Admin', color: '#6366F1' }
    ];

    const isWithinPeriod = (dateVal: string) => {
      if (!dateVal) return false;
      const formattedDate = dateVal.split(' ')[0];
      if (performancePeriod === 'hoje') {
        return formattedDate === todayStr;
      } else if (performancePeriod === 'ontem') {
        return formattedDate === yesterdayStr;
      } else if (performancePeriod === 'mes') {
        return formattedDate.startsWith(currentMonth);
      }
      return true; // 'todos'
    };

    return cols.map(c => {
      let abordagens = 0;
      let followups = 0;
      let fechamentos = 0;
      let atendimentos = 0;

      // 1. Abordagens
      pessoas.forEach((p: any) => {
        const isResp = p.responsavel?.toLowerCase().includes(c.id) || 
                       (c.id === 'liana' && p.responsavel?.toLowerCase() === 'liana') ||
                       (c.id === 'fabi' && p.responsavel?.toLowerCase() === 'fabi') ||
                       (c.id === 'nuria' && p.responsavel?.toLowerCase() === 'nuria') ||
                       (c.id === 'luiza' && p.responsavel?.toLowerCase() === 'luiza');

        if (isResp && p.tipoPessoa === 'lead') {
          if (p.ultimaInteracao && isWithinPeriod(p.ultimaInteracao)) {
            abordagens += 1;
          }
        }
      });

      // 2. Followups (Leads in negotiation that had contact update)
      pessoas.forEach((p: any) => {
        const isResp = p.responsavel?.toLowerCase().includes(c.id) || 
                       (c.id === 'liana' && p.responsavel?.toLowerCase() === 'liana') ||
                       (c.id === 'fabi' && p.responsavel?.toLowerCase() === 'fabi') ||
                       (c.id === 'nuria' && p.responsavel?.toLowerCase() === 'nuria') ||
                       (c.id === 'luiza' && p.responsavel?.toLowerCase() === 'luiza');

        if (isResp && p.tipoPessoa === 'lead' && p.status === 'em negociação') {
          if (p.ultimaInteracao && isWithinPeriod(p.ultimaInteracao)) {
            followups += 1;
          }
        }
      });

      // 3. Fechamentos (Paid payments)
      pagamentos.forEach((pag: any) => {
        const isResp = pag.responsavel?.toLowerCase().includes(c.id) || 
                       (c.id === 'liana' && pag.responsavel?.toLowerCase() === 'liana') ||
                       (c.id === 'fabi' && pag.responsavel?.toLowerCase() === 'fabi') ||
                       (c.id === 'nuria' && pag.responsavel?.toLowerCase() === 'nuria') ||
                       (c.id === 'luiza' && pag.responsavel?.toLowerCase() === 'luiza');

        if (isResp && pag.status === 'pago') {
          if (pag.vencimento && isWithinPeriod(pag.vencimento)) {
            fechamentos += 1;
          }
        }
      });

      // 4. Atendimentos (Completed tasks)
      tarefas.forEach((t: any) => {
        const isResp = t.responsavel?.toLowerCase().includes(c.id) || 
                       (c.id === 'liana' && t.responsavel?.toLowerCase() === 'liana') ||
                       (c.id === 'fabi' && t.responsavel?.toLowerCase() === 'fabi') ||
                       (c.id === 'nuria' && t.responsavel?.toLowerCase() === 'nuria') ||
                       (c.id === 'luiza' && t.responsavel?.toLowerCase() === 'luiza');

        if (isResp && t.status === 'concluído') {
          if (t.prazo && isWithinPeriod(t.prazo)) {
            atendimentos += 1;
          }
        }
      });

      const profileDoc = perfis.find((p: any) => p.id === c.id);
      let manualAbordagens = 0;
      let manualFollowups = 0;
      let manualFechamentos = 0;
      let manualAtendimentos = 0;

      const defaultMocks: Record<string, any[]> = {
        liana: [
          { id: 'm_li_1', data: yesterdayStr, abordagens: 4, followups: 2, fechamentos: 1, atendimentos: 3, nota: 'Abordagem estratégica institucional.' },
          { id: 'm_li_2', data: todayStr, abordagens: 2, followups: 1, fechamentos: 1, atendimentos: 2, nota: 'Alinhamento corporativo sobre assédio.' }
        ],
        ana: [
          { id: 'm_an_1', data: yesterdayStr, abordagens: 15, followups: 8, fechamentos: 3, atendimentos: 6, nota: 'Leads frios do Instagram contactados.' },
          { id: 'm_an_2', data: todayStr, abordagens: 12, followups: 10, fechamentos: 2, atendimentos: 14, nota: 'Disparos ativos de combos corporativos.' }
        ],
        fabi: [
          { id: 'm_fa_1', data: yesterdayStr, abordagens: 22, followups: 12, fechamentos: 2, atendimentos: 9, nota: 'Plantão de vendas ativo.' },
          { id: 'm_fa_2', data: todayStr, abordagens: 10, followups: 6, fechamentos: 1, atendimentos: 5, nota: 'Retorno de propostas via whatsapp.' }
        ],
        nuria: [
          { id: 'm_nu_1', data: yesterdayStr, abordagens: 2, followups: 10, fechamentos: 0, atendimentos: 18, nota: 'Checkup inicial e liberação de Nutror.' },
          { id: 'm_nu_2', data: todayStr, abordagens: 1, followups: 12, fechamentos: 1, atendimentos: 22, nota: 'Onboarding geral de novas alunas.' }
        ],
        luiza: [
          { id: 'm_lu_1', data: yesterdayStr, abordagens: 0, followups: 1, fechamentos: 0, atendimentos: 8, nota: 'Resolução de problemas de cookies.' },
          { id: 'm_lu_2', data: todayStr, abordagens: 1, followups: 2, fechamentos: 0, atendimentos: 5, nota: 'Atendimento técnico de integração.' }
        ]
      };

      const manualList = profileDoc && Array.isArray(profileDoc.atividades_manuais)
        ? profileDoc.atividades_manuais
        : defaultMocks[c.id] || [];

      manualList.forEach((act: any) => {
        if (isWithinPeriod(act.data)) {
          manualAbordagens += parseInt(act.abordagens) || 0;
          manualFollowups += parseInt(act.followups) || 0;
          manualFechamentos += parseInt(act.fechamentos) || 0;
          manualAtendimentos += parseInt(act.atendimentos) || 0;
        }
      });

      return {
        ...c,
        abordagens: abordagens + manualAbordagens,
        followups: followups + manualFollowups,
        fechamentos: fechamentos + manualFechamentos,
        atendimentos: atendimentos + manualAtendimentos,
        autoScores: { abordagens, followups, fechamentos, atendimentos },
        manualScores: { abordagens: manualAbordagens, followups: manualFollowups, fechamentos: manualFechamentos, atendimentos: manualAtendimentos },
        logs: manualList
      };
    });
  }, [pessoas, pagamentos, tarefas, perfis, performancePeriod, dateIntervals]);

  const handleAddManualPerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLiana) {
      alert("Apenas a administradora Liana pode realizar lançamentos de performance.");
      return;
    }

    const targetProfile = perfis.find((p: any) => p.id === targetColaborador);
    const currentAtividades = targetProfile && Array.isArray(targetProfile.atividades_manuais)
      ? targetProfile.atividades_manuais
      : [];

    const hasExistingLogs = targetProfile && Array.isArray(targetProfile.atividades_manuais);
    let baseList = [...currentAtividades];
    if (!hasExistingLogs) {
      const defaultMocks: Record<string, any[]> = {
        liana: [
          { id: 'm_li_1', data: dateIntervals.yesterdayStr, abordagens: 4, followups: 2, fechamentos: 1, atendimentos: 3, nota: 'Abordagem estratégica institucional.' },
          { id: 'm_li_2', data: dateIntervals.todayStr, abordagens: 2, followups: 1, fechamentos: 1, atendimentos: 2, nota: 'Alinhamento corporativo sobre assédio.' }
        ],
        ana: [
          { id: 'm_an_1', data: dateIntervals.yesterdayStr, abordagens: 15, followups: 8, fechamentos: 3, atendimentos: 6, nota: 'Leads frios do Instagram contactados.' },
          { id: 'm_an_2', data: dateIntervals.todayStr, abordagens: 12, followups: 10, fechamentos: 2, atendimentos: 14, nota: 'Disparos ativos de combos corporativos.' }
        ],
        fabi: [
          { id: 'm_fa_1', data: dateIntervals.yesterdayStr, abordagens: 22, followups: 12, fechamentos: 2, atendimentos: 9, nota: 'Plantão de vendas active.' },
          { id: 'm_fa_2', data: dateIntervals.todayStr, abordagens: 10, followups: 6, fechamentos: 1, atendimentos: 5, nota: 'Retorno de propostas via whatsapp.' }
        ],
        nuria: [
          { id: 'm_nu_1', data: dateIntervals.yesterdayStr, abordagens: 2, followups: 10, fechamentos: 0, atendimentos: 18, nota: 'Checkup inicial e liberação de Nutror.' },
          { id: 'm_nu_2', data: dateIntervals.todayStr, abordagens: 1, followups: 12, fechamentos: 1, atendimentos: 22, nota: 'Onboarding geral de novas alunas.' }
        ],
        luiza: [
          { id: 'm_lu_1', data: dateIntervals.yesterdayStr, abordagens: 0, followups: 1, fechamentos: 0, atendimentos: 8, nota: 'Resolução de problemas de cookies.' },
          { id: 'm_lu_2', data: dateIntervals.todayStr, abordagens: 1, followups: 2, fechamentos: 0, atendimentos: 5, nota: 'Atendimento técnico de integração.' }
        ]
      };
      baseList = [...(defaultMocks[targetColaborador] || [])];
    }

    const newEntry = {
      id: 'perf_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      data: manualDate,
      abordagens: parseInt(manualAbordagens) || 0,
      followups: parseInt(manualFollowups) || 0,
      fechamentos: parseInt(manualFechamentos) || 0,
      atendimentos: parseInt(manualAtendimentos) || 0,
      nota: manualNota.trim() || 'Lançamento de rotina executiva.'
    };

    const updatedList = [...baseList, newEntry];

    try {
      await updateSingleField('perfis', targetColaborador, { atividades_manuais: updatedList });
      alert(`Desempenho de ${targetProfile?.nome || targetColaborador} atualizado com sucesso no painel executivo!`);
      setManualAbordagens('0');
      setManualFollowups('0');
      setManualFechamentos('0');
      setManualAtendimentos('0');
      setManualNota('');
    } catch (err) {
      console.error(err);
      alert("Houve um problema de rede ou sincronização ao gravar o desempenho.");
    }
  };

  const handleDeletePerformanceLog = async (colId: string, logId: string) => {
    if (!isLiana) return;
    const confirmDel = window.confirm("Você tem certeza que deseja excluir este lançamento de performance?");
    if (!confirmDel) return;

    const targetProfile = perfis.find((p: any) => p.id === colId);
    if (!targetProfile) return;

    const currentAtividades = Array.isArray(targetProfile.atividades_manuais)
      ? targetProfile.atividades_manuais
      : [];

    const filtered = currentAtividades.filter((u: any) => u.id !== logId);

    try {
      await updateSingleField('perfis', colId, { atividades_manuais: filtered });
      alert("Lançamento excluído com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Houve um erro ao eliminar o registro.");
    }
  };

  // --- ANÁLISE DE INTEGRIDADE OPEROCIONAL & RETROALIMENTAÇÃO DE DADOS ---
  // 1. Leads com pagamentos registrados mas que constam como 'lead' no CRM
  const leadsPagantesDesatualizados = useMemo(() => {
    return pessoas.filter(p => {
      if (p.tipoPessoa !== 'lead') return false;
      return pagamentos.some(pag => 
        (pag.status === 'pago' || pag.status === 'parcial') && 
        (pag.aluno?.toLowerCase() === p.nome?.toLowerCase() || 
         pag.aluno?.toLowerCase() === p.email?.toLowerCase())
      );
    });
  }, [pessoas, pagamentos]);

  // 2. Alunas sem histórico de faturamento no financeiro
  const alunasSemFinancas = useMemo(() => {
    return pessoas.filter(p => {
      if (p.tipoPessoa !== 'aluna') return false;
      return !pagamentos.some(pag => 
        pag.aluno?.toLowerCase() === p.nome?.toLowerCase() || 
        pag.aluno?.toLowerCase() === p.email?.toLowerCase()
      );
    });
  }, [pessoas, pagamentos]);

  // 3. Alunas com onboarding incompleto e sem tarefas de suporte delegadas
  const alunasOnboardingPendenteSemTarefa = useMemo(() => {
    return pessoas.filter(p => {
      if (p.tipoPessoa !== 'aluna') return false;
      const onboardingIncompleto = !p.acessoNutror || !p.entrouGrupo || !p.acessoMRP || !p.respondeuInicial;
      if (!onboardingIncompleto) return false;
      
      const temTarefa = tarefas.some(t => 
        t.pessoaId === p.id || 
        t.titulo?.toLowerCase().includes(p.nome?.toLowerCase()) || 
        t.descricao?.toLowerCase().includes(p.nome?.toLowerCase())
      );
      return !temTarefa;
    });
  }, [pessoas, tarefas]);

  // 4. Tarefas orfãs (possuem pessoaId mas a pessoa nao existe no banco)
  const tarefasOrfas = useMemo(() => {
    return tarefas.filter(t => t.pessoaId && !pessoas.some(p => p.id === t.pessoaId));
  }, [tarefas, pessoas]);

  // 5. Cobranças vencidas sem tarefa de faturamento comercial
  const cobrancasVencidasSemTarefa = useMemo(() => {
    const hoje = new Date().toISOString().split('T')[0];
    return pagamentos.filter(pag => {
      if (pag.status !== 'pendente' && pag.status !== 'parcial') return false;
      if (!pag.vencimento || pag.vencimento >= hoje) return false;
      
      const temTarefaCobranca = tarefas.some(t => 
        t.titulo?.toLowerCase().includes(pag.aluno?.toLowerCase()) && 
        (t.titulo?.toLowerCase().includes('cobrança') || t.titulo?.toLowerCase().includes('pendência') || t.titulo?.toLowerCase().includes('follow'))
      );
      return !temTarefaCobranca;
    });
  }, [pagamentos, tarefas]);

  const totalInconsistencias = 
    leadsPagantesDesatualizados.length + 
    alunasSemFinancas.length + 
    alunasOnboardingPendenteSemTarefa.length + 
    tarefasOrfas.length + 
    cobrancasVencidasSemTarefa.length;

  // Actions for data synchronization and loop feedback
  const promoverLeadParaAluna = async (pessoaId: string) => {
    try {
      const updatedPessoas = pessoas.map(p => {
        if (p.id === pessoaId) {
          return { ...p, tipoPessoa: 'aluna', status: 'em acompanhamento' };
        }
        return p;
      });
      await updateModuleData('pessoas', updatedPessoas);
      alert('Cadastro de CRM atualizado! O lead foi promovido a Aluna Ativa com sucesso.');
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar cadastro.');
    }
  };

  const criarRegistroFinanceiro = async (aluna: any) => {
    try {
      const novoPagamento = {
        id: 'pag_auto_' + Date.now(),
        aluno: aluna.nome,
        formacao: aluna.produtoComprado || 'Formação Executiva ILG',
        valorCombinado: 1250,
        status: 'pendente',
        vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        responsavel: 'Financeiro',
        observacoes: 'Registro gerado automaticamente por integridade operacional do sistema.'
      };
      const updatedPagamentos = [novoPagamento, ...pagamentos];
      await updateModuleData('pagamentos', updatedPagamentos);
      alert('Lançamento financeiro pendente do curso gerado com sucesso para ' + aluna.nome + '!');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar registro financeiro.');
    }
  };

  const criarTarefaOnboarding = async (aluna: any) => {
    try {
      const novaTarefa = {
        id: 'ts_onb_' + Date.now(),
        titulo: '⚠️ Onboarding pendente: ' + aluna.nome,
        categoria: 'acesso',
        tipo: 'suporte',
        pessoaId: aluna.id,
        responsavel: 'Núria',
        prioridade: 'alta',
        status: 'a fazer',
        descricao: `Liberar acessos e onboarding para a nova aluna. Ativar acessos no Nutror/MRP e inserir no grupo de alunas do WhatsApp/Telegram. Aluna cadastrada em: ${aluna.turma || 'Turma Geral'}.`
      };
      const updatedTarefas = [novaTarefa, ...tarefas];
      await updateModuleData('tarefas_suporte', updatedTarefas);
      alert('Tarefa de onboarding delegada para Núria no Quadro de Suporte!');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar tarefa de onboarding.');
    }
  };

  const desvincularTarefaOrfa = async (tarefaId: string) => {
    try {
      const updatedTarefas = tarefas.map(t => {
        if (t.id === tarefaId) {
          const { pessoaId, ...rest } = t;
          return { ...rest, pessoaId: '' }; // remove
        }
        return t;
      });
      await updateModuleData('tarefas_suporte', updatedTarefas);
      alert('Vínculo órfão limpo! A tarefa foi revertida para demanda administrativa genérica.');
    } catch (err) {
      console.error(err);
      alert('Erro ao limpar vínculo.');
    }
  };

  const criarTarefaCobranca = async (pagamento: any) => {
    try {
      const novaTarefa = {
        id: 'ts_cob_' + Date.now(),
        titulo: '🔥 Cobrança de Faturamento: ' + pagamento.aluno,
        categoria: 'comercial',
        tipo: 'tarefa',
        responsavel: 'Ana',
        prioridade: 'alta',
        status: 'a fazer',
        descricao: `Contatar a cliente ${pagamento.aluno} sobre pendência financeira do curso ${pagamento.formacao} vencida em ${pagamento.vencimento} no valor de R$ ${pagamento.valorCombinado}. Propor envio de Pix ou parcelamento.`
      };
      const updatedTarefas = [novaTarefa, ...tarefas];
      await updateModuleData('tarefas_suporte', updatedTarefas);
      alert('Pauta de cobrança delegada com sucesso no Comercial para Ana!');
    } catch (err) {
      console.error(err);
      alert('Erro ao disparar tarefa de cobrança.');
    }
  };

  const getPostItBg = (color: string) => {
    switch(color) {
      case 'blue': return 'bg-cyan-100/90 text-cyan-900 border-cyan-200 hover:rotate-1';
      case 'pink': return 'bg-rose-100/90 text-rose-900 border-rose-200 hover:-rotate-1';
      case 'green': return 'bg-emerald-100 text-emerald-950 border-emerald-200 hover:rotate-1';
      default: return 'bg-amber-100 text-amber-950 border-amber-200 hover:-rotate-1';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Title & Layout Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0A192F]">Painel de Controle</h1>
        <p className="text-slate-500 mt-2">Seja bem-vinda de volta ao Instituto Liana Gomes. Monitore as pautas e gerencie os espaços de trabalho.</p>
      </div>

      {/* Profile Space Cards Area (Botão de Perfil - Espaço de Trabalho de cada uma) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="text-lg font-bold text-[#0A192F] tracking-tight">Espaços de Trabalho da Equipe</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {profiles.map((p) => (
            <div
              key={p.id}
              onClick={() => handleSelectWorkspace(p.id)}
              className={cn(
                "bg-white rounded-2xl p-5 border cursor-pointer hover:-translate-y-1.5 transition-all duration-305 flex flex-col justify-between group shadow-lg hover:shadow-xl",
                p.color, p.glow
              )}
            >
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-14 h-14 rounded-full p-0.5 bg-slate-100 shrink-0 overflow-hidden border border-slate-200 group-hover:scale-105 transition-transform">
                    <img 
                      src={p.foto} 
                      alt={p.name} 
                      className="w-full h-full rounded-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-slate-900 group-hover:text-[#1D4E89] transition-colors leading-tight">{p.name}</h3>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5 tracking-wider">{p.pills}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">{p.description}</p>
              </div>
              
              <button className="w-full text-center text-xs font-bold py-2 px-3 bg-slate-50 text-[#0A192F] group-hover:bg-[#0A192F] group-hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200/60 shadow-xs">
                Acessar Mesa
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Communication Quick Action Area */}
      <div className="bg-gradient-to-r from-[#0A192F] to-[#1D4E89] text-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(10,25,47,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded text-[9px] font-extrabold uppercase tracking-widest text-[#D4AF37]">Mural do Time</span>
            <h3 className="text-lg font-bold">Comunicação Interna de Equipe</h3>
          </div>
          <p className="text-slate-300 text-xs md:text-sm">Envie circulares, atualizações rápidas, avisos do escritório e pautas corporativas em tempo real para todo o Instituto.</p>
        </div>
        <button
          onClick={handleAccessComunicacaoInterna}
          className="bg-[#D4AF37] hover:bg-white text-slate-950 font-extrabold text-xs tracking-wider py-3 px-5 rounded-xl transition-all self-start md:self-auto flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          Acessar Comunicação Interna
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-4 mt-6">
        <button
          onClick={() => setDashboardTab('mural')}
          className={cn(
            "px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer select-none flex items-center gap-2",
            dashboardTab === 'mural'
              ? "border-[#0A192F] text-[#0A192F]"
              : "border-transparent text-slate-400 hover:text-slate-700"
          )}
        >
          <Pin className="w-4 h-4 text-amber-500" />
          Mural Geral & Faturamento
        </button>
        <button
          onClick={() => setDashboardTab('health')}
          className={cn(
            "px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer select-none flex items-center gap-2 relative",
            dashboardTab === 'health'
              ? "border-[#0A192F] text-[#0A192F]"
              : "border-transparent text-slate-400 hover:text-slate-700"
          )}
        >
          <Activity className="w-4 h-4 text-emerald-600" />
          Saúde Operacional & Integridade
          {totalInconsistencias > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[9px] font-black text-[#0A192F] animate-bounce shadow">
              {totalInconsistencias}
            </span>
          )}
        </button>
        {isLiana ? (
          <button
            onClick={() => setDashboardTab('performance')}
            className={cn(
              "px-6 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer select-none flex items-center gap-2 relative",
              dashboardTab === 'performance'
                ? "border-[#0A192F] text-[#0A192F]"
                : "border-transparent text-slate-400 hover:text-slate-700"
            )}
          >
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Performance das Colaboradoras
            <span className="p-0.5 px-1 bg-amber-50 border border-amber-200 rounded text-[8px] font-black uppercase text-amber-700 select-none">
              Diretoria Geral
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-4 text-slate-400 cursor-not-allowed select-none" title="Somente a Liana tem acesso às estatísticas de performance">
            <Lock className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Performance (Privado)</span>
          </div>
        )}
      </div>

      {dashboardTab === 'mural' && (
        <>
          {/* "Resumo Mensal" Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-md text-left space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="p-1 px-1.5 bg-emerald-50 border border-emerald-200 rounded text-[9px] font-extrabold uppercase tracking-widest text-emerald-700">Insights Financeiros</span>
                <h3 className="text-lg font-extrabold text-[#0A192F] flex items-center gap-2 mt-1">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Resumo Mensal de Faturamento
                </h3>
                <p className="text-slate-500 text-xs mt-1">Comparativo de faturamento previsto vs. realizado com base nas informações registradas.</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                  <span className="w-3 h-3 rounded-full bg-[#1D4E89]"></span>
                  <span className="text-slate-650">Previsto: <strong className="text-slate-900">{formatCurrency(totalPrevistoPeriodo)}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50/50 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-650">Realizado: <strong className="text-emerald-700">{formatCurrency(totalRealizadoPeriodo)}</strong></span>
                </div>
              </div>
            </div>

            {monthlyData.length > 0 ? (
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis 
                      dataKey="label" 
                      stroke="#64748B" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#64748B" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000) + 'k' : value}`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`R$ ${parseFloat(value).toLocaleString('pt-BR')}`, '']}
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: '12px', 
                        border: '1px solid #E2E8F0', 
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        fontSize: '12px',
                        fontWeight: '600',
                      }} 
                    />
                    <Bar 
                      dataKey="previsto" 
                      name="Previsto" 
                      fill="#1D4E89" 
                      radius={[4, 4, 0, 0]} 
                      barSize={32}
                    />
                    <Bar 
                      dataKey="realizado" 
                      name="Realizado" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]} 
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <TrendingUp className="w-10 h-10 mx-auto text-slate-300 animate-pulse mb-2" />
                <p className="text-xs">Não há lançamentos de faturamento registrados para o gráfico.</p>
              </div>
            )}
          </div>

          {/* Coletive Mural (Recados & Chores & IA Generator Engine) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sticky Notices Board (Quadro de Recados Post-its) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-extrabold text-[#0A192F] flex items-center gap-2">
                  <Pin className="w-5 h-5 text-amber-500" />
                  Quadro de Avisos Coletivo
                </h3>
                <span className="text-[11px] bg-slate-100 border border-slate-200 shadow-xs text-slate-600 px-2 py-0.5 rounded font-extrabold uppercase">
                  {recados.length} post-its
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recados.map((rec) => (
                  <div 
                    key={rec.id}
                    className={cn(
                      "p-5 rounded-xl border border-dashed shadow-sm transition-all relative flex flex-col justify-between group",
                      getPostItBg(rec.descricao || 'yellow')
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <Pin className="w-4 h-4 text-amber-500/80 rotate-12" />
                        <button
                          onClick={() => handleDeleteMuralItem(rec.id)}
                          className="opacity-0 group-hover:opacity-100 text-rose-700 hover:text-rose-900 transition-opacity p-0.5 rounded hover:bg-rose-50 cursor-pointer"
                          title="Excluir do mural"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-semibold leading-relaxed tracking-tight break-words pr-2">
                        {rec.titulo}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-slate-300/30 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-bold uppercase tracking-wider">Aviso Equipe</span>
                      <span>Mural Geral</span>
                    </div>
                  </div>
                ))}
                
                {recados.length === 0 && (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <Lightbulb className="w-8 h-8 text-slate-350 mb-2" />
                    <p className="text-xs font-semibold">Sem post-its ou avisos rápidos fixados.</p>
                  </div>
                )}
              </div>

              {/* Manual Add Sticky Note form */}
              <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm text-left">
                <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-2">Fixar novo Post-It no Mural</h4>
                <form onSubmit={handleAddManualRecado} className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text"
                    placeholder="Ex e.g. Reunião extraordinária hoje às 16h no Zoom"
                    required
                    maxLength={180}
                    value={newRecado}
                    onChange={e => setNewRecado(e.target.value)}
                    className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] text-slate-850"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-1.5">
                      {(['yellow', 'blue', 'pink', 'green'] as const).map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setNewRecadoColor(col)}
                          className={cn(
                            "w-5 h-5 rounded-full border-2 transition-all cursor-pointer shrink-0",
                            col === 'yellow' && "bg-amber-100 border-amber-300",
                            col === 'blue' && "bg-cyan-150 border-cyan-400",
                            col === 'pink' && "bg-rose-100 border-rose-300",
                            col === 'green' && "bg-emerald-100 border-emerald-300",
                            newRecadoColor === col ? "scale-110 border-slate-800 ring-2 ring-slate-400/30" : "scale-100"
                          )}
                          title={`Cor ${col}`}
                        />
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="bg-[#0A192F] hover:bg-[#D4AF37] px-4 py-2 rounded-lg font-bold text-xs text-white hover:text-[#0A192F] transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Fixar
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Coletive Duties Board (Lista de Focos e Tarefas) */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-extrabold text-[#0A192F] flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[#D4AF37]" />
                  Foco & Demandas Coletivas
                </h3>
                <span className="text-[11px] bg-[#0A192F]/10 border border-[#0A192F]/10 text-[#0A192F] px-2 py-0.5 rounded font-extrabold uppercase">
                  {muralTarefas.length} pendentes
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-3 max-h-[420px] overflow-y-auto">
                {muralTarefas.map((t) => (
                  <div 
                    key={t.id} 
                    className={cn(
                      "p-3 rounded-lg border flex items-center justify-between gap-3 transition-colors text-left",
                      t.status === 'concluído' 
                        ? 'bg-slate-50/70 border-slate-200/60 opacity-60' 
                        : 'bg-white border-slate-100 hover:border-[#1D4E89]/20'
                    )}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleMuralTarefa(t.id, t.status || '')}
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 mt-0.5 cursor-pointer",
                          t.status === 'concluído' 
                            ? 'bg-emerald-600 border-emerald-600 text-white' 
                            : 'border-slate-300 hover:border-slate-500 bg-white'
                        )}
                      >
                        {t.status === 'concluído' && <Check className="w-3 h-3" />}
                      </button>
                      <div className="min-w-0">
                        <p className={cn(
                          "text-xs font-bold leading-tight truncate",
                          t.status === 'concluído' ? 'line-through text-slate-400' : 'text-slate-800'
                        )}>
                          {t.titulo}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-semibold">
                          <span className={cn(
                            "px-1.5 py-0.2 rounded text-[8px] uppercase font-black",
                            t.prioridade === 'alta' ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-650'
                          )}>
                            {t.prioridade}
                          </span>
                          <span>• Resp: <strong>{t.responsavel}</strong></span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteMuralItem(t.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Apagar pauta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {muralTarefas.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs">Não há tarefas de mural pendentes.</p>
                  </div>
                )}
              </div>

              {/* Quick manual Task adding */}
              <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm text-left">
                <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-2">Adicionar Tarefa ao Mural</h4>
                <form onSubmit={handleAddManualMuralTarefa} className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Ex e.g. Disparar e-mail boas-vindas para nova turma"
                    required
                    value={newTarefaTitle}
                    onChange={e => setNewTarefaTitle(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] text-slate-850"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newTarefaResponsavel}
                      onChange={e => setNewTarefaResponsavel(e.target.value)}
                      className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                    >
                      <option value="Geral">Time Geral</option>
                      <option value="Liana">Liana</option>
                      <option value="Ana">Ana</option>
                      <option value="Nuria">Núria</option>
                      <option value="Luiza">Luiza</option>
                    </select>
                    <select
                      value={newTarefaPrioridade}
                      onChange={e => setNewTarefaPrioridade(e.target.value)}
                      className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                    >
                      <option value="alta">Alta 🔥</option>
                      <option value="média">Média ⚡</option>
                      <option value="baixa">Baixa 🍃</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#0A192F] hover:bg-[#D4AF37] hover:text-[#0A192F] text-white font-bold py-2 rounded-lg text-xs transition"
                  >
                    + Adicionar Tarefa
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* IA Mural Auto Generation section */}
          <div className="bg-stone-50 border border-slate-200/80 p-6 rounded-2xl text-left">
            <h3 className="text-lg font-extrabold text-[#0A192F] flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Mural Inteligente: Gerador Automático por Consultor IA
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Cole abaixo as discussões de reuniões, sumários transcritos, diálogos, áudios do WhatsApp transcritos ou rascunhos de reuniões corporativas. Nossa inteligência artificial (Gemini) irá decifrar as informações, definindo automaticamente tarefas prioritárias delegadas para cada membro da equipe e resumos no quadro de avisos.
            </p>

            <div className="space-y-4">
              <textarea
                value={aiInputText}
                onChange={e => setAiInputText(e.target.value)}
                rows={4}
                placeholder="Ex e.g. Tivemos uma reunião rápida hoje. Liana solicitou que se envie o e-mail boas vindas com link da planilha para todas as alunas da nova turma, já Núria necessita aprovar a postagem do Instagram de Compliance de Gênero para quinta-feira e Ana precisa fazer follow up no lead quente do combo hoje porque eles estão aguardando o link de pagamento..."
                className="w-full font-sans text-xs border border-slate-300 rounded-xl p-3 outline-none focus:border-[#1F4E89] text-slate-850 leading-relaxed bg-white"
              />

              {aiError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {aiError}
                </div>
              )}

              <button
                onClick={handleAiDiagnosticMuralGeneration}
                disabled={isAiGenerating}
                className="bg-[#0A192F] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A192F] disabled:opacity-50 disabled:hover:bg-[#0A192F] disabled:hover:text-[#D4AF37] border-2 border-[#D4AF37] font-bold text-xs tracking-wider py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isAiGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    Extraindo pautas com Inteligência Artificial...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 shrink-0" />
                    Alimentar Mural pelo Gemini (IA) ✨
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {dashboardTab === 'health' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Health Summary Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#D4AF37]" />
            <div className="space-y-2 md:max-w-2xl">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-6 h-6 text-rose-500 animate-pulse" />
                <h3 className="text-xl font-black text-[#0A192F]">Triagem Geral: Saúde e Integridade de Módulos</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Esta central de diagnóstico cruza ativamente o banco de dados de CRM Comercial (<strong className="text-slate-800">Leads e Alunas</strong>), do Financeiro (<strong className="text-slate-800">Faturamentos e Cobranças</strong>) e as demandas do time (<strong className="text-slate-805">Tarefas do Mural</strong>). Ele identifica dependências ausentes, gaps de processo e inconsistências estruturais, permitindo retroalimentá-los automaticamente com ações inteligentes em 1 clique.
              </p>
            </div>
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4 shrink-0 shadow-xs self-start md:self-center">
              <div className="p-3 bg-white shadow-xs rounded-lg">
                {totalInconsistencias > 0 ? (
                  <ShieldAlert className="w-7 h-7 text-amber-500" />
                ) : (
                  <ShieldCheck className="w-7 h-7 text-emerald-500" />
                )}
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest leading-none">Qualidade dos Módulos</p>
                <p className="text-sm font-extrabold text-[#0A192F] mt-1.5">
                  {totalInconsistencias > 0 
                    ? `${totalInconsistencias} inconsistências` 
                    : 'Nenhuma falha de vínculo'}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-bold">
                  {totalInconsistencias > 0 
                    ? 'Ações recomendadas pendentes' 
                    : 'Estabilidade Excelente'}
                </p>
              </div>
            </div>
          </div>

          {/* Theoretical Analysis Card of Retroalimentation */}
          <div className="bg-[#0A192F] text-white p-6 rounded-2xl shadow-xl text-left relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-y-1/4 translate-x-1/4">
              <Sparkles className="w-[180px] h-[180px] text-white" />
            </div>
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm font-black uppercase tracking-wider text-[#D4AF37]">
                  Estudo Estratégico: Teoria de Loops de Retroalimentação
                </h4>
                <p className="text-xs text-slate-350 leading-relaxed max-w-4xl">
                  A sanidade de uma holding operacional depende da constante comunicação ativa entre seus subsistemas de dados. Ao retroalimentar o sistema, garantimos que um fechamento comercial efetuado pela <strong>Ana (Comercial)</strong> ative o faturamento e dispare imediatamente a pauta de onboarding da <strong>Núria (CS)</strong>. Se houver atrasos na compensação do pagamento, o setor financeiro automaticamente cria uma demanda de cobrança de volta para a Ana. Este ecossistema autônomo de dependências impede furos no funil, automatiza a liberação do Nutror e de certificados emitidos de forma consistente nos módulos, elevando a confiabilidade do Instituto Liana Gomes.
                </p>
              </div>
            </div>
          </div>

          {/* List of Module Gaps */}
          <div className="space-y-4">
            
            {/* 1. Leads convertidos que ainda estao rotulados como leads */}
            <div className="bg-white p-5 rounded-xl border border-slate-205 shadow-sm text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                  <h4 className="font-extrabold text-[#0A192F] text-sm flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#1D4E89]" />
                    1. Leads Convertidos sem Promoção de Status no CRM
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Contatos rotulados como meros leads em negociação, mas que já possuem pagamentos compensados ou confirmados no módulo Financeiro.
                  </p>
                </div>
                <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-0.5 rounded font-black uppercase tracking-wider select-none shrink-0 self-start sm:self-center">
                  Vias: CRM × Comercial × Financeiro
                </span>
              </div>

              {leadsPagantesDesatualizados.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-150 rounded-lg overflow-hidden bg-slate-50/20">
                  {leadsPagantesDesatualizados.map((p) => (
                    <div key={p.id} className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">{p.nome}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>Interesse: {p.produtoInteresse || 'Combo Geral'}</span>
                          <span>•</span>
                          <span>Email: {p.email || 'Não informado'}</span>
                        </p>
                        <p className="text-[10px] text-amber-600 bg-amber-50 rounded-md py-1 px-2.5 border border-amber-250/30 font-semibold inline-flex items-center gap-1.5 mt-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Gargalo: Fluxo comercial travado. Aluna efetuou o pagamento mas não consta ativa na base de acompanhamento.
                        </p>
                      </div>

                      <button
                        onClick={() => promoverLeadParaAluna(p.id)}
                        className="bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 self-start sm:self-center shadow-xs cursor-pointer shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Promover para Aluna Ativa
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/10 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-xs font-bold text-emerald-800">Excelente! Todos os leads pagantes estão promovidos a Aluna com sucesso no CRM.</p>
                </div>
              )}
            </div>

            {/* 2. Alunas estruturadas sem registro de cobranca no financeiro */}
            <div className="bg-white p-5 rounded-xl border border-slate-205 shadow-sm text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                  <h4 className="font-extrabold text-[#0A192F] text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    2. Alunas Ativas sem Histórico de Faturamento Financeiro
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Alunas cadastradas e lotadas em turmas de formação, mas que não possuem nenhum registro correspondente de receita ou cobrança gerada.
                  </p>
                </div>
                <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded font-black uppercase tracking-wider select-none shrink-0 self-start sm:self-center">
                  Vias: CRM × Alunas × Financeiro
                </span>
              </div>

              {alunasSemFinancas.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-150 rounded-lg overflow-hidden bg-slate-50/20">
                  {alunasSemFinancas.map((p) => (
                    <div key={p.id} className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">{p.nome}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>Curso Comprado: {p.produtoComprado || 'Curso ILG'}</span>
                          <span>•</span>
                          <span>Turma ativa: {p.turma || 'Turma 1'}</span>
                        </p>
                        <p className="text-[10px] text-amber-600 bg-amber-50 rounded-md py-1 px-2.5 border border-amber-250/30 font-semibold inline-flex items-center gap-1.5 mt-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Gargalo: Auditoria fiscal/auditoria interna falha. Aluna estudando sem ter cadastro de entrada gerado no financeiro.
                        </p>
                      </div>

                      <button
                        onClick={() => criarRegistroFinanceiro(p)}
                        className="bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 self-start sm:self-center shadow-xs cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Gerar Lançamento Financeiro
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/10 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-xs font-bold text-emerald-800">Sanidade em dia! Todas as alunas registradas constam com movimentação de caixa correspondente.</p>
                </div>
              )}
            </div>

            {/* 3. Alunas com onboarding incompleto e sem tarefas delegadas */}
            <div className="bg-white p-5 rounded-xl border border-slate-205 shadow-sm text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                  <h4 className="font-extrabold text-[#0A192F] text-sm flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-orange-500" />
                    3. Alunas sem Onboarding/Acessos e sem Tarefas Operacionais
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Alunas que ainda não entraram no grupo, não preencheram respostas ou não têm acesso ao Nutror/MRP, e que estão sem demandas de acompanhamento delegadas.
                  </p>
                </div>
                <span className="text-[10px] bg-orange-50 border border-orange-200 text-orange-700 px-2.5 py-0.5 rounded font-black uppercase tracking-wider select-none shrink-0 self-start sm:self-center">
                  Vias: CS Onboarding × Suporte
                </span>
              </div>

              {alunasOnboardingPendenteSemTarefa.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-150 rounded-lg overflow-hidden bg-slate-50/20">
                  {alunasOnboardingPendenteSemTarefa.map((p) => (
                    <div key={p.id} className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">{p.nome}</p>
                        <p className="text-[10px] text-slate-500 flex flex-wrap gap-2 mt-1">
                          <span className="text-rose-600 font-semibold">• Nutror: {p.acessoNutror ? 'OK' : 'Pendente de liberação'}</span>
                          <span className="text-rose-600 font-semibold">• Grupo VIP: {p.entrouGrupo ? 'OK' : 'Fora do grupo'}</span>
                          <span className="text-rose-600 font-semibold">• MRP Tracker: {p.acessoMRP ? 'OK' : 'Não parametrizado'}</span>
                        </p>
                        <p className="text-[10px] text-amber-600 bg-amber-50 rounded-md py-1 px-2.5 border border-amber-250/30 font-semibold inline-flex items-center gap-1.5 mt-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Gargalo: Experiência de compra do aluno prejudicada. Falta delegar a tarefa de boas-vindas para a Núria no mural coletivo.
                        </p>
                      </div>

                      <button
                        onClick={() => criarTarefaOnboarding(p)}
                        className="bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 self-start sm:self-center shadow-xs cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Delegar Boas-Vindas à Núria
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/10 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-xs font-bold text-emerald-800">Excelente! Todas as alunas com onboarding pendente já estão associadas a pautas de suporte.</p>
                </div>
              )}
            </div>

            {/* 4. Tarefas de suporte órfãs */}
            <div className="bg-white p-5 rounded-xl border border-slate-205 shadow-sm text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                  <h4 className="font-extrabold text-[#0A192F] text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    4. Tarefas com Vínculos de Alunas Inexistentes (Órfãs)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tarefas do mural delegadas que referenciam chaves de identificação (IDs de Alunas) que foram apagadas do CRM ou estão incorretas.
                  </p>
                </div>
                <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-0.5 rounded font-black uppercase tracking-wider select-none shrink-0 self-start sm:self-center">
                  Vias: Suporte × Banco SGBD
                </span>
              </div>

              {tarefasOrfas.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-150 rounded-lg overflow-hidden bg-slate-50/20">
                  {tarefasOrfas.map((t) => (
                    <div key={t.id} className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">{t.titulo}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-2">
                          <span>Categoria do Suporte: {t.categoria}</span>
                          <span>•</span>
                          <span>Responsável: {t.responsavel}</span>
                        </p>
                        <p className="text-[10px] text-rose-650 bg-rose-50 rounded-md py-1 px-2.5 border border-rose-250/30 font-semibold inline-flex items-center gap-1.5 mt-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Inconsistência: Esta tarefa possui uma amarração vazia para uma ID ({t.pessoaId}) que não existe na tabela de pessoas.
                        </p>
                      </div>

                      <button
                        onClick={() => desvincularTarefaOrfa(t.id)}
                        className="bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 self-start sm:self-center shadow-xs cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Limpar Vínculo Órfão
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/10 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-xs font-bold text-emerald-800">Conformidade perfeita! Todas as pautas contêm correspondentes saudáveis nas tabelas do SGBD.</p>
                </div>
              )}
            </div>

            {/* 5. Inadimplencia pendente sem alertas no comercial */}
            <div className="bg-white p-5 rounded-xl border border-slate-205 shadow-sm text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                  <h4 className="font-extrabold text-[#0A192F] text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-rose-500 animate-pulse" />
                    5. Cobranças Vencidas em Atraso sem Pautas Ativas no Comercial
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lançamentos de faturas ou mensalidades parciais que ultrapassaram a data de vencimento sem haver nenhuma tarefa comercial de recuperação aberta.
                  </p>
                </div>
                <span className="text-[10px] bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-0.5 rounded font-black uppercase tracking-wider select-none shrink-0 self-start sm:self-center">
                  Vias: Finanças × Recuperação CRM
                </span>
              </div>

              {cobrancasVencidasSemTarefa.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-150 rounded-lg overflow-hidden bg-slate-50/20">
                  {cobrancasVencidasSemTarefa.map((pag) => (
                    <div key={pag.id} className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">{pag.aluno}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-3">
                          <span className="text-rose-600 font-extrabold">Atrasado desde: {pag.vencimento}</span>
                          <span>•</span>
                          <span>Preço: {formatCurrency(pag.valorCombinado)}</span>
                        </p>
                        <p className="text-[10px] text-amber-600 bg-amber-50 rounded-md py-1 px-2.5 border border-amber-250/30 font-semibold inline-flex items-center gap-1.5 mt-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Gargalo: Perda de faturamento por falta de contato. Nenhuma pauta de faturamento/renegociação ativa delegada à Ana (Comercial).
                        </p>
                      </div>

                      <button
                        onClick={() => criarTarefaCobranca(pag)}
                        className="bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 self-start sm:self-center shadow-xs cursor-pointer shrink-0"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Delegar Cobrança para Ana
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/10 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-xs font-bold text-emerald-800">Recuperações de caixa sob controle! Todos os atrasos possuem acompanhamento comercial.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* --- BLOCO EXCLUSIVO DA LIANA: RELATÓRIOS DE PERFORMANCE E AUDITORIA --- */}
      {isLiana && dashboardTab === 'performance' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Header do Relatório */}
          <div className="bg-gradient-to-r from-[#0A192F] to-[#1D4E89] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none w-1/3 flex items-center justify-center">
              <TrendingUp className="w-64 h-64" />
            </div>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="p-1 px-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/45 rounded text-[9px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
                  Painel de Governança
                </span>
                <span className="bg-emerald-500 text-white rounded-full p-0.5 px-2 text-[8px] font-bold uppercase tracking-wider">
                  Apenas Liana Gomes
                </span>
              </div>
              <h2 className="text-xl font-bold md:text-2xl">Métricas de Performance e Produtividade Comercial</h2>
              <p className="text-xs md:text-sm text-slate-300">
                Audite e gerencie o rendimento diário de conversão, abordagens, follow-ups e resoluções completadas por cada colaboradora do time.
              </p>
            </div>
          </div>

          {/* Filtros de Data */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtro de Período</h3>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">Métricas calculadas do dia: {performancePeriod === 'hoje' ? 'Hoje (04/06/2026)' : performancePeriod === 'ontem' ? 'Ontem (03/06/2026)' : performancePeriod === 'mes' ? 'Junho / 2026' : 'Todo o Histórico'}</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setPerformancePeriod('hoje')}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  performancePeriod === 'hoje' ? "bg-white text-[#0A192F] shadow" : "text-slate-500 hover:text-slate-900"
                )}
              >
                Hoje
              </button>
              <button
                onClick={() => setPerformancePeriod('ontem')}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  performancePeriod === 'ontem' ? "bg-white text-[#0A192F] shadow" : "text-slate-500 hover:text-slate-900"
                )}
              >
                Ontem
              </button>
              <button
                onClick={() => setPerformancePeriod('mes')}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  performancePeriod === 'mes' ? "bg-white text-[#0A192F] shadow" : "text-slate-500 hover:text-slate-900"
                )}
              >
                Este Mês
              </button>
              <button
                onClick={() => setPerformancePeriod('todos')}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  performancePeriod === 'todos' ? "bg-white text-[#0A192F] shadow" : "text-slate-500 hover:text-slate-900"
                )}
              >
                Tudo
              </button>
            </div>
          </div>

          {/* Gráfico de Desempenho Comparativo */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md text-left space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#0A192F] flex items-center gap-1.5 uppercase tracking-wider">
                <Activity className="w-4 h-4 text-indigo-650" />
                Gráfico Comparativo de Performance da Equipe
              </h3>
              <p className="text-xs text-slate-500">Mapeamento consolidado das ações executadas no período selecionado (Automático + Lançado Manualmente).</p>
            </div>

            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={calculatedPerformance}
                  margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="abordagens" name="Abordagens (Mkt/CRM)" fill="#1D4E89" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="followups" name="Follow-ups (Comercial)" fill="#EA580C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="fechamentos" name="Fechamentos (Vendido)" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="atendimentos" name="Atendimentos (Suporte)" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPI Total Cards Grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Total Abordagens</p>
                <h4 className="text-2xl font-extrabold text-[#1D4E89] mt-1">
                  {calculatedPerformance.reduce((acc, curr) => acc + curr.abordagens, 0)}
                </h4>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-[#1D4E89]">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Total Follow-ups</p>
                <h4 className="text-2xl font-extrabold text-[#EA580C] mt-1">
                  {calculatedPerformance.reduce((acc, curr) => acc + curr.followups, 0)}
                </h4>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 text-[#EA580C]">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Total Fechamentos</p>
                <h4 className="text-2xl font-extrabold text-emerald-700 mt-1">
                  {calculatedPerformance.reduce((acc, curr) => acc + curr.fechamentos, 0)}
                </h4>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Total Atendimentos</p>
                <h4 className="text-2xl font-extrabold text-indigo-700 mt-1">
                  {calculatedPerformance.reduce((acc, curr) => acc + curr.atendimentos, 0)}
                </h4>
              </div>
              <div className="p-3 rounded-lg bg-indigo-50 text-indigo-650">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Tabela de Relatório Detalhado por Colaboradora */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md text-left space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-[#0A192F] uppercase tracking-wider">Detalhamento Individual por Colaboradora</h3>
              <p className="text-xs text-slate-500">Compare as métricas e confira a divisão entre ações automáticas (registros no sistema) e auditadas manualmente.</p>
            </div>

            <div className="overflow-x-auto border border-slate-150 rounded-xl">
              <table className="w-full text-xs text-slate-700 font-medium">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-155 uppercase text-[10px] tracking-wide">
                  <tr>
                    <th className="py-3 px-4 text-left">Colaboradora</th>
                    <th className="py-3 px-4 text-center">Abordagens</th>
                    <th className="py-3 px-4 text-center">Follow-ups</th>
                    <th className="py-3 px-4 text-center">Fechamentos</th>
                    <th className="py-3 px-4 text-center">Atendimentos</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {calculatedPerformance.map((col) => (
                    <tr key={col.id} className="hover:bg-slate-50/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                            {col.id === 'fabi' ? (
                              <div className="text-slate-500 font-bold">F</div>
                            ) : (
                              <img src={profiles.find(pro => pro.id === col.id)?.foto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300'} alt={col.name} className="w-full h-full rounded-full object-cover" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="font-extrabold text-slate-900">{col.name}</p>
                            <p className="text-[10px] text-indigo-700 font-bold">{col.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <p className="font-bold text-slate-900 text-sm">{col.abordagens}</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                          Sistema: {col.autoScores.abordagens} | Manual: {col.manualScores.abordagens}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <p className="font-bold text-slate-900 text-sm">{col.followups}</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                          Sistema: {col.autoScores.followups} | Manual: {col.manualScores.followups}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <p className="font-bold text-emerald-750 text-sm">{col.fechamentos}</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                          Sistema: {col.autoScores.fechamentos} | Manual: {col.manualScores.fechamentos}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <p className="font-bold text-slate-900 text-sm">{col.atendimentos}</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                          Sistema: {col.autoScores.atendimentos} | Manual: {col.manualScores.atendimentos}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-block py-1 px-2.5 rounded-full bg-slate-100 text-slate-700 text-[9px] font-extrabold uppercase">
                          Logado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form + Histórico Lançamentos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            
            {/* Lançar Desempenho */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-[#0A192F] uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  Lançar Atividades Administrativas Manuais
                </h4>
                <p className="text-xs text-slate-500">Adicione ou corrija métricas diárias adicionais que não foram registradas diretamente no CRM.</p>
              </div>

              <form onSubmit={handleAddManualPerformance} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-505 mb-1.5 uppercase">Colaboradora</label>
                  <select
                    value={targetColaborador}
                    onChange={e => setTargetColaborador(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2.5 bg-white outline-none"
                  >
                    <option value="liana">Liana Gomes (Diretoria Geral)</option>
                    <option value="ana">Ana (Head Comercial)</option>
                    <option value="fabi">Fabi (Vendas)</option>
                    <option value="nuria">Núria (Client Success)</option>
                    <option value="luiza">Luiza (Tech/Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-505 mb-1.5 uppercase">Data da Atividade</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={e => setManualDate(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2.5 bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase text-slate-450">Abordagens</label>
                    <input
                      type="number"
                      min="0"
                      value={manualAbordagens}
                      onChange={e => setManualAbordagens(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase text-slate-450">Follow-ups</label>
                    <input
                      type="number"
                      min="0"
                      value={manualFollowups}
                      onChange={e => setManualFollowups(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase text-slate-450">Fechamentos</label>
                    <input
                      type="number"
                      min="0"
                      value={manualFechamentos}
                      onChange={e => setManualFechamentos(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase text-slate-450">Atendimentos</label>
                    <input
                      type="number"
                      min="0"
                      value={manualAtendimentos}
                      onChange={e => setManualAtendimentos(e.target.value)}
                      className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-505 mb-1.5 uppercase">Observação / Justificativa</label>
                  <input
                    type="text"
                    placeholder="Ex: Ligação direta para lote corporativo..."
                    value={manualNota}
                    onChange={e => setManualNota(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-2.5 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0A192F] hover:bg-[#D4AF37] hover:text-[#0A192F] text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow cursor-pointer uppercase tracking-wider"
                >
                  + Lançar Atividade
                </button>
              </form>
            </div>

            {/* Histórico Recentes logs */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
              <div>
                <h4 className="text-sm font-extrabold text-[#0A192F] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-indigo-650" />
                  Histórico de Ajustes e Lançamentos Manuais
                </h4>
                <p className="text-xs text-slate-500">Visualize todas as entradas inseridas no banco para eventuais correções ou reparações.</p>
              </div>

              <div className="overflow-y-auto max-h-[380px] divide-y divide-slate-100 pr-2">
                {calculatedPerformance.flatMap(col => 
                  col.logs.map((log: any) => ({ ...log, colId: col.id, colName: col.name }))
                ).length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold mt-2">Nenhum lançamento manual efetuado ainda.</p>
                  </div>
                ) : (
                  calculatedPerformance.flatMap(col => 
                    col.logs.map((log: any) => ({ ...log, colId: col.id, colName: col.name }))
                  )
                  // Sort by date desc
                  .sort((a,b) => b.data.localeCompare(a.data))
                  .map((log: any) => (
                    <div key={log.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">{log.colName}</span>
                          <span className="text-[10px] bg-slate-50 text-slate-500 border border-slate-200 p-0.5 px-2 rounded-sm font-bold">{log.data}</span>
                        </div>
                        <p className="text-xs text-slate-655 font-semibold italic">"{log.nota}"</p>
                        <div className="flex flex-wrap gap-2 text-[10px] font-bold text-indigo-700 font-mono mt-1">
                          <span>Abordagens: {log.abordagens}</span>
                          <span>•</span>
                          <span>Follow-ups: {log.followups}</span>
                          <span>•</span>
                          <span>Fechamentos: {log.fechamentos}</span>
                          <span>•</span>
                          <span>Atendimentos: {log.atendimentos}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePerformanceLog(log.colId, log.id)}
                        className="text-stone-400 hover:text-rose-650 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Remover lançamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
