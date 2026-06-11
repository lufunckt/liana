import React, { useState } from 'react';
import { useStore } from '../../store';
import { Search, Check, X as XIcon, List, Grid, GraduationCap, Mail, Phone, MessageCircle, CheckCircle2, XCircle } from 'lucide-react';
import { PessoaFicha } from '../Pessoas/PessoaFicha';

export function AlunosModule() {
  const { data } = useStore();
  const alunos = (data.pessoas || []).filter(p => p.tipoPessoa === 'aluna' || p.produtoComprado);
  
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [selectedPessoa, setSelectedPessoa] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const tagsList = data.tags_personalizaveis || [];

  const filtered = alunos.filter(a => {
    if (search && !a.nome?.toLowerCase().includes(search.toLowerCase())) return false;
    if (tagFilter && (!a.tags || !Array.isArray(a.tags) || !a.tags.some((t: string) => t.toLowerCase() === tagFilter.toLowerCase()))) return false;
    return true;
  });

  const renderStatusCheck = (val: boolean) => {
    return val 
      ? <div className="flex justify-center text-emerald-600"><Check className="w-5 h-5" /></div>
      : <div className="flex justify-center text-slate-300"><XIcon className="w-5 h-5" /></div>
  };

  return (
    <div className="flex flex-col min-h-full space-y-4 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#0A192F]">Jornada do Aluno</h1>
          <p className="text-slate-500 text-sm">Acompanhamento de Onboarding e Acessos ({filtered.length})</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar aluno..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-[#1D4E89] outline-none"
            />
          </div>
          <select 
            value={tagFilter} 
            onChange={e => setTagFilter(e.target.value)} 
            className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white outline-none focus:ring-[#1D4E89] min-w-[140px]"
          >
            <option value="">Tag (Todas)</option>
            {tagsList.map((tag: any) => (
              <option key={tag.id} value={tag.nome}>{tag.nome}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto border border-slate-200/50">
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

      {viewMode === 'table' ? (
        <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100/60 overflow-hidden">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-[#0A192F] text-white">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Aluno(a)</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Turma / Produto</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Tags</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider">Grupo Whats</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider">Forms Inic.</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider">Nutror</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider">MRP</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status Onboarding</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filtered.map(item => (
                  <tr key={item.id} onClick={() => setSelectedPessoa(item)} className="hover:bg-slate-50/80 cursor-pointer transition-colors">
                    <td className="px-5 py-4 text-sm text-slate-800 font-bold">{item.nome}</td>
                    <td className="px-5 py-4 text-sm text-slate-500 max-w-[150px] truncate">{item.produtoComprado || item.turma || '-'}</td>
                    <td className="px-5 py-4 text-sm">
                      <div className="flex flex-wrap gap-1 max-w-[175px]">
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
                    <td className="px-5 py-4 text-sm">{renderStatusCheck(item.entrouGrupo)}</td>
                    <td className="px-5 py-4 text-sm">{renderStatusCheck(item.respondeuInicial)}</td>
                    <td className="px-5 py-4 text-sm">{renderStatusCheck(item.acessoNutror)}</td>
                    <td className="px-5 py-4 text-sm">{renderStatusCheck(item.acessoMRP)}</td>
                    <td className="px-5 py-4 text-sm">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 uppercase tracking-wide">{item.status || 'aguardando'}</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-400">
                      Nenhum aluno encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedPessoa(item)}
              className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.06)] border border-slate-100/80 hover:shadow-md hover:-translate-y-0.5 hover:border-[#1D4E89]/20 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-slate-50 rounded-xl text-slate-600 border border-slate-100 group-hover:bg-[#1D4E89]/5 transition-colors shrink-0">
                      <GraduationCap className="w-5 h-5 text-[#1D4E89]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-800 text-sm md:text-base leading-snug group-hover:text-[#1D4E89] transition-colors truncate">{item.nome}</h4>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{item.produtoComprado || item.turma || 'Sem turma registrada'}</p>
                      
                      {/* Associated Tags on student's card */}
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
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1D4E89]/10 text-[#1D4E89] uppercase tracking-wide shrink-0">
                    {item.status || 'aguardando'}
                  </span>
                </div>

                {/* Contact and Key details */}
                <div className="space-y-2 mb-4 border-t border-slate-50 pt-3">
                  {item.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate" title={item.email}>{item.email}</span>
                    </div>
                  )}
                  {item.telefone && (
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2 min-w-0">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.telefone}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          let cleanPhone = String(item.telefone).replace(/\D/g, '');
                          if (cleanPhone.length > 0 && !cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
                            cleanPhone = '55' + cleanPhone;
                          }
                          window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}`, '_blank', 'noreferrer,noopener');
                        }}
                        className="p-1 px-2 text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-100 transition-colors flex items-center gap-1 text-[10px] font-bold shrink-0 cursor-pointer"
                        title="Falar direto no WhatsApp"
                      >
                        <MessageCircle className="w-3 h-3" />
                        WhatsApp
                      </button>
                    </div>
                  )}
                </div>

                {/* Status Onboarding Checklists */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Onboarding & Acessos</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50/50">
                      {item.entrouGrupo ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                      )}
                      <span className="text-slate-600 text-[11px] truncate">Grupo WhatsApp</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50/50">
                      {item.respondeuInicial ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                      )}
                      <span className="text-slate-600 text-[11px] truncate">Form Inicial</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50/50">
                      {item.acessoNutror ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                      )}
                      <span className="text-slate-600 text-[11px] truncate">Nutror</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50/50">
                      {item.acessoMRP ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                      )}
                      <span className="text-slate-600 text-[11px] truncate">Acesso MRP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              <GraduationCap className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm">Nenhum aluno encontrado</p>
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
