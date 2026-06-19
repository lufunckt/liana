import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, Shield, Clock, Search, SlidersHorizontal, RefreshCw, 
  Trash2, Database, ChevronDown, ChevronUp, User, 
  Calendar, FileText, CheckCircle2, AlertTriangle, Key, Terminal
} from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';

interface ColecaoLogsAuditoriaProps {
  historico: any[];
  perfis: any[];
}

export function ColecaoLogsAuditoria({ historico, perfis }: ColecaoLogsAuditoriaProps) {
  const { deleteSingleDocument } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isWiping, setIsWiping] = useState(false);

  // Helper to map profiles
  const getProfileName = (idOrEmail: string | null) => {
    if (!idOrEmail) return 'Visitante';
    const profileDoc = perfis.find((p: any) => p.id === idOrEmail || p.email === idOrEmail);
    if (profileDoc && profileDoc.nome) return profileDoc.nome;
    
    switch(idOrEmail) {
      case 'liana': return 'Liana Gomes (CEO)';
      case 'ana': return 'Ana (Comercial)';
      case 'nuria': return 'Núria (CS)';
      case 'luiza': return 'Luiza (DevOps)';
      case 'anonymous': return 'Membro Autenticado';
      default: return idOrEmail.split('@')[0];
    }
  };

  // Helper to map action types to cute terms
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'cadastro_pessoa': return 'Cadastro de Aluno/Lead';
      case 'status_update': return 'Atualização de CRM';
      case 'view_ficha': return 'Visualização de Ficha';
      case 'alteracao_dados_pessoa': return 'Alteração de Cadastro';
      case 'cadastro_tag': return 'Criação de Tag';
      case 'edicao_tag': return 'Edição de Tag';
      case 'exclusao_tag': return 'Exclusão de Tag';
      case 'recebimento_confirmado': return 'Recebimento Confirmado';
      case 'exclusao_pagamento': return 'Exclusão de Pagamento';
      case 'atualizacao_pagamento': return 'Edição de Pagamento';
      case 'cadastro_pagamento': return 'Lançamento de Cobrança';
      case 'ativacao_canal_real_comunicacoes': return 'Canal Real Ativado';
      case 'reativacao_dados_demonstracao': return 'Reativação de Modo Demo';
      default: return action.replace(/_/g, ' ').toUpperCase();
    }
  };

  // Color mappings for active audit actions
  const getActionStyles = (action: string) => {
    switch (action) {
      case 'cadastro_pessoa':
      case 'cadastro_pagamento':
      case 'cadastro_tag':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'recebimento_confirmado':
      case 'ativacao_canal_real_comunicacoes':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'status_update':
      case 'view_ficha':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'alteracao_dados_pessoa':
      case 'edicao_tag':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'exclusao_pagamento':
      case 'exclusao_tag':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  // Unique lists for filtering
  const uniqueActions = useMemo(() => {
    const actions = new Set<string>();
    historico.forEach(log => {
      if (log.action) actions.add(log.action);
    });
    return Array.from(actions);
  }, [historico]);

  const uniqueUsers = useMemo(() => {
    const users = new Set<string>();
    historico.forEach(log => {
      const emailOrId = log.userEmail || log.userId;
      if (emailOrId) users.add(emailOrId);
    });
    return Array.from(users);
  }, [historico]);

  // Clean wipe trigger with double validation to fulfill safe operations
  const handleWipeLogs = async () => {
    const confirm1 = window.confirm('RESTRITO À SEGURANÇA: Tem certeza que deseja esvaziar os logs de auditoria do sistema? Esta ação é irreversível.');
    if (!confirm1) return;
    const confirm2 = window.prompt('Por favor, escreva "CONFIRMAR" para limpar em definitivo todo o histórico de logs.');
    if (confirm2 !== 'CONFIRMAR') {
      alert('Operação cancelada. Chave de governança inválida.');
      return;
    }

    setIsWiping(true);
    try {
      let count = 0;
      for (const log of historico) {
        await deleteSingleDocument('historico', log.id);
        count++;
      }
      alert(`Sucesso! ${count} registros de auditoria foram removidos permanentemente para conformidade.`);
    } catch (err: any) {
      alert('Erro ao esvaziar banco de dados dos logs: ' + err.message);
    } finally {
      setIsWiping(false);
    }
  };

  // Filtered and sorted logs
  const filteredLogs = useMemo(() => {
    let list = [...historico];

    // Sort descending chronologically
    list.sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return dateB - dateA;
    });

    if (selectedAction !== 'all') {
      list = list.filter(log => log.action === selectedAction);
    }

    if (selectedUser !== 'all') {
      list = list.filter(log => (log.userEmail || log.userId) === selectedUser);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      list = list.filter(log => {
        const actionLabel = getActionLabel(log.action || '').toLowerCase();
        const actionVal = String(log.action || '').toLowerCase();
        const userEmail = String(log.userEmail || '').toLowerCase();
        const userId = String(log.userId || '').toLowerCase();
        const operatorName = getProfileName(log.userEmail || log.userId).toLowerCase();
        
        let detailsString = '';
        if (log.details) {
          try {
            detailsString = JSON.stringify(log.details).toLowerCase();
          } catch(e) {}
        }

        return actionLabel.includes(term) || 
               actionVal.includes(term) || 
               userEmail.includes(term) || 
               userId.includes(term) ||
               operatorName.includes(term) ||
               detailsString.includes(term);
      });
    }

    return list;
  }, [historico, searchTerm, selectedAction, selectedUser, perfis]);

  // KPIs
  const stats = useMemo(() => {
    let creationsCount = 0;
    let paymentCount = 0;
    let viewCount = 0;

    historico.forEach(log => {
      if (log.action === 'cadastro_pessoa') creationsCount++;
      if (log.action && log.action.includes('pagamento') || log.action === 'recebimento_confirmado') paymentCount++;
      if (log.action === 'view_ficha') viewCount++;
    });

    return {
      total: historico.length,
      creations: creationsCount,
      payments: paymentCount,
      views: viewCount
    };
  }, [historico]);

  const toggleExpand = (id: string) => {
    if (expandedLogId === id) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(id);
    }
  };

  const getSystemTimestampText = (isoString: string) => {
    if (!isoString) return 'Data indefinida';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left space-y-6 p-5 md:p-6" id="coletor-logs-auditoria">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 border border-indigo-150 rounded-lg text-indigo-700">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#0A192F] tracking-tight">Logs de Governança & Auditoria Administrativa</h2>
            <p className="text-[11px] text-slate-500 font-medium">Histórico cronológico de transações, edições de ficha, financeiro e segurança do Portal ILG.</p>
          </div>
        </div>

        {historico.length > 0 && (
          <button
            type="button"
            onClick={handleWipeLogs}
            disabled={isWiping}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            {isWiping ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Limpar Base de Logs
          </button>
        )}
      </div>

      {/* METRIC BOXES GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 flex items-center gap-3">
          <Database className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Total Registrado</span>
            <span className="text-xl font-black text-slate-800 block mt-1">{stats.total} eventos</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 flex items-center gap-3">
          <User className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Cadastros CRM</span>
            <span className="text-xl font-black text-emerald-700 block mt-1">{stats.creations} fichas</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Financeiro / Pagamentos</span>
            <span className="text-xl font-black text-blue-700 block mt-1">{stats.payments} transações</span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150 flex items-center gap-3">
          <Terminal className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block leading-none">Inspeções de Ficha</span>
            <span className="text-xl font-black text-slate-700 mt-1 block">{stats.views} consultas</span>
          </div>
        </div>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="flex flex-col lg:flex-row items-center gap-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
        {/* Search */}
        <div className="relative w-full lg:w-1/3">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ação, operador ou detalhes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-250 rounded-lg text-xs font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-3xs"
          />
        </div>

        {/* Action Filter */}
        <div className="relative w-full lg:w-1/4">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 shadow-3xs appearance-none cursor-pointer"
          >
            <option value="all">Filtro: Todas as Ações</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>{getActionLabel(act)}</option>
            ))}
          </select>
        </div>

        {/* User Filter */}
        <div className="relative w-full lg:w-1/4">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-500 shadow-3xs appearance-none cursor-pointer"
          >
            <option value="all">Filtro: Todos Operadores</option>
            {uniqueUsers.map(usr => (
              <option key={usr} value={usr}>{getProfileName(usr)}</option>
            ))}
          </select>
        </div>

        {/* Reset button */}
        {(searchTerm || selectedAction !== 'all' || selectedUser !== 'all') && (
          <button
            onClick={() => { setSearchTerm(''); setSelectedAction('all'); setSelectedUser('all'); }}
            className="w-full lg:w-auto px-4 py-2 hover:bg-slate-150 border border-slate-250 font-bold text-slate-650 text-xs rounded-lg transition"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* LOG ENTRIES TIMELINE VIEW */}
      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {filteredLogs.slice(0, 150).map((log) => {
          const isExpanded = expandedLogId === log.id;
          const userKey = log.userEmail || log.userId || 'anonymous';
          const userName = getProfileName(userKey);
          const formattedTime = getSystemTimestampText(log.timestamp);

          return (
            <div 
              key={log.id} 
              className={cn(
                "border rounded-xl transition duration-200 overflow-hidden",
                isExpanded ? "border-indigo-300 bg-slate-50/50" : "border-slate-200 hover:border-slate-350 bg-white"
              )}
            >
              {/* COMPACT LOG LINE */}
              <div 
                onClick={() => toggleExpand(log.id)}
                className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Action pill */}
                  <span className={cn(
                    "px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border tracking-wider",
                    getActionStyles(log.action)
                  )}>
                    {getActionLabel(log.action || 'system')}
                  </span>

                  {/* Description helper string */}
                  <span className="text-xs font-bold text-slate-800">
                    {userName} {
                      log.action === 'view_ficha' ? 'inspecionou cadastro' :
                      log.action === 'status_update' ? 'atualizou ficha de contato' :
                      log.action === 'cadastro_pessoa' ? 'criou perfil no CRM' :
                      log.action === 'alteracao_dados_pessoa' ? 'alterou dados cadastrais' :
                      log.action === 'cadastro_tag' ? 'criou nova tag personalizável' :
                      log.action === 'edicao_tag' ? 'editou tag personalizável' :
                      log.action === 'exclusao_tag' ? 'excluiu tag personalizável' :
                      log.action === 'recebimento_confirmado' ? 'confirmou recebimento' :
                      log.action === 'exclusao_pagamento' ? 'excluiu cobrança/parcela' :
                      log.action === 'atualizacao_pagamento' ? 'editou dados de pagamento' :
                      log.action === 'cadastro_pagamento' ? 'gerou nova cobrança' :
                      'modificou dados institucionais'
                    }
                  </span>

                  {log.details && log.details.nome && (
                    <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-200">
                       Aluna: {log.details.nome}
                    </span>
                  )}
                  {log.details && log.details.aluno && (
                    <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-200">
                       Aluna: {log.details.aluno}
                    </span>
                  )}
                  {log.details && log.details.valor !== undefined && (
                    <span className="text-[11px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded border border-emerald-150">
                       R$ {log.details.valor}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                    <Clock className="w-3 h-3" />
                    <span>{formattedTime}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* DRAW DOWN JSON METADATA DETAILS */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50/55 p-3.5 text-xs font-medium text-slate-705 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-450 uppercase font-black tracking-widest block">Metadados de Autenticação</span>
                      <div className="text-[11px] space-y-1 font-mono text-slate-600 pt-1">
                        <div><strong className="text-slate-800">Email Operacional:</strong> {log.userEmail || 'anonymous'}</div>
                        <div><strong className="text-slate-800">Sessão ID / Perfil:</strong> {log.userId || 'Sistema'}</div>
                        <div><strong className="text-slate-800">ID do Log:</strong> {log.id}</div>
                      </div>
                    </div>

                    <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200">
                      <span className="text-[9px] text-slate-450 uppercase font-black tracking-widest block">Análise de Dados Relacionados</span>
                      <div className="text-[11px] space-y-1 font-mono text-slate-600 pt-1">
                        <div><strong className="text-slate-800">Referência Relacionada:</strong> {log.pessoaId || 'Global / N/A'}</div>
                        <div><strong className="text-slate-800">Timestamp ISO:</strong> {log.timestamp || 'N/A'}</div>
                        <div><strong className="text-slate-800">Origem:</strong> {log.details?.fastTrigger ? 'Fast Trigger Action' : 'Form Action Module'}</div>
                      </div>
                    </div>
                  </div>

                  {log.details && (
                    <div className="bg-slate-900 border border-slate-950 text-indigo-200 p-3.5 rounded-lg overflow-x-auto relative select-text" style={{ contentVisibility: 'auto' }}>
                      <div className="absolute right-3 top-2.5 text-[8.5px] uppercase font-mono tracking-widest text-[#D4AF37] font-extrabold flex items-center gap-1">
                        <Key className="w-3 h-3" />
                        Objeto de Entrada (JSON)
                      </div>
                      <pre className="text-[10px] font-mono leading-relaxed pt-1.5 whitespace-pre-wrap">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-3">
            <SlidersHorizontal className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs font-bold text-slate-550">Nenhum evento registrado no filtro atual</div>
            <p className="text-[10px] text-slate-400">Tente buscar por termos mais genéricos ou limpe os seletores de filtros.</p>
          </div>
        )}
      </div>

      {filteredLogs.length > 150 && (
        <div className="text-center text-[10px] text-slate-500 font-bold bg-slate-50 py-2 border-t border-slate-100 italic rounded-b-xl">
          Visualizando os 150 registros mais recentes para otimização de largura de banda de governança.
        </div>
      )}
    </div>
  );
}
