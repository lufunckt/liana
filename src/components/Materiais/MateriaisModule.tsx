import React, { useState } from 'react';
import { useStore } from '../../store';
import { Search, Plus, ExternalLink, FileText, Trash2, Edit3, Check, Palette, X } from 'lucide-react';
import { TagManagerModal } from '../TagManagerModal';
import { cn } from '../../lib/utils';

export function MateriaisModule() {
  const { data, addSingleDocument, updateSingleField, deleteSingleDocument } = useStore();
  const materiais = data.materiais || [];
  const tagsList = data.tags_personalizaveis || [];
  
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [showTagManager, setShowTagManager] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form states
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Roteiro');
  const [responsavel, setResponsavel] = useState('Liana');
  const [status, setStatus] = useState('Ativo');
  const [link, setLink] = useState('');
  const [associatedTags, setAssociatedTags] = useState<string[]>([]);

  const filtered = materiais.filter(m => {
    if (search && !m.nome?.toLowerCase().includes(search.toLowerCase())) return false;
    if (tagFilter && (!m.tags || !Array.isArray(m.tags) || !m.tags.some((t: string) => t.toLowerCase() === tagFilter.toLowerCase()))) return false;
    return true;
  });

  const openAddModal = () => {
    setEditingItem(null);
    setNome('');
    setCategoria('Roteiro');
    setResponsavel('Liana');
    setStatus('Ativo');
    setLink('');
    setAssociatedTags([]);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setNome(item.nome || '');
    setCategoria(item.categoria || 'Roteiro');
    setResponsavel(item.responsavel || 'Liana');
    setStatus(item.status || 'Ativo');
    setLink(item.link || '');
    setAssociatedTags(Array.isArray(item.tags) ? item.tags : []);
    setIsModalOpen(true);
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const payload = {
      nome: nome.trim(),
      categoria,
      responsavel,
      status,
      link: link.trim(),
      tags: associatedTags,
    };

    if (editingItem) {
      await updateSingleField('materiais', editingItem.id, payload);
    } else {
      const newId = `material-${Date.now()}`;
      await addSingleDocument('materiais', { id: newId, ...payload });
    }

    setIsModalOpen(false);
  };

  const handleDeleteMaterial = async (id: string, name: string) => {
    if (confirm(`Deseja realmente remover o material "${name}" da biblioteca?`)) {
      await deleteSingleDocument('materiais', id);
    }
  };

  const toggleTagAssociation = (tagName: string) => {
    if (associatedTags.some(t => t.toLowerCase() === tagName.toLowerCase())) {
      setAssociatedTags(associatedTags.filter(t => t.toLowerCase() !== tagName.toLowerCase()));
    } else {
      setAssociatedTags([...associatedTags, tagName]);
    }
  };

  return (
    <div className="flex flex-col min-h-full space-y-4 pb-12">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A192F]">Materiais & Biblioteca</h1>
          <p className="text-slate-500 text-sm">Organização de roteiros, materiais didáticos e referências ({filtered.length})</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTagManager(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-205 border text-slate-700 font-bold text-xs rounded-lg flex items-center gap-1.5 transition"
          >
            <Palette className="w-4 h-4 text-[#D4AF37]" />
            Gerenciar Tags
          </button>
          
          <button
            onClick={openAddModal}
            className="px-4 py-1.5 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] font-extrabold text-xs rounded-lg flex items-center gap-1.5 transition shadow"
          >
            <Plus className="w-4 h-4" />
            Adicionar Material
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-150">
        
        {/* Filters and search box */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-[#1D4E89] outline-none"
            />
          </div>

          <select
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:ring-[#1D4E89] min-w-[140px]"
          >
            <option value="">Filtrar por Tag (Todas)</option>
            {tagsList.map((tag: any) => (
              <option key={tag.id} value={tag.nome}>{tag.nome}</option>
            ))}
          </select>
        </div>

        {/* Bento Grid layout of material cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => (
            <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-[#FCFBF9] hover:bg-white hover:shadow-md transition-all flex flex-col justify-between group h-full">
              <div>
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 text-[#0A192F] min-w-0 flex-1">
                    <FileText className="w-4 h-4 shrink-0 text-[#1D4E89]" />
                    <h3 className="font-bold text-sm text-[#0A192F] truncate-2-lines leading-snug group-hover:text-[#1D4E89] transition-colors">{item.nome}</h3>
                  </div>
                  <span className="shrink-0 text-[9px] uppercase font-black text-[#0A192F] bg-slate-100 border px-1.5 py-0.5 rounded-md">{item.categoria}</span>
                </div>

                {/* Display tags associated with materials inside grid card context */}
                <div className="flex flex-wrap gap-1 mb-3.5">
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
                  {(!item.tags || item.tags.length === 0) && (
                    <span className="text-[10px] text-slate-350 italic">Nenhuma tag</span>
                  )}
                </div>
                
                <div className="text-xs text-slate-500 space-y-1 bg-white/70 p-2.5 rounded-lg border border-slate-100">
                  <p className="flex justify-between">
                    <span className="font-medium text-slate-400">Responsável:</span> 
                    <span className="font-bold text-slate-750 uppercase">{item.responsavel || '-'}</span>
                  </p>
                  <p className="flex justify-between mt-0.5">
                    <span className="font-medium text-slate-400">Status:</span> 
                    <span className="font-bold text-[#0A192F]">{item.status || '-'}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-150/60 flex items-center gap-2 justify-end">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs"
                  title="Editar dados ou tags"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteMaterial(item.id, item.nome)}
                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-xs"
                  title="Remover material"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#0A192F] group-hover:bg-[#D4AF37] text-white hover:text-[#0A192F] group-hover:text-[#0A192F] font-extrabold text-xs rounded-lg transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Acessar Link
                  </a>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              Nenhum material cadastrado com os critérios informados.
            </div>
          )}
        </div>
      </div>

      {/* ADD/EDIT MATERIAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg mx-4 rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-left animate-in fade-in duration-150">
            
            <div className="p-4 bg-[#0A192F] text-white flex justify-between items-center">
              <h3 className="font-extrabold text-sm tracking-tight uppercase">
                {editingItem ? '✏️ Editar Material' : '✨ Criar Novo Material'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome do Material / Link</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Roteiro Comercial VIP, Manual de Boas-vindas..."
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Categoria</label>
                  <select
                    value={categoria}
                    onChange={e => setCategoria(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                  >
                    <option value="Roteiro">Roteiro</option>
                    <option value="Ebook">Ebook</option>
                    <option value="Planilha">Planilha</option>
                    <option value="Apoio">Material de Apoio</option>
                    <option value="Video">Vídeo / Aula</option>
                    <option value="Contrato">Contrato</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Responsável</label>
                  <select
                    value={responsavel}
                    onChange={e => setResponsavel(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                  >
                    <option value="Liana">Liana</option>
                    <option value="Ana">Ana</option>
                    <option value="Núria">Núria</option>
                    <option value="Geral">Operação Geral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                  >
                    <option value="Ativo">🟢 Ativo</option>
                    <option value="Rascunho">🟡 Rascunho</option>
                    <option value="Arquivado">🔴 Arquivado</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Link de Acesso (URL)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
                  />
                </div>
              </div>

              {/* Tag Selection block inside Material form */}
              <div className="border-t pt-3.5 space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase block mb-1 text-slate-700">Tags Cadastrais</span>
                <p className="text-[9px] text-slate-400 italic">Clique nos botões correspondentes para associar múltiplas tags:</p>
                
                <div className="flex flex-wrap gap-1.5">
                  {tagsList.map((tag: any) => {
                    const isSelected = associatedTags.some(t => t.toLowerCase() === tag.nome.toLowerCase() || t === tag.id);
                    
                    return (
                      <button
                        type="button"
                        key={tag.id}
                        onClick={() => toggleTagAssociation(tag.nome)}
                        style={{
                          backgroundColor: isSelected ? tag.cor : 'transparent',
                          borderColor: tag.cor,
                          color: isSelected ? '#FFFFFF' : tag.cor
                        }}
                        className={cn(
                          "px-2.5 py-1 rounded text-[9px] uppercase font-bold border transition-all text-left flex items-center gap-1",
                          isSelected ? 'shadow-xs border-transparent' : 'opacity-70 hover:opacity-100 hover:bg-slate-50'
                        )}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 shrink-0" />}
                        {tag.nome}
                      </button>
                    );
                  })}

                  {tagsList.length === 0 && (
                    <p className="text-[10px] text-slate-450 italic">Nenhuma tag cadastrada. Use o Gerenciador de Tags primeiro.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] text-xs font-extrabold rounded-lg transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Customizable Tag Manager */}
      {showTagManager && (
        <TagManagerModal onClose={() => setShowTagManager(false)} />
      )}

    </div>
  );
}
