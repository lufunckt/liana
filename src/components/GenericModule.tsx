import React, { useState, useMemo } from 'react';
import { ModuleSchema, FieldDefinition } from '../types';
import { useStore } from '../store';
import { Search, Plus, List, Grid, Edit, Trash2, Download, Upload, X } from 'lucide-react';
import { exportToCsv, importFromCsv } from '../lib/csv';

export function GenericModule({ schema }: { schema: ModuleSchema }) {
  const { data, updateModuleData } = useStore();
  const records = data[schema.id] || [];
  
  const [viewMode, setViewMode] = useState<'table'|'cards'>('table');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const filteredRecords = useMemo(() => {
    return records.filter((item: any) => {
      const searchMatch = search === '' || Object.values(item).some((val: any) => 
        String(val).toLowerCase().includes(search.toLowerCase())
      );
      if (!searchMatch) return false;
      
      for (const key in filters) {
        if (filters[key] && String(item[key]) !== filters[key]) return false;
      }
      return true;
    });
  }, [records, search, filters]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newItem: any = {};
    schema.fields.forEach(f => {
      if (f.type === 'checkbox') {
        newItem[f.key] = formData.get(f.key) === 'on';
      } else if (f.type === 'tags') {
        const val = formData.get(f.key) as string;
        newItem[f.key] = val.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        newItem[f.key] = formData.get(f.key);
      }
    });

    if (editingItem && editingItem.id) {
      newItem.id = editingItem.id;
      updateModuleData(schema.id, records.map((r: any) => r.id === newItem.id ? newItem : r));
    } else {
      newItem.id = Math.random().toString(36).substring(2, 9);
      updateModuleData(schema.id, [newItem, ...records]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir?')) {
      updateModuleData(schema.id, records.filter((r: any) => r.id !== id));
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importFromCsv(file, schema.fields.map(f => f.key));
        if (imported.length > 0) {
          updateModuleData(schema.id, [...imported, ...records]);
        }
      } catch (err) {
        console.error(err);
        alert('Erro ao importar CSV');
      }
    }
    e.target.value = ''; // reset
  };

  const openAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const renderBadge = (text: string) => {
    if (!text) return null;
    let color = 'bg-slate-100 text-slate-700';
    const lower = String(text).toLowerCase();
    
    // Some dynamic color logic based on keywords
    if (lower.includes('novo') || lower.includes('aberto') || lower.includes('frio') || lower.includes('solicitado') || lower.includes('a fazer')) color = 'bg-blue-100 text-blue-700';
    else if (lower.includes('andamento') || lower.includes('análise') || lower.includes('morno') || lower.includes('produção')) color = 'bg-amber-100 text-amber-700';
    else if (lower.includes('concluíd') || lower.includes('quente') || lower.includes('pago') || lower.includes('resolvido') || lower.includes('vendido') || lower.includes('aprovado') || lower.includes('entregue') || lower.includes('qualificado')) color = 'bg-green-100 text-green-700';
    else if (lower.includes('atrasado') || lower.includes('perdido') || lower.includes('cancelad') || lower.includes('bloqueado')) color = 'bg-rose-100 text-rose-700';
    else if (lower.includes('parcial') || lower.includes('aguardando')) color = 'bg-purple-100 text-purple-700';
    
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>{text}</span>;
  };

  const filterableFields = schema.fields.filter(f => schema.filterFields.includes(f.key));

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A192F]">{schema.title}</h1>
          <p className="text-slate-500 text-sm">{filteredRecords.length} registro(s) encontrado(s)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="cursor-pointer inline-flex items-center px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
            <Upload className="w-4 h-4 mr-2" /> Importar
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          <button 
            onClick={() => exportToCsv(`${schema.title}.csv`, records, schema.fields.map(f=>f.key))}
            className="inline-flex items-center px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 mr-2" /> Exportar
          </button>
          <button 
            onClick={openAdd}
            className="inline-flex items-center px-3 py-2 bg-[#D4AF37] text-white border border-transparent rounded-md text-sm font-medium hover:bg-[#b8952b] shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100/60 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Busca global..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 w-full md:max-w-xs border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-[#1D4E89] focus:border-[#1D4E89] outline-none text-slate-800"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {filterableFields.map(field => (
              <select
                key={field.key}
                value={filters[field.key] || ''}
                onChange={e => setFilters({...filters, [field.key]: e.target.value})}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-[#1D4E89] focus:border-[#1D4E89] outline-none text-slate-800 bg-white"
              >
                <option value="">{field.label} (Todos)</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
                {/* Dynamically extract options if not predefined */}
                {!field.options && Array.from(new Set(records.map((r:any) => r[field.key]).filter(Boolean))).map((opt:any) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ))}
          </div>

          <div className="flex items-center border border-slate-300 rounded-md bg-slate-50 ml-auto shrink-0">
            <button 
              onClick={() => setViewMode('table')} 
              className={`p-2 ${viewMode === 'table' ? 'bg-white shadow-sm rounded-md' : 'text-slate-500'}`}
              title="Tabela"
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('cards')} 
              className={`p-2 ${viewMode === 'cards' ? 'bg-white shadow-sm rounded-md' : 'text-slate-500'}`}
              title="Cards"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Nenhum registro encontrado.
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {schema.fields.slice(0, 6).map(f => (
                    <th key={f.key} className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {f.label}
                    </th>
                  ))}
                  <th className="px-5 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredRecords.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 cursor-pointer transition-colors" onClick={() => openEdit(item)}>
                    {schema.fields.slice(0, 6).map(f => (
                      <td key={f.key} className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap font-medium">
                        {f.type === 'select' || f.key === 'status' || f.key === 'temperatura' ? 
                          renderBadge(item[f.key]) : 
                          f.type === 'checkbox' ? (item[f.key] ? 'Sim' : 'Não') :
                          item[f.key]
                        }
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="text-[#1D4E89] hover:text-cyan-900 mr-3"><Edit className="w-4 h-4"/></button>
                      <button onClick={(e) => handleDelete(item.id, e)} className="text-rose-600 hover:text-rose-900"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRecords.map((item: any) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => openEdit(item)}>
                {/* Find a good title field, usually 'nome', 'titulo', 'aluno' */}
                <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">
                  {item.nome || item.titulo || item.aluno || item.id}
                </h3>
                
                {schema.fields.slice(0, 5).filter(f => !['nome', 'titulo', 'aluno'].includes(f.key)).map(f => {
                  if (!item[f.key]) return null;
                  return (
                    <div key={f.key} className="mb-2">
                       <span className="text-xs text-slate-500 font-medium block">{f.label}</span>
                       <div className="text-sm text-slate-800">
                         {f.type === 'select' || f.key === 'status' || f.key === 'temperatura' 
                           ? renderBadge(item[f.key]) 
                           : f.type === 'checkbox' ? (item[f.key] ? 'Sim' : 'Não') : String(item[f.key])}
                       </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl z-10 mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">{editingItem ? 'Editar' : 'Adicionar'} {schema.title}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              <form id="recordForm" onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schema.fields.map(f => (
                    <div key={f.key} className={f.type === 'textarea' ? 'col-span-1 md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                      {f.type === 'textarea' ? (
                        <textarea 
                          name={f.key} 
                          defaultValue={editingItem ? editingItem[f.key] : ''} 
                          className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-[#1D4E89] focus:ring-1 focus:ring-[#1D4E89] text-slate-800 bg-white"
                          rows={3}
                        />
                      ) : f.type === 'select' ? (
                        <select 
                          name={f.key} 
                          defaultValue={editingItem ? editingItem[f.key] : ''}
                          className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-[#1D4E89] focus:ring-1 focus:ring-[#1D4E89] text-slate-800 bg-white"
                        >
                          <option value=""></option>
                          {f.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : f.type === 'checkbox' ? (
                        <input 
                          type="checkbox" 
                          name={f.key} 
                          defaultChecked={editingItem ? editingItem[f.key] : false}
                          className="w-5 h-5 text-[#1D4E89] rounded border-slate-300 focus:ring-[#1D4E89]"
                        />
                      ) : f.type === 'tags' ? (
                        <input 
                          type="text" 
                          name={f.key} 
                          defaultValue={editingItem && editingItem[f.key] ? editingItem[f.key].join(', ') : ''} 
                          placeholder="Separado por vírgula..."
                          className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-[#1D4E89] focus:ring-1 focus:ring-[#1D4E89] text-slate-800 bg-white"
                        />
                      ) : (
                        <input 
                          type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} 
                          name={f.key} 
                          defaultValue={editingItem ? editingItem[f.key] : ''} 
                          step={f.type === 'number' ? '0.01' : undefined}
                          className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:border-[#1D4E89] focus:ring-1 focus:ring-[#1D4E89] text-slate-800 bg-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </form>
            </div>
            <div className="border-t border-slate-100 px-6 py-4 flex justify-end gap-2 bg-slate-50">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button 
                form="recordForm" 
                type="submit" 
                className="px-4 py-2 bg-[#0A192F] text-white rounded-md font-medium hover:bg-[#152a4a] transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
