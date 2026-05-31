import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../store';
import { 
  Video, ExternalLink, Copy, Check, Trash2, VideoOff, Info, Plus, ChevronRight, MessageCircle, RefreshCw, Calendar, Users, User, ShieldCheck,
  Mic, MicOff, Settings, Sparkles, Brain, Save, Play, Square, AlertCircle, CheckSquare
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface LearnedRule {
  id: string;
  pattern: string;
  responsavelId: string;
  matchCounter: number;
}

const DEFAULT_LEARNED_RULES: LearnedRule[] = [
  { id: 'rule_1', pattern: 'landing page', responsavelId: 'Luiza Tech', matchCounter: 3 },
  { id: 'rule_2', pattern: 'código', responsavelId: 'Luiza Tech', matchCounter: 1 },
  { id: 'rule_3', pattern: 'subir site', responsavelId: 'Luiza Tech', matchCounter: 2 },
  { id: 'rule_4', pattern: 'venda', responsavelId: 'Ana Comercial', matchCounter: 5 },
  { id: 'rule_5', pattern: 'comercial', responsavelId: 'Ana Comercial', matchCounter: 4 },
  { id: 'rule_6', pattern: 'lead', responsavelId: 'Ana Comercial', matchCounter: 2 },
  { id: 'rule_7', pattern: 'suporte', responsavelId: 'Núria Onboarding', matchCounter: 4 },
  { id: 'rule_8', pattern: 'matrícula', responsavelId: 'Núria Onboarding', matchCounter: 2 },
  { id: 'rule_9', pattern: 'trancar', responsavelId: 'Núria Onboarding', matchCounter: 3 },
  { id: 'rule_10', pattern: 'mentoria', responsavelId: 'Liana Gomes', matchCounter: 5 },
  { id: 'rule_11', pattern: 'post', responsavelId: 'Liana Gomes', matchCounter: 3 },
  { id: 'rule_12', pattern: 'conteúdo', responsavelId: 'Liana Gomes', matchCounter: 2 },
];

export function ReunioesModule() {
  const { data, updateModuleData } = useStore();
  const perfis = data.perfis || [];

  // Active operator identifier for preset display name
  const [activeOperator, setActiveOperator] = useState('Liana Gomes');

  // Navigation tabs config
  const [currentSubTab, setCurrentSubTab] = useState<'salas' | 'transcricao'>('salas');

  // Transcription process states
  const [transcriptText, setTranscriptText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionObj, setRecognitionObj] = useState<any>(null);
  const [interimResult, setInterimResult] = useState('');

  // Local trained patterns list
  const [learnedRules, setLearnedRules] = useState<LearnedRule[]>([]);
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleAssignee, setNewRuleAssignee] = useState('Luiza Tech');

  // Load learned patterns from cache or fallback to preset defaults
  useEffect(() => {
    const saved = localStorage.getItem('ilg_learned_delegation_rules');
    if (saved) {
      try {
        setLearnedRules(JSON.parse(saved));
      } catch (e) {
        setLearnedRules(DEFAULT_LEARNED_RULES);
      }
    } else {
      localStorage.setItem('ilg_learned_delegation_rules', JSON.stringify(DEFAULT_LEARNED_RULES));
      setLearnedRules(DEFAULT_LEARNED_RULES);
    }
  }, []);

  const saveRules = (updatedRules: LearnedRule[]) => {
    setLearnedRules(updatedRules);
    localStorage.setItem('ilg_learned_delegation_rules', JSON.stringify(updatedRules));
  };

  // Load operators from store if available
  useEffect(() => {
    if (perfis.length > 0) {
      // Find default active or just pick first
      setActiveOperator(perfis[0].nome || 'Liana Gomes');
    }
  }, [perfis]);

  // Virtual meetings (Jitsi Meet) integration states
  const [jitsiMeetings, setJitsiMeetings] = useState<any[]>([]);
  const [newMeetingTopic, setNewMeetingTopic] = useState('');
  const [newMeetingType, setNewMeetingType] = useState('Grupo');
  const [newMeetingHost, setNewMeetingHost] = useState('Liana Gomes');
  const [activeIframeMeeting, setActiveIframeMeeting] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'todos' | 'Grupo' | 'Individual'>('todos');

  useEffect(() => {
    const saved = localStorage.getItem('ilg_jitsi_meetings');
    if (saved) {
      try {
        setJitsiMeetings(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading meetings', e);
      }
    } else {
      const initial = [
        {
          id: 'meet_1',
          tema: 'Reunião de Alinhamento Geral ILG',
          anfitria: 'Liana Gomes',
          tipo: 'Grupo',
          salaId: 'ilg-reuniao-equipe-semanal',
          dataCriacao: new Date().toLocaleDateString('pt-BR')
        },
        {
          id: 'meet_2',
          tema: 'Espaço Mentoria de Liana (1-on-1)',
          anfitria: 'Liana Gomes',
          tipo: 'Individual',
          salaId: 'ilg-atendimento-liana-gomes',
          dataCriacao: new Date().toLocaleDateString('pt-BR')
        }
      ];
      localStorage.setItem('ilg_jitsi_meetings', JSON.stringify(initial));
      setJitsiMeetings(initial);
    }
  }, []);

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingTopic.trim()) return;

    // Sanitize topic to form a clean URL slug
    const cleanTopic = newMeetingTopic
      .toLowerCase()
      .normalize('NFD') // detach accents
      .replace(/[\u0300-\u036f]/g, '') // remove accent symbols
      .replace(/[^a-z0-9]/g, '-') // convert anything else to hyphens
      .replace(/-+/g, '-') // collapse multiple hyphens
      .replace(/^-|-$/g, ''); // trim hyphens from ends

    const uniqueId = Math.random().toString(36).substring(2, 6);
    const roomSlug = `ilg-meet-${cleanTopic || 'reuniao'}-${uniqueId}`;

    const newMeet = {
      id: 'meet_' + Date.now(),
      tema: newMeetingTopic,
      anfitria: newMeetingHost,
      tipo: newMeetingType,
      salaId: roomSlug,
      dataCriacao: new Date().toLocaleDateString('pt-BR')
    };

    const updated = [newMeet, ...jitsiMeetings];
    setJitsiMeetings(updated);
    localStorage.setItem('ilg_jitsi_meetings', JSON.stringify(updated));
    setNewMeetingTopic('');
    
    // Auto-embed or alert
    setActiveIframeMeeting(newMeet);
    // Scroll down to video if possible
    setTimeout(() => {
      document.getElementById('meeting-live-view')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  const handleDeleteMeeting = (id: string) => {
    if (confirm(`Deseja mesmo remover a sala "${jitsiMeetings.find(m => m.id === id)?.tema}" do histórico?`)) {
      const filtered = jitsiMeetings.filter(m => m.id !== id);
      setJitsiMeetings(filtered);
      localStorage.setItem('ilg_jitsi_meetings', JSON.stringify(filtered));
      if (activeIframeMeeting && activeIframeMeeting.id === id) {
        setActiveIframeMeeting(null);
      }
    }
  };

  const handleCopyLink = (text: string, meetId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(meetId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Heuristic delegation match parsing engine
  const parsedDelegatedTasks = useMemo(() => {
    if (!transcriptText.trim()) return [];

    // Split entire transcript into phrases by punctuation marks
    const sentences = transcriptText
      .split(/[.!?;\n\r]+/)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    const matches: any[] = [];

    sentences.forEach((sentence, index) => {
      let isMatched = false;
      let matchedAssignee = '';
      let matchSource = ''; // 'direct-name' or 'trained-rule'
      let matchingPatternWord = '';

      // Cleaned sentence for easier search
      const cleanSentence = sentence.toLowerCase();

      // 1. Explicit syntax check: Who performs the action?
      const collaboratorsToCheck = [
        { label: 'Luiza Tech', regexNames: ['luiza', 'luiza tech', 'lu'] },
        { label: 'Ana Comercial', regexNames: ['ana', 'ana comercial', 'comercial'] },
        { label: 'Núria Onboarding', regexNames: ['nuria', 'nuria onboarding', 'suporte'] },
        { label: 'Liana Gomes', regexNames: ['liana', 'liana gomes', 'eu, liana'] }
      ];

      for (const col of collaboratorsToCheck) {
        for (const name of col.regexNames) {
          // Rule patterns matching standard Portuguese delegation
          const regexPatterns = [
            new RegExp(`\\b${name}\\s+(?:vai|precisa|deve|ficou\\s+de)\\s+([^,.]+)`, 'i'),
            new RegExp(`\\b${name},\\s+(?:por\\s+favor,\\s+)?(?:faça|faz|ajusta|liga|envia|cria)\\s+([^,.]+)`, 'i'),
            new RegExp(`(?:pedir\\s+para|delegar\\s+para)\\s+${name}\\s+(?:para|fazer)?\\s+([^,.]+)`, 'i')
          ];

          for (const rx of regexPatterns) {
            const rxMatch = sentence.match(rx);
            if (rxMatch && rxMatch[1]) {
              isMatched = true;
              matchedAssignee = col.label;
              matchSource = 'explicit-pronounce';
              matchingPatternWord = name;
              break;
            }
          }
          if (isMatched) break;
        }
        if (isMatched) break;
      }

      // 2. If no direct name, scan using our TRAINED rule dictionaries (local learning system!)
      if (!isMatched) {
        for (const rule of learnedRules) {
          if (rule.pattern && cleanSentence.includes(rule.pattern.toLowerCase())) {
            isMatched = true;
            matchedAssignee = rule.responsavelId;
            matchSource = 'trained-rule';
            matchingPatternWord = rule.pattern;
            break;
          }
        }
      }

      if (isMatched) {
        let actionTitle = sentence.replace(/["]+/g, '');
        if (actionTitle.length > 60) {
          actionTitle = actionTitle.substring(0, 58) + '...';
        }

        matches.push({
          id: `task_sug_${index}`,
          originalText: sentence,
          titulo: actionTitle,
          responsavel: matchedAssignee,
          categoria: matchedAssignee.includes('Tech') ? 'Sistemas & Desenvolvimento' : matchedAssignee.includes('Comercial') ? 'Comercial & Vendas' : matchedAssignee.includes('Onboarding') ? 'Suporte & Onboarding' : 'Projetos & Direção',
          matchSource,
          matchingPatternWord,
          prazo: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }
    });

    return matches;
  }, [transcriptText, learnedRules]);

  // Start/Stop voice recording via Web Speech API (free browser-native, zero-API)
  const handleToggleVoiceRecording = () => {
    if (isRecording) {
      if (recognitionObj) {
        try {
          recognitionObj.stop();
        } catch (e) {}
      }
      setIsRecording(false);
    } else {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        alert('Seu navegador/ambiente de visualização não suporta a Web Speech API nativa. Por favor, digite o texto ou utilize o simulador inteligente abaixo!');
        return;
      }

      try {
        const rec = new SpeechRecognitionClass();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'pt-BR';

        rec.onstart = () => {
          setIsRecording(true);
        };

        rec.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptSegment = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcriptSegment + ' ';
            } else {
              interimTranscript += transcriptSegment;
            }
          }

          if (finalTranscript) {
            setTranscriptText(prev => prev + finalTranscript);
            setInterimResult('');
          } else {
            setInterimResult(interimTranscript);
          }
        };

        rec.onerror = (err: any) => {
          console.error('Lighthouse recognition error event:', err);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        rec.start();
        setRecognitionObj(rec);
      } catch (err) {
        console.error('Failed to trigger mic capture', err);
        setIsRecording(false);
      }
    }
  };

  // Push the suggested task directly into Firebase CRM collection
  const handlePushToCRM = async (task: any) => {
    try {
      const tarefasAtuais = data.tarefas_suporte || [];
      const novaTarefa = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        titulo: task.titulo,
        descricao: `Gerado de forma inteligente na Sala Virtual de Transcrição.\nSegmento transcrito: "${task.originalText}"`,
        tipo: 'tarefa',
        responsavel: task.responsavel,
        categoria: task.categoria,
        status: 'pendente',
        prazo: task.prazo,
        dataCriacao: new Date().toLocaleDateString('pt-BR')
      };

      const novasTarefas = [novaTarefa, ...tarefasAtuais];
      await updateModuleData('tarefas_suporte', novasTarefas);
      alert(`Sucesso! Tarefa delegada para "${task.responsavel}" gravada no CRM principal.`);
    } catch (err) {
      console.error(err);
      alert('Não foi possível enviar para o Firebase. Verifique sua conexão.');
    }
  };

  // Reinforce or modify learned heuristics rule
  const handleReinforceLearning = (rulePattern: string, collaborator: string) => {
    const existing = learnedRules.find(r => r.pattern.toLowerCase() === rulePattern.toLowerCase());
    if (existing) {
      const updated = learnedRules.map(r => 
        r.id === existing.id 
          ? { ...r, responsavelId: collaborator, matchCounter: (r.matchCounter || 0) + 1 }
          : r
      );
      saveRules(updated);
      alert(`Inteligência Reforçada! '${rulePattern}' foi confirmado como '${collaborator}' e pontuação aumentada.`);
    } else {
      const newRule: LearnedRule = {
        id: 'rule_' + Date.now(),
        pattern: rulePattern.trim().toLowerCase(),
        responsavelId: collaborator,
        matchCounter: 1
      };
      const updated = [...learnedRules, newRule];
      saveRules(updated);
      alert(`Novo padrão aprendido! '${rulePattern}' agora delegará automaticamente para '${collaborator}'.`);
    }
  };

  // Manual Learning Add
  const handleCreateCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRulePattern.trim()) return;

    const newRule: LearnedRule = {
      id: 'rule_' + Date.now(),
      pattern: newRulePattern.trim().toLowerCase(),
      responsavelId: newRuleAssignee,
      matchCounter: 1
    };
    const updated = [newRule, ...learnedRules];
    saveRules(updated);
    setNewRulePattern('');
    alert(`Regra de aprendizado inserida: '${newRulePattern}' mapeará para '${newRuleAssignee}'.`);
  };

  const handleDeleteRule = (id: string) => {
    const updated = learnedRules.filter(r => r.id !== id);
    saveRules(updated);
  };

  const handleApplyPresetSimulation = (type: 'comercial' | 'suporte' | 'tecnologia') => {
    let presetText = '';
    if (type === 'comercial') {
      presetText = "O alinhamento comercial de hoje foi produtivo. A Ana comercial vai ligar para todas as leads novas e montar a lista de matrículas pendentes.\nA Luiza Tech vai subir a landing page corrigida e ajustar o botão de checkout que deu erro ontem.";
    } else if (type === 'suporte') {
      presetText = "Sessão de suporte concluída. A Núria precisa trancar a matrícula da aluna Júlia devido ao seu intercâmbio.\nA Liana Gomes vai providenciar o conteúdo do post da mentoria de marketing e planejar os roteiros do próximo treinamento.";
    } else if (type === 'tecnologia') {
      presetText = "Reunião de infra. A Luiza Tech vai fazer o deploy do novo código da central e analisar os pings de erro no servidor.";
    }
    setTranscriptText(presetText);
  };

  const filteredMeetings = useMemo(() => {
    if (filterType === 'todos') return jitsiMeetings;
    return jitsiMeetings.filter(m => m.tipo === filterType);
  }, [jitsiMeetings, filterType]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        {/* Decorative ambient gold glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="space-y-1.5 z-10 text-left">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-[#D4AF37]/25 text-[#D4AF37] rounded-full border border-[#D4AF37]/35">
              Serviço Oficial ILG
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Conexor Gratuito Ilimitado
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Salas Virtuais de Reunião</h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Sua própria plataforma para atendimentos estratégicos 1-on-1 com clientes e reuniões táticas internas por videoconferência pelo <strong className="text-white">Jitsi Meet</strong>. Totalmente livre de limites e custos.
          </p>
        </div>

        <div className="shrink-0 flex items-center z-10">
          <div className="flex flex-col items-end gap-1 font-sans">
            <span className="text-[10px] uppercase font-bold text-slate-400">Logado agora como:</span>
            <select 
              value={activeOperator}
              onChange={e => setActiveOperator(e.target.value)}
              className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {perfis.length > 0 ? (
                perfis.map((p: any) => <option key={p.id} value={p.nome}>{p.nome}</option>)
              ) : (
                <>
                  <option value="Liana Gomes">Liana Gomes</option>
                  <option value="Ana Comercial">Ana (Comercial)</option>
                  <option value="Núria Onboarding">Núria (Suporte)</option>
                  <option value="Luiza Tech">Luiza (Tech)</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setCurrentSubTab('salas')}
          className={cn(
            "pb-3.5 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2",
            currentSubTab === 'salas'
              ? "border-[#D4AF37] text-[#0A192F]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Video className="w-4 h-4" />
          <span>Salas Virtuais Jitsi</span>
        </button>
        <button
          onClick={() => setCurrentSubTab('transcricao')}
          className={cn(
            "pb-3.5 px-6 text-sm font-bold border-b-2 transition-all flex items-center gap-2 relative",
            currentSubTab === 'transcricao'
              ? "border-[#D4AF37] text-[#0A192F]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          )}
        >
          <Brain className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Transcrição & Delegação Inteligente (IA Local)</span>
          <span className="px-1.5 py-0.5 text-[8px] bg-red-650 text-white rounded-full font-bold uppercase animate-bounce leading-none">NOVO</span>
        </button>
      </div>

      {currentSubTab === 'salas' ? (
        <>
          {/* Main Interactive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Meeting Rooms List */}
            <div className="lg:col-span-2 space-y-4">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-left">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Salas Disponíveis</p>
              <h3 className="text-sm font-bold text-slate-800">Conferências Cadastradas</h3>
            </div>

            {/* Sub-Filters */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setFilterType('todos')}
                className={cn(
                  "p-1.5 px-3 rounded-md text-[11px] font-bold tracking-wide uppercase transition-all",
                  filterType === 'todos' 
                    ? "bg-[#0A192F] text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                Todas ({jitsiMeetings.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('Grupo')}
                className={cn(
                  "p-1.5 px-3 rounded-md text-[11px] font-bold tracking-wide uppercase transition-all",
                  filterType === 'Grupo' 
                    ? "bg-indigo-700 text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                Em Grupo
              </button>
              <button
                type="button"
                onClick={() => setFilterType('Individual')}
                className={cn(
                  "p-1.5 px-3 rounded-md text-[11px] font-bold tracking-wide uppercase transition-all",
                  filterType === 'Individual' 
                    ? "bg-amber-600 text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                Individuais
              </button>
            </div>
          </div>

          {/* List display */}
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredMeetings.length > 0 ? (
              filteredMeetings.map((meet) => {
                const meetingUrl = `https://meet.jit.si/${meet.salaId}`;
                const invitationText = `Olá! Você foi convidada para uma reunião virtual oficial do Instituto Liana Gomes.

Tema: ${meet.tema}
Anfitriã: ${meet.anfitria}
Como acessar: ${meetingUrl}

Basta clicar no link de qualquer dispositivo e autorizar a câmera/microfone. Até já!`;
                
                const isCurrentActive = activeIframeMeeting?.id === meet.id;

                return (
                  <div 
                    key={meet.id} 
                    className={cn(
                      "p-4 bg-white border rounded-xl transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left shadow-xs",
                      isCurrentActive 
                        ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/30 bg-amber-50/10"
                        : "border-slate-200 hover:border-slate-350"
                    )}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {meet.tipo === 'Grupo' ? (
                          <span className="px-2 py-0.5 text-[9px] uppercase font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded">
                            Grupo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] uppercase font-extrabold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                            Individual (1-on-1)
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">ID: {meet.salaId}</span>
                      </div>
                      
                      <h4 className="font-bold text-[#0A192F] text-sm truncate">{meet.tema}</h4>
                      
                      <div className="flex items-center gap-3 text-slate-500 text-xs">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          Anfitriã: <strong className="text-slate-700 font-semibold">{meet.anfitria}</strong>
                        </span>
                        <span className="text-slate-300">•</span>
                        <span>Criada em {meet.dataCriacao}</span>
                      </div>
                    </div>

                    {/* Operational controls */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                      
                      {/* Embed Option */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isCurrentActive) {
                            setActiveIframeMeeting(null);
                          } else {
                            setActiveIframeMeeting(meet);
                            setTimeout(() => {
                              document.getElementById('meeting-live-view')?.scrollIntoView({ behavior: 'smooth' });
                            }, 150);
                          }
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs",
                          isCurrentActive 
                            ? "bg-amber-500 text-white hover:bg-amber-600" 
                            : "bg-[#0A192F] hover:bg-opacity-95 text-white"
                        )}
                        title="Abrir a transmissão de vídeo diretamente neste sistema"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>{isCurrentActive ? 'Fechar Vídeo' : 'Embutir'}</span>
                      </button>

                      {/* New Tab Option */}
                      <a
                        href={meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-slate-50 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                        title="Abrir em Nova Aba Externa (Ideal para melhor performance)"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {/* Copy link */}
                      <button
                        type="button"
                        onClick={() => handleCopyLink(meetingUrl, meet.id)}
                        className="p-1.5 bg-slate-50 border border-slate-300 hover:bg-slate-100 text-slate-650 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                        title="Copiar link de convite"
                      >
                        {copiedId === meet.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Invite via WhatsApp */}
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(invitationText)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-emerald-550 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                        title="Enviar convite completo via WhatsApp diretamente"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteMeeting(meet.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded-lg transition-colors ml-1"
                        title="Remover Sala"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 border border-dashed rounded-xl bg-white text-slate-400 text-center text-xs space-y-2 shadow-2xs">
                <Video className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-500">Nenhuma sala cadastrada para este filtro.</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">Crie uma nova sala instantânea utilizando o painel rápido ao lado para iniciar conversas imediatamente.</p>
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3 text-left">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <h5 className="font-bold text-emerald-900 text-xs uppercase tracking-wide">Segurança & Privacidade Absoluta</h5>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Todas as chamadas utilizam criptografia de ponta a ponta nativa do Jitsi Meet. Suas conversas com alunas particulares, equipes internas e dados confidenciais de conformidade corporativa estão 100% seguros e não são registrados em nenhum banco de dados corporativo externo.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Room Generator */}
        <div className="space-y-6">
          
          {/* Creation card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 text-left space-y-4 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Painel Operador</h3>
              <h4 className="font-bold text-slate-800 text-base mt-0.5">Criar Nova Sala</h4>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Título / Tema da Videoconferência *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Treinamento de Mentoria"
                  value={newMeetingTopic}
                  onChange={e => setNewMeetingTopic(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none bg-white font-medium focus:border-cyan-850"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Tipo de Audiência</label>
                  <select 
                    value={newMeetingType}
                    onChange={e => setNewMeetingType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium"
                  >
                    <option value="Grupo">Equipe / Grupo</option>
                    <option value="Individual">Individual (1-on-1)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Anfitriã Designada</label>
                  <select 
                    value={newMeetingHost}
                    onChange={e => setNewMeetingHost(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-700 font-medium"
                  >
                    <option value="Liana Gomes">Liana Gomes</option>
                    <option value="Ana Comercial">Ana (Comercial)</option>
                    <option value="Núria Onboarding">Núria (Suporte)</option>
                    <option value="Luiza Tech">Luiza (Tech)</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Gerar e Iniciar Sala</span>
              </button>
            </form>

            {/* Quick action buttons for preset direct static rooms */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-2">Salas Fixas de Atendimento:</span>
              
              <a 
                href="https://meet.jit.si/ilg-mentoria-coletiva"
                target="_blank"
                rel="noreferrer"
                className="w-full p-2.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-150 rounded-lg text-slate-750 text-xs font-semibold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  Mentoria Coletiva ILG
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>

              <a 
                href="https://meet.jit.si/ilg-sala-suporte-urgente"
                target="_blank"
                rel="noreferrer"
                className="w-full p-2.5 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-200 rounded-lg text-slate-750 text-xs font-semibold flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Suporte Rápido Onboarding
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Quick Informative Guide */}
          <div className="bg-stone-100 border border-slate-200 rounded-xl p-5 text-left text-xs space-y-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-[#0A192F] font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 pb-2">
              <Info className="w-4 h-4 text-cyan-800" />
              <span>Instruções de Uso</span>
            </div>
            <ul className="space-y-2.5 text-slate-600 list-disc pl-4 leading-relaxed">
              <li>O Jitsi Meet é 100% gratuito e não exige que as alunas instalem nada ou façam login.</li>
              <li>Pressione <strong className="text-slate-800">Embutir</strong> para entrar na videoconferência imediatamente por aqui.</li>
              <li>Com o botão <strong className="text-slate-800">Copiar Link</strong>, você copia o link limpo da sala para enviar diretamente às alunas.</li>
              <li>Utilize o ícone do <strong className="text-slate-800">WhatsApp</strong> para disparar o convite formatado e acolhedor para a pessoa de sua escolha.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Embedded Meeting Video Player section */}
      {activeIframeMeeting && (
        <div id="meeting-live-view" className="pt-4 space-y-3 text-left animate-in fade-in duration-300">
          <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="font-bold text-xs sm:text-sm">Transmissão Ativa: {activeIframeMeeting.tema}</span>
              <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded-md text-amber-400 capitalize hidden md:inline-block">
                Anfitriã: {activeIframeMeeting.anfitria}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <a 
                href={`https://meet.jit.si/${activeIframeMeeting.salaId}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all text-center"
                title="Melhor para compartilhar tela e ver mais câmeras ao mesmo tempo"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">Nova Janela</span>
              </a>

              <button
                type="button"
                onClick={() => setActiveIframeMeeting(null)}
                className="p-1.5 px-3 bg-red-650 hover:bg-red-700 text-white rounded-lg transition-all flex items-center gap-1 text-[10px] uppercase font-bold"
              >
                <VideoOff className="w-3.5 h-3.5" />
                <span>Encerrar Exibição</span>
              </button>
            </div>
          </div>

          {/* Embedded Responsive Jitsi Room Frame */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-slate-900 bg-slate-950 shadow-lg">
            <iframe
              src={`https://meet.jit.si/${activeIframeMeeting.salaId}#userInfo.displayName="${encodeURIComponent(activeOperator)}"`}
              className="w-full h-[620px] border-0"
              allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write; camera *; microphone *; fullscreen *"
              title={`Reunião Jitsi - ${activeIframeMeeting.tema}`}
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] text-slate-400 gap-2 text-left">
            <p className="italic font-medium">
              * Importante: Caso não consiga habilitar a câmera/microfone, use o botão "Nova Janela" acima para carregar o Jitsi em tela cheia de forma nativa e segura.
            </p>
            <p className="font-semibold text-[#0A192F]">
              Instituto Liana Gomes • Portal Operacional Integrado
            </p>
          </div>
        </div>
      )}
        </>
      ) : (
        <div className="space-y-6 text-left">
          
          {/* Header instructions for local voice recognition */}
          <div className="p-4 bg-amber-500/10 border border-[#D4AF37]/30 rounded-xl flex items-start gap-4">
            <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div className="space-y-1 text-left">
              <h4 className="font-bold text-[#0A192F] text-xs uppercase tracking-wide">Heurísticas de Aprendizado Local (Zero API, 100% Interno)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Esta funcionalidade transcreve e correlaciona conversas de áudio em tempo real usando a robusta API de voz embutida do seu próprio navegador (<strong className="text-slate-800">sem conexões de rede pagas, IA externa ou taxas de consumo de tokens</strong>). Ela identifica trechos onde tarefas são delegadas por voz ou analisando o nosso dicionário de correspondência de regras calibradas por você!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Left panel: Transcriber console */}
            <div className="lg:col-span-2 space-y-4 text-left">
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="text-left">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sala de Controle</h3>
                    <h4 className="font-bold text-slate-800 text-sm">Transcritor de Voz Ativo</h4>
                  </div>
                  
                  {/* Speech status display */}
                  <span className={cn(
                    "text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5",
                    isRecording 
                      ? "bg-red-50 text-red-700 border-red-200 animate-pulse" 
                      : "bg-slate-50 text-slate-500 border-slate-200"
                  )}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", isRecording ? "bg-red-500" : "bg-slate-400")} />
                    {isRecording ? 'Captando Voz...' : 'Microfone Inativo'}
                  </span>
                </div>

                {/* Recorder Control Button and instructions */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
                  <button
                    type="button"
                    onClick={handleToggleVoiceRecording}
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center transition-all drop-shadow-sm shrink-0",
                      isRecording 
                        ? "bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-100" 
                        : "bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] ring-4 ring-amber-100"
                    )}
                    title={isRecording ? 'Pausar Gravação' : 'Habilitar Captação do Microfone'}
                  >
                    {isRecording ? (
                      <MicOff className="w-6 h-6 animate-pulse" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                  </button>

                  <div className="text-xs text-slate-500 leading-normal flex-1 text-center sm:text-left">
                    <p className="font-bold text-slate-705 mb-0.5 text-left font-sans">
                      {isRecording ? 'Aguardando voz... Fale agora.' : 'Clique para Iniciar Captura de Voz'}
                    </p>
                    <p className="text-[11px] text-left text-slate-600 font-sans leading-normal">
                      Recomendado: Fale de forma pausada. Suas sentenças serão adicionadas ao editor de pauta abaixo e processadas localmente para sugerir e calibrar delegações.
                    </p>
                  </div>
                </div>

                {/* Textarea Workspace Area */}
                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center text-left">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Workspace de Ata da Reunião</label>
                    <button 
                      type="button"
                      onClick={() => {
                        if (confirm('Deseja limpar todo o texto atual?')) setTranscriptText('');
                      }}
                      className="text-[10px] font-bold text-rose-605 hover:text-rose-700 uppercase"
                    >
                      Limpar Texto
                    </button>
                  </div>

                  <div className="relative text-left">
                    <textarea
                      value={transcriptText}
                      onChange={e => setTranscriptText(e.target.value)}
                      placeholder="Os trechos transcritos do áudio aparecerão aqui automaticamente. Você também pode digitar livremente ou colar atas, notas e resumos textuais de outras ligações para ver a IA heurística processar!"
                      className="w-full h-[180px] p-3 border border-slate-200 rounded-xl outline-none font-sans text-xs bg-slate-50/50 focus:bg-white focus:border-[#D4AF37] transition-all resize-none text-left"
                    />

                    {/* Speech Recognition realtime interim text preview */}
                    {interimResult && (
                      <div className="absolute bottom-3 left-3 right-3 text-[11px] text-slate-400 font-mono italic bg-white/95 px-2 py-1 border border-slate-100 rounded shadow-xs flex items-center gap-1.5 align-middle">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping shrink-0" />
                        <span>Visualização local: "{interimResult}..."</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preset Scenarios Simulation section */}
                <div className="pt-3 border-t border-slate-100 text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 text-left">Simular Textos e Áudios (Estudo de Casos):</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
                    <button
                      type="button"
                      onClick={() => handleApplyPresetSimulation('comercial')}
                      className="p-2 py-2.5 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-150 rounded-lg text-indigo-900 font-bold text-[11px] flex flex-col items-center gap-1 text-center transition-colors shadow-2xs"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                      <span>Cenário 1: Vendas (Ana & Luiza)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetSimulation('suporte')}
                      className="p-2 py-2.5 bg-amber-50 hover:bg-amber-100/85 border border-amber-200 rounded-lg text-amber-900 font-bold text-[11px] flex flex-col items-center gap-1 text-center transition-colors shadow-2xs"
                    >
                      <Brain className="w-4 h-4 text-amber-600" />
                      <span>Cenário 2: Suporte (Núria & Liana)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyPresetSimulation('tecnologia')}
                      className="p-2 py-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-150 rounded-lg text-emerald-950 font-bold text-[11px] flex flex-col items-center gap-1 text-center transition-colors shadow-2xs"
                    >
                      <Settings className="w-4 h-4 text-emerald-600" />
                      <span>Cenário 3: Infra (Luiza)</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right panel: Extracted Tasks delegator list */}
            <div className="space-y-4 text-left">
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 shadow-xs">
                
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center text-left">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Resultados</h3>
                    <h4 className="font-bold text-slate-800 text-sm text-left">Diligências Extraídas ({parsedDelegatedTasks.length})</h4>
                  </div>
                  
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    Sincronizável
                  </span>
                </div>

                {/* Suggested tasks loop */}
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {parsedDelegatedTasks.length > 0 ? (
                    parsedDelegatedTasks.map((task) => {
                      return (
                        <div key={task.id} className="p-3 bg-slate-50 border border-slate-205 rounded-xl space-y-2.5 relative text-left text-xs">
                          
                          {/* Indicator label */}
                          <div className="flex items-center justify-between font-mono">
                            <span className={cn(
                              "text-[8px] uppercase font-bold px-1.5 py-0.5 rounded border leading-none",
                              task.matchSource === 'explicit-pronounce'
                                ? "bg-indigo-50 text-indigo-700 border-indigo-150"
                                : "bg-amber-50 text-amber-700 border-[#D4AF37]/30"
                            )}>
                              {task.matchSource === 'explicit-pronounce' ? 'Voz: Atribuição' : 'Calibrado por Regra'}
                            </span>

                            <span className="text-[9px] text-slate-400 font-medium">
                              Termo: "{task.matchingPatternWord}"
                            </span>
                          </div>

                          {/* Editable task title details */}
                          <div>
                            <span className="text-[9px] uppercase font-semibold text-slate-400 block mb-0.5 text-left font-sans">Demanda Detectada</span>
                            <textarea
                              rows={2}
                              value={task.titulo}
                              onChange={e => {
                                const val = e.target.value;
                                setTranscriptText(prev => prev.replace(task.originalText, val));
                              }}
                              className="w-full bg-white border border-slate-200 rounded p-1.5 outline-none font-sans font-semibold text-slate-800 text-xs resize-none text-left"
                            />
                          </div>

                          {/* Parameters selection */}
                          <div className="grid grid-cols-2 gap-2 text-left">
                            <div>
                              <span className="text-[8px] uppercase font-bold text-slate-400 block mb-1 text-left font-sans">Colaborador</span>
                              <select
                                value={task.responsavel}
                                onChange={e => {
                                  const val = e.target.value;
                                  handleReinforceLearning(task.matchingPatternWord || task.titulo, val);
                                }}
                                className="w-full bg-white border border-slate-200 rounded p-1 text-[11.5px] font-bold text-slate-700 outline-none"
                              >
                                <option value="Liana Gomes">Liana Gomes</option>
                                <option value="Ana Comercial">Ana (Comercial)</option>
                                <option value="Núria Onboarding">Núria (Suporte)</option>
                                <option value="Luiza Tech">Luiza (Tech)</option>
                              </select>
                            </div>

                            <div>
                              <span className="text-[8px] uppercase font-bold text-slate-400 block mb-1 text-left font-sans">Data Limite</span>
                              <input
                                type="date"
                                value={task.prazo}
                                onChange={e => {
                                  task.prazo = e.target.value;
                                }}
                                className="w-full bg-white border border-slate-205 rounded p-0.5 text-[11px] text-slate-700"
                              />
                            </div>
                          </div>

                          {/* Action panel inside task suggested box */}
                          <div className="flex gap-1.5 pt-1 text-left">
                            <button
                              type="button"
                              onClick={() => handleReinforceLearning(task.matchingPatternWord || task.titulo, task.responsavel)}
                              className="flex-1 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10px] rounded flex items-center justify-center gap-1 transition-colors"
                              title="Reforça de forma autônoma que este assunto pertence a este colaborador"
                            >
                              <Brain className="w-3 h-3 text-slate-755" />
                              <span>Treinar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handlePushToCRM(task)}
                              className="flex-1 py-1.5 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] font-bold text-[10px] rounded flex items-center justify-center gap-1 transition-all shadow-2xs"
                              title="Grava essa tarefa no banco de dados de Tarefas e Suporte oficial"
                            >
                              <CheckSquare className="w-3 h-3" />
                              <span>Gravar CRM</span>
                            </button>
                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 border border-dashed rounded-xl bg-slate-50 text-slate-400 text-center text-xs space-y-1.5">
                      <Sparkles className="w-7 h-7 text-slate-300 mx-auto animate-pulse" />
                      <p className="font-semibold text-slate-500">Aguardando dados...</p>
                      <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto text-center font-medium leading-relaxed">
                        Simule um cenário ou ligue a captação para ver o mapeamento heurístico atuar em tempo real!
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Core trained dictionary rules lists */}
          <div className="bg-[#0A192F] text-white p-5 rounded-xl border border-slate-800 space-y-4 text-left">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3 text-left">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#D4AF37] animate-pulse" />
                  <h3 className="font-extrabold text-base tracking-tight text-white text-left">Biblioteca de Aprendizagem Local (Correspondência de Padrões)</h3>
                </div>
                <p className="text-xs text-slate-405 mt-0.5 text-left leading-normal">
                  Dicionário interno guardado no navegador. Quando o áudio ou ata contém esses termos específicos, o sistema os atribui ao colaborador de forma inteligente e autônoma!
                </p>
              </div>

              <div className="text-[10px] font-mono text-[#D4AF37] bg-amber-500/10 border border-[#D4AF37]/35 px-2.5 py-1 rounded-full shrink-0">
                Padrões Treinados: {learnedRules.length}
              </div>
            </div>

            {/* Rule Creation Form */}
            <form onSubmit={handleCreateCustomRule} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 text-xs text-left">
              <div className="sm:col-span-2 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-300 block mb-1">Palavra / Termo Gatilho de Delegação</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: redes sociais, trancar matricula, design, posts..."
                  value={newRulePattern}
                  onChange={e => setNewRulePattern(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-705 text-white rounded px-2.5 py-1.5 outline-none font-medium focus:border-[#D4AF37]"
                />
              </div>

              <div className="text-left">
                <label className="text-[10px] uppercase font-bold text-slate-300 block mb-1">Responsável Alocado</label>
                <select
                  value={newRuleAssignee}
                  onChange={e => setNewRuleAssignee(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-705 text-[#D4AF37] rounded px-2.5 py-1.5 outline-none font-bold text-amber-400"
                >
                  <option value="Liana Gomes">Liana Gomes</option>
                  <option value="Ana Comercial">Ana (Comercial)</option>
                  <option value="Núria Onboarding">Núria (Suporte)</option>
                  <option value="Luiza Tech">Luiza (Tech)</option>
                </select>
              </div>

              <div className="flex items-end text-left">
                <button
                  type="submit"
                  className="w-full py-1.5 bg-[#D4AF37] hover:bg-white text-slate-950 font-bold block rounded transition-all text-[11px] uppercase tracking-wider"
                >
                  Gravar Padrão
                </button>
              </div>
            </form>

            {/* Rules list display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs max-h-[220px] overflow-y-auto pr-1 text-left">
              {learnedRules.map(rule => {
                return (
                  <div key={rule.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-left relative group">
                    <div className="min-w-0 pr-6 text-left">
                      <p className="font-bold text-[#D4AF37] truncate text-left">"{rule.pattern}"</p>
                      <p className="text-[10px] text-slate-350 text-left">{rule.responsavelId}</p>
                      <span className="text-[8px] uppercase tracking-wide bg-slate-800 text-slate-400 px-1 mt-0.5 inline-block rounded font-mono text-left">
                        Calibrações: {rule.matchCounter || 0}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-slate-500 hover:text-red-400 absolute right-2 top-2 transition-colors lg:opacity-35"
                      title="Excluir padrão"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
