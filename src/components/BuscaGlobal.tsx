import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { 
  Search, Users, CheckSquare, Award, BookOpen, MessageSquare, 
  MapPin, Eye, ExternalLink, ArrowRight, UserCheck 
} from 'lucide-react';

export function BuscaGlobal() {
  const { data } = useStore();
  const pessoas = data.pessoas || [];
  const tarefas = data.tarefas_suporte || [];
  const materiais = data.materiais || [];

  const [term, setTerm] = useState('');

  // Read certificates from localStorage to enable search across certificates
  const certificates = useMemo(() => {
    const saved = localStorage.getItem('ilg_cert_issued');
    if (saved) {
      try { return JSON.parse(saved) as any[]; } catch(e) {}
    }
    return [];
  }, []);

  const results = useMemo(() => {
    if (!term.trim() || term.length < 2) return null;

    const query = term.toLowerCase();

    // Group matching results
    return {
      pessoas: pessoas.filter(p => 
        p.nome?.toLowerCase().includes(query) ||
        p.email?.toLowerCase().includes(query) ||
        p.telefone?.toLowerCase().includes(query) ||
        p.tipoPessoa?.toLowerCase().includes(query) ||
        p.status?.toLowerCase().includes(query) ||
        p.produtoInteresse?.toLowerCase().includes(query) ||
        p.produtoComprado?.toLowerCase().includes(query) ||
        p.turma?.toLowerCase().includes(query)
      ),
      tarefas: tarefas.filter(t => 
        t.titulo?.toLowerCase().includes(query) ||
        t.descricao?.toLowerCase().includes(query) ||
        t.responsavel?.toLowerCase().includes(query) ||
        t.categoria?.toLowerCase().includes(query) ||
        t.tipo?.toLowerCase().includes(query)
      ),
      materiais: materiais.filter(m => 
        m.titulo?.toLowerCase().includes(query) ||
        m.descricao?.toLowerCase().includes(query) ||
        m.tipo?.toLowerCase().includes(query) ||
        m.url?.toLowerCase().includes(query)
      ),
      certificados: certificates.filter(c => 
        c.nomeAluno?.toLowerCase().includes(query) ||
        c.nomeFormacao?.toLowerCase().includes(query) ||
        c.turma?.toLowerCase().includes(query) ||
        c.id?.toLowerCase().includes(query)
      )
    };
  }, [term, pessoas, tarefas, materiais, certificates]);

  const handleOpenFicha = (p: any) => {
    window.dispatchEvent(new CustomEvent('open_pessoa_ficha', { detail: p }));
  };

  const hasAnyResults = results 
    ? (results.pessoas.length > 0 || results.tarefas.length > 0 || results.materiais.length > 0 || results.certificados.length > 0)
    : false;

  return (
    <div className="space-y-6 animate-in fade-in duration-305 text-left pb-16">
      
      {/* Header */}
      <div>
        <span className="p-1 px-2 bg-indigo-50 text-indigo-805 text-xs font-black uppercase rounded tracking-widest border border-indigo-200">Pesquisa Unificada</span>
        <h1 className="text-2xl font-extrabold text-[#0A192F] tracking-tight mt-1.5">Busca Global Centrada</h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1">Localize instantaneamente qualquer cadastro de aluna, lead, tarefa, certificado ou recurso estratégico em qualquer tabela.</p>
      </div>

      {/* Large search input layout */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <label className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">O que você está procurando?</label>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-6 w-6 text-slate-400" />
          <input
            type="text"
            placeholder="Digite o nome, e-mail, telefone, código de certificado, produto, tarefa..."
            value={term}
            onChange={e => setTerm(e.target.value)}
            className="pl-12 pr-4 w-full border border-slate-300 rounded-2xl py-3 text-sm md:text-base outline-none focus:border-[#1F4E89] text-slate-800 bg-stone-50/20 shadow-inner"
            autoFocus
          />
        </div>
        
        {term.trim().length > 0 && term.trim().length < 2 && (
          <p className="text-xs text-slate-400 italic">Digite pelo menos 2 caracteres para iniciar a busca...</p>
        )}
      </div>

      {/* Results View */}
      {results && (
        <div className="space-y-6">
          {!hasAnyResults ? (
            <div className="py-16 text-center text-slate-400 border border-dashed rounded-2xl bg-white bg-slate-50/50">
              <span className="text-3xl select-none">🔍</span>
              <p className="text-xs font-bold mt-2 text-slate-700">Nenhum registro corresponde a "{term}"</p>
              <p className="text-[10px] text-slate-500 mt-1">Verifique a ortografia ou tente termos mais genéricos (ex: nome parcial).</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CATEGORY 1: PESSOAS (LEADS / ALUNAS) */}
              {results.pessoas.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 md:col-span-2">
                  <h3 className="text-xs font-bold uppercase text-[#0A192F] tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5 text-slate-650">
                    <Users className="w-4.5 h-4.5 text-indigo-650" />
                    <span>Cadastros & Clientes encontrados ({results.pessoas.length})</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.pessoas.map((p) => {
                      const isAluna = p.tipoPessoa === 'aluna' || p.status === 'comprou';
                      return (
                        <div key={p.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-slate-50 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className={`text-[8px] px-1.5 py-0.2 rounded font-black tracking-wider uppercase ${isAluna ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{p.tipoPessoa || 'lead'}</span>
                            <div className="font-bold text-slate-800 mt-1 truncate">{p.nome}</div>
                            <div className="text-[11px] text-slate-500 truncate">{p.email} • {p.telefone || 'Sem fone'}</div>
                            <div className="text-[10px] text-slate-400 mt-1 truncate">Status: <strong className="uppercase">{p.status}</strong> • SDR: <strong>{p.responsavel}</strong></div>
                          </div>

                          <button
                            onClick={() => handleOpenFicha(p)}
                            className="p-1.5 bg-white hover:bg-[#0A192F] text-slate-700 hover:text-white rounded-lg border border-slate-200 transition shrink-0 flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" /> Ficha
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CATEGORY 2: TAREFAS / TICKETS */}
              {results.tarefas.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase text-[#0A192F] tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-4.5 h-4.5 text-[#D4AF37]" />
                    <span>Demandas & Suportes ({results.tarefas.length})</span>
                  </h3>

                  <div className="space-y-2.5">
                    {results.tarefas.map((t) => (
                      <div key={t.id} className="p-3 bg-[#FCFBF9] border border-slate-150 rounded-lg text-slate-850">
                        <span className="text-[8px] bg-[#0A192F]/10 px-1.5 py-0.2 rounded text-[#0A192F] uppercase font-black">{t.tipo}</span>
                        <div className="font-bold text-xs text-slate-800 mt-1">{t.titulo}</div>
                        {t.descricao && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{t.descricao}</p>}
                        <div className="text-[10px] text-slate-400 mt-2 font-semibold">Responsável: <strong>{t.responsavel}</strong> • Status: <span className="uppercase">{t.status}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CATEGORY 3: CERTIFICADOS EMITIDOS */}
              {results.certificados.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase text-[#0A192F] tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <Award className="w-4.5 h-4.5 text-amber-500" />
                    <span>Certificados Emitidos ({results.certificados.length})</span>
                  </h3>

                  <div className="space-y-2.5">
                    {results.certificados.map((c) => (
                      <div key={c.id} className="p-3 bg-indigo-50/30 border border-indigo-150 rounded-lg text-slate-850">
                        <div className="font-bold text-xs text-indigo-950">{c.nomeAluno}</div>
                        <p className="text-[11px] text-slate-600 font-medium mt-0.5">{c.nomeFormacao} • {c.turma}</p>
                        <p className="text-[9px] text-slate-400 mt-1 italic font-mono uppercase">Autenticidade: {c.id}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CATEGORY 4: MATERIAIS */}
              {results.materiais.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 md:col-span-2">
                  <h3 className="text-xs font-bold uppercase text-[#0A192F] tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4.5 h-4.5 text-emerald-600" />
                    <span>Materiais, Links & Acervo Acadêmico ({results.materiais.length})</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {results.materiais.map((m) => (
                      <div key={m.id} className="p-3.5 border border-slate-105 rounded-xl bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] bg-emerald-100 px-1.5 py-0.2 rounded font-extrabold text-emerald-850 uppercase">{m.tipo || 'Material'}</span>
                          <h4 className="font-bold text-slate-800 text-xs mt-1.5">{m.titulo}</h4>
                          {m.descricao && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{m.descricao}</p>}
                        </div>

                        {m.url && (
                          <a 
                            href={m.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="mt-3.5 text-[10px] font-extrabold uppercase text-[#1F4E89] hover:text-[#D4AF37] flex items-center gap-1 w-fit"
                          >
                            <span>Acessar Recurso Externo</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* Suggestive workspace tips when search is empty */}
      {!term.trim() && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-5 border border-slate-200 rounded-2xl bg-white space-y-2">
            <span className="text-xl">👩‍💻</span>
            <h4 className="font-bold text-xs uppercase text-slate-800 tracking-wide mt-1">Busque Alunas e Contatos</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Digite o primeiro nome, e-mail completo ou telefone para encontrar a ficha cadastral 360.</p>
          </div>
          <div className="p-5 border border-slate-200 rounded-2xl bg-white space-y-2">
            <span className="text-xl">📜</span>
            <h4 className="font-bold text-xs uppercase text-slate-800 tracking-wide mt-1">Valide Certificados</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Localize rascunhos de certificados ou códigos emitidos para as turmas de Compliance / Coach.</p>
          </div>
          <div className="p-5 border border-slate-200 rounded-2xl bg-white space-y-2">
            <span className="text-xl">📚</span>
            <h4 className="font-bold text-xs uppercase text-slate-800 tracking-wide mt-1">Links e Modelos</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">Ache prontamente planilhas de turmas, links externos de drive, pautas e materiais de suporte.</p>
          </div>
        </div>
      )}

    </div>
  );
}
