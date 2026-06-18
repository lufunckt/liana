import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../store';
import { Search, Plus, List, Grid, Edit, User as UserIcon, MessageCircle, FileDown } from 'lucide-react';
import { cn, normalizeStatusSlug, getStatusLabel } from '../../lib/utils';
import { exportToCsv } from '../../lib/csv';
import { PessoaFicha } from './PessoaFicha';

export function PessoasModule() {
  const { data } = useStore();
  const pessoas = data.pessoas || [];
  
  const [viewMode, setViewMode] = useState<'table'|'cards'>('table');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ tipoPessoa: '', status: '', temperatura: '', tag: '' });
  
  const [selectedPessoa, setSelectedPessoa] = useState<any>(null);

  const tagsList = data.tags_personalizaveis || [];

  useEffect(() => {
    const handleFilterChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setFilters(prev => ({ ...prev, ...customEvent.detail }));
      }
    };
    window.addEventListener('set_pessoas_filter', handleFilterChange);
    return () => {
      window.removeEventListener('set_pessoas_filter', handleFilterChange);
    };
  }, []);

  const filtered = useMemo(() => {
    return pessoas.filter(p => {
      if (search && !p.nome?.toLowerCase().includes(search.toLowerCase()) && !p.email?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.tipoPessoa && p.tipoPessoa !== filters.tipoPessoa) return false;
      if (filters.status && normalizeStatusSlug(p.status) !== normalizeStatusSlug(filters.status)) return false;
      if (filters.temperatura && p.temperatura !== filters.temperatura) return false;
      if (filters.tag && (!p.tags || !Array.isArray(p.tags) || !p.tags.some((t: string) => t.toLowerCase() === filters.tag.toLowerCase()))) return false;
      return true;
    });
  }, [pessoas, search, filters]);

  const renderBadge = (text: string) => {
    if (!text) return null;
    let color = 'bg-slate-100 text-slate-700';
    const lower = String(text).toLowerCase();
    if (lower.includes('novo') || lower.includes('frio')) color = 'bg-blue-100 text-blue-700';
    else if (lower.includes('negociação') || lower.includes('morno')) color = 'bg-amber-100 text-amber-700';
    else if (lower.includes('alun') || lower.includes('quente') || lower.includes('comprou')) color = 'bg-green-100 text-green-700';
    else if (lower.includes('perdid')) color = 'bg-rose-100 text-rose-700';
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>{text}</span>;
  };

  return (
    <div className="flex flex-col min-h-full space-y-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A192F]">Base de Pessoas</h1>
          <p className="text-slate-500 text-sm">{filtered.length} registro(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCsv(`export-pessoas-${new Date().toISOString().split('T')[0]}.csv`, filtered, ['nome', 'email', 'telefone', 'tipoPessoa', 'status', 'temperatura', 'produtoInteresse', 'proximoContato'])}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
          >
            <FileDown className="w-4 h-4 text-[#1D4E89]" /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100/60 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar pessoa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 w-full md:max-w-xs border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-[#1D4E89] focus:border-[#1D4E89] outline-none"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select value={filters.tipoPessoa} onChange={e => setFilters({...filters, tipoPessoa: e.target.value})} className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white outline-none focus:ring-[#1D4E89]">
              <option value="">Tipo (Todos)</option>
              <option value="lead">Lead</option>
              <option value="aluna">Aluna</option>
              <option value="ex-aluna">Ex-aluna</option>
            </select>
            <select value={normalizeStatusSlug(filters.status)} onChange={e => setFilters({...filters, status: e.target.value})} className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white outline-none focus:ring-[#1D4E89]">
              <option value="">Status (Todos)</option>
              <option value="novo-lead">Novo lead</option>
              <option value="contato-feito">Contato feito</option>
              <option value="respondeu">Respondeu</option>
              <option value="em-qualificacao">Em qualificação</option>
              <option value="em-negociacao">Em negociação</option>
              <option value="aguardando-pagamento">Aguardando pagamento</option>
              <option value="comprou">Comprou / Fechado</option>
              <option value="sem-interesse">Sem interesse</option>
              <option value="retomar-depois">Retomar depois</option>
              <option value="perdido">Perdido</option>
            </select>

            <select value={filters.tag} onChange={e => setFilters({...filters, tag: e.target.value})} className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white outline-none focus:ring-[#1D4E89]">
              <option value="">Tag (Todas)</option>
              {tagsList.map((tag: any) => (
                <option key={tag.id} value={tag.nome}>{tag.nome}</option>
              ))}
            </select>

            <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
              <button 
                onClick={() => setViewMode('table')} 
                className={cn("p-1.5 px-3 rounded-md text-xs font-bold transition flex items-center gap-1.5", viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-850')}
              >
                <List className="w-3.5 h-3.5" /> Tabela
              </button>
              <button 
                onClick={() => setViewMode('cards')} 
                className={cn("p-1.5 px-3 rounded-md text-xs font-bold transition flex items-center gap-1.5", viewMode === 'cards' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-[#0A192F]')}
              >
                <Grid className="w-3.5 h-3.5" /> Cards
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tags</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Produto / Turma</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Temperatura</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filtered.map((item: any) => (
                  <tr key={item.id} onClick={() => setSelectedPessoa(item)} className="hover:bg-slate-50/80 cursor-pointer transition-colors">
                    <td className="px-5 py-4 text-sm text-slate-800 font-bold">{item.nome}</td>
                    <td className="px-5 py-4 text-sm">{renderBadge(item.tipoPessoa)}</td>
                    <td className="px-5 py-4 text-sm text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5 group/wa">
                        <span>{item.telefone || '-'}</span>
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
                            className="p-2 sm:p-1 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors opacity-100 sm:opacity-0 sm:group-hover/wa:opacity-100 focus:opacity-100"
                            title="Falar direto no WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-500">
                      <div className="flex flex-wrap gap-1 max-w-[170px]">
                        {item.tags && Array.isArray(item.tags) && item.tags.map((t: string) => {
                          const found = tagsList.find((g: any) => g.nome.toLowerCase() === t.toLowerCase() || g.id === t);
                          const tagCor = found ? found.cor : '#64748B';
                          const tagNome = found ? found.nome : t;
                          return (
                            <span key={t} style={{ backgroundColor: tagCor }} className="px-1.5 py-0.5 rounded text-[8px] font-black text-white uppercase tracking-wider shadow-2xs">
                              {tagNome}
                            </span>
                          );
                        })}
                        {(!item.tags || item.tags.length === 0) && <span className="text-slate-300">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 truncate max-w-[200px]">{item.produtoInteresse || item.produtoComprado}</td>
                    <td className="px-4 py-3 text-sm">{renderBadge(getStatusLabel(item.status))}</td>
                    <td className="px-4 py-3 text-sm">{renderBadge(item.temperatura)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item: any) => {
              const isLead = (item.tipoPessoa || 'lead') === 'lead';
              return (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedPessoa(item)}
                  className="bg-white border border-slate-200/90 hover:border-[#0A192F]/45 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-4 text-slate-700"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-[#0A192F] text-sm truncate">{item.nome}</h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{item.email || 'Sem e-mail cadastrado'}</span>
                        
                        {/* Custom tags in card lists */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.tags && Array.isArray(item.tags) && item.tags.map((t: string) => {
                            const found = tagsList.find((g: any) => g.nome.toLowerCase() === t.toLowerCase() || g.id === t);
                            const tagCor = found ? found.cor : '#64748B';
                            const tagNome = found ? found.nome : t;
                            return (
                              <span key={t} style={{ backgroundColor: tagCor }} className="px-1.5 py-0.2 rounded text-[8px] font-black text-white uppercase tracking-wider">
                                {tagNome}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <span className="shrink-0">{renderBadge(item.tipoPessoa)}</span>
                    </div>

                    <div className="space-y-1 bg-stone-55/70 p-3 rounded-xl border border-slate-100 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-450 font-semibold">Responsável:</span>
                        <span className="font-bold text-slate-800 uppercase">{item.responsavel || 'Ana'}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-slate-450 font-semibold">Status Geral:</span>
                        <span className="font-bold text-[#0A192F]">{getStatusLabel(item.status) || 'Novo'}</span>
                      </div>
                      {isLead ? (
                        <>
                          <div className="flex justify-between mt-1">
                            <span className="text-slate-450 font-semibold">Interesse:</span>
                            <span className="font-bold text-slate-700 truncate max-w-[140px]">{item.produtoInteresse || 'Não informado'}</span>
                          </div>
                          {item.proximoContato && (
                            <div className="flex justify-between mt-1 text-rose-700 font-black">
                              <span>Próx. Contato:</span>
                              <span>📅 {item.proximoContato}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between mt-1">
                            <span className="text-slate-450 font-semibold">Formação:</span>
                            <span className="font-bold text-slate-700 truncate max-w-[140px]">{item.produtoComprado || item.formacao || 'Turma Ativa'}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-slate-450 font-semibold">Onboarding status:</span>
                            <span className="font-bold text-emerald-700 font-mono text-[10px] uppercase bg-emerald-50 px-1 py-0.2 rounded">{item.statusOnboarding || 'Acesso OK'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] text-slate-400 font-bold font-mono">{item.telefone || '-'}</span>
                    
                    <div className="flex gap-2">
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
                          className="p-1.5 px-3 bg-emerald-55 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition"
                          title="Chamar no WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> Whats
                        </button>
                      )}
                      <button className="p-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-extrabold transition">Ficha</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {selectedPessoa && (
        <PessoaFicha pessoa={selectedPessoa} onClose={() => setSelectedPessoa(null)} />
      )}
    </div>
  );
}
