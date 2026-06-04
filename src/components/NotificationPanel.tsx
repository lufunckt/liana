import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { 
  Bell, Calendar, DollarSign, CheckSquare, AlertTriangle, 
  X, ArrowRight, UserCheck, Clock, ShieldAlert, BadgeAlert 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface NotificationPanelProps {
  onClose: () => void;
  setActiveTab: (tab: any) => void;
}

export function NotificationPanel({ onClose, setActiveTab }: NotificationPanelProps) {
  const { data } = useStore();
  const [activeFilter, setActiveFilter] = useState<'all' | 'lead' | 'task' | 'finance'>('all');

  const pessoas = data.pessoas || [];
  const tarefas = data.tarefas_suporte || [];
  const pagamentos = data.pagamentos || [];

  // Helper date parsing
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const notifications = useMemo(() => {
    const list: any[] = [];

    // 1. Upcoming and Overdue Lead Followups
    pessoas.forEach(p => {
      if (p.tipoPessoa === 'lead' && p.status !== 'vendido' && p.status !== 'perdido') {
        const contactDate = p.proximoContato || p.proximoFollowUp;
        if (contactDate) {
          const isOverdue = contactDate < todayStr;
          const isToday = contactDate === todayStr;
          
          if (isOverdue || isToday) {
            list.push({
              id: `lead-followup-${p.id}`,
              type: 'lead',
              title: isToday ? '⏰ Follow-up para HOJE' : '⚠️ Follow-up ATRASADO',
              description: `Retomar contato comercial urgente com ${p.nome} (${p.produtoInteresse || 'Combo ILG'}).`,
              date: contactDate,
              severity: isOverdue ? 'error' : 'warning',
              record: p,
              associatedPessoa: p,
              actionLabel: 'Abrir Ficha do Lead'
            });
          }
        }
      }
    });

    // 2. Overdue or Urgent Tasks
    tarefas.forEach(t => {
      const isCompleted = t.status === 'concluído' || t.status === 'resolvido' || t.status === 'feito';
      if (!isCompleted && t.prazo) {
        const isOverdue = t.prazo < todayStr;
        const isToday = t.prazo === todayStr;

        if (isOverdue || isToday) {
          // Find associated person if exists
          const matchedPessoa = pessoas.find(p => p.id === t.pessoaId || (p.email && t.email && p.email.toLowerCase() === t.email.toLowerCase()));
          
          list.push({
            id: `task-overdue-${t.id}`,
            type: 'task',
            title: isOverdue ? '🚨 Demanda ATRASADA' : '📅 Tarefa para HOJE',
            description: `${t.titulo} - Resp: ${t.responsavel || 'Equipe'}.`,
            date: t.prazo,
            severity: isOverdue ? 'error' : 'warning',
            record: t,
            associatedPessoa: matchedPessoa,
            fallbackTab: t.tipo === 'suporte' ? 'alunos' : 'prioridades_hoje',
            actionLabel: matchedPessoa ? `Ficha de ${matchedPessoa.nome.split(' ')[0]}` : 'Ver Painel de Tarefas'
          });
        }
      }
    });

    // 3. Late Payments
    pagamentos.forEach(pag => {
      const isPaid = pag.status === 'pago';
      if (!isPaid && pag.vencimento) {
        const isOverdue = pag.vencimento < todayStr;
        const isToday = pag.vencimento === todayStr;

        if (isOverdue || isToday) {
          // Find matched student/lead
          const matchedPessoa = pessoas.find(p => p.nome && pag.aluno && p.nome.toLowerCase().trim() === pag.aluno.toLowerCase().trim());

          const valorFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pag.valorCombinado || 0);

          list.push({
            id: `payment-late-${pag.id}`,
            type: 'finance',
            title: isOverdue ? '💸 Parcela / Boleto ATRASADO' : '💰 Vencimento de Cobrança HOJE',
            description: `${pag.aluno} possui parcela de ${valorFmt} pendente em ${pag.formacao || 'Curso'}.`,
            date: pag.vencimento,
            severity: isOverdue ? 'error' : 'warning',
            record: pag,
            associatedPessoa: matchedPessoa,
            fallbackTab: 'financeiro',
            actionLabel: matchedPessoa ? `Ficha de ${pag.aluno.split(' ')[0]}` : 'Ir para Financeiro'
          });
        }
      }
    });

    // Sort by date ascending (oldest overdue first so it is cleared first) then severity
    return list.sort((a, b) => {
      if (a.severity === 'error' && b.severity !== 'error') return -1;
      if (a.severity !== 'error' && b.severity === 'error') return 1;
      return a.date.localeCompare(b.date);
    });
  }, [pessoas, tarefas, pagamentos, todayStr]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter(n => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const handleActionClick = (n: any) => {
    onClose();
    if (n.associatedPessoa) {
      // Trigger Persona Sheet dynamically
      window.dispatchEvent(new CustomEvent('open_pessoa_ficha', { detail: n.associatedPessoa }));
    } else if (n.fallbackTab) {
      // Direct tab redirection
      setActiveTab(n.fallbackTab);
    }
  };

  return (
    <div className="absolute right-0 top-16 w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden text-left flex flex-col max-h-[85vh] animate-in slide-in-from-top-2 duration-200">
      
      {/* Panel Header */}
      <div className="p-4 bg-[#0A192F] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4.5 h-4.5 text-[#D4AF37] fill-[#D4AF37]/20" />
          <h3 className="font-extrabold text-sm tracking-tight font-sans">Central de Alertas Críticos</h3>
          <span className="text-[10px] bg-red-650 text-white font-extrabold px-2 py-0.5 rounded-full">
            {notifications.length}
          </span>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Fechar painel"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Tabs Filters */}
      <div className="flex bg-slate-50 border-b border-slate-205 p-1 px-2 gap-1 overflow-x-auto select-none">
        {(['all', 'lead', 'task', 'finance'] as const).map(f => {
          const count = f === 'all' 
            ? notifications.length 
            : notifications.filter(n => n.type === f).length;
          
          const label = f === 'all' ? 'Todos' 
                      : f === 'lead' ? 'Leads' 
                      : f === 'task' ? 'Tarefas' 
                      : 'Financeiro';

          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 shrink-0 cursor-pointer",
                activeFilter === f 
                  ? "bg-[#1F4E89] text-white shadow-2xs" 
                  : "text-slate-500 hover:bg-slate-200/60"
              )}
            >
              <span>{label}</span>
              {count > 0 && (
                <span className={cn(
                  "text-[9px] px-1 rounded-full font-extrabold",
                  activeFilter === f ? "bg-white text-[#1F4E89]" : "bg-slate-200 text-slate-800"
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Notification List Panel */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[50vh] min-h-[180px] bg-stone-50/60">
        {filteredNotifications.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-center space-y-2.5 px-6">
            <span className="text-2xl">🎉</span>
            <p className="text-xs font-bold text-slate-700">Tudo em dia pelo Instituto!</p>
            <p className="text-[10px] text-slate-500 max-w-[280px]">Nenhum lead com contato esquecido, tarefa atrasada ou pagamento pendente encontrado nesta fila.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isError = n.severity === 'error';
            return (
              <div 
                key={n.id}
                className={cn(
                  "p-3 rounded-xl border transition-all text-slate-850 bg-white shadow-2xs hover:shadow-xs flex gap-3 items-start",
                  isError ? "border-l-4 border-l-red-500 border-slate-200" : "border-l-4 border-l-amber-500 border-slate-200"
                )}
              >
                {/* Icon Circle */}
                <div className={cn(
                  "p-1.5 rounded-lg shrink-0 mt-0.5",
                  n.type === 'lead' ? "bg-blue-50 text-blue-700" :
                  n.type === 'task' ? "bg-amber-50 text-amber-700" :
                  "bg-rose-50 text-rose-700"
                )}>
                  {n.type === 'lead' && <UserCheck className="w-4 h-4" />}
                  {n.type === 'task' && <CheckSquare className="w-4 h-4" />}
                  {n.type === 'finance' && <DollarSign className="w-4 h-4" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-extrabold text-slate-900 leading-tight block truncate pr-1">
                      {n.title}
                    </span>
                    <span className={cn(
                      "text-[9px] font-black uppercase px-1.5 py-0.2 rounded font-mono shrink-0",
                      isError ? "bg-red-55 text-red-750" : "bg-amber-55 text-amber-750"
                    )}>
                      {isError ? 'Atrás' : 'Hoje'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {n.description}
                  </p>
                  
                  {/* Footer / Meta and Action */}
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 flex-wrap gap-2">
                    <span className="text-[9px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Progresso: {n.date.split('-').reverse().join('/')}</span>
                    </span>

                    <button
                      onClick={() => handleActionClick(n)}
                      className={cn(
                        "text-[10px] font-extrabold flex items-center gap-1 hover:underline text-indigo-705 border-none bg-transparent hover:text-[#D4AF37] select-none cursor-pointer"
                      )}
                    >
                      <span>{n.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-50 p-2.5 text-center text-[9px] text-slate-450 border-t border-slate-200 select-none">
        Indicadores calculados em tempo real com base no faturamento e fluxos de CRM.
      </div>
    </div>
  );
}
