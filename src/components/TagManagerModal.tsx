import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Palette } from 'lucide-react';
import { useStore } from '../store';

interface TagManagerModalProps {
  onClose: () => void;
}

const PRESET_COLORS = [
  '#0A192F', // Navy (System core)
  '#D4AF37', // Gold (System core)
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Green
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#64748B', // Slate
];

export function TagManagerModal({ onClose }: TagManagerModalProps) {
  const { data, addSingleDocument, deleteSingleDocument, updateSingleField } = useStore();
  const tagsList = data.tags_personalizaveis || [];

  const [nome, setNome] = useState('');
  const [cor, setCor] = useState(PRESET_COLORS[0]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNome, setEditingNome] = useState('');
  const [editingCor, setEditingCor] = useState('');

  const handleAddTag = async () => {
    if (!nome.trim()) return;
    const cleanNome = nome.trim();
    // Pre-check duplicate name
    if (tagsList.some((t: any) => t.nome.toLowerCase() === cleanNome.toLowerCase())) {
      alert('Já existe uma tag com este nome.');
      return;
    }

    const tagId = `tag-${Math.random().toString(36).substring(2, 9)}`;
    const newTag = { id: tagId, nome: cleanNome, cor };
    
    await addSingleDocument('tags_personalizaveis', newTag);
    setNome('');
  };

  const handleStartEdit = (tag: any) => {
    setEditingId(tag.id);
    setEditingNome(tag.nome);
    setEditingCor(tag.cor);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingNome.trim()) return;
    await updateSingleField('tags_personalizaveis', id, {
      nome: editingNome.trim(),
      cor: editingCor
    });
    setEditingId(null);
  };

  const handleDeleteTag = async (id: string, name: string) => {
    if (confirm(`Deseja realmente excluir a tag "${name}"? Ela deixará de estar ativa nos registros de Leads, Alunos e Materiais.`)) {
      await deleteSingleDocument('tags_personalizaveis', id);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-left animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-4 bg-[#0A192F] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="font-extrabold text-sm tracking-tight">Gerenciador de Tags Personalizáveis</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-6 max-h-[70vh]">
          {/* Create tag Form */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Criar Nova Tag</h4>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Ex: Aluna VIP, Proposta Enviada..."
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-[#0A192F] focus:border-[#0A192F] bg-white text-slate-800"
              />
              <button
                onClick={handleAddTag}
                className="bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" /> Criar Tag
              </button>
            </div>

            {/* Colors picker */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Escolha uma Cor:</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setCor(color)}
                    style={{ backgroundColor: color }}
                    className={`w-6 h-6 rounded-full border border-slate-250 transition-transform ${
                      cor === color ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-105'
                    }`}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* List existing tags */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tags Existentes ({tagsList.length})</h4>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {tagsList.map((tag: any) => {
                const isEditing = editingId === tag.id;

                return (
                  <div key={tag.id} className="flex items-center justify-between p-3 bg-white border border-slate-150 rounded-xl hover:bg-slate-50/55 transition">
                    {isEditing ? (
                      <div className="flex flex-col gap-2 w-full">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingNome}
                            onChange={e => setEditingNome(e.target.value)}
                            className="flex-1 text-xs border border-slate-300 rounded px-2 py-1 text-slate-800"
                          />
                          <button
                            onClick={() => handleSaveEdit(tag.id)}
                            className="p-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] flex items-center gap-0.5"
                          >
                            <Check className="w-3.5 h-3.5" /> Salvar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-bold text-[10px]"
                          >
                            Cancelar
                          </button>
                        </div>
                        {/* Selector for edit color */}
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {PRESET_COLORS.map(color => (
                            <button
                              key={color}
                              onClick={() => setEditingCor(color)}
                              style={{ backgroundColor: color }}
                              className={`w-5 h-5 rounded-full border border-slate-200 ${
                                editingCor === color ? 'ring-2 ring-offset-1 ring-slate-800' : ''
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5">
                          <span
                            style={{ backgroundColor: tag.cor || '#64748B' }}
                            className="px-2.5 py-0.5 rounded text-[10px] font-bold text-white uppercase"
                          >
                            {tag.nome}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{tag.cor}</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartEdit(tag)}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-800 p-1 px-2 hover:bg-slate-100 rounded"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteTag(tag.id, tag.nome)}
                            className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {tagsList.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400 italic">
                  Nenhuma tag personalizada cadastrada.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-bold transition"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
}
