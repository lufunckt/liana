import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { Search, Plus, List, Grid, Edit, User as UserIcon, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { exportToCsv } from '../../lib/csv';
import { PessoaFicha } from './PessoaFicha';

export function PessoasModule() {
  const { data } = useStore();
  const pessoas = data.pessoas || [];
  
  const [viewMode, setViewMode] = useState<'table'|'cards'>('table');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ tipoPessoa: '', status: '', temperatura: '' });
  
  const [selectedPessoa, setSelectedPessoa] = useState<any>(null);

  const filtered = useMemo(() => {
    return pessoas.filter(p => {
      if (search && !p.nome?.toLowerCase().includes(search.toLowerCase()) && !p.email?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.tipoPessoa && p.tipoPessoa !== filters.tipoPessoa) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.temperatura && p.temperatura !== filters.temperatura) return false;
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
          
          <div className="flex flex-wrap gap-2">
            <select value={filters.tipoPessoa} onChange={e => setFilters({...filters, tipoPessoa: e.target.value})} className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white outline-none focus:ring-[#1D4E89]">
              <option value="">Tipo (Todos)</option>
              <option value="lead">Lead</option>
              <option value="aluna">Aluna</option>
              <option value="ex-aluna">Ex-aluna</option>
            </select>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white outline-none focus:ring-[#1D4E89]">
              <option value="">Status (Todos)</option>
              {Array.from(new Set(pessoas.map(p => p.status).filter(Boolean))).map(opt => <option key={opt as string} value={opt as string}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp</th>
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
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors opacity-0 group-hover/wa:opacity-100 focus:opacity-100"
                          title="Falar direto no WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 truncate max-w-[200px]">{item.produtoInteresse || item.produtoComprado}</td>
                  <td className="px-4 py-3 text-sm">{renderBadge(item.status)}</td>
                  <td className="px-4 py-3 text-sm">{renderBadge(item.temperatura)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedPessoa && (
        <PessoaFicha pessoa={selectedPessoa} onClose={() => setSelectedPessoa(null)} />
      )}
    </div>
  );
}
