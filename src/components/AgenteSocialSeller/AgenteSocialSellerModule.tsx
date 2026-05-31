import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, MessageSquare, Briefcase, ChevronRight, Copy, Save, Clock, Search, Filter, Hash, User, RefreshCw, Send, CheckCircle2, AlertTriangle, FileText, LayoutDashboard, MessageCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { generateAiMessage } from './agentLogic';

const produtosILG = [
  'Formação em NR-1',
  'Programa Expert em Treinamentos de Feedback',
  'Formação Master Analista Comportamental',
  'Formação Master Trainer de Líderes',
  'Formação em Processos Individuais para Líderes',
  'Programa Desenvolvedor de Equipes de Alta Performance',
  'Combo Workshops Lucrativos',
  'Combo Atendimento ao Cliente',
  'Programa Expert em Treinamentos de Vendas'
];

const situacoesContextuais = [
  'primeiro contato',
  'conexão aceita',
  'pessoa comentou em post',
  'pessoa curtiu conteúdo',
  'pessoa respondeu story',
  'pessoa pediu informações',
  'pessoa perguntou preço',
  'pessoa demonstrou insegurança',
  'pessoa disse "preciso pensar"',
  'pessoa disse "está caro"',
  'pessoa disse "já fiz muitas formações"',
  'pessoa sumiu',
  'lead frio',
  'lead morno',
  'lead quente',
  'pós-live',
  'pós-imersão',
  'pós-formulário',
  'convite para WhatsApp',
  'convite para conhecer formação',
  'follow-up 1',
  'follow-up 2',
  'encerramento elegante'
];

