import React, { useState } from 'react';
import { useStore } from '../../store';
import { Tag } from '../../types';
import { Plus, Trash2, Tag as TagIcon } from 'lucide-react';
import { logAuditEvent } from '../../lib/audit';

export function TagManagerModule() {
  const { data, addSingleDocument, deleteSingleDocument } = useStore();
  const tags: Tag[] = data.tags_personalizaveis || [];
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#D4AF37');

  const handleAddTag = async () => {
    if (!newTagName) return;
    const tagId = `tag-${Math.random().toString(36).substring(2, 9)}`;
    await addSingleDocument('tags_personalizaveis', {
      id: tagId,
      name: newTagName,
      color: newTagColor
    });
    try {
      await logAuditEvent('cadastro_tag', tagId, { nome: newTagName, cor: newTagColor, via: 'Módulo de Configuração de Tags' });
    } catch (e) {
      console.error('Erro ao registrar log de auditoria de tag no modulo', e);
    }
    setNewTagName('');
  };

  const handleDeleteTag = async (id: string, name: string) => {
    if (confirm(`Deseja realmente excluir a tag "${name}"? Ela deixará de estar ativa nos registros de Leads, Alunos e Materiais.`)) {
      await deleteSingleDocument('tags_personalizaveis', id);
      try {
        await logAuditEvent('exclusao_tag', id, { nome: name, via: 'Módulo de Configuração de Tags' });
      } catch (e) {
        console.error('Erro ao registrar log de auditoria ao excluir tag no modulo', e);
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Gerenciar Tags</h2>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="Nome da tag"
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
        />
        <input
          type="color"
          value={newTagColor}
          onChange={(e) => setNewTagColor(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer"
        />
        <button onClick={handleAddTag} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-1">
          <Plus size={16} /> Adicionar
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <div key={tag.id} className="px-3 py-1 rounded-full text-sm flex items-center gap-2 border" style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color, color: tag.color }}>
            <TagIcon size={14} />
            {tag.name}
            <button onClick={() => handleDeleteTag(tag.id, tag.name)} className="text-slate-500 hover:text-red-500">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
