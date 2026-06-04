import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store';
import { 
  Search, Users, CheckSquare, Award, BookOpen, MessageSquare, 
  DollarSign, Activity, Eye, ExternalLink, X, HelpCircle, 
  CornerDownRight, Calendar, Bookmark, Briefcase
} from 'lucide-react';
import { cn } from '../lib/utils';

interface GlobalSearchModalProps {
  onClose: () => void;
  setActiveTab: (tab: any) => void;
}

export function GlobalSearchModal({ onClose, setActiveTab }: GlobalSearchModalProps) {
  const { data } = useStore();
  const [term, setTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const pessoas = data.pessoas || [];
  const turmas = data.turmas || [];
  const materiais = data.materiais || [];
  const pagamentos = data.pagamentos || [];
  const tarefasSuporte = data.tarefas_suporte || [];

  // Matcher function safely
  const match = (val: any, q: string) => {
    if (!val) return false;
    return String(val).toLowerCase().includes(q);
  };

  const results = useMemo(() => {
    if (!term.trim() || term.trim().length < 2) return null;
    const query = term.toLowerCase().trim();

    return {
      leads: pessoas.filter(p => 
        p.tipoPessoa === 'lead' && (
          match(p.nome, query) ||
          match(p.email, query) ||
          match(p.telefone, query) ||
          match(p.status, query) ||
          match(p.produtoInteresse, query) ||
          match(p.responsavel, query)
        )
      ),
      alunos: pessoas.filter(p => 
        p.tipoPessoa === 'aluna' && (
          match(p.nome, query) ||
          match(p.email, query) ||
          match(p.telefone, query) ||
          match(p.turma, query) ||
          match(p.produtoComprado, query) ||
          match(p.formacao, query) ||
          match(p.observacoes, query)
        )
      ),
      turmas: turmas.filter(t => 
        match(t.nome, query) || 
        match(t.formacao, query) || 
        match(t.status, query) || 
        match(t.responsavel, query)
      ),
      materiais: materiais.filter(m => 
        match(m.nome ?? m.titulo, query) || 
        match(m.categoria ?? m.tipo, query) || 
        match(m.responsavel, query) ||
        match(m.linkDrive ?? m.link, query)
      ),
      pagamentos: pagamentos.filter(pag => 
        match(pag.aluno, query) || 
        match(pag.formacao, query) || 
        match(pag.status, query) || 
        match(pag.responsavel, query)
      ),
      suporte: tarefasSuporte.filter(t => 
        t.tipo === 'suporte' && (
          match(t.titulo, query) || 
          match(t.descricao, query) || 
          match(t.categoria, query) || 
          match(t.responsavel, query)
        )
      ),
      tarefasInternas: tarefasSuporte.filter(t => 
        t.tipo === 'tarefa' && (
          match(t.titulo, query) || 
          match(t.descricao, query) || 
          match(t.categoria, query) || 
          match(t.responsavel, query) ||
          match(t.prioridade, query)
        )
      )
    };
  }, [term, pessoas, turmas, materiais, pagamentos, tarefasSuporte]);

  // Flattened results for keyboard cursor navigation
  const flatItems = useMemo(() => {
    if (!results) return [];
    const list: any[] = [];
    
    results.leads.forEach(item => list.push({ type: 'lead', id: `lead-${item.id}`, item }));
    results.alunos.forEach(item => list.push({ type: 'aluno', id: `aluno-${item.id}`, item }));
    results.turmas.forEach(item => list.push({ type: 'turma', id: `turma-${item.id}`, item }));
    results.materiais.forEach(item => list.push({ type: 'material', id: `material-${item.id}`, item }));
    results.pagamentos.forEach(item => list.push({ type: 'pagamento', id: `pag-${item.id}`, item }));
    results.suporte.forEach(item => list.push({ type: 'suporte', id: `sup-${item.id}`, item }));
    results.tarefasInternas.forEach(item => list.push({ type: 'tarefa', id: `tar-${item.id}`, item }));

    return list;
  }, [results]);

  // Manage Keyboard Shortcuts inside Modal
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [onClose]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [term]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (flatItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev >= flatItems.length - 1 ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev <= 0 ? flatItems.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < flatItems.length) {
        e.preventDefault();
        triggerRowAction(flatItems[highlightedIndex]);
      }
    }
  };

  const triggerRowAction = (flatRow: any) => {
    onClose();
    const { type, item } = flatRow;

    if (type === 'lead' || type === 'aluno') {
      // Open CRM sheet directly
      window.dispatchEvent(new CustomEvent('open_pessoa_ficha', { detail: item }));
    } else if (type === 'turma') {
      // Redirect to classes/certificates panel
      setActiveTab('certificados');
    } else if (type === 'material') {
      const url = item.linkDrive || item.link;
      if (url) {
        window.open(url, '_blank', 'noreferrer,noopener');
      } else {
        setActiveTab('materiais');
      }
    } else if (type === 'pagamento') {
      // Find person corresponding to the student and open them
      const matched = pessoas.find(p => p.nome && item.aluno && p.nome.toLowerCase().trim() === item.aluno.toLowerCase().trim());
      if (matched) {
        window.dispatchEvent(new CustomEvent('open_pessoa_ficha', { detail: matched }));
      } else {
        setActiveTab('financeiro');
      }
    } else if (type === 'suporte') {
      // Find student and open sheet, or go to Tickets list
      const matched = pessoas.find(p => p.id === item.pessoaId || (p.email && item.email && p.email.toLowerCase() === item.email.toLowerCase()));
      if (matched) {
        window.dispatchEvent(new CustomEvent('open_pessoa_ficha', { detail: matched }));
      } else {
        setActiveTab('alunos');
      }
    } else if (type === 'tarefa') {
      const matched = pessoas.find(p => p.id === item.pessoaId);
      if (matched) {
        window.dispatchEvent(new CustomEvent('open_pessoa_ficha', { detail: matched }));
      } else {
        setActiveTab('prioridades_hoje');
      }
    }
  };

  const totalResultsCount = flatItems.length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-[5vh] md:pt-[10vh] px-4 md:px-0 z-50 animate-in fade-in duration-200">
      
      {/* Search Chest */}
      <div className="bg-white rounded-2xl border border-slate-205 w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh] animate-in zoom-in-95 duration-200" onKeyDown={handleKeyDown}>
        
        {/* Input Bar */}
        <div className="p-4 bg-[#0A192F] flex items-center relative gap-3.5 border-b border-slate-700">
          <Search className="w-6 h-6 text-slate-300 ml-1" />
          <input 
            type="text"
            placeholder="Pesquisa Unificada: Aluna, Lead, Turma, Faturamento, Suporte, Links..."
            value={term}
            onChange={e => setTerm(e.target.value)}
            className="flex-1 w-full text-white bg-transparent border-none outline-none focus:ring-0 placeholder-slate-400 text-sm md:text-base font-medium pr-10"
            autoFocus
          />
          {term && (
            <button 
              onClick={() => setTerm('')} 
              className="absolute right-14 top-4.5 p-1 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button 
            onClick={onClose}
            className="p-1 px-2.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold font-sans uppercase select-none transition"
            title="Fechar pesquisa"
          >
            Esc
          </button>
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {!term.trim() || term.trim().length < 2 ? (
            // Explanatory view when empty
            <div className="py-10 text-center space-y-4 max-w-lg mx-auto">
              <span className="text-3xl">🔍</span>
              <h3 className="font-extrabold text-sm text-slate-800 font-sans tracking-tight uppercase">Busca Instantânea Inteligente</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Digite um nome, e-mail completo, telefone, código de turma, produto de interesse ou status de pagamento. 
                Os resultados serão buscados vivos sobre todas as tabelas operacionais da central.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 select-none">
                {['Leads', 'Alunos', 'Turmas', 'Materiais', 'Pagamentos', 'Suporte', 'Tarefas'].map(m => (
                  <span key={m} className="px-2 py-0.5 bg-slate-100 text-[#1F4E89] border border-slate-200 text-[10px] font-extrabold rounded-lg uppercase tracking-wider">{m}</span>
                ))}
              </div>
            </div>
          ) : totalResultsCount === 0 ? (
            // Empty Matches
            <div className="py-14 text-center space-y-2">
              <span className="text-3xl">❌</span>
              <h3 className="font-bold text-sm text-slate-800 font-sans">Nenhum resultado para "{term}"</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">Tente refinar os termos ou fazer buscas mais genéricas (ex: apenas as primeiras letras do sobrenome).</p>
            </div>
          ) : (
            // Search Categories
            <div className="space-y-6 text-left">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                <span className="text-[11px] font-black uppercase text-slate-450 tracking-wider">Resultados localizados ({totalResultsCount})</span>
                <span className="text-[10px] text-slate-400">Pressione ↑ ↓ e Enter para acelerar o acesso</span>
              </div>

              {/* Grid or Columns list of modules */}
              <div className="space-y-4">
                
                {/* 1. LEADS COOPERATIVE */}
                {results!.leads.length > 0 && (
                  <Section category="Leads comerciais" icon={<Briefcase className="w-4 h-4 text-orange-600" />}>
                    {results!.leads.map((item, idx) => {
                      const flatIndex = flatItems.findIndex(f => f.id === `lead-${item.id}`);
                      const isSelected = highlightedIndex === flatIndex;
                      return (
                        <div 
                          key={item.id}
                          onClick={() => triggerRowAction({ type: 'lead', item })}
                          className={cn(
                            "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-slate-850",
                            isSelected ? "bg-amber-50/55 border-[#D4AF37] ring-2 ring-[#D4AF37]/20" : "bg-slate-50/40 border-slate-100 hover:bg-slate-50"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-slate-900 truncate">{item.nome}</span>
                              <span className="text-[9px] font-extrabold bg-orange-100 text-orange-850 uppercase px-2 rounded-full tracking-wider">{item.status || 'novo'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">{item.email} • {item.telefone || 'Sem fone'}</div>
                            <div className="text-[9px] text-slate-400 mt-1 font-semibold">Interesse: <strong className="text-slate-600">{item.produtoInteresse || 'Sem produto'}</strong> • SDR: <strong className="text-slate-600">{item.responsavel || 'Mara'}</strong></div>
                          </div>
                          <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                      )
                    })}
                  </Section>
                )}

                {/* 2. ALUNOS */}
                {results!.alunos.length > 0 && (
                  <Section category="Alunos Registrados" icon={<Users className="w-4 h-4 text-emerald-600" />}>
                    {results!.alunos.map((item) => {
                      const flatIndex = flatItems.findIndex(f => f.id === `aluno-${item.id}`);
                      const isSelected = highlightedIndex === flatIndex;
                      return (
                        <div 
                          key={item.id}
                          onClick={() => triggerRowAction({ type: 'aluno', item })}
                          className={cn(
                            "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-slate-850",
                            isSelected ? "bg-amber-50/55 border-[#D4AF37] ring-2 ring-[#D4AF37]/20" : "bg-slate-50/40 border-slate-100 hover:bg-slate-50"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-slate-900 truncate">{item.nome}</span>
                              <span className="text-[9px] font-extrabold bg-emerald-105 text-emerald-850 uppercase px-2 rounded-full tracking-wider">{item.turma || 'Turma Ativa'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate mt-0.5">{item.email} • {item.telefone || 'Sem fone'}</div>
                            <div className="text-[9px] text-slate-400 mt-1 font-semibold">Formação: <strong className="text-slate-600">{item.produtoComprado || item.formacao || 'Combo'}</strong> • Acesso: <strong className="text-slate-600 font-mono uppercase">{item.statusAcesso || 'Ativo'}</strong></div>
                          </div>
                          <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                      )
                    })}
                  </Section>
                )}

                {/* 3. TURMAS */}
                {results!.turmas.length > 0 && (
                  <Section category="Turmas / Calendário" icon={<Calendar className="w-4 h-4 text-indigo-600" />}>
                    {results!.turmas.map((item) => {
                      const flatIndex = flatItems.findIndex(f => f.id === `turma-${item.id}`);
                      const isSelected = highlightedIndex === flatIndex;
                      return (
                        <div 
                          key={item.id}
                          onClick={() => triggerRowAction({ type: 'turma', item })}
                          className={cn(
                            "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-slate-850",
                            isSelected ? "bg-amber-50/55 border-[#D4AF37] ring-2 ring-[#D4AF37]/20" : "bg-slate-50/40 border-slate-100 hover:bg-slate-50"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-slate-900 block truncate">{item.nome}</span>
                            <div className="text-[10px] text-slate-500 mt-0.5">Formação integrada: {item.formacao}</div>
                            <div className="text-[9px] text-slate-400 mt-1 uppercase font-extrabold tracking-wider">Docentes / SDR: {item.responsavel || 'Equipe'} • Status: <span className="text-[#1F4E89]">{item.status || 'planejada'}</span></div>
                          </div>
                          <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                      )
                    })}
                  </Section>
                )}

                {/* 4. MATERIAIS */}
                {results!.materiais.length > 0 && (
                  <Section category="Acervo & Materiais de Apoio" icon={<BookOpen className="w-4 h-4 text-teal-600" />}>
                    {results!.materiais.map((item) => {
                      const flatIndex = flatItems.findIndex(f => f.id === `material-${item.id}`);
                      const isSelected = highlightedIndex === flatIndex;
                      return (
                        <div 
                          key={item.id}
                          onClick={() => triggerRowAction({ type: 'material', item })}
                          className={cn(
                            "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-slate-850",
                            isSelected ? "bg-amber-50/55 border-[#D4AF37] ring-2 ring-[#D4AF37]/20" : "bg-slate-50/40 border-slate-100 hover:bg-slate-50"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-slate-900 block truncate">{item.nome ?? item.titulo}</span>
                            <div className="text-[10px] text-slate-500 mt-0.5">Categoria / Formato: {item.categoria ?? item.tipo} • Resp: {item.responsavel || 'Núria'}</div>
                            <span className="text-[8px] bg-slate-100 text-[#1F4E89] px-1.5 py-0.2 rounded font-black uppercase mt-1 inline-block tracking-wider">
                              {item.linkDrive || item.link ? 'Recurso Externo Disponível' : 'Doc Interno'}
                            </span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                      )
                    })}
                  </Section>
                )}

                {/* 5. PAGAMENTOS */}
                {results!.pagamentos.length > 0 && (
                  <Section category="Faturamento & Parcelas" icon={<DollarSign className="w-4 h-4 text-[#D4AF37]" />}>
                    {results!.pagamentos.map((item) => {
                      const flatIndex = flatItems.findIndex(f => f.id === `pag-${item.id}`);
                      const isSelected = highlightedIndex === flatIndex;
                      const valueFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorCombinado || 0);
                      return (
                        <div 
                          key={item.id}
                          onClick={() => triggerRowAction({ type: 'pagamento', item })}
                          className={cn(
                            "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-slate-850",
                            isSelected ? "bg-amber-50/55 border-[#D4AF37] ring-2 ring-[#D4AF37]/20" : "bg-slate-50/40 border-slate-100 hover:bg-slate-50"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-slate-900 block truncate">Aluno/Sacado: {item.aluno}</span>
                            <div className="text-[10px] text-slate-500 mt-0.5">Mapeamento: {item.formacao} • Responsável: {item.responsavel || 'Financeiro'}</div>
                            <div className="text-[9px] text-slate-400 mt-1 font-bold">Valor: <strong className="text-slate-700">{valueFormatted}</strong> • Status: <strong className="uppercase text-[#1F4E89]">{item.status}</strong> • Vencimento: <strong>{item.vencimento?.split('-').reverse().join('/') || 'À vista'}</strong></div>
                          </div>
                          <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                      )
                    })}
                  </Section>
                )}

                {/* 6. SUPORTE */}
                {results!.suporte.length > 0 && (
                  <Section category="Chamados de Suporte" icon={<HelpCircle className="w-4 h-4 text-blue-600" />}>
                    {results!.suporte.map((item) => {
                      const flatIndex = flatItems.findIndex(f => f.id === `sup-${item.id}`);
                      const isSelected = highlightedIndex === flatIndex;
                      return (
                        <div 
                          key={item.id}
                          onClick={() => triggerRowAction({ type: 'suporte', item })}
                          className={cn(
                            "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-slate-850",
                            isSelected ? "bg-amber-50/55 border-[#D4AF37] ring-2 ring-[#D4AF37]/20" : "bg-slate-50/40 border-slate-100 hover:bg-slate-50"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-slate-900 block truncate">{item.titulo}</span>
                            {item.descricao && <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{item.descricao}</p>}
                            <div className="text-[9px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">Cód / Categoria: {item.categoria} • Status: <span className="text-[#1F4E89]">{item.status}</span> • Operador: {item.responsavel || 'Equipe'}</div>
                          </div>
                          <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                      )
                    })}
                  </Section>
                )}

                {/* 7. TAREFAS INTERNAS */}
                {results!.tarefasInternas.length > 0 && (
                  <Section category="Tarefas Internas de Operação" icon={<CheckSquare className="w-4 h-4 text-purple-600" />}>
                    {results!.tarefasInternas.map((item) => {
                      const flatIndex = flatItems.findIndex(f => f.id === `tar-${item.id}`);
                      const isSelected = highlightedIndex === flatIndex;
                      return (
                        <div 
                          key={item.id}
                          onClick={() => triggerRowAction({ type: 'tarefa', item })}
                          className={cn(
                            "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-slate-850",
                            isSelected ? "bg-amber-50/55 border-[#D4AF37] ring-2 ring-[#D4AF37]/20" : "bg-slate-50/40 border-slate-100 hover:bg-slate-50"
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-slate-900 block truncate">{item.titulo}</span>
                            {item.descricao && <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{item.descricao}</p>}
                            <div className="text-[9px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">Prazo: {item.prazo?.split('-').reverse().join('/') || 'Sem prazo'} • Prio: <span className="text-[#D4AF37]">{item.prioridade || 'Média'}</span> • Status: <span className="text-[#1F4E89]">{item.status}</span> • Resp: {item.responsavel || 'Nuria'}</div>
                          </div>
                          <Eye className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                      )
                    })}
                  </Section>
                )}

              </div>
            </div>
          )}
        </div>

        {/* Footer Guidance */}
        <div className="p-3 bg-slate-50 text-center border-t border-slate-150 text-[10px] text-slate-450 select-none">
          Use a tecla <strong className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">ESC</strong> para fechar. Navegue nos resultados com as setas <strong className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">↑ ↓</strong> do seu teclado de operador.
        </div>

      </div>
    </div>
  );
}

// Visual Wrapper Section for Grouping Search Matches
function Section({ category, icon, children }: { category: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2 border border-slate-200/40 p-4 rounded-2xl bg-white shadow-2xs">
      <div className="flex items-center gap-1.5 text-slate-850 font-bold text-xs uppercase tracking-wider pb-1.5 border-b border-stone-50 select-none">
        {icon}
        <span>{category}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1.5">
        {children}
      </div>
    </div>
  );
}
