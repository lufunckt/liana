import React, { useState } from 'react';
import { useStore } from '../../store';
import { Search, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export function TarefasSuporteModule() {
  const { data } = useStore();
  const tarefas = data.tarefas_suporte || [];
  const pessoas = data.pessoas || [];
  
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  const filtered = tarefas.filter(t => {
    if (search && !t.titulo?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTipo && t.tipo !== filterTipo) return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-full space-y-4 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#0A192F]">Tarefas & Suporte</h1>
          <p className="text-slate-500 text-sm">Central unificada de demandas internas</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100/60 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar tarefa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-[#1D4E89] outline-none"
            />
          </div>
          <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white outline-none">
            <option value="">Todos os tipos</option>
            <option value="tarefa">Tarefa Interna</option>
            <option value="suporte">Ticket de Suporte</option>
          </select>
        </div>

        <div className="space-y-2">
          {filtered.map(item => {
            const pessoa = pessoas.find(p => p.id === item.pessoaId);
            const isResolved = item.status === 'concluído' || item.status === 'resolvido';
            const isLate = !isResolved && item.prazo && new Date(item.prazo) < new Date();
            
            return (
              <div key={item.id} className={`flex items-start p-4 rounded-xl border ${isResolved ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-[#1D4E89]/40 hover:shadow-sm transition-all'}`}>
                <div className="mt-0.5 mr-4 shrink-0">
                  {isResolved ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-slate-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.tipo === 'suporte' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.tipo}
                    </span>
                    <h4 className={`font-semibold text-sm ${isResolved ? 'line-through text-slate-500' : 'text-slate-800'}`}>{item.titulo}</h4>
                    {isLate && <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full ml-2"><AlertCircle className="w-3 h-3"/> Atrasado</span>}
                  </div>
                  <div className="flex flex-wrap items-center mt-2 text-xs text-slate-500 gap-4">
                    <span><strong>Para:</strong> {pessoa?.nome || 'Sem pessoa'}</span>
                    <span><strong>Resp:</strong> {item.responsavel || '-'}</span>
                    <span><strong>Cat:</strong> {item.categoria || '-'}</span>
                    {item.prazo && <span><strong>Prazo:</strong> {item.prazo}</span>}
                  </div>
                  {item.descricao && <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded">{item.descricao}</p>}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && <div className="text-center py-8 text-slate-500">Nenhum registro encontrado.</div>}
        </div>
      </div>
    </div>
  );
}
