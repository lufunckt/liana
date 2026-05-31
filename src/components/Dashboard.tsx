import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Briefcase, MessageSquare, Sparkles, Trash2, Pin, CheckSquare, 
  Send, User, AlertTriangle, Lightbulb, Check, Plus, Loader2 
} from 'lucide-react';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { data, updateModuleData } = useStore();
  const tarefas = data.tarefas_suporte || [];

  // Team Profiles
  const profiles = [
    { 
      id: 'liana', 
      name: 'Liana Gomes', 
      role: 'Fundadora & Diretora Geral', 
      foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300',
      description: 'Diretoria Executiva, Estratégia Corporativa & Delegar Tarefas',
      pills: 'Direção Geral',
      color: 'border-[#D4AF37]/40 hover:border-[#D4AF37]',
      glow: 'shadow-[#D4AF37]/5'
    },
    { 
      id: 'ana', 
      name: 'Ana', 
      role: 'Head de Negócios & Comercial', 
      foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300&h=300',
      description: 'Gestão comercial, CRM, Leads quentes & Faturamento',
      pills: 'Comercial & Vendas',
      color: 'border-orange-500/30 hover:border-orange-500',
      glow: 'shadow-orange-500/5'
    },
    { 
      id: 'nuria', 
      name: 'Núria', 
      role: 'Client Success, Mídias & Operação', 
      foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300',
      description: 'Onboarding de alunas, Nutror, MRP Tracker & Redes sociais',
      pills: 'Sucesso & Midia',
      color: 'border-emerald-500/30 hover:border-emerald-500',
      glow: 'shadow-emerald-500/5'
    },
    { 
      id: 'luiza', 
      name: 'Luiza', 
      role: 'Tech Lead / Administradora', 
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300',
      description: 'Manutenção do Portal, Logs de segurança & LinkedIn pautas',
      pills: 'Tech & Admin',
      color: 'border-indigo-500/30 hover:border-indigo-500',
      glow: 'shadow-indigo-500/5'
    }
  ];

  // Filter Mural items from generic database tarefas_suporte
  const recados = tarefas.filter(t => t.tipo === 'mural_recado');
  const muralTarefas = tarefas.filter(t => t.categoria === 'mural_tarefa');

  // Input States for Manual Adding
  const [newRecado, setNewRecado] = useState('');
  const [newRecadoColor, setNewRecadoColor] = useState('yellow'); // yellow, blue, pink, green
  
  const [newTarefaTitle, setNewTarefaTitle] = useState('');
  const [newTarefaResponsavel, setNewTarefaResponsavel] = useState('Geral');
  const [newTarefaPrioridade, setNewTarefaPrioridade] = useState('média');

  // IA Diagnostics Inputs
  const [aiInputText, setAiInputText] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  // Local Storage workspace action
  const handleSelectWorkspace = (profileId: string) => {
    localStorage.setItem('ilg_selected_profile', profileId);
    // Switch to spaces tab dynamically
    window.dispatchEvent(new CustomEvent('change_active_tab', { detail: 'espacos' }));
    // Wait slightly and refresh page so layouts and store get completely syncd for the active profile
    setTimeout(() => {
      window.location.reload();
    }, 120);
  };

  const handleAccessComunicacaoInterna = () => {
    window.dispatchEvent(new CustomEvent('change_active_tab', { detail: 'comunicacao_interna' }));
  };

  // Insert a new manual notice
  const handleAddManualRecado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecado.trim()) return;

    const newItem = {
      id: 'mural_recado_' + Date.now(),
      titulo: newRecado,
      descricao: newRecadoColor, // encode sticky color here
      tipo: 'mural_recado',
      categoria: 'mural_recado',
      status: 'ativo',
      responsavel: 'Geral',
      prioridade: 'média',
      prazo: ''
    };

    const updated = [...tarefas, newItem];
    await updateModuleData('tarefas_suporte', updated);
    setNewRecado('');
  };

  // Add a new mural task manually
  const handleAddManualMuralTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTarefaTitle.trim()) return;

    const newItem = {
      id: 'mural_tarefa_' + Date.now(),
      titulo: newTarefaTitle,
      descricao: 'Adicionada manualmente no Mural Coletivo.',
      tipo: 'tarefa',
      categoria: 'mural_tarefa',
      status: 'a fazer',
      responsavel: newTarefaResponsavel,
      prioridade: newTarefaPrioridade,
      prazo: new Date().toISOString().split('T')[0]
    };

    const updated = [...tarefas, newItem];
    await updateModuleData('tarefas_suporte', updated);
    setNewTarefaTitle('');
  };

  // Complete a mural task
  const handleToggleMuralTarefa = async (id: string, currentStatus: string) => {
    const updated = tarefas.map(t => {
      if (t.id === id) {
        return { ...t, status: currentStatus === 'concluído' ? 'a fazer' : 'concluído' };
      }
      return t;
    });
    await updateModuleData('tarefas_suporte', updated);
  };

  // Delete any mural item
  const handleDeleteMuralItem = async (id: string) => {
    const updated = tarefas.filter(t => t.id !== id);
    await updateModuleData('tarefas_suporte', updated);
  };

  // IA Generator Trigger
  const handleAiDiagnosticMuralGeneration = async () => {
    if (!aiInputText.trim()) {
      setAiError('Por favor, informe alguma pauta, áudio transcrito ou notas de diálogos.');
      return;
    }

    setIsAiGenerating(true);
    setAiError('');

    try {
      const response = await fetch('/api/diagnostico-mural', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ texto: aiInputText })
      });

      if (!response.ok) {
        const errBody = await response.json();
        throw new Error(errBody.error || 'Falha ao processar resumo com IA.');
      }

      const generated = await response.json();

      let itemsToAdd: any[] = [];

      // Map recados
      if (Array.isArray(generated.recados)) {
        generated.recados.forEach((rec: string, idx: number) => {
          itemsToAdd.push({
            id: 'mural_recado_ai_' + Date.now() + '_' + idx,
            titulo: rec,
            descricao: 'yellow', // Default safe post-it color
            tipo: 'mural_recado',
            categoria: 'mural_recado',
            status: 'ativo',
            responsavel: 'Geral',
            prioridade: 'média',
            prazo: ''
          });
        });
      }

      // Map tarefas
      if (Array.isArray(generated.tarefas)) {
        generated.tarefas.forEach((task: any, idx: number) => {
          itemsToAdd.push({
            id: 'mural_tarefa_ai_' + Date.now() + '_' + idx,
            titulo: task.titulo,
            descricao: 'Gerada automaticamente por inteligência artificial através de diagnósticos de pautas.',
            tipo: 'tarefa',
            categoria: 'mural_tarefa',
            status: 'a fazer',
            responsavel: task.responsavel || 'Geral',
            prioridade: task.prioridade || 'média',
            prazo: new Date().toISOString().split('T')[0]
          });
        });
      }

      if (itemsToAdd.length === 0) {
        throw new Error('A inteligência artificial não identificou itens ou tarefas acionáveis neste texto. Tente detalhar um pouco mais.');
      }

      const updated = [...tarefas, ...itemsToAdd];
      await updateModuleData('tarefas_suporte', updated);
      
      setAiInputText('');
      alert(`Mural atualizado com sucesso via Inteligência Artificial! Foram adicionadas ${itemsToAdd.length} novas notas coletivas.`);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Houve um erro de comunicação ou processamento no servidor de inteligência artificial.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const getPostItBg = (color: string) => {
    switch(color) {
      case 'blue': return 'bg-cyan-100/90 text-cyan-900 border-cyan-200 hover:rotate-1';
      case 'pink': return 'bg-rose-100/90 text-rose-900 border-rose-200 hover:-rotate-1';
      case 'green': return 'bg-emerald-100 text-emerald-950 border-emerald-200 hover:rotate-1';
      default: return 'bg-amber-100 text-amber-950 border-amber-200 hover:-rotate-1';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Title & Layout Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0A192F]">Painel de Controle</h1>
        <p className="text-slate-500 mt-2">Seja bem-vinda de volta ao Instituto Liana Gomes. Monitore as pautas e gerencie os espaços de trabalho.</p>
      </div>

      {/* Profile Space Cards Area (Botão de Perfil - Espaço de Trabalho de cada uma) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="text-lg font-bold text-[#0A192F] tracking-tight">Espaços de Trabalho da Equipe</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {profiles.map((p) => (
            <div
              key={p.id}
              onClick={() => handleSelectWorkspace(p.id)}
              className={cn(
                "bg-white rounded-2xl p-5 border cursor-pointer hover:-translate-y-1.5 transition-all duration-305 flex flex-col justify-between group shadow-lg hover:shadow-xl",
                p.color, p.glow
              )}
            >
              <div>
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-14 h-14 rounded-full p-0.5 bg-slate-100 shrink-0 overflow-hidden border border-slate-200 group-hover:scale-105 transition-transform">
                    <img 
                      src={p.foto} 
                      alt={p.name} 
                      className="w-full h-full rounded-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-slate-900 group-hover:text-[#1D4E89] transition-colors leading-tight">{p.name}</h3>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-0.5 tracking-wider">{p.pills}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">{p.description}</p>
              </div>
              
              <button className="w-full text-center text-xs font-bold py-2 px-3 bg-slate-50 text-[#0A192F] group-hover:bg-[#0A192F] group-hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200/60 shadow-xs">
                Acessar Mesa
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Communication Quick Action Area */}
      <div className="bg-gradient-to-r from-[#0A192F] to-[#1D4E89] text-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(10,25,47,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded text-[9px] font-extrabold uppercase tracking-widest text-[#D4AF37]">Mural do Time</span>
            <h3 className="text-lg font-bold">Comunicação Interna de Equipe</h3>
          </div>
          <p className="text-slate-300 text-xs md:text-sm">Envie circulares, atualizações rápidas, avisos do escritório e pautas corporativas em tempo real para todo o Instituto.</p>
        </div>
        <button
          onClick={handleAccessComunicacaoInterna}
          className="bg-[#D4AF37] hover:bg-white text-slate-950 font-extrabold text-xs tracking-wider py-3 px-5 rounded-xl transition-all self-start md:self-auto flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          Acessar Comunicação Interna
        </button>
      </div>

      {/* Coletive Mural (Recados & Chores & IA Generator Engine) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sticky Notices Board (Quadro de Recados Post-its) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-extrabold text-[#0A192F] flex items-center gap-2">
              <Pin className="w-5 h-5 text-amber-500" />
              Quadro de Avisos Coletivo
            </h3>
            <span className="text-[11px] bg-slate-100 border border-slate-200 shadow-xs text-slate-600 px-2 py-0.5 rounded font-extrabold uppercase">
              {recados.length} post-its
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recados.map((rec) => (
              <div 
                key={rec.id}
                className={cn(
                  "p-5 rounded-xl border border-dashed shadow-sm transition-all relative flex flex-col justify-between group",
                  getPostItBg(rec.descricao || 'yellow')
                )}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <Pin className="w-4 h-4 text-amber-500/80 rotate-12" />
                    <button
                      onClick={() => handleDeleteMuralItem(rec.id)}
                      className="opacity-0 group-hover:opacity-100 text-rose-700 hover:text-rose-900 transition-opacity p-0.5 rounded hover:bg-rose-50 cursor-pointer"
                      title="Excluir do mural"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed tracking-tight break-words pr-2">
                    {rec.titulo}
                  </p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-300/30 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-bold uppercase tracking-wider">Aviso Equipe</span>
                  <span>Mural Geral</span>
                </div>
              </div>
            ))}
            
            {recados.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <Lightbulb className="w-8 h-8 text-slate-350 mb-2" />
                <p className="text-xs font-semibold">Sem post-its ou avisos rápidos fixados.</p>
              </div>
            )}
          </div>

          {/* Manual Add Sticky Note form */}
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm text-left">
            <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-2">Fixar novo Post-It no Mural</h4>
            <form onSubmit={handleAddManualRecado} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text"
                placeholder="Ex e.g. Reunião extraordinária hoje às 16h no Zoom"
                required
                maxLength={180}
                value={newRecado}
                onChange={e => setNewRecado(e.target.value)}
                className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] text-slate-850"
              />
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-1.5">
                  {(['yellow', 'blue', 'pink', 'green'] as const).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewRecadoColor(col)}
                      className={cn(
                        "w-5 h-5 rounded-full border-2 transition-all cursor-pointer shrink-0",
                        col === 'yellow' && "bg-amber-100 border-amber-300",
                        col === 'blue' && "bg-cyan-150 border-cyan-400",
                        col === 'pink' && "bg-rose-100 border-rose-300",
                        col === 'green' && "bg-emerald-100 border-emerald-300",
                        newRecadoColor === col ? "scale-110 border-slate-800 ring-2 ring-slate-400/30" : "scale-100"
                      )}
                      title={`Cor ${col}`}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="bg-[#0A192F] hover:bg-[#D4AF37] px-4 py-2 rounded-lg font-bold text-xs text-white hover:text-[#0A192F] transition flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Fixar
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Coletive Duties Board (Lista de Focos e Tarefas) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-extrabold text-[#0A192F] flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#D4AF37]" />
              Foco & Demandas Coletivas
            </h3>
            <span className="text-[11px] bg-[#0A192F]/10 border border-[#0A192F]/10 text-[#0A192F] px-2 py-0.5 rounded font-extrabold uppercase">
              {muralTarefas.length} pendentes
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-3 max-h-[420px] overflow-y-auto">
            {muralTarefas.map((t) => (
              <div 
                key={t.id} 
                className={cn(
                  "p-3 rounded-lg border flex items-center justify-between gap-3 transition-colors text-left",
                  t.status === 'concluído' 
                    ? 'bg-slate-50/70 border-slate-200/60 opacity-60' 
                    : 'bg-white border-slate-100 hover:border-[#1D4E89]/20'
                )}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <button
                    onClick={() => handleToggleMuralTarefa(t.id, t.status || '')}
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 mt-0.5 cursor-pointer",
                      t.status === 'concluído' 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'border-slate-300 hover:border-slate-500 bg-white'
                    )}
                  >
                    {t.status === 'concluído' && <Check className="w-3 h-3" />}
                  </button>
                  <div className="min-w-0">
                    <p className={cn(
                      "text-xs font-bold leading-tight truncate",
                      t.status === 'concluído' ? 'line-through text-slate-400' : 'text-slate-800'
                    )}>
                      {t.titulo}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-semibold">
                      <span className={cn(
                        "px-1.5 py-0.2 rounded text-[8px] uppercase font-black",
                        t.prioridade === 'alta' ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-650'
                      )}>
                        {t.prioridade}
                      </span>
                      <span>• Resp: <strong>{t.responsavel}</strong></span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteMuralItem(t.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  title="Apagar pauta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {muralTarefas.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs">Não há tarefas de mural pendentes.</p>
              </div>
            )}
          </div>

          {/* Quick manual Task adding */}
          <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-sm text-left">
            <h4 className="text-xs font-bold text-[#0A192F] uppercase tracking-wider mb-2">Adicionar Tarefa ao Mural</h4>
            <form onSubmit={handleAddManualMuralTarefa} className="space-y-3">
              <input 
                type="text" 
                placeholder="Ex e.g. Disparar e-mail boas-vindas para nova turma"
                required
                value={newTarefaTitle}
                onChange={e => setNewTarefaTitle(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#1F4E89] text-slate-850"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newTarefaResponsavel}
                  onChange={e => setNewTarefaResponsavel(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="Geral">Time Geral</option>
                  <option value="Liana">Liana</option>
                  <option value="Ana">Ana</option>
                  <option value="Nuria">Núria</option>
                  <option value="Luiza">Luiza</option>
                </select>
                <select
                  value={newTarefaPrioridade}
                  onChange={e => setNewTarefaPrioridade(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="alta">Alta 🔥</option>
                  <option value="média">Média ⚡</option>
                  <option value="baixa">Baixa 🍃</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-[#0A192F] hover:bg-[#D4AF37] hover:text-[#0A192F] text-white font-bold py-2 rounded-lg text-xs transition"
              >
                + Adicionar Tarefa
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* IA Mural Auto Generation section */}
      <div className="bg-stone-50 border border-slate-200/80 p-6 rounded-2xl text-left">
        <h3 className="text-lg font-extrabold text-[#0A192F] flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          Mural Inteligente: Gerador Automático por Consultor IA
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Cole abaixo as discussões de reuniões, sumários transcritos, diálogos, áudios do WhatsApp transcritos ou rascunhos de reuniões corporativas. Nossa inteligência artificial (Gemini) irá decifrar as informações, definindo automaticamente tarefas prioritárias delegadas para cada membro da equipe e resumos no quadro de avisos.
        </p>

        <div className="space-y-4">
          <textarea
            value={aiInputText}
            onChange={e => setAiInputText(e.target.value)}
            rows={4}
            placeholder="Ex e.g. Tivemos uma reunião rápida hoje. Liana solicitou que se envie o e-mail boas vindas com link da planilha para todas as alunas da nova turma, já Núria necessita aprovar a postagem do Instagram de Compliance de Gênero para quinta-feira e Ana precisa fazer follow up no lead quente do combo hoje porque eles estão aguardando o link de pagamento..."
            className="w-full font-sans text-xs border border-slate-300 rounded-xl p-3 outline-none focus:border-[#1F4E89] text-slate-850 leading-relaxed bg-white"
          />

          {aiError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {aiError}
            </div>
          )}

          <button
            onClick={handleAiDiagnosticMuralGeneration}
            disabled={isAiGenerating}
            className="bg-[#0A192F] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A192F] disabled:opacity-50 disabled:hover:bg-[#0A192F] disabled:hover:text-[#D4AF37] border-2 border-[#D4AF37] font-bold text-xs tracking-wider py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            {isAiGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                Extraindo pautas com Inteligência Artificial...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 shrink-0" />
                Alimentar Mural pelo Gemini (IA) ✨
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
