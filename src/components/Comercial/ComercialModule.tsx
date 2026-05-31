import React, { useState } from 'react';
import { useStore } from '../../store';
import { Search, List, Grid, Trello, User, Calendar, MessageCircle, Mail, Phone, Flame, ChevronRight } from 'lucide-react';
import { PessoaFicha } from '../Pessoas/PessoaFicha';

export function ComercialModule() {
  const { data } = useStore();
  const leads = (data.pessoas || []).filter(
    p =>
      p.tipoPessoa === 'lead' ||
      p.tipoPessoa === 'em negociação' ||
      ['frio', 'morno', 'quente'].includes(p.temperatura)
  );

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'cards'>('kanban');
  const [selectedPessoa, setSelectedPessoa] = useState<any>(null);

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
    </div>
  );
}
