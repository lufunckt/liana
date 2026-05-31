import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { 
  AlertTriangle, Calendar, Star, Users, CheckSquare, Award, Clock, 
  ArrowRight, FileSpreadsheet, UserPlus, Eye, Check, X, PlusCircle 
} from 'lucide-react';

const COMPANY_PIX_CNPJ = '51.533.488/0001-09';

export function PrioridadesHoje() {
  const { data, updateModuleData } = useStore();
  const pessoas = data.pessoas || [];
  const tarefas = data.tarefas_suporte || [];
  const materiais = data.materiais || [];

  const [dateOffset, setDateOffset] = useState<number>(0); // 0 = Hoje, 1 = Amanhã, etc.

  // Date constants
  const todayStr = new Date().toISOString().split('T')[0];

  const prioritiesList = useMemo(() => {
    const list: any[] = [];

    // 1. Followups vencidos e de hoje
    pessoas.forEach(p => {
      if (p.proximoContato) {
        const isLate = p.proximoContato < todayStr;
        const isToday = p.proximoContato === todayStr;
        
        if ((isLate || isToday) && p.status !== 'comprou' && p.status !== 'perdido') {
          list.push({
            id: `followup_${p.id}`,
            entity: p,
            type: 'CRM Follow-up',
            title: isLate ? `Followup Atrasado (${p.proximoContato})` : `Follow-up agendado para hoje`,
            description: `Entrar em contato sobre o produto "${p.produtoInteresse || 'Não informado'}"`,
            prioridade: p.temperatura === 'quente' ? 'alta' : 'média',
            responsavel: p.responsavel || 'Ana',
            prazo: p.proximoContato,
            pessoaRelacionada: p.nome,
            color: 'border-amber-500/30 bg-amber-50/40 text-amber-900',
            icon: Calendar,
            actionLabel: 'Disparar WhatsApp',
            actionClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
            onResolve: async () => {
              // Mark contact made / move forward
              let cleanPhone = String(p.telefone || '').replace(/\D/g, '');
              if (cleanPhone.length > 0 && !cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
                cleanPhone = '55' + cleanPhone;
              }
              const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(`Olá ${p.nome}, tudo bem? Passando para retomarmos nossa conversa...`)}`;
              window.open(url, '_blank');
              // Auto-log interaction
              const updatedPessoas = pessoas.map(item => {
                if (item.id === p.id) {
                  const updatedInteracoes = [
                    { text: `[Auto-Atalha] Disparou follow-up urgente via link Prioridades de Hoje`, date: 'Agora', type: 'system' },
                    ...(item.interacoes || [])
                  ];
                  return { ...item, status: 'contato feito', interacoes: updatedInteracoes };
                }
                return item;
              });
              await updateModuleData('pessoas', updatedPessoas);
            },
            onDelay: async () => {
              const nextWeek = new Date();
              nextWeek.setDate(nextWeek.getDate() + 3);
              const nextWeekStr = nextWeek.toISOString().split('T')[0];
              const updated = pessoas.map(item => {
                if (item.id === p.id) {
                  return { ...item, proximoContato: nextWeekStr };
                }
                return item;
              });
              await updateModuleData('pessoas', updated);
              alert('Follow-up adiado em 3 dias com sucesso!');
            }
          });
        }
      }

      // 2. Leads quentes sem retorno (temperatura quente e status novo / contato feito)
      if (p.temperatura === 'quente' && (p.status === 'novo' || p.status === 'contato feito')) {
        list.push({
          id: `hot_lead_${p.id}`,
          entity: p,
          type: 'Lead Quente',
          title: 'Lead Quente sem resposta',
          description: `Qualificar e abordar urgentemente! Produto: "${p.produtoInteresse || 'Indefinido'}"`,
          prioridade: 'alta',
          responsavel: p.responsavel || 'Ana',
          prazo: todayStr,
          pessoaRelacionada: p.nome,
          color: 'border-red-500/30 bg-rose-50/40 text-rose-950',
          icon: Star,
          actionLabel: 'Qualificar Agora',
          actionClass: 'bg-orange-600 hover:bg-orange-700 text-white',
          onResolve: () => {
            window.dispatchEvent(new CustomEvent('open_pessoa_ficha', { detail: p }));
          }
        });
      }

      // 3. Leads aguardando pagamento
      if (p.status === 'aguardando pagamento') {
        list.push({
          id: `wait_pay_${p.id}`,
          entity: p,
          type: 'Financeiro CRM',
          title: 'Aguardando pagamento de inscrição',
          description: `Enviar chave PIX de fechamento (${COMPANY_PIX_CNPJ}) ou confirmar comprovantes de faturamento`,
          prioridade: 'alta',
          responsavel: p.responsavel || 'Ana',
          prazo: todayStr,
          pessoaRelacionada: p.nome,
          color: 'border-[#D4AF37]/35 bg-amber-50/50 text-[#0A192F]',
          icon: Clock,
          actionLabel: 'Enviar PIX Chave',
          actionClass: 'bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-slate-900',
          onResolve: () => {
            const cleanPhone = String(p.telefone || '').replace(/\D/g, '');
            const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(`Olá, ${p.nome}! Segue nossa chave PIX CNPJ do Instituto Liana Gomes para confirmação da vaga:\n🔑 CNPJ: 51.533.488/0001-09\n\nFico no aguardo do comprovante!`)}`;
            window.open(url, '_blank');
          }
        });
      }

      // 4. Alunas pendentes de Onboarding (sem grupo, sem formulário, sem assessoria Nutror/MRP)
      if (p.tipoPessoa === 'aluna' || p.status === 'comprou') {
        const onboardingPending = [];
        if (!p.entrouGrupo) onboardingPending.push('Grupo Whats');
        if (!p.respondeuInicial) onboardingPending.push('Formulário Inicial');
        if (!p.acessoNutror) onboardingPending.push('Acesso Nutror');
        if (!p.acessoMRP) onboardingPending.push('Planilha MRP');

        if (onboardingPending.length > 0) {
          list.push({
            id: `onboard_pend_${p.id}`,
            entity: p,
            type: 'Onboarding CS',
            title: `Pendências: ${onboardingPending.join(', ')}`,
            description: `Liberar credenciais de onboarding ou cobrar resposta de documentos fundamentais.`,
            prioridade: onboardingPending.length >= 3 ? 'alta' : 'média',
            responsavel: 'Nuria',
            prazo: todayStr,
            pessoaRelacionada: p.nome,
            color: 'border-sky-500/30 bg-sky-50/40 text-sky-900',
            icon: UserPlus,
            actionLabel: 'Sanar Pendência',
            actionClass: 'bg-sky-600 hover:bg-sky-700 text-white',
            onResolve: async () => {
              // Auto solve first checked or open sheet
              window.dispatchEvent(new CustomEvent('open_pessoa_ficha', { detail: p }));
            }
          });
        }
      }
    });

    // 5. Tarefas vencidas ou ativas da central de suporte
    tarefas.forEach(t => {
      const isResolved = t.status === 'concluído' || t.status === 'resolvido';
      if (!isResolved) {
        const isLate = t.prazo && t.prazo < todayStr;
        const isToday = t.prazo === todayStr;

        if (isLate || isToday || !t.prazo) {
          list.push({
            id: `task_${t.id}`,
            entity: t,
            type: t.tipo === 'suporte' ? 'Ticket Suporte' : 'Dever Coletivo',
            title: t.titulo,
            description: t.descricao || 'Demandas pendentes no fluxo operacional.',
            prioridade: t.prioridade || 'alta',
            responsavel: t.responsavel || 'Geral',
            prazo: t.prazo || 'Sem prazo definido',
            pessoaRelacionada: t.pessoaRelacionada || 'Equipe Geral',
            color: t.tipo === 'suporte' ? 'border-violet-500/30 bg-violet-50/40 text-violet-950' : 'border-slate-500/30 bg-white/70 text-slate-900',
            icon: CheckSquare,
            actionLabel: 'Concluir Chamado',
            actionClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
            onResolve: async () => {
              const updated = tarefas.map(item => {
                if (item.id === t.id) {
                  return { ...item, status: 'concluído' };
                }
                return item;
              });
              await updateModuleData('tarefas_suporte', updated);
              alert('Tarefa marcada como Concluída no mural unificado!');
            },
            onDelay: async () => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const tomorrowStr = tomorrow.toISOString().split('T')[0];
              const updated = tarefas.map(item => {
                if (item.id === t.id) {
                  return { ...item, prazo: tomorrowStr };
                }
                return item;
              });
              await updateModuleData('tarefas_suporte', updated);
              alert('Prazo postergado para amanhã!');
            }
          });
        }
      }
    });

    return list;
  }, [pessoas, tarefas, materiais, todayStr]);

  const stats = useMemo(() => {
    return {
      total: prioritiesList.length,
      alta: prioritiesList.filter(p => p.prioridade === 'alta').length,
      media: prioritiesList.filter(p => p.prioridade === 'média').length,
      baixa: prioritiesList.filter(p => p.prioridade === 'baixa' || !p.prioridade).length,
    };
  }, [prioritiesList]);

  // Handle open ficha trigger
  const handleOpenFichaId = (entity: any) => {
    const parentPerson = pessoas.find(p => p.id === entity.id || p.nome === entity.nome || p.email === entity.email);
    if (parentPerson) {
      window.dispatchEvent(new CustomEvent('open_pessoa_ficha', { detail: parentPerson }));
    } else {
      window.dispatchEvent(new CustomEvent('open_pessoa_ficha', { detail: entity }));
    }
  };

  // Quick manual add form state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickResp, setQuickResp] = useState('Geral');
  const [quickPrio, setQuickPrio] = useState('média');

  const handleAddQuickTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const newTask = {
      id: 'quick_task_' + Date.now(),
      titulo: quickTitle.trim(),
      descricao: 'Cadastrada nas prioridades expressas de hoje.',
      tipo: 'tarefa',
      status: 'a fazer',
      categoria: 'mural_tarefa',
      responsavel: quickResp,
      prioridade: quickPrio,
      prazo: todayStr
    };

    const updated = [...tarefas, newTask];
    await updateModuleData('tarefas_suporte', updated);
    setQuickTitle('');
    alert('Nova tarefa prioritária fixada no dia!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-305 text-left pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="p-1 px-2 bg-[#D4AF37]/10 text-[#0A192F] text-xs font-black uppercase rounded tracking-widest border border-[#D4AF37]/30">Fila Diária de Rotina</span>
          <h1 className="text-2xl font-extrabold text-[#0A192F] tracking-tight mt-1.5">Prioridades de Hoje</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">Este painel indexa todas as ações comerciais e operacionais que venceram ou estão agendadas para hoje.</p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2">
          <div className="bg-rose-50 border border-rose-250 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse shrink-0" />
            <span className="text-xs font-bold text-rose-950">{stats.alta} Urgentes</span>
          </div>

          <div className="bg-amber-50 border border-amber-250 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="text-xs font-bold text-amber-950">{stats.media} Pendências</span>
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left main: priority items array */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-[#0A192F] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2.5">📋 Fila de Pendências Ativas ({stats.total})</h3>
            
            <div className="space-y-3.5">
              {prioritiesList.map((item) => {
                const IconComponent = item.icon || AlertTriangle;
                return (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${item.color}`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 bg-white/80 rounded-lg shadow-2xs shrink-0 mt-0.5">
                        <IconComponent className="w-4 h-4 text-slate-700" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] uppercase font-black bg-white/70 tracking-wider px-1.5 py-0.2 rounded border border-slate-200 text-slate-700">{item.type}</span>
                          {item.prioridade === 'alta' && (
                            <span className="text-[8px] bg-rose-600 font-extrabold rounded px-1.2 py-0.2 text-white uppercase tracking-wider">CRÍTICO</span>
                          )}
                          <span className="text-[10px] text-slate-600 font-bold whitespace-nowrap">Para: <strong>{item.pessoaRelacionada}</strong></span>
                        </div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 tracking-tight mt-1 leading-tight">{item.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">{item.description}</p>
                        
                        <div className="flex gap-4 items-center mt-2.5 text-[10px] text-slate-500 font-semibold uppercase">
                          <span>Responsável: <strong>{item.responsavel}</strong></span>
                          {item.prazo && <span>Prazo: <strong>{item.prazo}</strong></span>}
                        </div>
                      </div>
                    </div>

                    {/* Quick operational actions */}
                    <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/40">
                      <button
                        onClick={() => handleOpenFichaId(item.entity)}
                        className="p-2 bg-white hover:bg-slate-105 rounded-lg border border-slate-300 text-slate-700 transition flex items-center justify-center gap-1 text-[11px] font-bold shadow-2xs cursor-pointer"
                        title="Abrir ficha completa 360"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ficha
                      </button>

                      {item.onDelay && (
                        <button
                          onClick={item.onDelay}
                          className="px-2.5 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-300 text-slate-650 text-[11px] font-bold transition cursor-pointer"
                        >
                          Adiar
                        </button>
                      )}

                      <button
                        onClick={item.onResolve}
                        className={`px-3 py-2 rounded-lg text-[11px] font-extrabold uppercase transition-all shadow-2xs cursor-pointer ${item.actionClass || 'bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F]'}`}
                      >
                        {item.actionLabel || 'Resolver'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {prioritiesList.length === 0 && (
                <div className="py-16 text-center text-slate-400 border border-dashed rounded-xl bg-slate-50/50">
                  <span className="text-3xl select-none">🏖️</span>
                  <p className="text-xs font-bold mt-2">Sem pendências registradas para hoje!</p>
                  <p className="text-[10px] text-slate-500 mt-1">O time está 100% atualizado ou não há contatos programados.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Quick add new priority action item */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Quick task trigger for today */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-[#0A192F] uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">⚡ Fixar pendência urgente</h3>
            <p className="text-xs text-slate-500 mb-4">Adicione uma tarefa prioritária com vencimento para hoje na fila coletiva.</p>

            <form onSubmit={handleAddQuickTask} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Título da pendência rápida:</label>
                <input 
                  type="text" 
                  value={quickTitle}
                  onChange={e => setQuickTitle(e.target.value)}
                  placeholder="Ex: Ligar para confirmar PIX da Renata"
                  required
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 outline-none focus:border-[#1F4E89] text-slate-800 bg-[#FCFBF9]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Líder / Responsável:</label>
                  <select 
                    value={quickResp}
                    onChange={e => setQuickResp(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-2.5 py-2 bg-white"
                  >
                    <option value="Geral">Time Geral</option>
                    <option value="Liana">Liana</option>
                    <option value="Ana">Ana</option>
                    <option value="Nuria">Núria</option>
                    <option value="Luiza">Luiza</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Gravidade/Prioridade:</label>
                  <select 
                    value={quickPrio}
                    onChange={e => setQuickPrio(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-2.5 py-2 bg-white"
                  >
                    <option value="alta">Alta 🔥</option>
                    <option value="média">Média ⚡</option>
                    <option value="baixa">Baixa 🍃</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0A192F] hover:bg-[#D4AF37] hover:text-[#0A192F] text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                + Acionar Prioridade
              </button>
            </form>
          </div>

          {/* Quick rules checklist helpful tips */}
          <div className="bg-[#0A192F]/5 p-5 border border-[#0A192F]/10 rounded-2xl text-slate-700 space-y-3.5">
            <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider flex items-center gap-1">
              <Star className="w-4 h-4 text-[#D4AF37]" />
              Manual de Produtividade ILG
            </h4>
            <ul className="space-y-2 text-[11px] font-medium text-slate-650">
              <li className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-[#D4AF37] select-none">•</span>
                <span>As alunas com pendências de onboarding (sem preencher formulário inicial ou sem link de acesso ao Nutror) devem ser acionadas pela <strong>Núria</strong>.</span>
              </li>
              <li className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-[#D4AF37] select-none">•</span>
                <span>Qualquer follow-up que passar do prazo de contato aparecerá imediatamente aqui para a <strong>Ana</strong> comercial retomar.</span>
              </li>
              <li className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-[#D4AF37] select-none">•</span>
                <span>Os chamados de suporte técnico em aberto exigem resolução imediata para não fragilizar o Sucesso do Cliente.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