export function AgenteSocialSellerModule() {
  const [activeSubTab, setActiveSubTab] = useState<'gerador' | 'followup' | 'objecoes' | 'scripts' | 'comentarios' | 'cadencias' | 'historico' | 'templates'>('gerador');
  
  // States - Gerador
  const [canal, setCanal] = useState('LinkedIn');
  const [situacao, setSituacao] = useState('primeiro contato');
  const [produto, setProduto] = useState('');
  const [contexto, setContexto] = useState('');
  const [mensagemRecebida, setMensagemRecebida] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<{leve: string, direta: string, consultiva: string} | null>(null);

  const [historico, setHistorico] = useState<any[]>([]);

  useEffect(() => {
    // Load historico from db (dummy effect for now, we can use firestore later)
    const loadData = async () => {
      try {
        const docRef = doc(db, 'modules', 'agente_social_seller');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.historico) setHistorico(data.historico);
        }
      } catch (err) {
        console.error("Error loading agent history", err);
      }
    };
    loadData();
  }, []);

  const saveToHistory = async (newEntry: any) => {
    const updated = [newEntry, ...historico].slice(0, 50); // keep last 50
    setHistorico(updated);
    try {
      await setDoc(doc(db, 'modules', 'agente_social_seller'), { historico: updated }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateAbordagem = async () => {
    setIsGenerating(true);
    // Simulate API/AI delay
    setTimeout(() => {
      const results = generateAiMessage(canal, situacao, produto, contexto, mensagemRecebida);
      setGeneratedResults(results);
      setIsGenerating(false);
      
      saveToHistory({
        id: 'msg_' + Date.now(),
        data: new Date().toISOString(),
        canal,
        tipo: 'Abordagem - ' + situacao,
        produto,
        texto: results.consultiva,
        responsavel: 'Equipe ILG',
        status: 'Gerada'
      });
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Mensagem copiada para a área de transferência!');
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER TABS */}
      <div className="bg-white p-2.5 rounded-2xl border border-slate-200/60 flex overflow-x-auto no-scrollbar gap-2 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
        <button onClick={() => setActiveSubTab('gerador')} className={cn("px-5 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2", activeSubTab === 'gerador' ? "bg-amber-100 text-amber-800 shadow-sm" : "text-slate-600 hover:bg-slate-50")}>
          <Sparkles className="w-4 h-4" /> Gerador de Abordagens
        </button>
        <button onClick={() => setActiveSubTab('followup')} className={cn("px-5 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2", activeSubTab === 'followup' ? "bg-indigo-100 text-indigo-800 shadow-sm" : "text-slate-600 hover:bg-slate-50")}>
          <RefreshCw className="w-4 h-4" /> Follow-ups
        </button>
        <button onClick={() => setActiveSubTab('objecoes')} className={cn("px-5 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2", activeSubTab === 'objecoes' ? "bg-rose-100 text-rose-800 shadow-sm" : "text-slate-600 hover:bg-slate-50")}>
          <AlertTriangle className="w-4 h-4" /> Objeções
        </button>
        <button onClick={() => setActiveSubTab('scripts')} className={cn("px-5 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2", activeSubTab === 'scripts' ? "bg-emerald-100 text-emerald-800 shadow-sm" : "text-slate-600 hover:bg-slate-50")}>
          <FileText className="w-4 h-4" /> Scripts por Produto
        </button>
        <button onClick={() => setActiveSubTab('comentarios')} className={cn("px-5 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2", activeSubTab === 'comentarios' ? "bg-sky-100 text-sky-800 shadow-sm" : "text-slate-600 hover:bg-slate-50")}>
          <MessageCircle className="w-4 h-4" /> Comentários Estratégicos
        </button>
        <button onClick={() => setActiveSubTab('historico')} className={cn("px-5 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-2", activeSubTab === 'historico' ? "bg-slate-800 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50")}>
          <Clock className="w-4 h-4" /> Histórico
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ESQUERDA - PAINEL PRINCIPAL */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeSubTab === 'gerador' && (
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <div className="p-8 border-b border-slate-200/50 bg-gradient-to-br from-slate-900 via-[#0A192F] to-indigo-950 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="flex items-center gap-4 mb-2 relative z-10">
                  <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30 shadow-inner">
                    <Bot className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Agente Social Seller</h2>
                    <p className="text-sm text-slate-300 font-medium mt-1">Geração de abordagens consultivas e estruturadas</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6 bg-slate-50/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Canal</label>
                    <select value={canal} onChange={e => setCanal(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white shadow-sm transition-all">
                      <option>LinkedIn</option>
                      <option>Instagram</option>
                      <option>WhatsApp</option>
                      <option>Direct</option>
                      <option>Comentário público</option>
                      <option>E-mail curto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Situação</label>
                    <select value={situacao} onChange={e => setSituacao(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white shadow-sm transition-all">
                      {situacoesContextuais.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Formação/Produto (Opcional)</label>
                    <select value={produto} onChange={e => setProduto(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white shadow-sm transition-all">
                      <option value="">-- Nenhum Selecionado --</option>
                      {produtosILG.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Mensagem Recebida do Lead (Se houver)</label>
                  <textarea 
                    value={mensagemRecebida} onChange={e => setMensagemRecebida(e.target.value)}
                    placeholder="Cole aqui a mensagem que o lead enviou..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white shadow-sm transition-all min-h-[100px] resize-y"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Contexto Adicional / Observações</label>
                  <textarea 
                    value={contexto} onChange={e => setContexto(e.target.value)}
                    placeholder="Ex: É psicóloga, tem 10 anos de RH, mas hoje quer atuar como consultora de liderança..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 bg-white shadow-sm transition-all min-h-[100px] resize-y"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleGenerateAbordagem}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-slate-900 to-[#0A192F] text-white py-4 rounded-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed group border border-slate-800"
                  >
                    {isGenerating ? (
                      <><RefreshCw className="w-5 h-5 animate-spin" /> Processando Inteligência Estratégica...</>
                    ) : (
                      <><Sparkles className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" /> Gerar Mensagens</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {generatedResults && activeSubTab === 'gerador' && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> 
                Resultados Gerados
              </h3>
              
              {/* VERSÃO CONSULTIVA (Destaque) */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl overflow-hidden relative group shadow-sm transition-all hover:shadow-md">
                <div className="bg-emerald-100/50 px-4 py-2 border-b border-emerald-200 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">1. Versão Consultiva (Recomendada)</span>
                  <button onClick={() => copyToClipboard(generatedResults.consultiva)} className="p-1.5 hover:bg-emerald-200 text-emerald-700 rounded-md transition-colors tooltip-trigger" title="Copiar">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                  {generatedResults.consultiva}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* VERSÃO DIRETA */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden relative group shadow-sm transition-all hover:shadow-md">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">2. Versão Direta</span>
                    <button onClick={() => copyToClipboard(generatedResults.direta)} className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-md transition-colors tooltip-trigger" title="Copiar">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                    {generatedResults.direta}
                  </div>
                </div>

                {/* VERSÃO LEVE */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden relative group shadow-sm transition-all hover:shadow-md">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">3. Versão Leve</span>
                    <button onClick={() => copyToClipboard(generatedResults.leve)} className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-md transition-colors tooltip-trigger" title="Copiar">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                    {generatedResults.leve}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'historico' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Histórico de Mensagens</h3>
                <span className="text-xs text-slate-500">{historico.length} registros</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {historico.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    Nenhuma mensagem gerada ainda. Use o gerador para popular o histórico.
                  </div>
                ) : historico.map((h, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-0.5 rounded">{h.canal}</span>
                        <span className="text-xs font-bold text-slate-700">{h.tipo}</span>
                      </div>
                      <span className="text-xs text-slate-400">{new Date(h.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {h.produto && <div className="text-xs text-amber-600 mb-2 font-medium">Ref: {h.produto}</div>}
                    <div className="text-sm text-slate-600 bg-white border border-slate-200 p-3 rounded-lg whitespace-pre-wrap">
                      {h.texto}
                    </div>
                    <div className="mt-2 text-right">
                      <button onClick={() => copyToClipboard(h.texto)} className="text-xs text-indigo-600 font-bold hover:underline flex items-center justify-end gap-1 w-full">
                        <Copy className="w-3 h-3" /> Copiar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Placeholders for other tabs for brevity */}
          {(activeSubTab === 'followup' || activeSubTab === 'objecoes' || activeSubTab === 'scripts' || activeSubTab === 'comentarios') && (
            <div className="bg-white border text-center border-slate-200 rounded-xl p-10 shadow-sm flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Bot className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Módulo em Integração</h3>
              <p className="text-sm text-slate-500 max-w-md">
                Esta sub-aba ({activeSubTab}) utiliza as mesmas lógicas de motor do Gerador de Abordagens. Ajuste de contexto corporativo ILG ativo.
              </p>
              <button 
                onClick={() => setActiveSubTab('gerador')}
                className="mt-6 px-4 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-200"
              >
                Voltar para o Gerador
              </button>
            </div>
          )}
          
        </div>

        {/* DIREITA - DASHBOARD & REGRAS */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-white">
            <h3 className="font-bold text-amber-500 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Diretrizes de Tom (ILG)
            </h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> <span className="leading-relaxed"><strong className="text-white">Seja Consultivo:</strong> Entenda antes de vender. Pergunte o momento atual do profissional de RH/Coach.</span></li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> <span className="leading-relaxed"><strong className="text-white">Mercado Corporativo:</strong> Use termos como 'solução corporativa', 'riscos psicossociais', 'posicionamento'.</span></li>
              <li className="flex gap-2"><X className="w-4 h-4 text-rose-400 shrink-0" /> <span className="leading-relaxed"><strong className="text-white">Zero Agressividade:</strong> Sem falsa escassez, urgente falsa ou linguagem estilo "imperdível/telemarketing".</span></li>
              <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> <span className="leading-relaxed"><strong className="text-white">Dor Real:</strong> Foque em ajudar quem "sabe muito, mas não consegue viver disso no mercado B2B".</span></li>
            </ul>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Dashboard Social Seller</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Abordagens Hoje</span>
                </div>
                <span className="font-bold text-slate-800">{historico.filter(h => new Date(h.data).toDateString() === new Date().toDateString()).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Follow-ups Ativos</span>
                </div>
                <span className="font-bold text-slate-800">42</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-rose-50 text-rose-600 rounded">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-600">Objeções Salvas</span>
                </div>
                <span className="font-bold text-slate-800">18</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
