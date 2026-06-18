import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Search, List, Grid, Trello, User, Calendar, MessageCircle, Mail, Phone, Flame, ChevronRight, Plus, X } from 'lucide-react';
import { PessoaFicha } from '../Pessoas/PessoaFicha';
import { showToast } from '../../lib/utils';

export function ComercialModule() {
  const { data, addSingleDocument } = useStore();
  const leads = (data.pessoas || []).filter(
    p =>
      p.tipoPessoa === 'lead' ||
      p.tipoPessoa === 'em negociação' ||
      ['frio', 'morno', 'quente'].includes(p.temperatura)
  );

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'cards'>('kanban');
  const [selectedPessoa, setSelectedPessoa] = useState<any>(null);

  // States for Adding New Lead Modal with Autosave
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLeadNome, setNewLeadNome] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadTelefone, setNewLeadTelefone] = useState('');
  const [newLeadProduto, setNewLeadProduto] = useState('');
  const [newLeadTemperatura, setNewLeadTemperatura] = useState('frio');
  const [newLeadStatus, setNewLeadStatus] = useState('novo');
  const [newLeadResponsavel, setNewLeadResponsavel] = useState('Ana');
  const [newLeadOrigem, setNewLeadOrigem] = useState('Tráfego Pago');
  const [newLeadObservacoes, setNewLeadObservacoes] = useState('');
  
  // Autosave timing & notification states
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  // Load draft from localStorage on mount or when modal opens
  useEffect(() => {
    const savedDraft = localStorage.getItem('ilg_new_lead_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setNewLeadNome(parsed.nome || '');
        setNewLeadEmail(parsed.email || '');
        setNewLeadTelefone(parsed.telefone || '');
        setNewLeadProduto(parsed.produtoInteresse || '');
        setNewLeadTemperatura(parsed.temperatura || 'frio');
        setNewLeadStatus(parsed.status || 'novo');
        setNewLeadResponsavel(parsed.responsavel || 'Ana');
        setNewLeadOrigem(parsed.origem || 'Tráfego Pago');
        setNewLeadObservacoes(parsed.observacoes || '');
      } catch (e) {
        console.error("Erro ao ler rascunho de lead", e);
      }
    }
  }, [showAddModal]);

  // Execute autosave to localStorage whenever any field value changes
  useEffect(() => {
    if (!showAddModal) return;

    const draft = {
      nome: newLeadNome,
      email: newLeadEmail,
      telefone: newLeadTelefone,
      produtoInteresse: newLeadProduto,
      temperatura: newLeadTemperatura,
      status: newLeadStatus,
      responsavel: newLeadResponsavel,
      origem: newLeadOrigem,
      observacoes: newLeadObservacoes,
    };

    const hasAnyContent = 
      newLeadNome.trim() || 
      newLeadEmail.trim() || 
      newLeadTelefone.trim() || 
      newLeadProduto.trim() || 
      newLeadObservacoes.trim();

    if (hasAnyContent) {
      localStorage.setItem('ilg_new_lead_draft', JSON.stringify(draft));
      const now = new Date();
      setDraftSavedAt(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } else {
      localStorage.removeItem('ilg_new_lead_draft');
      setDraftSavedAt(null);
    }
  }, [
    newLeadNome,
    newLeadEmail,
    newLeadTelefone,
    newLeadProduto,
    newLeadTemperatura,
    newLeadStatus,
    newLeadResponsavel,
    newLeadOrigem,
    newLeadObservacoes,
    showAddModal
  ]);

  const handleClearDraft = () => {
    if (confirm('Deseja realmente limpar todos os dados preenchidos neste rascunho?')) {
      localStorage.removeItem('ilg_new_lead_draft');
      setNewLeadNome('');
      setNewLeadEmail('');
      setNewLeadTelefone('');
      setNewLeadProduto('');
      setNewLeadTemperatura('frio');
      setNewLeadStatus('novo');
      setNewLeadResponsavel('Ana');
      setNewLeadOrigem('Tráfego Pago');
      setNewLeadObservacoes('');
      setDraftSavedAt(null);
      showToast('Campos limpos com sucesso.', 'info');
    }
  };

  const handleCloseAttempt = () => {
    const hasAnyContent = 
      newLeadNome.trim() || 
      newLeadEmail.trim() || 
      newLeadTelefone.trim() || 
      newLeadProduto.trim() || 
      newLeadObservacoes.trim();

    if (hasAnyContent) {
      if (confirm('O rascunho preenchido foi salvo de forma automática e não será perdido. Deseja mesmo fechar o formulário agora?')) {
        setShowAddModal(false);
      }
    } else {
      setShowAddModal(false);
    }
  };

  const handleSaveNewLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadNome.trim()) {
      showToast('Por favor, informe o nome do lead.', 'error');
      return;
    }

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const newLead = {
        id: 'lead_' + Date.now(),
        nome: newLeadNome.trim(),
        email: newLeadEmail.trim(),
        telefone: newLeadTelefone.trim(),
        tipoPessoa: 'lead',
        status: newLeadStatus,
        temperatura: newLeadTemperatura,
        produtoInteresse: newLeadProduto.trim(),
        responsavel: newLeadResponsavel,
        origem: newLeadOrigem,
        observacoes: newLeadObservacoes.trim(),
        proximoContato: todayStr,
        dataCadastro: todayStr,
        timeline: [
          { text: 'Lead cadastrado manualmente no CRM do módulo comercial.', date: 'Agora', type: 'system' }
        ]
      };

      if (typeof addSingleDocument === 'function') {
        await addSingleDocument('pessoas', newLead);
      } else {
        throw new Error('Função addSingleDocument não disponível no useStore.');
      }
      
      // Clear draft & state
      localStorage.removeItem('ilg_new_lead_draft');
      setNewLeadNome('');
      setNewLeadEmail('');
      setNewLeadTelefone('');
      setNewLeadProduto('');
      setNewLeadTemperatura('frio');
      setNewLeadStatus('novo');
      setNewLeadResponsavel('Ana');
      setNewLeadOrigem('Tráfego Pago');
      setNewLeadObservacoes('');
      setDraftSavedAt(null);
      
      setShowAddModal(false);
      showToast('Lead cadastrado com sucesso!', 'success');
    } catch (error: any) {
      showToast('Erro ao cadastrar lead: ' + error.message, 'error');
    }
  };

  const filteredLeads = leads.filter(l => {
    if (search && !l.nome?.toLowerCase().includes(search.toLowerCase()) && !l.produtoInteresse?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns = [
    { id: 'novo', label: 'Novo Lead', bg: 'bg-slate-105' },
    { id: 'em qualificação', label: 'Em Qualificação', bg: 'bg-blue-50/70' },
    { id: 'em negociação', label: 'Em Negociação', bg: 'bg-amber-50/70' },
    { id: 'aguardando pagamento', label: 'Aguardando Pagamento', bg: 'bg-orange-50/70' },
    { id: 'comprou', label: 'Comprou', bg: 'bg-emerald-50/70' },
    { id: 'perdido', label: 'Perdido', bg: 'bg-rose-50/70' },
  ];

  const getTemperaturaColor = (temp: string) => {
    const lower = String(temp).toLowerCase();
    if (lower === 'quente') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (lower === 'morno') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const isAtrasado = (dateStr?: string) => {
    if (!dateStr) return false;
    try {
      return new Date(dateStr) < new Date();
    } catch {
      return false;
    }
  };

  return (
    <div className="flex flex-col min-h-full space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A192F]">Jornada Comercial</h1>
          <p className="text-slate-500 text-sm">Acompanhamento e conversão de leads ({filteredLeads.length})</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-[#D4AF37] hover:bg-[#b8952b] text-white font-bold rounded-lg shadow-sm transition text-sm cursor-pointer select-none"
            title="Adicionar um novo lead manualmente ao CRM"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Adicionar Lead
          </button>
        </div>
      </div>

      {/* View Selectors & Search Container */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar lead..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-[#1D4E89] outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto border border-slate-200/50">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              viewMode === 'kanban'
                ? 'bg-white text-[#0A192F] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trello className="w-3.5 h-3.5" />
            Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-[#0A192F] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Tabela
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-[#0A192F] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Cards
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex h-full gap-4 min-w-max">
            {columns.map(col => {
              const columnItems = filteredLeads.filter(
                l => (l.status || 'novo').toLowerCase() === col.id
              );
              return (
                <div key={col.id} className={`w-80 flex flex-col rounded-xl border border-slate-200/60 shadow-sm overflow-hidden bg-slate-50/50`}>
                  <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-white">
                    <h3 className="font-semibold text-slate-700 text-sm">{col.label}</h3>
                    <span className="text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded shadow-xs text-slate-650 font-bold">{columnItems.length}</span>
                  </div>
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 max-h-[60vh] min-h-[150px]">
                    {columnItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedPessoa(item)}
                        className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-[#1D4E89]/20 transition-all group"
                      >
                        <h4 className="font-bold text-slate-850 text-sm group-hover:text-[#1D4E89] transition-colors">{item.nome}</h4>
                        <p className="text-xs text-slate-500 truncate mt-1">{item.produtoInteresse || 'Sem produto interest'}</p>
                        
                        {item.responsavel && (
                          <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>Resp: {item.responsavel}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-3 border-t border-slate-50 pt-2">
                          <span className={`text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full border ${getTemperaturaColor(item.temperatura || 'frio')}`}>
                            {item.temperatura || 'Frio'}
                          </span>
                          {(item.proximoContato || item.proximoFollowUp) && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              isAtrasado(item.proximoContato || item.proximoFollowUp)
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isAtrasado(item.proximoContato || item.proximoFollowUp) ? 'Atrasado' : (item.proximoContato || item.proximoFollowUp)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {columnItems.length === 0 && (
                      <div className="h-20 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs font-medium bg-white/40">
                        Vazio
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100/60 overflow-hidden">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-[#0A192F] text-white">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Lead</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Responsável</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Próximo Contato</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Produto Interesse</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Temperatura</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredLeads.map(item => (
                  <tr key={item.id} onClick={() => setSelectedPessoa(item)} className="hover:bg-slate-50/80 cursor-pointer transition-colors">
                    <td className="px-5 py-4 text-sm text-slate-800 font-bold">{item.nome}</td>
                    <td className="px-5 py-4 text-sm">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 uppercase tracking-wide">
                        {item.status || 'novo'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 font-medium">{item.responsavel || '-'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {item.proximoContato || item.proximoFollowUp ? (
                        <span className={isAtrasado(item.proximoContato || item.proximoFollowUp) ? 'text-rose-650 font-semibold' : ''}>
                          {item.proximoContato || item.proximoFollowUp}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 truncate max-w-[180px]">{item.produtoInteresse || '-'}</td>
                    <td className="px-5 py-4 text-sm">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTemperaturaColor(item.temperatura || 'frio')}`}>
                        {item.temperatura || 'Frio'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">
                      Nenhum lead encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedPessoa(item)}
              className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] border border-slate-100/90 hover:shadow-md hover:-translate-y-0.5 hover:border-[#1D4E89]/20 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-base leading-snug group-hover:text-[#1D4E89] transition-colors truncate">{item.nome}</h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{item.produtoInteresse || 'Sem interesse registrado'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-650 uppercase tracking-wide shrink-0">
                    {item.status || 'novo'}
                  </span>
                </div>

                {/* Info Fields */}
                <div className="space-y-2 mb-4 border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Responsável: <strong className="text-slate-700">{item.responsavel || 'Sem responsável'}</strong></span>
                  </div>

                  {(item.proximoContato || item.proximoFollowUp) && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Próximo contato:{' '}
                        <strong className={isAtrasado(item.proximoContato || item.proximoFollowUp) ? 'text-rose-600' : 'text-slate-700'}>
                          {item.proximoContato || item.proximoFollowUp}
                        </strong>
                        {isAtrasado(item.proximoContato || item.proximoFollowUp) && (
                          <span className="ml-1.5 px-1 py-0.2 bg-rose-100 text-rose-705 text-[9px] rounded font-bold uppercase">Atrasado</span>
                        )}
                      </span>
                    </div>
                  )}

                  {item.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate" title={item.email}>{item.email}</span>
                    </div>
                  )}
                </div>

                {/* Footer and Actions */}
                <div className="flex justify-between items-center border-t border-slate-105 pt-3 mt-3">
                  <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full border ${getTemperaturaColor(item.temperatura || 'frio')}`}>
                    {item.temperatura || 'Frio'}
                  </span>

                  {item.telefone && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        let cleanPhone = String(item.telefone).replace(/\D/g, '');
                        if (cleanPhone.length > 0 && !cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
                          cleanPhone = '55' + cleanPhone;
                        }
                        window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}`, '_blank', 'noreferrer,noopener');
                      }}
                      className="p-1 px-2.5 text-emerald-600 hover:bg-emerald-55 hover:text-white rounded border border-emerald-110 hover:border-emerald-600 transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer bg-white"
                      title="Falar no WhatsApp"
                    >
                      <MessageCircle className="w-3 h-3 text-emerald-500" />
                      WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredLeads.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              <User className="w-8 h-8 text-slate-350 mb-2" />
              <p className="text-sm">Nenhum lead encontrado</p>
            </div>
          )}
        </div>
      )}

      {selectedPessoa && (
        <PessoaFicha pessoa={selectedPessoa} onClose={() => setSelectedPessoa(null)} />
      )}

      {/* Adding New Lead Modal with Autosave */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseAttempt}></div>
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl z-10 mx-4 border border-slate-200/50 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Adicionar Novo Lead</h2>
                <p className="text-xs text-slate-500 font-sans mt-0.5">Cadastre um novo contato na jornada comercial</p>
              </div>
              <button type="button" onClick={handleCloseAttempt} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6">
              <form id="addLeadForm" onSubmit={handleSaveNewLead} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do lead..."
                    value={newLeadNome}
                    onChange={e => setNewLeadNome(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D4E89]/20 focus:border-[#1D4E89] text-slate-800 bg-white placeholder-slate-400"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="exemplo@gmail.com"
                    value={newLeadEmail}
                    onChange={e => setNewLeadEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D4E89]/20 focus:border-[#1D4E89] text-slate-800 bg-white placeholder-slate-400"
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(00) 90000-0000"
                    value={newLeadTelefone}
                    onChange={e => setNewLeadTelefone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D4E89]/20 focus:border-[#1D4E89] text-slate-800 bg-white placeholder-slate-400"
                  />
                </div>

                {/* Produto de Interesse */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Produto / Curso de Interesse</label>
                  <input
                    type="text"
                    placeholder="e.g. Formação Direitos Humanos"
                    value={newLeadProduto}
                    onChange={e => setNewLeadProduto(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D4E89]/20 focus:border-[#1D4E89] text-slate-800 bg-white placeholder-slate-400"
                  />
                </div>

                {/* Temperatura */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Temperatura de Interesse</label>
                  <select
                    value={newLeadTemperatura}
                    onChange={e => setNewLeadTemperatura(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D4E89]/20 focus:border-[#1D4E89] text-slate-800 bg-white"
                  >
                    <option value="frio">Frio ❄️</option>
                    <option value="morno">Morno 🔥</option>
                    <option value="quente">Quente ⚡</option>
                  </select>
                </div>

                {/* Status Comercial */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Etapa Kanban Inicial</label>
                  <select
                    value={newLeadStatus}
                    onChange={e => setNewLeadStatus(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D4E89]/20 focus:border-[#1D4E89] text-slate-800 bg-white"
                  >
                    <option value="novo">Novo Lead</option>
                    <option value="em qualificação">Em Qualificação</option>
                    <option value="em negociação">Em Negociação</option>
                    <option value="aguardando pagamento">Aguardando Pagamento</option>
                    <option value="comprou">Comprou</option>
                    <option value="perdido">Perdido</option>
                  </select>
                </div>

                {/* Responsavel */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Responsável Comercial</label>
                  <select
                    value={newLeadResponsavel}
                    onChange={e => setNewLeadResponsavel(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D4E89]/20 focus:border-[#1D4E89] text-slate-800 bg-white"
                  >
                    <option value="Ana">Ana</option>
                    <option value="Nuria">Núria</option>
                    <option value="Fabi">Fabi</option>
                    <option value="Luiza">Luiza</option>
                    <option value="Liana">Liana Gomes</option>
                  </select>
                </div>

                {/* Origem */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Canal de Origem</label>
                  <select
                    value={newLeadOrigem}
                    onChange={e => setNewLeadOrigem(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D4E89]/20 focus:border-[#1D4E89] text-slate-800 bg-white"
                  >
                    <option value="Tráfego Pago">Tráfego Pago (Anúncios)</option>
                    <option value="Instagram">Instagram Orgânico</option>
                    <option value="WhatsApp">WhatsApp Direto</option>
                    <option value="Google">Pesquisa Google</option>
                    <option value="Indicação">Indicação de Aluna</option>
                    <option value="Site/Landing page">Site / Landing Page</option>
                  </select>
                </div>

                {/* Observações */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Observações / Notas Comerciais</label>
                  <textarea
                    placeholder="Detalhes sobre a conversa, dores do cliente, histórico..."
                    value={newLeadObservacoes}
                    onChange={e => setNewLeadObservacoes(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1D4E89]/20 focus:border-[#1D4E89] text-slate-800 bg-white placeholder-slate-400"
                  />
                </div>
              </form>
            </div>
            {/* Footer */}
            <div className="border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50">
              {/* Draft Status with manual Clear button */}
              <div className="flex items-center gap-3">
                {draftSavedAt ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-110 rounded-full px-2.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Rascunho salvo às {draftSavedAt}
                    </div>
                    <button
                      type="button"
                      onClick={handleClearDraft}
                      className="text-xs text-rose-500 hover:text-rose-700 hover:underline font-semibold"
                      title="Apagar dados digitados"
                    >
                      Descartar rascunho
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-medium font-sans">Autosalvamento em segundo plano ativo</span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseAttempt}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold text-xs hover:bg-slate-100 transition shadow-xs cursor-pointer select-none"
                >
                  Cancelar
                </button>
                <button
                  form="addLeadForm"
                  type="submit"
                  className="px-4 py-2 bg-[#0A192F] hover:bg-[#152a4a] text-white rounded-lg font-bold text-xs transition shadow-md cursor-pointer select-none flex items-center"
                >
                  Cadastrar Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
