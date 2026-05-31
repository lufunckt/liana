import React, { useState } from 'react';
import { useStore } from '../../store';
import { Search, Link as LinkIcon, ExternalLink, FileText } from 'lucide-react';

export function MateriaisModule() {
  const { data } = useStore();
  const materiais = data.materiais || [];
  
  const [search, setSearch] = useState('');

  const filtered = materiais.filter(m => {
    if (search && !m.nome?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-full space-y-4 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#0A192F]">Materiais & Links</h1>
          <p className="text-slate-500 text-sm">Biblioteca central da operação ({filtered.length})</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="mb-4 relative max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar material..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-[#1D4E89] outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm hover:border-[#1D4E89]/40 transition-all group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 text-[#0A192F]">
                  <FileText className="w-5 h-5" />
                  <h3 className="font-semibold text-sm line-clamp-1">{item.nome}</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{item.categoria}</span>
              </div>
              
              <div className="text-xs text-slate-500 mt-2 space-y-1">
                <p><strong>Responsável:</strong> {item.responsavel || '-'}</p>
                <p><strong>Status:</strong> {item.status || '-'}</p>
              </div>

              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-white border border-slate-200 text-[#1D4E89] font-medium text-sm rounded-lg hover:bg-slate-50 transition-colors">
                  <ExternalLink className="w-4 h-4" /> Acessar Link
                </a>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-500">Nenhum material cadastrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}
