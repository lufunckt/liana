import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Briefcase, MessageSquare, Sparkles, Trash2, Pin, CheckSquare, 
  Send, User, AlertTriangle, Lightbulb, Check, Plus, Loader2,
  TrendingUp, Activity, BadgeAlert, Shield, Users, CreditCard,
  DollarSign, Mail, Phone, ExternalLink, HelpCircle, CheckCircle, FileText,
  UserCheck, Award
} from 'lucide-react';
import { cn, getTodayString, normalizeStatusSlug, normalizeOnboardingSlug } from '../lib/utils';
import { PessoaFicha } from './Pessoas/PessoaFicha';

interface MeuPainelProps {
  setActiveTab: (tab: any) => void;
}

export function MeuPainel({ setActiveTab }: MeuPainelProps) {
  const { data } = useStore();
  
  // Active Profile from LocalStorage
  const selectedProfile = localStorage.getItem('ilg_selected_profile') || 'ana';

  // State for Modal PessoaFicha
  const [selectedPessoa, setSelectedPessoa] = useState<any | null>(null);
  
  // Data lists
  const pessoas = data.pessoas || [];
  const tarefas = data.tarefas_suporte || [];
  const pagamentos = data.pagamentos || [];
  const materiais = data.materiais || [];

  const todayStr = getTodayString(); // Dynamic system date using central function

  const getProfileName = (id: string) => {
    switch(id) {
      case 'liana': return 'Liana Gomes';
      case 'ana': return 'Ana (Comercial)';
      case 'nuria': return 'Núria (Onboarding & CS)';
      case 'luiza': return 'Luiza (Regras e DevOps)';
      default: return 'Colaboradora';
    }
  };

  const getProfileRole = (id: string) => {
    switch(id) {
      case 'liana': return 'Fundadora & Diretora Geral';
      case 'ana': return 'Head de Negócios & Comercial';
      case 'nuria': return 'Onboarding, Mídias & CS';
      case 'luiza': return 'Tech Lead / Administradora';
      default: return 'Membro da Equipe';
    }
  };

  // Helper to open a person's card
  const openPersonCard = (personId: string) => {
    const person = pessoas.find(p => p.id === personId);
    if (person) {
      setSelectedPessoa(person);
    }
  };

  // ----------------------------------------------------
  // PROFILE 1: ANA (COMERCIAl / CRM)
  // ----------------------------------------------------
  const renderAnaDashboard = () => {
    const leads = pessoas.filter(p => (p.tipoPessoa || 'lead') === 'lead');
    const leadsQuentes = leads.filter(p => p.temperatura === 'quente' && normalizeStatusSlug(p.status) !== 'comprou' && normalizeStatusSlug(p.status) !== 'perdido');
    const followupsDeHoje = leads.filter(p => p.proximoContato === todayStr);
    const followupsAtrasados = leads.filter(p => p.proximoContato && p.proximoContato < todayStr);
    const leadsSemResposta = leads.filter(p => normalizeStatusSlug(p.status) === 'novo-lead' || normalizeStatusSlug(p.status) === 'novo');
    const negociacoesAbertas = leads.filter(p => normalizeStatusSlug(p.status) === 'em-negociacao');
    const aguardandoPagamento = leads.filter(p => normalizeStatusSlug(p.status) === 'aguardando-pagamento');
    
    // Objeções pendentes: leads com observações que contenham palavras de objeção ou status negociação
    const objecoesPendentes = leads.filter(p => 
      normalizeStatusSlug(p.status) === 'em-negociacao' && p.observacoes && 
      (p.observacoes.toLowerCase().includes('obje') || 
       p.observacoes.toLowerCase().includes('caro') || 
       p.observacoes.toLowerCase().includes('pensar'))
    );

    return (
      <div className="space-y-6">
        {/* KPI Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leads Quentes</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{leadsQuentes.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Follow-ups de Hoje</p>
            <p className="text-2xl font-black text-amber-500 mt-1">{followupsDeHoje.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aguardando Pgto</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{aguardandoPagamento.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Follow-ups Atrasados</p>
            <p className="text-2xl font-black text-red-500 mt-1">{followupsAtrasados.length}</p>
          </div>
        </div>

        {/* Task lists & CRM queues */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Queues */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-extrabold text-[#0A192F] text-sm tracking-tight flex items-center justify-between">
              <span>Fila Comercial Urgente</span>
              <span className="text-[10px] bg-red-100 text-red-800 font-extrabold px-1.5 py-0.5 rounded uppercase">Alta Prioridade</span>
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {followupsAtrasados.map(p => (
                <div key={p.id} className="p-3 bg-red-50/50 border border-red-100 rounded-lg flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate">{p.nome}</p>
                    <p className="text-[10px] text-red-700 font-medium">Follow-up vencido em: {p.proximoContato}</p>
                  </div>
                  <button onClick={() => openPersonCard(p.id)} className="px-2 py-1 bg-white hover:bg-red-100 border border-red-250 text-red-800 text-[10px] font-bold uppercase rounded-lg transition">
                    Ver Ficha
                  </button>
                </div>
              ))}

              {leadsQuentes.map(p => (
                <div key={p.id} className="p-3 bg-orange-50/50 border border-orange-100 rounded-lg flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate">{p.nome}</p>
                    <p className="text-[10px] text-orange-850 font-medium">Lead Quente • Foco Comercial</p>
                  </div>
                  <button onClick={() => openPersonCard(p.id)} className="px-2 py-1 bg-white hover:bg-orange-100 border border-orange-200 text-orange-900 text-[10px] font-bold uppercase rounded-lg transition">
                    Ver Ficha
                  </button>
                </div>
              ))}

              {followupsAtrasados.length === 0 && leadsQuentes.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Não há contatos urgentes na fila comercial. Ótimo trabalho!
                </div>
              )}
            </div>
          </div>

          {/* Active negotiations & Objections */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-extrabold text-[#0A192F] text-sm tracking-tight">Negociações Ativas & Objeções Detectadas</h3>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {negociacoesAbertas.map(p => {
                const isObjection = objecoesPendentes.some(obj => obj.id === p.id);
                return (
                  <div key={p.id} className={cn("p-3 rounded-lg border flex justify-between items-center", isObjection ? "bg-amber-50/75 border-amber-200" : "bg-slate-50 border-slate-100")}>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-xs truncate">{p.nome}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{p.produtoInteresse || 'Nenhum produto especificado'}</p>
                      {isObjection && (
                        <span className="text-[8px] uppercase bg-amber-100 border border-amber-200 text-amber-800 px-1 py-0.2 rounded font-black mt-1 inline-block">Objeção Detectada / Caro</span>
                      )}
                    </div>
                    <button onClick={() => openPersonCard(p.id)} className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold uppercase rounded-lg transition shadow-2xs">
                      Resolver
                    </button>
                  </div>
                );
              })}

              {negociacoesAbertas.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Sem negociações ativas listadas em seu funil de vendas.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ana Actions */}
        <div className="bg-[#0A192F] text-white p-5 rounded-xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => setActiveTab('agente_social_seller')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition space-y-1">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h4 className="font-bold text-xs">Agente Social Seller</h4>
            <p className="text-[10px] text-slate-400">Gerar abordagens frias com IA</p>
          </button>
          <button onClick={() => setActiveTab('whatsapp')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition space-y-1">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-xs">Abrir WhatsApp</h4>
            <p className="text-[10px] text-slate-400">Central Geral de Atendimentos</p>
          </button>
          <button onClick={() => setActiveTab('comercial')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition space-y-1">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-xs">Funil Comercial</h4>
            <p className="text-[10px] text-slate-400">Arrastar colunas do CRM</p>
          </button>
          <button 
            onClick={() => {
              // Open add manual lead flow
              setActiveTab('pessoas');
              setTimeout(() => {
                alert('Dica: Utilize o botão de novo registro no topo da Base de Pessoas para cadastrar leads quentes.');
              }, 400);
            }} 
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition space-y-1"
          >
            <Plus className="w-5 h-5 text-[#D4AF37]" />
            <h4 className="font-bold text-xs">Novo Lead Quente</h4>
            <p className="text-[10px] text-slate-400">Cadastrar no banco de dados</p>
          </button>
        </div>
      </div>
    );
  };


  // ----------------------------------------------------
  // PROFILE 2: NÚRIA (ONBOARDING / SUPPORT)
  // ----------------------------------------------------
  const renderNuriaDashboard = () => {
    const students = pessoas.filter(p => p.tipoPessoa === 'aluna' || normalizeStatusSlug(p.status) === 'comprou');
    
    // Checkpoints
    const semGrupo = students.filter(p => !p.entrouGrupo);
    const semForm = students.filter(p => !p.respondeuInicial);
    const semNutror = students.filter(p => !p.acessoNutror);
    const semMRP = students.filter(p => !p.acessoMRP);
    
    const openSupports = tarefas.filter(t => t.tipo === 'suporte' && t.status !== 'resolvido' && t.status !== 'concluído');
    const tasksToday = tarefas.filter(t => t.categoria === 'mural_tarefa' && t.status !== 'concluído');

    return (
      <div className="space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fora do Grupo Whats</p>
            <p className="text-2xl font-black text-rose-500 mt-1">{semGrupo.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sem Diagnóstico Inicial</p>
            <p className="text-2xl font-black text-amber-500 mt-1">{semForm.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Acesso Nutror pendente</p>
            <p className="text-2xl font-black text-indigo-500 mt-1">{semNutror.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Suportes em Aberto</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{openSupports.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Onboarding Checklist Grid */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-extrabold text-[#0A192F] text-sm tracking-tight">Fila de Onboarding Crítico (Alunas com Pendência)</h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {semGrupo.map(p => (
                <div key={p.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate">{p.nome}</p>
                    <p className="text-[10px] text-rose-700 font-extrabold uppercase">Estágio 1 • Adicionar no Grupo de Whats</p>
                  </div>
                  <button onClick={() => openPersonCard(p.id)} className="px-2 py-1 bg-white hover:bg-rose-100 border border-rose-200 text-rose-800 text-[10px] font-bold uppercase rounded-lg transition">
                    Ver Ficha
                  </button>
                </div>
              ))}

              {semForm.map(p => (
                <div key={p.id} className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate">{p.nome}</p>
                    <p className="text-[10px] text-amber-800 font-extrabold uppercase">Estágio 2 • Aguardando Formulário Diagnóstico</p>
                  </div>
                  <button onClick={() => openPersonCard(p.id)} className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase rounded-lg transition">
                    Ver Ficha
                  </button>
                </div>
              ))}

              {semNutror.map(p => (
                <div key={p.id} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate">{p.nome}</p>
                    <p className="text-[10px] text-indigo-750 font-extrabold uppercase">Estágio 3 • Enviar Acesso Nutror</p>
                  </div>
                  <button onClick={() => openPersonCard(p.id)} className="px-2 py-1 bg-white hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[10px] font-bold uppercase rounded-lg transition">
                    Ver Ficha
                  </button>
                </div>
              ))}

              {semGrupo.length === 0 && semForm.length === 0 && semNutror.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Todas as alunas estão com onboarding pendente em dia!
                </div>
              )}
            </div>
          </div>

          {/* Active support list */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-extrabold text-[#0A192F] text-sm tracking-tight flex items-center justify-between animate-in font-sans">
              <span>Chamados de Suporte Técnico</span>
              <span className="text-[10px] bg-indigo-100 text-[#0A192F] font-bold px-2 py-0.5 rounded">Tickets</span>
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {openSupports.map(t => (
                <div key={t.id} className="p-3 bg-slate-50 border border-slate-150 rounded-lg flex justify-between items-center text-left">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate">{t.titulo}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                      Tipo: <strong className="uppercase">{t.tipo}</strong> • Responsável: <strong>{t.responsavel || 'Equipe'}</strong>
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setActiveTab('tarefas_suporte');
                    }} 
                    className="px-2.5 py-1 bg-[#0A192F] text-white hover:bg-[#D4AF37] hover:text-[#0A192F] text-[10px] font-bold uppercase rounded transition"
                  >
                    Atender
                  </button>
                </div>
              ))}

              {openSupports.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Sem tickets de suporte abertos e pendentes no momento.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
          <button onClick={() => setActiveTab('alunos')} className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg transition text-left space-y-1">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <span className="font-black text-xs text-[#0A192F] block">Onboarding Portal</span>
            <span className="text-[9px] text-slate-400 block font-semibold">Tabelas e Checklists de Alunas</span>
          </button>
          <button onClick={() => setActiveTab('certificados')} className="p-3 bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded-lg transition text-left space-y-1">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="font-black text-xs text-[#0A192F] block">Gerar Certificado</span>
            <span className="text-[9px] text-slate-400 block font-semibold">Imprimir selo ou código ILG</span>
          </button>
          <button onClick={() => setActiveTab('tarefas_suporte')} className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-lg transition text-left space-y-1">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            <span className="font-black text-xs text-[#0A192F] block">Nova Tarefa / Suporte</span>
            <span className="text-[9px] text-slate-400 block font-semibold">Registrar ticket de aluna</span>
          </button>
          <button 
            onClick={() => {
              setActiveTab('pessoas');
              setTimeout(() => {
                alert('Dica: Selecione a pessoa na Base Geral para abrir a Ficha Única e manipular acessos do Nutror/MRP.');
              }, 400);
            }} 
            className="p-3 bg-slate-50 hover:bg-rose-50 border border-slate-200 rounded-lg transition text-left space-y-1"
          >
            <User className="w-5 h-5 text-rose-500" />
            <span className="font-black text-xs text-[#0A192F] block">Buscar Aluna ficha</span>
            <span className="text-[9px] text-slate-400 block font-semibold">Abrir Ficha Única</span>
          </button>
        </div>
      </div>
    );
  };


  // ----------------------------------------------------
  // PROFILE 3: LIANA (DIRECTOR / ADVISOR)
  // ----------------------------------------------------
  const renderLianaDashboard = () => {
    // Calculo de Vendas
    const totalPago = pagamentos
      .filter(p => p.status === 'pago')
      .reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

    const totalAtrasado = pagamentos
      .filter(p => p.status === 'atrasado')
      .reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

    const leadsQuentesList = pessoas.filter(p => p.tipoPessoa === 'lead' && p.temperatura === 'quente');
    const suportesCriticos = tarefas.filter(t => t.tipo === 'suporte' && t.prioridade === 'alta' && t.status !== 'resolvido');
    const tasksAwaiting = tarefas.filter(t => t.prioridade === 'alta' && t.status !== 'concluído');

    // Most sought products
    const productFrequency: { [key: string]: number } = {};
    pessoas.forEach(p => {
      const prod = p.produtoInteresse || p.produtoComprado;
      if (prod) {
        productFrequency[prod] = (productFrequency[prod] || 0) + 1;
      }
    });
    const topProducts = Object.entries(productFrequency)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 3);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Faturamento Pago</p>
            <p className="text-xl font-mono font-black text-emerald-600 mt-2">R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Inadimplência Atrasos</p>
            <p className="text-xl font-mono font-black text-rose-500 mt-2">R$ {totalAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none font-sans">Contatos Quentes Ativos</p>
            <p className="text-2xl font-black text-orange-500 mt-1.5">{leadsQuentesList.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Gargalos e Prioridades</p>
            <p className="text-2xl font-black text-red-500 mt-1.5">{suportesCriticos.length + tasksAwaiting.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liana Critical bottlenecks and requests */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 text-left">
            <h3 className="font-extrabold text-[#0A192F] text-sm tracking-tight flex items-center gap-2">
              <BadgeAlert className="w-5 h-5 text-red-500" />
              Decisões Críticas e Gargalos Aguardando Validação
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {suportesCriticos.map(t => (
                <div key={t.id} className="p-3 bg-red-50 border border-red-100 rounded-lg flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate">Suporte: {t.titulo}</p>
                    <p className="text-[10px] text-red-700 font-semibold uppercase">Reclamação ou Dúvida Crítica de Aluna</p>
                  </div>
                  <button onClick={() => setActiveTab('tarefas_suporte')} className="px-2 py-1 bg-[#0A192F] hover:bg-slate-800 text-white text-[10px] font-bold uppercase rounded-lg transition">
                    Ver Ticket
                  </button>
                </div>
              ))}

              {tasksAwaiting.map(t => (
                <div key={t.id} className="p-3 bg-stone-50 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate">Tarefa: {t.titulo}</p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Pauta Alta Prioridade • Resp: {t.responsavel}</p>
                  </div>
                  <button onClick={() => setActiveTab('tarefas_suporte')} className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold uppercase rounded-lg transition">
                    Ver Pauta
                  </button>
                </div>
              ))}

              {suportesCriticos.length === 0 && tasksAwaiting.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Não há decisões pendentes ou gargalos críticos abertos para validação.
                </div>
              )}
            </div>
          </div>

          {/* Most requested formations */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 text-left">
            <h3 className="font-extrabold text-[#0A192F] text-sm tracking-tight">Crescimento de Formações / Produtos Mais Procurados</h3>

            <div className="space-y-3">
              {topProducts.map(([prodName, freq], pIdx) => (
                <div key={prodName} className="p-3.5 bg-slate-50 rounded-lg border border-slate-150 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0A192F] text-[#D4AF37] flex items-center justify-center font-bold text-[10px]">{pIdx + 1}</span>
                    <strong className="text-slate-800">{prodName}</strong>
                  </div>
                  <span className="bg-amber-100 text-amber-900 border border-amber-200 font-extrabold px-2 py-0.5 rounded text-[10px]">
                    {freq} interesse(s)
                  </span>
                </div>
              ))}

              {topProducts.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Preencha dados de interesse nas fichas para gerar estatísticas.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Liana Actions */}
        <div className="bg-[#0A192F] text-white p-5 rounded-xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <button onClick={() => setActiveTab('financeiro')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition space-y-1">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-xs">Resultados Financeiros</h4>
            <p className="text-[10px] text-slate-400">Contratos fechados e fluxo</p>
          </button>
          <button onClick={() => setActiveTab('comunicacao_interna')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition space-y-1">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h4 className="font-bold text-xs">Comunicado Interno</h4>
            <p className="text-[10px] text-slate-400">Publicar editais de equipe</p>
          </button>
          <button onClick={() => setActiveTab('comercial')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition space-y-1">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h4 className="font-bold text-xs">Visão Funil Global</h4>
            <p className="text-[10px] text-slate-400">Acompanhar equipe comercial</p>
          </button>
          <button onClick={() => setActiveTab('pessoas')} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition space-y-1">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            <h4 className="font-bold text-xs">Base de Alunas & CRM</h4>
            <p className="text-[10px] text-slate-400">Auditar fichas cadastrais</p>
          </button>
        </div>
      </div>
    );
  };


  // ----------------------------------------------------
  // PROFILE 4: LUIZA (COORDENAÇÃO / COCKPIT / DEVOPS)
  // ----------------------------------------------------
  const renderLuizaDashboard = () => {
    // Governance - Calculate clean data governance KPIs
    const invalidPhones = pessoas.filter(p => !p.telefone || p.telefone.replace(/\D/g, '').length < 8);
    const invalidEmails = pessoas.filter(p => !p.email || !p.email.includes('@'));
    const noResponsavel = pessoas.filter(p => !p.responsavel);
    
    // Duplicate calculation by WhatsApp string helper
    const phoneSeen = new Set<string>();
    const dupesList: string[] = [];
    pessoas.forEach(p => {
      const ph = String(p.telefone || '').replace(/\D/g, '');
      if (ph && ph.length > 5) {
        if (phoneSeen.has(ph)) {
          dupesList.push(ph);
        } else {
          phoneSeen.add(ph);
        }
      }
    });

    const tasksByPerson: { [key: string]: number } = {};
    tarefas.forEach(t => {
      if (t.responsavel) {
        tasksByPerson[t.responsavel] = (tasksByPerson[t.responsavel] || 0) + 1;
      }
    });

    return (
      <div className="space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pessoas Cadastradas</p>
            <p className="text-2xl font-black text-indigo-600 mt-2">{pessoas.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Contatos Duplicados</p>
            <p className="text-2xl font-black text-rose-500 mt-2">{dupesList.length} detectados</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Cadastros Incompletos</p>
            <p className="text-2xl font-black text-amber-500 mt-2">{invalidPhones.length + invalidEmails.length + noResponsavel.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pautas / Tarefas no Geral</p>
            <p className="text-2xl font-black text-[#0A192F] mt-2">{tarefas.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Luiza: Data quality and logs panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 text-left">
            <h3 className="font-extrabold text-[#0A192F] text-sm tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Governança e Erros Cadastrais (Correção de Dados)
            </h3>

            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {dupesList.map(ph => (
                <div key={ph} className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-[#0A192F]">Telefone Duplicado: +{ph}</p>
                    <p className="text-[10px] text-rose-700 font-medium">Cadastros múltiplos compartilhando este WhatsApp.</p>
                  </div>
                  <button onClick={() => setActiveTab('pessoas')} className="px-2.5 py-1 bg-white hover:bg-rose-100 border border-rose-200 text-rose-800 text-[10px] font-bold uppercase rounded transition">
                    Ver Base
                  </button>
                </div>
              ))}

              {invalidPhones.map(p => (
                <div key={p.id} className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{p.nome}</p>
                    <p className="text-[10px] text-amber-800 font-medium">WhatsApp ausente ou inválido: "{p.telefone}"</p>
                  </div>
                  <button onClick={() => openPersonCard(p.id)} className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase rounded transition">
                    Limpar
                  </button>
                </div>
              ))}

              {invalidEmails.map(p => (
                <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{p.nome}</p>
                    <p className="text-[10px] text-slate-500 font-normal">E-mail ausente ou sem arroba: "{p.email}"</p>
                  </div>
                  <button onClick={() => openPersonCard(p.id)} className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold uppercase rounded transition">
                    Limpar
                  </button>
                </div>
              ))}

              {dupesList.length === 0 && invalidPhones.length === 0 && invalidEmails.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  A base de dados do Instituto Liana Gomes está com 100% de integridade!
                </div>
              )}
            </div>
          </div>

          {/* Core modules workload */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 text-left">
            <h3 className="font-extrabold text-[#0A192F] text-sm tracking-tight">Carga de Trabalho / Tarefas por Responsável</h3>

            <div className="space-y-3.5">
              {Object.entries(tasksByPerson).map(([respName, count]) => (
                <div key={respName} className="p-3 bg-slate-50/70 border border-slate-150 rounded-lg flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-700">{respName}</span>
                  <span className="bg-[#0A192F] text-white font-black px-2.5 py-0.5 rounded text-[10px]">
                    {count} pauta(s) ativa(s)
                  </span>
                </div>
              ))}

              {Object.keys(tasksByPerson).length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Nenhuma pauta ou tarefa cadastrada no sistema.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <button onClick={() => setActiveTab('importar')} className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-lg transition text-left space-y-1">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span className="font-black text-xs text-[#0A192F] block">Importação Segura</span>
            <span className="text-[9px] text-slate-400 block font-semibold">Subir CSVs sem duplicados</span>
          </button>
          <button onClick={() => setActiveTab('planilhas')} className="p-3 bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded-lg transition text-left space-y-1">
            <Check className="w-5 h-5 text-amber-500" />
            <span className="font-black text-xs text-[#0A192F] block">Sincronização</span>
            <span className="text-[9px] text-slate-400 block font-semibold">Auditar planilhas internas</span>
          </button>
          <button onClick={() => setActiveTab('espacos')} className="p-3 bg-slate-50 hover:bg-[#D4AF37]/10 border border-slate-200 rounded-lg transition text-left space-y-1">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-black text-xs text-[#0A192F] block">Usuárias & Permições</span>
            <span className="text-[9px] text-slate-400 block font-semibold">Espaços e acessos equipe</span>
          </button>
          <button onClick={() => setActiveTab('tarefas_suporte')} className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-lg transition text-left space-y-1">
            <Plus className="w-5 h-5 text-emerald-600" />
            <span className="font-black text-xs text-[#0A192F] block">Cadastrar Pauta</span>
            <span className="text-[9px] text-slate-400 block font-semibold">Lançar novas atividades</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title block with selected profile info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg">
        <div>
          <span className="p-1 px-2 bg-[#D4AF37]/20 border border-[#D4AF37]/30 rounded text-[9px] font-black uppercase tracking-wider text-[#D4AF37]">
            Painel Operacional da Colaboradora
          </span>
          <h1 className="text-2xl font-black mt-1.5 flex items-center gap-2">
            Mesa de Trabalho: {getProfileName(selectedProfile)}
          </h1>
          <p className="text-slate-350 text-xs mt-1">Carreiras focadas em resultados. Aqui estão as métricas cruciais delegadas à sua rotina diária.</p>
        </div>

        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2.5 px-3.5 rounded-xl shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none">Status Autenticado</p>
            <p className="text-xs font-black text-amber-400 mt-1">{getProfileRole(selectedProfile)}</p>
          </div>
        </div>
      </div>

      {/* Render Dynamic Dashboard based on Profile */}
      {selectedProfile === 'ana' && renderAnaDashboard()}
      {selectedProfile === 'nuria' && renderNuriaDashboard()}
      {selectedProfile === 'liana' && renderLianaDashboard()}
      {selectedProfile === 'luiza' && renderLuizaDashboard()}

      {/* Action block "O que você quer fazer agora?" */}
      <div className="bg-stone-50 border border-slate-200 p-6 rounded-2xl text-left">
        <h3 className="text-sm font-extrabold text-[#0A192F] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#D4AF37]" />
          Ações Rápidas: O que você quer fazer agora?
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <button onClick={() => { setActiveTab('pessoas'); }} className="p-2.5 bg-white border border-slate-200 hover:border-[#0A192F] rounded-xl text-left transition flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-[11px] font-bold text-slate-700 truncate">Buscar pessoa</span>
          </button>
          <button onClick={() => { setActiveTab('comercial'); }} className="p-2.5 bg-white border border-slate-200 hover:border-[#0A192F] rounded-xl text-left transition flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[11px] font-bold text-slate-700 truncate">Cadastrar lead</span>
          </button>
          <button onClick={() => { setActiveTab('financeiro'); }} className="p-2.5 bg-white border border-slate-200 hover:border-[#0A192F] rounded-xl text-left transition flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-bold text-slate-700 truncate">Registrar venda</span>
          </button>
          <button onClick={() => { setActiveTab('tarefas_suporte'); }} className="p-2.5 bg-white border border-slate-200 hover:border-[#0A192F] rounded-xl text-left transition flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-[11px] font-bold text-slate-700 truncate">Criar tarefa</span>
          </button>
          <button onClick={() => { setActiveTab('tarefas_suporte'); }} className="p-2.5 bg-white border border-slate-200 hover:border-[#0A192F] rounded-xl text-left transition flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-[11px] font-bold text-slate-700 truncate">Abrir suporte</span>
          </button>
          <button onClick={() => { setActiveTab('financeiro'); }} className="p-2.5 bg-white border border-slate-200 hover:border-[#0A192F] rounded-xl text-left transition flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-[11px] font-bold text-slate-700 truncate">Registrar pagamento</span>
          </button>
          <button onClick={() => { setActiveTab('certificados'); }} className="p-2.5 bg-white border border-slate-200 hover:border-[#0A192F] rounded-xl text-left transition flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-[11px] font-bold text-slate-700 truncate">Gerar certificado</span>
          </button>
          <button onClick={() => { setActiveTab('whatsapp'); }} className="p-2.5 bg-white border border-slate-200 hover:border-[#0A192F] rounded-xl text-left transition flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-[11px] font-bold text-slate-700 truncate">Enviar mensagem</span>
          </button>
          <button onClick={() => { setActiveTab('agente_social_seller'); }} className="p-2.5 bg-white border border-slate-200 hover:border-[#0A192F] rounded-xl text-left transition flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-550" />
            <span className="text-[11px] font-bold text-slate-700 truncate">Gerar script Seller</span>
          </button>
          <button onClick={() => { setActiveTab('planilhas'); }} className="p-2.5 bg-white border border-slate-200 hover:border-[#0A192F] rounded-xl text-left transition flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stone-500" />
            <span className="text-[11px] font-bold text-slate-700 truncate">Criar planilha</span>
          </button>
          <button onClick={() => { setActiveTab('materiais'); }} className="p-2.5 bg-white border border-slate-200 hover:border-[#0A192F] rounded-xl text-left transition flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span className="text-[11px] font-bold text-slate-700 truncate">Adicionar material</span>
          </button>
          <button onClick={() => { setActiveTab('prioridades_hoje'); }} className="p-2.5 bg-white border border-slate-200 hover:border-[#0A192F] rounded-xl text-left transition flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-700 truncate">Ver pendências</span>
          </button>
          <button onClick={() => { setActiveTab('importar'); }} className="p-2.5 bg-white border border-slate-200 hover:border-[#0A192F] rounded-xl text-left transition flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="text-[11px] font-bold text-slate-700 truncate">Importar planilha</span>
          </button>
          <button onClick={() => { setActiveTab('comunicacao_interna'); }} className="p-2.5 bg-white border border-slate-200 hover:border-[#0A192F] rounded-xl text-left transition flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0A192F]" />
            <span className="text-[11px] font-bold text-slate-700 truncate">Criar comunicado</span>
          </button>
        </div>
      </div>

      {/* Render selected PessoaFicha modal popup if selected */}
      {selectedPessoa && (
        <PessoaFicha 
          pessoa={selectedPessoa} 
          onClose={() => {
            setSelectedPessoa(null);
            // Quick force refresh
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('certificados_updated'));
            }, 100);
          }} 
        />
      )}
    </div>
  );
}
