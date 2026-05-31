import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Trash2, Edit2, Download, Search, LayoutGrid, CheckSquare, 
  Calendar, KanbanSquare, Check, X, ArrowUpDown, ChevronDown, ListFilter,
  Eye, EyeOff, CalendarRange, Sparkles, UserPlus, FileSpreadsheet, Layers, Copy, CheckCircle2
} from 'lucide-react';
import { useStore } from '../../store';
import { TemplateColumn } from './templates';

interface PlanilhaGridProps {
  sheetId: string;
  nome: string;
  colunas: TemplateColumn[];
  registros: Record<string, any>[];
  onUpdateRegistros: (regs: Record<string, any>[]) => void;
  onUpdateColunas: (cols: TemplateColumn[]) => void;
}

export function PlanilhaGrid({ 
  sheetId, 
  nome, 
  colunas, 
  registros, 
  onUpdateRegistros, 
  onUpdateColunas 
}: PlanilhaGridProps) {
  const { data, updateModuleData } = useStore();
  const pessoas = data.pessoas || [];

  // Active view: 'tabela' | 'cards' | 'kanban' | 'calendario' | 'lista'
  const [viewType, setViewType] = useState<'tabela' | 'cards' | 'kanban' | 'calendario' | 'lista'>('tabela');

  // Search and filter states
  const [globalSearch, setGlobalSearch] = useState('');
  const [filterColumn, setFilterColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Toggle visible columns
  const [hiddenColumnKeys, setHiddenColumnKeys] = useState<Record<string, boolean>>({});
  const [congelarPrimeira, setCongelarPrimeira] = useState(false);

  // Directly inline editing row & field cells
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>('');

  // Row selection for batch removals
  const [selectedRowIndexes, setSelectedRowIndexes] = useState<Record<number, boolean>>({});

  // Adding a row via simplified Form View vs Inline
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newRowForm, setNewRowForm] = useState<Record<string, any>>({});

  // Adding a person directly workflow
  const [isNewPersonOpen, setIsNewPersonOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonPhone, setNewPersonPhone] = useState('');
  const [newPersonEmail, setNewPersonEmail] = useState('');

  // New Column Dynamic Modal
  const [isNewColOpen, setIsNewColOpen] = useState(false);
  const [newColLabel, setNewColLabel] = useState('');
  const [newColType, setNewColType] = useState<TemplateColumn['type']>('texto_curto');
  const [newColOptionsText, setNewColOptionsText] = useState('');

  // Auto-fill form controls on show
  useEffect(() => {
    const emptyForm: Record<string, any> = {};
    colunas.forEach(c => {
      if (c.type === 'checkbox') emptyForm[c.key] = false;
      else if (c.type === 'tags' || c.type === 'multi_selecao') emptyForm[c.key] = [];
      else emptyForm[c.key] = '';
    });
    setNewRowForm(emptyForm);
  }, [colunas]);

  // Determine what field contains date for calendar routing
  const dateColumnKey = useMemo(() => {
    const c = colunas.find(col => col.type === 'data');
    return c ? c.key : '';
  }, [colunas]);

  // Determine status column key for Kanban grouping
  const statusColumnKey = useMemo(() => {
    const c = colunas.find(col => col.type === 'status' || col.key === 'status');
    return c ? c.key : colunas[0]?.key || '';
  }, [colunas]);

  // Filter and Sort Rows
  const processedRows = useMemo(() => {
    let result = [...registros];

    // 1. Apply global search filter
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase();
      result = result.filter(row => {
        return Object.values(row).some(val => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // 2. Apply explicit column filtration
    if (filterColumn && filterValue) {
      result = result.filter(row => {
        const val = row[filterColumn];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase() === filterValue.toLowerCase();
      });
    }

    // 3. Sort
    if (sortColumn) {
      result.sort((a, b) => {
        let valA = a[sortColumn] ?? '';
        let valB = b[sortColumn] ?? '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [registros, globalSearch, filterColumn, filterValue, sortColumn, sortOrder]);

  // Quick helper to download CSV format
  const handleExportCsv = () => {
    const visibleCols = colunas.filter(c => !hiddenColumnKeys[c.key]);
    const headers = visibleCols.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');
    
    const rows = registros.map(row => {
      return visibleCols.map(c => {
        let val = row[c.key] ?? '';
        if (Array.isArray(val)) val = val.join('; ');
        if (typeof val === 'boolean') val = val ? 'Sim' : 'Não';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${nome}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Duplicate entire Spreadsheet helper
  const handleDuplicate = () => {
    const saved = localStorage.getItem('ilg_planilhas');
    if (!saved) return;
    const sheets = JSON.parse(saved);
    const cur = sheets.find((s: any) => s.id === sheetId);
    if (!cur) return;

    const dup = {
      ...cur,
      id: `sheet-${Date.now()}`,
      nome: `${cur.nome} (Cópia)`,
      ultimaAtualizacao: new Date().toLocaleString()
    };

    localStorage.setItem('ilg_planilhas', JSON.stringify([...sheets, dup]));
    window.dispatchEvent(new Event('storage'));
    alert('Planilha duplicada com sucesso!');
  };

  // Inline Cell Trigger
  const startInlineEdit = (rowIndex: number, colKey: string, currentVal: any) => {
    setEditingRowIndex(rowIndex);
    setEditingField(colKey);
    setEditValue(currentVal ?? '');
  };

  const saveInlineEdit = (rowIndex: number) => {
    if (editingField === null) return;
    const updated = [...registros];
    updated[rowIndex] = {
      ...updated[rowIndex],
      [editingField]: editValue
    };
    onUpdateRegistros(updated);
    
    // Clear inline locks
    setEditingRowIndex(null);
    setEditingField(null);
  };

  // Quick remove records
  const handleDeleteRow = (rowIndex: number) => {
    const updated = registros.filter((_, idx) => idx !== rowIndex);
    onUpdateRegistros(updated);
  };

  // Add row manually via Form submit
  const handleAddRowFromForm = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRegistros([...registros, newRowForm]);
    setIsFormOpen(false);

    // Reset Form
    const emptyForm: Record<string, any> = {};
    colunas.forEach(c => {
      if (c.type === 'checkbox') emptyForm[c.key] = false;
      else if (c.type === 'tags' || c.type === 'multi_selecao') emptyForm[c.key] = [];
      else emptyForm[c.key] = '';
    });
    setNewRowForm(emptyForm);
  };

  // Quick create a new person directly into Base de Pessoas
  const handleQuickCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    const newPersonId = `pessoa-${Date.now()}`;
    const newPerson = {
      id: newPersonId,
      nome: newPersonName.trim(),
      telefone: newPersonPhone.trim() || 'Sem telefone',
      email: newPersonEmail.trim() || 'Sem e-mail',
      tipoPessoa: nome.includes('Lead') ? 'lead' : 'aluna',
      status: 'novo',
      interacoes: [{ text: `Cadastrada rapidamente pelo módulo de Planilhas: ${nome}`, date: 'Hoje', type: 'system' }]
    };

    try {
      await updateModuleData('pessoas', [newPerson, ...pessoas]);
      
      // Auto-populate current form input or cell with this newly created person's name!
      if (isFormOpen) {
        setNewRowForm(prev => ({
          ...prev,
          nome: newPerson.nome // or whatever key is connected to rel_pessoa
        }));
      } else if (editingRowIndex !== null && editingField) {
        setEditValue(newPerson.nome);
      }

      setIsNewPersonOpen(false);
      setNewPersonName('');
      setNewPersonPhone('');
      setNewPersonEmail('');
      alert(`Pessoa "${newPerson.nome}" adicionada na base com sucesso!`);
    } catch (err) {
      console.error(err);
      alert('Erro ao incluir pessoa na base única.');
    }
  };

  // Add dynamic column structure
  const handleAddColumn = () => {
    if (!newColLabel.trim()) return;
    const colKey = newColLabel.toLowerCase()
      .replace(/\s+/g, '_')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const newCol: TemplateColumn = {
      key: colKey,
      label: newColLabel.trim(),
      type: newColType,
      options: newColOptionsText ? newColOptionsText.split(',').map(s => s.trim()) : undefined
    };

    onUpdateColunas([...colunas, newCol]);
    setIsNewColOpen(false);
    setNewColLabel('');
    setNewColOptionsText('');
  };

  // Remove Column Helper
  const handleRemoveColumn = (colKey: string) => {
    if (confirm(`Tem certeza de que deseja remover a coluna "${colKey}" permanentemente de toda a planilha?`)) {
      onUpdateColunas(colunas.filter(c => c.key !== colKey));
    }
  };

  // Render values prettily depending on Column types
  const renderCellFormatted = (val: any, type: TemplateColumn['type']) => {
    if (val === null || val === undefined || val === '') return <span className="text-slate-400 font-normal">-</span>;

    if (type === 'checkbox') {
      return (
        <span className={`inline-flex px-2 py-0.5 rounded font-extrabold text-[10px] uppercase tracking-wider ${
          val ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-red-50 text-red-600'
        }`}>
          {val ? 'Sim ✅' : 'Não ❌'}
        </span>
      );
    }

    if (type === 'moeda') {
      return <span className="font-mono text-slate-700 font-bold">{Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>;
    }

    if (type === 'status') {
      const isRed = ['Crítico', 'Atrasado', 'Sem Interesse', 'Pendente 🔴'].includes(val);
      const isGreen = ['Concluído', 'Quitado', 'Vendido', 'Resolvido 🟢'].includes(val);
      return (
        <span className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
          isRed ? 'bg-red-100 text-red-700' : isGreen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
        }`}>
          {val}
        </span>
      );
    }

    if (type === 'link') {
      return (
        <a href={val} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1">
          <span>Abrir Link</span>
        </a>
      );
    }

    if (type === 'tags' || type === 'multi_selecao') {
      const list = Array.isArray(val) ? val : String(val).split(',').map(s => s.trim());
      return (
        <div className="flex flex-wrap gap-1">
          {list.map((tag, i) => (
            <span key={i} className="text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-150 px-1.5 py-0.2 rounded">
              {tag}
            </span>
          ))}
        </div>
      );
    }

    if (type === 'email') {
      return <span className="text-slate-500 hover:underline cursor-pointer">{val}</span>;
    }

    if (type === 'telefone') {
      return <span className="text-slate-600 font-mono font-medium">{val}</span>;
    }

    return <span className="text-slate-700 text-xs font-medium">{String(val)}</span>;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden pb-1 ">
      
      {/* SPREADSHEET HEADER SUBBAR */}
      <div className="p-4 bg-slate-50/55 border-b border-slate-150 flex flex-wrap items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-extrabold uppercase text-slate-[#0A192F] tracking-wide">{nome}</h2>
          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold uppercase">{sheetId.includes('tpl') ? 'Modelo Exclusivo' : 'Personalizada'}</span>
        </div>

        {/* CONTROLLERS VIEW TRIGGER */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input 
              type="text" 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Pesquisar registros..."
              className="pl-8 bg-white border border-slate-300 rounded-lg text-xs py-1.5 outline-none focus:border-[#0A192F] w-48 font-medium"
            />
          </div>

          {/* VIEW TYPE SELECTOR */}
          <div className="bg-slate-100 border border-slate-200/50 p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold">
            <button 
              onClick={() => setViewType('tabela')}
              className={`px-2 py-1 rounded transition ${viewType === 'tabela' ? 'bg-white text-[#0A192F] shadow-xs' : 'text-slate-500'}`}
            >
              Grade
            </button>
            <button 
              onClick={() => setViewType('cards')}
              className={`px-2 py-1 rounded transition ${viewType === 'cards' ? 'bg-white text-[#0A192F] shadow-xs' : 'text-slate-500'}`}
            >
              Cards
            </button>
            <button 
              onClick={() => setViewType('kanban')}
              className={`px-2 py-1 rounded transition ${viewType === 'kanban' ? 'bg-white text-[#0A192F] shadow-xs' : 'text-slate-500'}`}
            >
              Kanban
            </button>
            {dateColumnKey && (
              <button 
                onClick={() => setViewType('calendario')}
                className={`px-2 py-1 rounded transition ${viewType === 'calendario' ? 'bg-white text-[#0A192F] shadow-xs' : 'text-slate-500'}`}
              >
                Calendário
              </button>
            )}
            <button 
              onClick={() => setViewType('lista')}
              className={`px-2 py-1 rounded transition ${viewType === 'lista' ? 'bg-white text-[#0A192F] shadow-xs' : 'text-slate-500'}`}
            >
              Listas
            </button>
          </div>

          {/* MAIN ACTIONS */}
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-3.5 py-1.5 bg-[#0A192F] text-white hover:bg-[#D4AF37] hover:text-[#0A192F] transition rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Registro</span>
          </button>

          <button
            onClick={() => setIsNewColOpen(true)}
            className="px-3.5 py-1.5 border border-slate-200 font-semibold bg-white hover:bg-slate-50 transition rounded-lg text-xs"
          >
            + Coluna
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-1.5 border border-slate-200 font-semibold bg-white hover:bg-slate-100 transition rounded-lg text-xs flex items-center gap-1"
            title="Exportar CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleDuplicate}
            className="px-3.5 py-1.5 border border-slate-200 font-semibold bg-white hover:bg-slate-100 transition rounded-lg text-xs"
            title="Duplicar planilha"
          >
            Duplicar
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE MODE */}
      
      {/* 1. TABLE GRID VIEW */}
      {viewType === 'tabela' && (
        <div className="overflow-x-auto w-full select-none">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="px-4 py-3 text-center w-12 border-r border-slate-150">Ações</th>
                {colunas.map((col, index) => {
                  const isFirst = index === 0 && congelarPrimeira;
                  return (
                    <th 
                      key={col.key} 
                      className={`px-4 py-3 border-r border-slate-150 font-extrabold relative group/th ${
                        isFirst ? 'sticky left-0 bg-slate-100 z-10' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#0A192F]">{col.label}</span>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover/th:opacity-100 transition">
                          <button
                            onClick={() => {
                              setSortColumn(col.key);
                              setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            }}
                            className="p-1 hover:bg-slate-200 rounded"
                            title="Ordenar por coluna"
                          >
                            <ArrowUpDown className="w-2.5 h-2.5 text-slate-500" />
                          </button>
                          
                          <button
                            onClick={() => handleRemoveColumn(col.key)}
                            className="p-1 hover:bg-red-50 text-rose-500 rounded"
                            title="Deletar coluna"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {processedRows.map((row, rowIndex) => {
                return (
                  <tr key={rowIndex} className="border-b border-stone-150 hover:bg-slate-50/50 font-medium">
                    {/* Actions column */}
                    <td className="px-4 py-2.5 text-center border-r border-stone-150 bg-stone-50/40 w-12">
                      <button
                        onClick={() => handleDeleteRow(rowIndex)}
                        className="p-1 hover:bg-rose-50 rounded-full text-rose-600 transition"
                        title="Deletar linha"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                    {/* Dynamic cells */}
                    {colunas.map((col) => {
                      const value = row[col.key];
                      const isEditing = editingRowIndex === rowIndex && editingField === col.key;

                      return (
                        <td 
                          key={col.key}
                          onClick={() => {
                            if (!isEditing) startInlineEdit(rowIndex, col.key, value);
                          }}
                          className="px-4 py-2.5 border-r border-stone-100 text-xs text-slate-800 min-w-[120px] max-w-[200px] truncate cursor-text hover:bg-yellow-50/40 active:bg-yellow-50 relative group/cell"
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 z-20">
                              {col.type === 'checkbox' ? (
                                <input 
                                  type="checkbox"
                                  checked={!!editValue}
                                  onChange={(e) => setEditValue(e.target.checked)}
                                  className="w-4 h-4 text-indigo-600 rounded"
                                />
                              ) : col.type === 'rel_pessoa' ? (
                                <select 
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full text-xs font-semibold p-1 border rounded"
                                >
                                  <option value="">Selecione...</option>
                                  {pessoas.map(p => (
                                    <option key={p.id} value={p.nome}>{p.nome}</option>
                                  ))}
                                </select>
                              ) : col.type === 'status' && col.options ? (
                                <select 
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full text-xs font-semibold p-1 border rounded"
                                >
                                  {col.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <input 
                                  type={col.type === 'numero' || col.type === 'moeda' ? 'number' : 'text'}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveInlineEdit(rowIndex);
                                    if (e.key === 'Escape') setEditingRowIndex(null);
                                  }}
                                  className="w-full text-xs font-medium p-1 border border-indigo-300 rounded outline-none"
                                  autoFocus
                                />
                              )}
                              
                              <button 
                                onClick={() => saveInlineEdit(rowIndex)}
                                className="p-1 bg-emerald-500 rounded text-white"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="truncate flex-1 pr-1">
                                {renderCellFormatted(value, col.type)}
                              </div>
                              <span className="text-[10px] text-slate-300 font-bold opacity-0 group-hover/cell:opacity-100 uppercase select-none pointer-events-none scale-90">Editar</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {processedRows.length === 0 && (
                <tr>
                  <td colSpan={colunas.length + 1} className="p-12 text-center text-slate-400 text-xs">
                    Nenhum registro encontrado. Crie um novo usando o botão superior "Novo Registro".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. CARDS VIEW */}
      {viewType === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5 bg-slate-50">
          {processedRows.map((row, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm hover:shadow relative select-none">
              <div className="flex justify-between items-start mb-2 border-b pb-2">
                <span className="font-extrabold text-xs text-indigo-700 uppercase">{row.nome || `Ficha #${idx + 1}`}</span>
                <button
                  onClick={() => handleDeleteRow(idx)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                {colunas.slice(1, 6).map(c => (
                  <div key={c.key} className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">{c.label}:</span>
                    <span className="font-semibold text-slate-700 max-w-[150px] truncate">
                      {renderCellFormatted(row[c.key], c.type)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {processedRows.length === 0 && (
            <div className="col-span-full p-12 text-center text-slate-400 text-sm">
              Nenhuma linha cadastrada.
            </div>
          )}
        </div>
      )}

      {/* 3. KANBAN STATUS VIEW */}
      {viewType === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-stone-50 overflow-x-auto select-none">
          {/* We determine statuses based on status col options, or we default to group indices */}
          {(() => {
            const statusCol = colunas.find(c => c.key === statusColumnKey);
            const statuses = statusCol?.options || ['Pendente', 'Em Andamento', 'Concluído'];

            return statuses.map(st => {
              const matches = processedRows.filter(r => String(r[statusColumnKey] || '').toLowerCase() === st.toLowerCase() || String(r[statusColumnKey] || '') === st);
              return (
                <div key={st} className="p-3 border border-slate-200 bg-white rounded-xl flex flex-col min-h-[300px] w-full">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-xs text-[#0A192F] uppercase">{st}</span>
                    <span className="bg-slate-100 text-[#0A192F] font-bold text-[10px] px-2 py-0.5 rounded-full">{matches.length}</span>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto">
                    {matches.map((row, idx) => {
                      const realIndex = registros.findIndex(r => r === row);
                      return (
                        <div key={realIndex} className="p-3 bg-stone-50 border border-slate-150 rounded-lg hover:border-slate-300">
                          <h4 className="font-bold text-xs text-slate-800">{row.nome || `Registro #${realIndex + 1}`}</h4>
                          {colunas.slice(1, 4).map(c => (
                            <p key={c.key} className="text-[10px] text-slate-500 mt-1">
                              <strong>{c.label}:</strong> {String(row[c.key] || '-')}
                            </p>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* 4. CALENDAR PLANNER VIEW */}
      {viewType === 'calendario' && dateColumnKey && (
        <div className="p-5 bg-slate-50 select-none">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Planejador de prazos / vencimentos:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {processedRows.filter(r => r[dateColumnKey]).map((row, idx) => (
              <div key={idx} className="bg-white border rounded-xl p-3 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-mono font-bold text-indigo-700">{row[dateColumnKey]}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-800">{row.nome || 'Lembrete'}</h4>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">Ação: <strong>{nome}</strong></p>
              </div>
            ))}
            {processedRows.filter(r => r[dateColumnKey]).length === 0 && (
              <div className="col-span-full p-12 text-center text-slate-400 text-xs">
                Nenhum registro possui data preenchida nesta planilha.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. MINIMAL SIMPLE LIST VIEW */}
      {viewType === 'lista' && (
        <div className="p-4 space-y-2 select-none bg-stone-50">
          {processedRows.map((row, idx) => (
            <div key={idx} className="p-3 bg-white border rounded-lg flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                <span className="font-bold text-slate-800">{row.nome || `Checklist #${idx + 1}`}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500">
                <span>{String(row[colunas[2]?.key] || '')}</span>
                <span className="font-bold text-slate-800 bg-stone-100 py-0.5 px-2 rounded text-[10px]">
                  {row[statusColumnKey] || 'Nenhum'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: ADD NEW RECORD BY FORM VIEW */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4.5 bg-slate-50 border-b border-slate-150 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-sm text-[#0A192F] uppercase flex items-center gap-1.5">
                <Layers className="w-4.5 h-4.5 text-[#0A192F]" />
                <span>Registrar Entrada: {nome}</span>
              </h3>
              
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRowFromForm} className="flex-1 overflow-y-auto p-5 space-y-4 text-left">
              {colunas.map((col) => (
                <div key={col.key} className="space-y-1 select-none">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">{col.label}:</label>
                    {col.type === 'rel_pessoa' && (
                      <button
                        type="button"
                        onClick={() => setIsNewPersonOpen(true)}
                        className="text-[10px] text-indigo-600 font-extrabold flex items-center gap-0.5 hover:underline"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>+ Nova Pessoa</span>
                      </button>
                    )}
                  </div>

                  {col.type === 'checkbox' ? (
                    <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={!!newRowForm[col.key]}
                        onChange={(e) => setNewRowForm({...newRowForm, [col.key]: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded border-slate-350"
                      />
                      <span>Sim / Concedido</span>
                    </label>
                  ) : col.type === 'rel_pessoa' ? (
                    <select 
                      value={newRowForm[col.key] || ''}
                      onChange={(e) => setNewRowForm({...newRowForm, [col.key]: e.target.value})}
                      className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-350 rounded-lg outline-none focus:border-[#0A192F]"
                    >
                      <option value="">Selecione na base única...</option>
                      {pessoas.map(p => (
                        <option key={p.id} value={p.nome}>{p.nome} ({p.tipoPessoa || 'lead'})</option>
                      ))}
                    </select>
                  ) : col.type === 'status' && col.options ? (
                    <select 
                      value={newRowForm[col.key] || ''}
                      onChange={(e) => setNewRowForm({...newRowForm, [col.key]: e.target.value})}
                      className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-350 rounded-lg outline-none focus:border-[#0A192F]"
                    >
                      <option value="">Escolha uma opção...</option>
                      {col.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : col.type === 'texto_longo' ? (
                    <textarea 
                      value={newRowForm[col.key] || ''}
                      onChange={(e) => setNewRowForm({...newRowForm, [col.key]: e.target.value})}
                      placeholder="Observações completas..."
                      className="w-full text-xs font-medium p-2.5 bg-white border border-slate-300 rounded-lg min-h-[60px] outline-none focus:border-[#0A192F]"
                    />
                  ) : (
                    <input 
                      type={col.type === 'numero' || col.type === 'moeda' ? 'number' : 'text'}
                      value={newRowForm[col.key] || ''}
                      onChange={(e) => setNewRowForm({...newRowForm, [col.key]: e.target.value})}
                      placeholder={`Digite ${col.label.toLowerCase()}...`}
                      className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:border-[#0A192F]"
                    />
                  )}
                </div>
              ))}

              <div className="pt-4 flex gap-3 shrink-0">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#0A192F] hover:bg-indigo-900 text-white text-xs font-bold uppercase rounded-lg shadow"
                >
                  Confirmar Cadastro
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-xs text-slate-500 font-semibold rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW DYNAMIC COLUMN MODAL */}
      {isNewColOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-sm overflow-hidden flex flex-col p-5 space-y-4">
            <h3 className="font-bold text-sm text-[#0A192F] uppercase flex items-center gap-1">
              <span>+ Adicionar Campo Customizado</span>
            </h3>

            <div className="space-y-3 font-medium">
              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">Nome/Etiqueta do Campo:</label>
                <input 
                  type="text" 
                  value={newColLabel}
                  onChange={(e) => setNewColLabel(e.target.value)}
                  placeholder="Ex: Nota de Prova ou ID Matrícula"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 font-bold block mb-1">Tipo de Dado:</label>
                <select
                  value={newColType}
                  onChange={(e) => setNewColType(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white focus:outline-none"
                >
                  <option value="texto_curto">Texto Curto</option>
                  <option value="texto_longo">Texto Longo</option>
                  <option value="numero">Número</option>
                  <option value="moeda">Moeda</option>
                  <option value="data">Data</option>
                  <option value="telefone">Telefonia</option>
                  <option value="email">E-mail</option>
                  <option value="link">Link da Web</option>
                  <option value="checkbox">Caixa de Seleção (Check/Sim/Não)</option>
                  <option value="status">Status Colorido</option>
                  <option value="tags">Marcas / Tags</option>
                  <option value="rel_pessoa">Vincular Base de Pessoas</option>
                </select>
              </div>

              {newColType === 'status' && (
                <div>
                  <label className="text-xs text-slate-700 font-bold block mb-1">Opções (Separado por vírgula):</label>
                  <input 
                    type="text" 
                    value={newColOptionsText}
                    onChange={(e) => setNewColOptionsText(e.target.value)}
                    placeholder="Ex: Novo, Em Progresso, Finalizado"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white outline-none"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">Defina opcionalmente as tags pré-selecionáveis do drop.</span>
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={handleAddColumn}
                className="flex-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow hover:bg-indigo-700"
              >
                Criar Campo
              </button>
              <button
                onClick={() => setIsNewColOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-xs text-slate-500 font-semibold rounded-lg"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK NEW PERSON MODAL SUBDRAWER */}
      {isNewPersonOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-sm p-5 space-y-4 text-left">
            <h4 className="font-extrabold text-xs text-[#0A192F] uppercase select-none flex items-center gap-1 border-b pb-2">
              <UserPlus className="w-4 h-4 text-[#D4AF37]" />
              <span>Adicionar Rapido na Base Geral</span>
            </h4>

            <form onSubmit={handleQuickCreatePerson} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Nome Completo:</label>
                <input 
                  type="text" 
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Ex: Luiza Alencar"
                  className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 rounded-lg outline-none focus:bg-white text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">WhatsApp:</label>
                <input 
                  type="text" 
                  value={newPersonPhone}
                  onChange={(e) => setNewPersonPhone(e.target.value)}
                  placeholder="Ex: 5511999990000"
                  className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 rounded-lg outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">E-mail Principal:</label>
                <input 
                  type="email" 
                  value={newPersonEmail}
                  onChange={(e) => setNewPersonEmail(e.target.value)}
                  placeholder="Ex: luiza@email.com"
                  className="w-full text-xs border border-slate-300 p-2.5 bg-slate-50 rounded-lg outline-none text-slate-800"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0A192F] text-white hover:bg-[#D4AF37] hover:text-[#0A192F] text-xs font-bold uppercase rounded-lg shadow transition"
                >
                  Registrar Pessoa
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewPersonOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-xs text-slate-500 font-semibold rounded-lg"
                >
                  Voltar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
