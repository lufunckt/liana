import React, { useState, useEffect, useRef } from 'react';
import { 
  Hash, Lock, Pin, Search, Plus, Send, MessageSquare, 
  Trash2, Edit3, CornerDownRight, Check, X, FileText, 
  Paperclip, Image, Bell, MoreHorizontal, Sparkles, 
  Folder, ArrowRight, UserCheck, ShieldAlert, CheckSquare, ListFilter, Share2,
  ChevronLeft
} from 'lucide-react';
import { useStore } from '../../store';
import { motion, AnimatePresence } from 'motion/react';
import { logAuditEvent } from '../../lib/audit';

// Definitions
interface MessageReply {
  id: string;
  autorNome: string;
  autorId: string;
  avatar: string;
  texto: string;
  dataHora: string;
}

interface Message {
  id: string;
  channelId: string;
  autorId: string;
  autorNome: string;
  avatar: string;
  texto: string;
  dataHora: string;
  pinned?: boolean;
  reacoes?: { emoji: string; count: number; users: string[] }[];
  anexos?: { nome: string; tipo: 'image' | 'pdf' | 'spreadsheet' | 'doc'; url: string }[];
  replies?: MessageReply[];
}

interface Channel {
  id: string;
  nome: string;
  descricao: string;
  isPrivate: boolean;
  unreadCount?: number;
  onlineMembers: string[];
}

interface InternalNotification {
  id: string;
  tipo: 'mention' | 'reply' | 'task' | 'file' | 'message';
  conteudo: string;
  origem: string;
  dataHora: string;
  lida: boolean;
  channelId?: string;
}

// Preset Operators for Liana Gomes team
const OPERATORS = [
  { id: 'liana', nome: 'Liana Gomes', cargo: 'Diretora & Mentora', avatar: '👑', handle: '@Liana', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'nuria', nome: 'Núria Onboarding', cargo: 'Suporte & Operações', avatar: '🌸', handle: '@Nuria', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'ana', nome: 'Ana Comercial', cargo: 'Vendas & Negócios', avatar: '💼', handle: '@Ana', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { id: 'luiza', nome: 'Luiza Gestão', cargo: 'Coordenação Geral', avatar: '⚡', handle: '@Luiza', color: 'bg-rose-100 text-rose-800 border-rose-300' }
];

export function WorkspaceCriativoModule() {
  return null; // temporary mock interface import resolver if required elsewhere
}

export function ComunicacaoInternaModule() {
  const { data, updateModuleData, addSingleDocument, updateSingleField, deleteSingleDocument } = useStore();
  const [currentUser, setCurrentUser] = useState(OPERATORS[3]); // Default operator Luiza (the logged in gestora)

  // Sub-tab / UI states
  const [activeChannelId, setActiveChannelId] = useState('geral');
  const [mobileView, setMobileView] = useState<'channels' | 'chat'>('channels');
  
  // Real database states connected to useStore()
  const channels: Channel[] = data.ilgc_canais || [];
  const messages: Message[] = data.ilgc_mensagens || [];
  const notifications: InternalNotification[] = data.ilgc_notificacoes || [];

  const [searchText, setSearchText] = useState('');
  
  // Interactive creation states
  const [newMessageText, setNewMessageText] = useState('');
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [newChanName, setNewChanName] = useState('');
  const [newChanDesc, setNewChanDesc] = useState('');
  const [newChanPrivate, setNewChanPrivate] = useState(false);
  
  // Edit & reply threads
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [activeThreadMessage, setActiveThreadMessage] = useState<Message | null>(null);
  const [newThreadReplyText, setNewThreadReplyText] = useState('');

  const liveActiveThreadMessage = activeThreadMessage 
    ? (messages.find(m => m.id === activeThreadMessage.id) || activeThreadMessage)
    : null;

  // Pin & Files view selection
  const [showChannelInfoPanel, setShowChannelInfoPanel] = useState(false);
  const [currentInfoTab, setCurrentInfoTab] = useState<'pinned' | 'files'>('pinned');

  // Task integration modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskMessageSource, setTaskMessageSource] = useState<Message | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('Núria Onboarding');
  const [taskPriority, setTaskPriority] = useState('alta');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskNotes, setTaskNotes] = useState('');

  // Notification overlay
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // File attach simulator state
  const [fileSimType, setFileSimType] = useState<'image' | 'pdf' | 'spreadsheet' | 'doc' | null>(null);
  const [fileSimName, setFileSimName] = useState('');
  const [realFilePayload, setRealFilePayload] = useState<string | null>(null);
  const [showGovernanceModal, setShowGovernanceModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll reference
  const chatEndRef = useRef<HTMLDivElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Match the logged-in collaborator on boot & dynamic profiles changes
  useEffect(() => {
    const profileId = localStorage.getItem('ilg_selected_profile') || 'luiza';
    const perfisList = data.perfis || [];
    const activeProfile = perfisList.find((p: any) => p.id === profileId);

    if (activeProfile) {
      setCurrentUser({
        id: activeProfile.id,
        nome: activeProfile.nome || 'Colaborador',
        cargo: activeProfile.cargo || activeProfile.role || 'Membro do Time',
        avatar: activeProfile.avatar || (activeProfile.nome?.includes('Liana') ? '👑' : activeProfile.nome?.includes('Ana') ? '💼' : activeProfile.nome?.includes('Nuria') ? '🌸' : '⚡'),
        handle: `@${(activeProfile.nome || '').replace(/\s+/g, '') || activeProfile.id}`,
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300'
      });
    } else {
      const matched = OPERATORS.find(op => op.id === profileId);
      if (matched) {
        setCurrentUser(matched);
      }
    }
  }, [data.perfis]);

  // Initialize and Seed mock database values in Firestore for communication consistency if empty
  useEffect(() => {
    const isRealMode = localStorage.getItem('ilg_comunicacao_real') === 'true';
    if (isRealMode) return;

    const seedCanais = async () => {
      // Avoid raw empty loops if data object is still loading
      if (data.ilgc_canais && data.ilgc_canais.length === 0) {
        const initialChannels: Channel[] = [
          { id: 'geral', nome: 'geral', descricao: 'Avisos institucionais e alinhamento operacional diário da Central ILG.', isPrivate: false, onlineMembers: ['Liana Gomes', 'Núria Onboarding', 'Ana Comercial', 'Luiza Gestão'] },
          { id: 'comercial', nome: 'comercial', descricao: 'Negociações, conversão de leads, metas comerciais e novos pagamentos.', isPrivate: false, onlineMembers: ['Ana Comercial', 'Liana Gomes'] },
          { id: 'suporte-alunos', nome: 'suporte-alunos', descricao: 'Onboarding de novas turmas, formulários iniciais de diagnóstico e suporte direto.', isPrivate: false, onlineMembers: ['Núria Onboarding', 'Luiza Gestão'] },
          { id: 'conteudo', nome: 'conteúdo', descricao: 'Pautas de mentoria, cronogramas de entrega e materiais didáticos.', isPrivate: false, onlineMembers: ['Liana Gomes', 'Luiza Gestão'] },
          { id: 'design', nome: 'design', descricao: 'Criação de criativos, criativos para lançamentos, identidade visual.', isPrivate: false, onlineMembers: ['Núria Onboarding'] },
          { id: 'certificados', nome: 'certificados', descricao: 'Validação e emissão de certificados das formadas.', isPrivate: false, onlineMembers: ['Núria Onboarding'] },
          { id: 'financeiro', nome: 'financeiro', descricao: 'Relatórios de cobrança, conciliação e lembretes de pendências comerciais.', isPrivate: false, onlineMembers: ['Luiza Gestão'] },
          { id: 'tarefas', nome: 'tarefas', descricao: 'Acompanhamento do kanban de pendências delegadas e operacionais.', isPrivate: false, onlineMembers: ['Núria Onboarding', 'Luiza Gestão', 'Ana Comercial'] },
          { id: 'linkedin-liana', nome: 'linkedin-liana', descricao: 'Ideias de postagem, artigos estratégicos e contatos B2B do LinkedIn da Liana.', isPrivate: false, onlineMembers: ['Liana Gomes', 'Luiza Gestão'] },
          { id: 'lancamentos', nome: 'lançamentos', descricao: 'Estruturação do funil de vendas dos próximos produtos e webinários.', isPrivate: false, onlineMembers: ['Liana Gomes', 'Ana Comercial', 'Luiza Gestão'] },
          { id: 'ideias', nome: 'ideias', descricao: 'Anotações rápidas de novos projetos, novos insights de mentorias.', isPrivate: false, onlineMembers: ['Liana Gomes', 'Núria Onboarding', 'Ana Comercial', 'Luiza Gestão'] },
          { id: 'urgentes', nome: 'urgentes', descricao: 'Assuntos urgentes que exigem atenção imediata da equipe diretiva.', isPrivate: true, onlineMembers: ['Liana Gomes', 'Luiza Gestão'] },
          { id: 'mrp', nome: 'mrp', descricao: 'Acompanhamento exclusivo das alunas da formação Mentoria de Respostas Práticas.', isPrivate: false, onlineMembers: ['Liana Gomes'] },
          { id: 'nutror', nome: 'nutror', descricao: 'Status das aulas gravadas, cadastros e acessos das alunas na Eduzz Nutror.', isPrivate: false, onlineMembers: ['Núria Onboarding'] }
        ];
        for (const chan of initialChannels) {
          await addSingleDocument('ilgc_canais', chan);
        }
      }
    };

    const seedMensagens = async () => {
      if (data.ilgc_mensagens && data.ilgc_mensagens.length === 0) {
        const initialMessages: Message[] = [
          {
            id: 'msg_seed_1',
            channelId: 'geral',
            autorId: 'liana',
            autorNome: 'Liana Gomes',
            avatar: '👑',
            texto: 'Bom dia time! Hoje iniciamos uma semana fundamental para as vendas da mentoria! Vamos acompanhar com precisão as leads do comercial e garantir as integrações no Nutror. Bom trabalho a todas! ✨',
            dataHora: '2026-05-24 09:02',
            pinned: true,
            reacoes: [{ emoji: '❤️', count: 3, users: ['nuria', 'ana', 'luiza'] }, { emoji: '🙌', count: 2, users: ['ana', 'luiza'] }]
          },
          {
            id: 'msg_seed_2',
            channelId: 'geral',
            autorId: 'nuria',
            autorNome: 'Núria Onboarding',
            avatar: '🌸',
            texto: 'Bom dia, Liana! Conte conosco. Já organizei o onboarding das primeiras 10 alunas que compraram no final de semana. Todas já estão no grupo VIP de WhatsApp e responderam o formulário de diagnóstico.',
            dataHora: '2026-05-24 09:15',
            replies: [
              { id: 'rep_1', autorNome: 'Liana Gomes', autorId: 'liana', avatar: '👑', texto: 'Maravilhoso, Núria! O feedback delas é super importante.', dataHora: '2026-05-24 09:20' }
            ]
          },
          {
            id: 'msg_seed_3',
            channelId: 'geral',
            autorId: 'luiza',
            autorNome: 'Luiza Gestão',
            avatar: '⚡',
            texto: 'Prezadas, acabo de subir o arquivo com o cronograma atualizado de entregas e live sessions de junho para termos como base de alinhamento com as alunas.',
            dataHora: '2026-05-24 10:11',
            anexos: [
              { nome: 'Cronograma_Sessions_ILG_Junho2026.pdf', tipo: 'pdf', url: '#' }
            ]
          },
          {
            id: 'msg_seed_4',
            channelId: 'comercial',
            autorId: 'ana',
            autorNome: 'Ana Comercial',
            avatar: '💼',
            texto: 'Meninas, notei que a lead Mariana de Souza está em dúvida sobre o parcelamento. Vou propor a ela a facilitação via PIX parcelado em 3x direto na nossa plataforma. Liana, você valida?',
            dataHora: '2026-05-25 14:30',
            reacoes: [{ emoji: '👍', count: 1, users: ['liana'] }]
          },
          {
            id: 'msg_seed_5',
            channelId: 'comercial',
            autorId: 'liana',
            autorNome: 'Liana Gomes',
            avatar: '👑',
            texto: 'Perfeito, Ana! Pode liberar sim. Já temos o histórico dela salvo no CRM e ela se mostrou muito engajada na live de quinta-feira. Vale a pena prender essa aluna.',
            dataHora: '2026-05-25 14:45',
            pinned: true
          },
          {
            id: 'msg_seed_6',
            channelId: 'suporte-alunos',
            autorId: 'nuria',
            autorNome: 'Núria Onboarding',
            avatar: '🌸',
            texto: 'Precisamos validar o acesso da aluna Roberta Lima no Nutror. Ela alegou que recebeu o convite, mas ao entrar diz que o curso está indisponível. Luiza, consegue conferir no painel administrativo?',
            dataHora: '2026-05-26 11:15',
            pinned: false
          },
          {
            id: 'msg_seed_7',
            channelId: 'design',
            autorId: 'nuria',
            autorNome: 'Núria Onboarding',
            avatar: '🌸',
            texto: 'Fiz os criativos em formato carrossel para a divulgação do case de sucesso da aluna Carla Mendes. Ficou excelente!',
            dataHora: '2026-05-26 15:00',
            anexos: [
              { nome: 'carrossel_carla_case_ilg.png', tipo: 'image', url: '#' }
            ]
          }
        ];
        for (const msg of initialMessages) {
          await addSingleDocument('ilgc_mensagens', msg);
        }
      }
    };

    const seedNotificacoes = async () => {
      if (data.ilgc_notificacoes && data.ilgc_notificacoes.length === 0) {
        const initialNotes: InternalNotification[] = [
          {
            id: 'note_1',
            tipo: 'mention',
            conteudo: 'Liana Gomes marcou você no canal #comercial sobre uma aluna pendente.',
            origem: 'Liana Gomes',
            dataHora: 'Há 5 min',
            lida: false,
            channelId: 'comercial'
          },
          {
            id: 'note_2',
            tipo: 'reply',
            conteudo: 'A Liana respondeu sua resposta em thread no #geral.',
            origem: 'Liana Gomes',
            dataHora: 'Há 1 hora',
            lida: true,
            channelId: 'geral'
          }
        ];
        for (const note of initialNotes) {
          await addSingleDocument('ilgc_notificacoes', note);
        }
      }
    };

    seedCanais();
    seedMensagens();
    seedNotificacoes();
  }, [data.ilgc_canais, data.ilgc_mensagens, data.ilgc_notificacoes]);

  // Sync state helpers
  const saveChannelsState = (updated: Channel[]) => {
    updateModuleData('ilgc_canais', updated);
  };

  const saveMessagesState = (updated: Message[]) => {
    updateModuleData('ilgc_mensagens', updated);
  };

  const saveNotificationsState = (updated: InternalNotification[]) => {
    updateModuleData('ilgc_notificacoes', updated);
  };

  // Auto scroll effects
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThreadMessage]);

  // Scan for mentions and notify other operator users in real time
  const checkAndCreateRealNotification = (text: string, channelId: string, replyOriginMessageAuthor?: string) => {
    OPERATORS.forEach(op => {
      // If mentioned, or if they are the author of a message being replied to in a thread
      const isMentioned = text.toLowerCase().includes(op.handle.toLowerCase());
      const isReplyingToThem = replyOriginMessageAuthor && op.nome === replyOriginMessageAuthor;
      
      if ((isMentioned || isReplyingToThem) && op.id !== currentUser.id) {
        const newNote: InternalNotification = {
          id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
          tipo: isMentioned ? 'mention' : 'reply',
          conteudo: isMentioned 
            ? `${currentUser.nome} marcou você em #${channels.find(c => c.id === channelId)?.nome || 'canal'}: "${text.substring(0, 45)}..."`
            : `${currentUser.nome} respondeu sua thread em #${channels.find(c => c.id === channelId)?.nome || 'canal'}`,
          origem: currentUser.nome,
          dataHora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
          lida: false,
          channelId: channelId
        };
        addSingleDocument('ilgc_notificacoes', newNote);
      }
    });
  };

  // Send email notifications to all configured corporate profiles + fallbacks + evaluating tester
  const sendEmailNotification = (text: string, channelName: string) => {
    const perfisList = data.perfis || [];
    const recipientsSet = new Set<string>();
    
    // 1. Gather configured emails from actual Firestore database profiles
    perfisList.forEach((p: any) => {
      if (p.id !== currentUser.id && p.email && p.email.includes('@')) {
        recipientsSet.add(p.email.trim());
      }
    });

    // 2. Map default operators to standard emails as reliable fallback
    const fallbackEmails: Record<string, string> = {
      liana: 'liane_gomes@hotmail.com',
      nuria: 'nuria.suporte@gmail.com',
      ana: 'ana.comercial.ilg@gmail.com',
      luiza: 'luiza.gestao.ilg@gmail.com'
    };

    Object.entries(fallbackEmails).forEach(([opId, emailAddr]) => {
      if (opId !== currentUser.id) {
        recipientsSet.add(emailAddr);
      }
    });

    // 3. Always include evaluating user email so they receive notification
    const userSessionEmail = 'ericocavalheiro.psico@gmail.com';
    if (userSessionEmail && currentUser.id !== 'developer') {
      recipientsSet.add(userSessionEmail);
    }

    const recipients = Array.from(recipientsSet);
    if (recipients.length === 0) return;

    fetch('/api/comunicacao/notificar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        senderName: currentUser.nome,
        channelName,
        text,
        recipients
      })
    })
    .then(res => res.json())
    .then(resData => {
      console.log('[Email notify dispatch success]', resData);
    })
    .catch(err => {
      console.error('[Email notify dispatch failed]', err);
    });
  };

  // Handle send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessageText.trim() && !fileSimName) return;

    const newMsg: Message = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      channelId: activeChannelId,
      autorId: currentUser.id,
      autorNome: currentUser.nome,
      avatar: currentUser.avatar || '⚡',
      texto: newMessageText,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reacoes: [],
      replies: []
    };

    // Embed simulated or real attachment if selected
    if (fileSimName && fileSimType) {
      newMsg.anexos = [{
        nome: fileSimName,
        tipo: fileSimType,
        url: realFilePayload || '#'
      }];
    }

    await addSingleDocument('ilgc_mensagens', newMsg);

    // Scan for mentions / notify real-time peers with in-portal notifications
    checkAndCreateRealNotification(newMessageText, activeChannelId);

    // Trigger SMTP email reminders
    const activeChan = channels.find(c => c.id === activeChannelId) || { nome: activeChannelId };
    sendEmailNotification(newMessageText, activeChan.nome);

    // Clear composer states
    setNewMessageText('');
    setFileSimName('');
    setFileSimType(null);
    setRealFilePayload(null);
  };

  // Thread replies sending
  const handleSendThreadReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadReplyText.trim() || !liveActiveThreadMessage) return;

    const newReply: MessageReply = {
      id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
      autorNome: currentUser.nome,
      autorId: currentUser.id,
      avatar: currentUser.avatar || '⚡',
      texto: newThreadReplyText,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const replies = liveActiveThreadMessage.replies ? [...liveActiveThreadMessage.replies, newReply] : [newReply];
    await updateSingleField('ilgc_mensagens', liveActiveThreadMessage.id, { replies });
    
    // Sync local active thread panel state immediately
    setActiveThreadMessage({ ...liveActiveThreadMessage, replies });

    // Notify mentioned users *and* the thread author
    checkAndCreateRealNotification(newThreadReplyText, activeChannelId, liveActiveThreadMessage.autorNome);

    // Dispatch email reminders
    const activeChan = channels.find(c => c.id === activeChannelId) || { nome: activeChannelId };
    sendEmailNotification(newThreadReplyText, `${activeChan.nome} (Thread)`);

    setNewThreadReplyText('');
  };

  // Message Actions: Pin / Edit / Remove
  const handleTogglePin = async (msgId: string) => {
    const msg = messages.find(m => m.id === msgId);
    if (msg) {
      await updateSingleField('ilgc_mensagens', msgId, { pinned: !msg.pinned });
    }
  };

  const handleStartEdit = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditingText(msg.texto);
  };

  const handleSaveEdit = async (msgId: string) => {
    await updateSingleField('ilgc_mensagens', msgId, { texto: editingText });
    setEditingMessageId(null);
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (confirm('Tem certeza que deseja apagar esta mensagem permanentemente?')) {
      await deleteSingleDocument('ilgc_mensagens', msgId);
      if (activeThreadMessage?.id === msgId) {
        setActiveThreadMessage(null);
      }
    }
  };

  // Reactions Simple Emojis
  const handleEmojiReact = async (msgId: string, emoji: string) => {
    const msg = messages.find(m => m.id === msgId);
    if (msg) {
      const rx = msg.reacoes ? [...msg.reacoes] : [];
      const existingReact = rx.find(r => r.emoji === emoji);
      if (existingReact) {
        if (existingReact.users.includes(currentUser.id)) {
          // Remove reaction
          existingReact.users = existingReact.users.filter(u => u !== currentUser.id);
          existingReact.count -= 1;
        } else {
          existingReact.users.push(currentUser.id);
          existingReact.count += 1;
        }
      } else {
        rx.push({ emoji, count: 1, users: [currentUser.id] });
      }
      const filteredReacts = rx.filter(r => r.count > 0);
      await updateSingleField('ilgc_mensagens', msgId, { reacoes: filteredReacts });
    }
  };

  // Add Custom Channel
  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName.trim()) return;

    const formattedName = newChanName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
    const newChan: Channel = {
      id: 'chan_' + Date.now(),
      nome: formattedName,
      descricao: newChanDesc || 'Canal de comunicação operacional para a equipe ILG.',
      isPrivate: newChanPrivate,
      onlineMembers: [currentUser.nome]
    };

    const updated = [...channels, newChan];
    saveChannelsState(updated);
    setActiveChannelId(newChan.id);

    // Reset fields
    setNewChanName('');
    setNewChanDesc('');
    setNewChanPrivate(false);
    setShowChannelModal(false);

    alert(`O canal #${formattedName} foi criado com sucesso!`);
  };

  // Push custom notification simulator when transforming to task
  const handleTransformMessageToTask = (msg: Message) => {
    setTaskMessageSource(msg);
    setTaskTitle(`Resolver conversa #${channels.find(c => c.id === msg.channelId)?.nome}: "${msg.texto.substring(0, 30)}..."`);
    setTaskDeadline(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setTaskNotes(`Tarefa criada a partir do comunicado interno.\nAutor: ${msg.autorNome}\nTexto Original:\n"${msg.texto}"\nLink de Contexto: Central de Comunicação > Canal: #${channels.find(c => c.id === msg.channelId)?.nome}`);
    setShowTaskModal(true);
  };

  const handleSaveDelegatedTask = async () => {
    if (!taskTitle.trim()) return;

    // We will append to the actual general list of support tasks (tarefas_suporte) inside our Firebase collection!
    const activeTasks = data.tarefas_suporte || [];
    const newTask = {
      id: 'ts_' + Date.now(),
      titulo: taskTitle,
      responsavel: taskAssignee,
      prioridade: taskPriority,
      descricao: taskNotes,
      categoria: 'Comunicação Interna',
      tipo: 'tarefa',
      status: 'a fazer',
      prazo: taskDeadline || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const updated = [newTask, ...activeTasks];
    await updateModuleData('tarefas_suporte', updated);

    // Add notification that task is assigned
    const newNote: InternalNotification = {
      id: 'note_' + Date.now(),
      tipo: 'task',
      conteudo: `Sucesso: Nova tarefa delegada a ${taskAssignee} criada a partir da discussão interna!`,
      origem: 'Central Operacional',
      dataHora: 'Agora',
      lida: false
    };
    saveNotificationsState([newNote, ...notifications]);

    setShowTaskModal(false);
    setTaskMessageSource(null);
    alert(`Tarefa criada com sucesso e sincronizada! Responsável: ${taskAssignee}`);
  };

  // Real and virtual document selection triggers
  const handleSelectRealFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Enforce clean offline persistence limits
      if (file.size > 2 * 1024 * 1024) {
        alert("Atenção: O sistema armazena documentos e canais em tempo real no banco criptografado. Para um bom desempenho, envie arquivos menores que 2MB.");
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
        let detectedType: 'image' | 'pdf' | 'spreadsheet' | 'doc' = 'pdf';
        if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(fileExt)) {
          detectedType = 'image';
        } else if (['xls', 'xlsx', 'csv'].includes(fileExt)) {
          detectedType = 'spreadsheet';
        } else if (['doc', 'docx', 'odt'].includes(fileExt)) {
          detectedType = 'doc';
        }

        setFileSimName(file.name);
        setFileSimType(detectedType);
        setRealFilePayload(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachVirtualFile = (tipo: 'image' | 'pdf' | 'spreadsheet' | 'doc') => {
    if (fileInputRef.current) {
      const accepts = {
        image: 'image/*',
        pdf: '.pdf',
        spreadsheet: '.xls,.xlsx,.csv',
        doc: '.doc,.docx,.odt'
      };
      fileInputRef.current.accept = accepts[tipo];
      fileInputRef.current.click();
    }
  };

  // Notifications helper
  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, lida: true }));
    saveNotificationsState(updated);
  };

  // Data governance / Clean Production Mode Handlers
  const handleWipeDemoContent = async () => {
    if (window.confirm('Atenção: Isso irá remover em definitivo todas as conversas e comunicados de demonstração cadastrados no Firestore para liberar o canal corporativo 100% limpo para uso diário real. Deseja prosseguir?')) {
      try {
        localStorage.setItem('ilg_comunicacao_real', 'true');
        
        // Clear all previous simulated messages
        for (const msg of messages) {
          await deleteSingleDocument('ilgc_mensagens', msg.id);
        }

        // Keep standard sectors but also clear notifications
        for (const note of notifications) {
          await deleteSingleDocument('ilgc_notificacoes', note.id);
        }

        try {
          await logAuditEvent('ativacao_canal_real_comunicacoes', 'sistema', { action: 'wipe_demo_data', status: 'real_activated' });
        } catch (e) {
          console.error(e);
        }

        alert('Sucesso! O banco de dados do Firestore foi limpo e formatado em Modo do Canal Corporativo de Produção Real. Agora você já pode escrever e anexar documentos reais!');
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('Falha ao limpar Firestore. Verifique sua conexão com a internet.');
      }
    }
  };

  const handleRestoreDemoContent = () => {
    if (window.confirm('Deseja reativar as conversas operacionais de demonstração para fins de teste ou auditoria?')) {
      localStorage.removeItem('ilg_comunicacao_real');
      try {
        logAuditEvent('reativacao_dados_demonstracao', 'sistema', { action: 'restore_demo_data', status: 'demo_activated' }).catch(console.error);
      } catch (e) {}
      alert('Modo de demonstração reativado! O sistema recarregará as mensagens padrão.');
      window.location.reload();
    }
  };

  // Global Filter queries messages text, files, and users
  const getFilteredMessages = () => {
    const rawChanMsgs = messages.filter(m => m.channelId === activeChannelId);
    if (!searchText) return rawChanMsgs;

    const lowerSearch = searchText.toLowerCase();
    return messages.filter(m => {
      const matchText = m.texto.toLowerCase().includes(lowerSearch);
      const matchAuthor = m.autorNome.toLowerCase().includes(lowerSearch);
      
      // Match attachments if any
      const matchFile = m.anexos?.some(file => file.nome.toLowerCase().includes(lowerSearch));
      
      // Match threads
      const matchThread = m.replies?.some(rep => rep.texto.toLowerCase().includes(lowerSearch));

      return matchText || matchAuthor || matchFile || matchThread;
    });
  };

  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0] || { id: 'geral', nome: 'geral', descricao: 'Avisos institucionais e alinhamento operacional diário da Central ILG.', isPrivate: false, onlineMembers: [] };
  const filteredMessages = getFilteredMessages();
  const unreadNotesCount = notifications.filter(n => !n.lida).length;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] bg-[#FCFBF9] text-slate-800 rounded-2xl overflow-hidden border border-slate-200 shadow-sm" id="ilg-comunicacaointerna">
      
      {/* 1. LEFT SIDEBAR (CHANNELS PANEL) */}
      <div className={`w-full md:w-64 bg-[#0A192F] text-slate-300 flex-col shrink-0 border-r border-[#10243e] ${mobileView === 'channels' ? 'flex h-full' : 'hidden md:flex'}`}>
        
        {/* Workspace Brand / Team Select */}
        <div className="p-4 border-b border-[#10243e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg font-bold text-xs">
              ILG
            </span>
            <div className="text-left">
              <h2 className="font-bold text-xs text-white uppercase tracking-wider">Instituto Liana</h2>
              <p className="text-[10px] text-slate-400">Canal Operacional Equipe</p>
            </div>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition relative text-slate-300"
            >
              <Bell className="w-4 h-4" />
              {unreadNotesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center animate-bounce">
                  {unreadNotesCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown card */}
            <AnimatePresence>
              {showNotificationsDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden"
                >
                  <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-slate-500" /> Notificações ({unreadNotesCount})
                    </span>
                    <button 
                      onClick={handleMarkAllNotificationsRead}
                      className="text-[10px] text-[#1F4E89] hover:underline font-bold"
                    >
                      Ler todas
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">Sem notificações operacionais.</div>
                    ) : (
                      notifications.map(note => (
                        <div 
                          key={note.id} 
                          onClick={() => {
                            if (note.channelId) {
                              setActiveChannelId(note.channelId);
                            }
                            setShowNotificationsDropdown(false);
                          }}
                          className={`p-3 text-left hover:bg-slate-50 transition cursor-pointer ${!note.lida ? 'bg-amber-50/50 border-l-2 border-[#D4AF37]' : ''}`}
                        >
                          <p className="text-xs text-slate-700 leading-snug">{note.conteudo}</p>
                          <div className="flex justify-between items-center mt-1 text-[9px] text-slate-400">
                            <span>{note.origem}</span>
                            <span>{note.dataHora}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Current logged-in operator tagger */}
        <div className="px-4 py-2 bg-[#0d213c] border-b border-[#10243e] flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm bg-slate-800 rounded-full w-6 h-6 flex items-center justify-center">{currentUser.avatar}</span>
            <div className="text-left leading-none">
              <span className="text-xs font-semibold text-white block">{currentUser.nome}</span>
              <span className="text-[9px] text-slate-400">{currentUser.cargo}</span>
            </div>
          </div>
          <select 
            value={currentUser.id} 
            onChange={(e) => {
              const selectedProfileId = e.target.value;
              localStorage.setItem('ilg_selected_profile', selectedProfileId);
              
              const perfisList = data.perfis || [];
              const activeProfile = perfisList.find((p: any) => p.id === selectedProfileId);
              if (activeProfile) {
                setCurrentUser({
                  id: activeProfile.id,
                  nome: activeProfile.nome || 'Colaborador',
                  cargo: activeProfile.cargo || activeProfile.role || 'Membro do Time',
                  avatar: activeProfile.avatar || (activeProfile.nome?.includes('Liana') ? '👑' : activeProfile.nome?.includes('Ana') ? '💼' : activeProfile.nome?.includes('Nuria') ? '🌸' : '⚡'),
                  handle: `@${(activeProfile.nome || '').replace(/\s+/g, '') || activeProfile.id}`,
                  color: 'bg-indigo-100 text-indigo-800 border-indigo-300'
                });
              } else {
                const matched = OPERATORS.find(op => op.id === selectedProfileId);
                if (matched) setCurrentUser(matched);
              }
              
              // Notify rest of the portal of active profile synchronization
              window.dispatchEvent(new Event('storage'));
            }}
            className="bg-transparent text-[10px] text-[#D4AF37] font-bold border-none outline-none cursor-pointer p-0"
          >
            {(data.perfis && data.perfis.length > 0 ? data.perfis : OPERATORS).map((op: any) => (
              <option key={op.id} value={op.id} className="text-slate-900 font-normal">
                {op.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Channels List Header */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between bg-[#081525]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Hash className="w-3.5 h-3.5" /> Canais / Setores
          </span>
          <button 
            onClick={() => setShowChannelModal(true)}
            className="p-1 bg-[#10243e] hover:bg-[#D4AF37] hover:text-[#0A192F] text-slate-300 rounded transition"
            title="Criar novo canal de setor"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Channels Scroll list */}
        <div className="flex-1 overflow-y-auto py-1 space-y-[2px] pr-1">
          {channels.map((chan) => {
            const isActive = chan.id === activeChannelId;
            return (
              <button
                key={chan.id}
                onClick={() => {
                  setActiveChannelId(chan.id);
                  setActiveThreadMessage(null); // automatic reset
                  setMobileView('chat');
                }}
                className={`w-full px-4 py-2 flex items-center justify-between text-left text-xs transition-all ${
                  isActive 
                    ? 'bg-[#1F4E89] text-[#FCFBF9] font-bold border-l-4 border-[#D4AF37]' 
                    : 'hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {chan.isPrivate ? (
                    <Lock className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                  ) : (
                    <Hash className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                  )}
                  <span className="truncate">{chan.nome}</span>
                </div>
                {chan.unreadCount && chan.unreadCount > 0 ? (
                  <span className="bg-red-500 text-white rounded-full px-1.5 py-0.2 text-[9px] font-extrabold">
                    {chan.unreadCount}
                  </span>
                ) : (
                  <span className="text-[9px] text-[#D4AF37]/50 font-mono tracking-tight font-light">
                    • {chan.onlineMembers.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global/Sidebar Demo vs Real Mode Indicator */}
        <div className="p-3.5 border-t border-[#10243e] bg-[#071324]/90">
          {localStorage.getItem('ilg_comunicacao_real') === 'true' ? (
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-extrabold font-sans tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              MODO REAL ATIVO (PRODUÇÃO)
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[10px] text-amber-405 font-extrabold flex items-center gap-2 tracking-wider text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce"></span>
                AMBIENTE DE DEMONSTRÁVEL
              </div>
              <p className="text-[9.5px] text-slate-400 leading-normal font-sans">
                Inicializado com conversas cooperativas para facilitar testes da equipe de SDR, CS e Gestão.
              </p>
              <button
                type="button"
                onClick={handleWipeDemoContent}
                className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-500 to-[#D4AF37] hover:from-amber-600 hover:to-[#C39F2D] text-slate-950 font-black text-[9px] uppercase rounded tracking-wider transition cursor-pointer text-center block select-none border-none shadow-md"
              >
                Limpar Demo e Ativar Canal Real
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div className={`flex-1 flex-col bg-[#FCFBF9] min-w-0 ${mobileView === 'chat' ? 'flex h-full' : 'hidden md:flex'}`}>
        
        {/* Chat Header banner */}
        <div className="p-4 border-b border-slate-200 bg-white/50 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="text-left flex items-center gap-2 md:gap-0 min-w-0 w-full md:w-auto">
            {/* Back Button for mobile */}
            <button 
              onClick={() => setMobileView('channels')}
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 shadow-2xs border border-slate-200 text-slate-700 font-extrabold flex items-center gap-1 shrink-0 cursor-pointer select-none"
              title="Voltar para canais"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
              <span className="text-[10px] uppercase tracking-wider">Canais</span>
            </button>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1 font-sans truncate">
                  {activeChannel.isPrivate ? <Lock className="w-4 h-4 text-amber-600 shrink-0" /> : <Hash className="w-4 h-4 text-slate-500 shrink-0" />}
                  {activeChannel.nome}
                </span>
                <span className="text-[10px] bg-slate-100 text-[#1F4E89] px-2 py-0.5 rounded font-extrabold uppercase select-none tracking-wider shrink-0">
                  {activeChannel.isPrivate ? 'Restrito' : 'Livre'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-sans leading-relaxed truncate max-w-[200px] sm:max-w-md">
                {activeChannel.descricao}
              </p>
            </div>
          </div>

          {/* Quick Search & pinned toggles */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 self-start md:self-auto w-full md:w-auto mt-1 md:mt-0">
            <div className="relative flex-1 sm:flex-initial min-w-[120px]">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Busca canais..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-100/90 border border-slate-200 text-xs rounded-lg outline-none w-full sm:w-40 lg:w-48 focus:border-[#1F4E89] text-slate-800"
              />
              {searchText && (
                <button 
                  onClick={() => setSearchText('')}
                  className="absolute right-2.5 top-2 hover:bg-slate-200 p-0.5 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button 
              onClick={() => {
                setShowChannelInfoPanel(!showChannelInfoPanel);
                setCurrentInfoTab('pinned');
              }}
              className={`p-1.5 sm:p-2 border rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition flex-1 sm:flex-initial ${
                showChannelInfoPanel && currentInfoTab === 'pinned' 
                  ? 'bg-amber-50 text-amber-700 border-amber-300' 
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300'
              }`}
              title="Mensagens fixadas do canal (cronogramas, links, decisões)"
            >
              <Pin className="w-3.5 h-3.5" />
              <span className="inline text-[10px] sm:text-xs">Fixados</span>
            </button>

            <button 
              onClick={() => {
                setShowChannelInfoPanel(!showChannelInfoPanel);
                setCurrentInfoTab('files');
              }}
              className={`p-1.5 sm:p-2 border rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition flex-1 sm:flex-initial ${
                showChannelInfoPanel && currentInfoTab === 'files' 
                  ? 'bg-slate-100 text-[#1F4E89] border-slate-350 font-bold' 
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-300'
              }`}
              title="Arquivos e links compartilhados neste canal"
            >
              <Folder className="w-3.5 h-3.5" />
              <span className="inline text-[10px] sm:text-xs">Arquivos</span>
            </button>

            <button 
              onClick={() => setShowGovernanceModal(true)}
              className="p-1.5 sm:p-2 border border-[#D4AF37]/45 hover:bg-[#D4AF37]/10 bg-[#FCFBF9] text-amber-800 hover:text-[#0A192F] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition flex-1 sm:flex-initial"
              title="Acessar painel de gerenciamento de dados reais de produção, limpar demonstrações e obter o link do portal externo"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
              <span className="inline text-[10px] sm:text-xs text-slate-800 font-extrabold font-sans">Sincronização & Ingestão</span>
            </button>
          </div>
        </div>

        {/* Global Search Notice bar if filter active */}
        {searchText && (
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
            <span>
              Resultado da busca por: <strong>"{searchText}"</strong> - {filteredMessages.length} mensagens encontradas na base.
            </span>
            <button 
              onClick={() => setSearchText('')}
              className="text-[#1F4E89] font-bold hover:underline"
            >
              Limpar busca
            </button>
          </div>
        )}

        {/* Main Feed of Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-450 border border-dashed border-slate-200 bg-white rounded-xl">
              <span className="text-3xl mb-2">💬</span>
              <p className="text-xs text-slate-500 font-bold">Sem correspondência no momento.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Mande a primeira mensagem operacional do setor!</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const operatorColor = OPERATORS.find(op => op.id === msg.autorId)?.color || 'bg-slate-100 text-slate-800';
              const isOwnMessage = msg.autorId === currentUser.id;
              
              return (
                <div key={msg.id} className="group flex gap-3 p-3 bg-white hover:bg-slate-50/50 border border-transparent hover:border-slate-150 rounded-xl transition duration-150 relative">
                  
                  {/* Avatar wrapper */}
                  <div className="flex-none">
                    <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-lg select-none">
                      {msg.avatar || '👩'}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{msg.autorNome}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium border ${operatorColor}`}>
                          {OPERATORS.find(op => op.id === msg.autorId)?.cargo}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal pl-1">{msg.dataHora}</span>
                      </div>

                      {/* Floating actions menu on hover */}
                      <div className="absolute top-2.5 right-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white/90 backdrop-blur-xs border border-slate-200 p-1 rounded-lg shadow-sm transition">
                        
                        {/* Reaction fast buttons */}
                        <button 
                          onClick={() => handleEmojiReact(msg.id, '👍')}
                          className="p-1 hover:bg-slate-100 rounded text-xs" 
                          title="Curtir"
                        >
                          👍
                        </button>
                        <button 
                          onClick={() => handleEmojiReact(msg.id, '❤️')}
                          className="p-1 hover:bg-slate-100 rounded text-xs" 
                          title="Amei"
                        >
                          ❤️
                        </button>
                        <button 
                          onClick={() => handleEmojiReact(msg.id, '🙌')}
                          className="p-1 hover:bg-slate-100 rounded text-xs" 
                          title="Parabéns"
                        >
                          🙌
                        </button>

                        <div className="w-px h-4 bg-slate-250 mx-1" />

                        {/* Thread reply */}
                        <button 
                          onClick={() => setActiveThreadMessage(msg)}
                          className={`p-1 hover:bg-slate-100 rounded text-slate-650 ${activeThreadMessage?.id === msg.id ? 'bg-[#1F4E89]/10 text-[#1F4E89] font-bold' : ''}`}
                          title="Responder em Thread (tópico separado)"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                        </button>

                        {/* Pin content */}
                        <button 
                          onClick={() => handleTogglePin(msg.id)}
                          className={`p-1 hover:bg-slate-100 rounded ${msg.pinned ? 'text-amber-500' : 'text-slate-400'}`}
                          title={msg.pinned ? 'Desafixar mensagem' : 'Fixar como processo importante'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        {/* Actions of message editor */}
                        {isOwnMessage && (
                          <>
                            <button 
                              onClick={() => handleStartEdit(msg)}
                              className="p-1 hover:bg-slate-100 rounded text-blue-650"
                              title="Editar mensagem"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="p-1 hover:bg-slate-100 rounded text-red-650"
                              title="Excluir mensagem"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        <div className="w-px h-4 bg-slate-250 mx-1" />

                        {/* Task transform direct link */}
                        <button 
                          onClick={() => handleTransformMessageToTask(msg)}
                          className="p-1 hover:bg-violet-50 hover:text-violet-700 rounded text-violet-500 font-bold flex items-center gap-0.5 text-[9px]"
                          title="Delegar como Tarefa Oficial da Equipe no Firebase"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-violet-600" />
                          <span className="hidden sm:inline">Criar Tarefa</span>
                        </button>
                      </div>

                    </div>

                    {/* Messages Body / Editable text boxes */}
                    {editingMessageId === msg.id ? (
                      <div className="mt-2 space-y-1.5">
                        <textarea 
                          className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white text-slate-800 outline-none focus:border-[#1F4E89]"
                          rows={3}
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                        />
                        <div className="flex gap-1.5 justify-end">
                          <button 
                            onClick={() => setEditingMessageId(null)}
                            className="px-2 py-1 text-[10px] font-bold border border-slate-300 text-slate-600 rounded"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={() => handleSaveEdit(msg.id)}
                            className="px-2 py-1 text-[10px] font-bold bg-[#1F4E89] hover:bg-[#D4AF37] text-white hover:text-[#0a192f] rounded"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-700 leading-relaxed font-normal mt-1 whitespace-pre-wrap">
                        {msg.texto}
                      </p>
                    )}

                    {/* Attachment files rendering */}
                    {msg.anexos && msg.anexos.map((file, idx) => (
                      <div key={idx} className="mt-2 bg-slate-50 border border-slate-200 p-2.5 rounded-lg max-w-sm flex items-center justify-between gap-3 text-xs shadow-2xs">
                        <div className="flex items-center gap-2 truncate">
                          {file.tipo === 'pdf' && <FileText className="w-6 h-6 text-red-500 shrink-0" />}
                          {file.tipo === 'image' && <Image className="w-6 h-6 text-emerald-500 shrink-0" />}
                          {file.tipo === 'spreadsheet' && <FileText className="w-6 h-6 text-emerald-700 shrink-0" />}
                          {file.tipo === 'doc' && <FileText className="w-6 h-6 text-indigo-500 shrink-0" />}
                          
                          <div className="text-left leading-none truncate">
                            <span className="font-bold text-slate-800 block truncate">{file.nome}</span>
                            <span className="text-[9px] text-slate-400 capitalize">{file.tipo} de suporte</span>
                          </div>
                        </div>
                        <a 
                          href={file.url} 
                          download={file.nome}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-[#1F4E89]/5 hover:bg-[#1F4E89]/15 border border-[#1F4E89]/25 rounded text-[10px] font-bold text-[#1F4E89] shadow-2xs transition"
                        >
                          Baixar
                        </a>
                      </div>
                    ))}

                    {/* Reactions tags below msg */}
                    {msg.reacoes && msg.reacoes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {msg.reacoes.map((react, i) => {
                          const hasReacted = react.users.includes(currentUser.id);
                          return (
                            <button
                              key={i}
                              onClick={() => handleEmojiReact(msg.id, react.emoji)}
                              className={`px-2 py-0.5 text-[10px] rounded-full border flex items-center gap-1 transition ${
                                hasReacted 
                                  ? 'bg-[#1F4E89]/10 border-[#1F4E89] text-[#1F4E89] font-bold' 
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span>{react.emoji}</span>
                              <span>{react.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* PIN INDICATOR BAR */}
                    {msg.pinned && (
                      <div className="mt-2.5 flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50/70 border border-amber-200/40 w-fit px-2 py-0.5 rounded-md">
                        <Pin className="w-3 h-3" />
                        <span>Fixado operacional</span>
                      </div>
                    )}

                    {/* Thread link button below */}
                    {msg.replies && msg.replies.length > 0 && (
                      <button 
                        onClick={() => setActiveThreadMessage(msg)}
                        className="mt-3 text-[10px] text-[#1F4E89] hover:underline bg-slate-100/50 hover:bg-slate-150 border border-slate-200/60 px-3 py-1 rounded-lg font-bold flex items-center gap-1 w-fit"
                      >
                        <MessageSquare className="w-3 h-3 text-[#1F4E89]" />
                        <span>Ver {msg.replies.length} {msg.replies.length === 1 ? 'resposta' : 'respostas'} no tópico</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </button>
                    )}

                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Messaging Composer Form */}
        <div className="p-4 border-t border-slate-200 bg-white shadow-xs">
          
          {/* Simulated File Attachments Indicator Bar if Selected */}
          {fileSimName && (
            <div className="mb-2 bg-[#FCFBF9] border border-[#D4AF37]/45 p-2 rounded-lg text-xs flex items-center justify-between w-fit gap-4 shadow-[#D4AF37]/5 shadow-xs">
              <span className="flex items-center gap-1 text-slate-700">
                <Paperclip className="w-3.5 h-3.5 text-[#D4AF37]" />
                Anexo pronto: <strong className="text-slate-900">{fileSimName}</strong>
              </span>
              <button 
                onClick={() => {
                  setFileSimName('');
                  setFileSimType(null);
                }}
                className="text-red-500 hover:text-red-700 p-0.5 hover:bg-slate-100 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-3">
            {/* Hidden native HTML5 file input for real document sharing */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleSelectRealFile} 
              className="hidden" 
            />
            
            {/* Real Text Box area with autocomplete simulation */}
            <div className="relative">
              <textarea 
                placeholder={`Mandar mensagem operacional no #${activeChannel.nome}... (marcar equipe como @Nuria, @Liana, @Ana, @Luiza)`}
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={2}
                className="w-full text-xs border border-slate-200 rounded-xl px-4 py-3 bg-[#FCFBF9] text-slate-800 outline-none pr-14 focus:border-[#1F4E89] shadow-inner placeholder-slate-400 leading-relaxed font-sans"
              />
              <button 
                type="submit"
                disabled={!newMessageText.trim() && !fileSimName}
                className="absolute right-3.5 bottom-3.5 p-2 bg-[#0A192F] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A192F] rounded-lg disabled:opacity-25 disabled:hover:bg-[#0A192F] disabled:hover:text-[#D4AF37] transition duration-200"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Attachment Simulators Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1.5 border-t border-slate-100">
              
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pr-1 hidden xs:inline">Anexar:</span>
                
                <button 
                  type="button" 
                  onClick={() => handleAttachVirtualFile('pdf')}
                  className="px-2 py-1 bg-white hover:bg-slate-105 text-slate-700 text-[10px] font-semibold rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-red-500" /> <span className="text-[9px]">PDF</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => handleAttachVirtualFile('image')}
                  className="px-2 py-1 bg-white hover:bg-slate-105 text-slate-700 text-[10px] font-semibold rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <Image className="w-3 h-3 text-emerald-500" /> <span className="text-[9px]">Img</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => handleAttachVirtualFile('spreadsheet')}
                  className="px-2 py-1 bg-white hover:bg-slate-105 text-slate-700 text-[10px] font-semibold rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-emerald-700" /> <span className="text-[9px]">XLS</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => handleAttachVirtualFile('doc')}
                  className="px-2 py-1 bg-white hover:bg-slate-105 text-slate-700 text-[10px] font-semibold rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3 h-3 text-blue-500" /> <span className="text-[9px]">Doc</span>
                </button>
              </div>

              {/* Mention Quick Adders tags */}
              <div className="flex items-center gap-1 border-t sm:border-t-0 border-slate-100 pt-1.5 sm:pt-0 max-w-full overflow-x-auto select-none no-scrollbar">
                <span className="text-[10px] text-slate-400 font-bold shrink-0">Mencionar:</span>
                {OPERATORS.filter(op => op.id !== currentUser.id).map(op => (
                  <button 
                    key={op.id}
                    type="button"
                    onClick={() => {
                      setNewMessageText(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + op.handle + ' ');
                    }}
                    className="px-1.5 py-0.5 bg-slate-100 hover:bg-[#D4AF37]/15 hover:text-[#D4AF37] border border-slate-200 text-slate-650 rounded text-[9px] font-bold shrink-0 cursor-pointer"
                  >
                    {op.handle}
                  </button>
                ))}
              </div>

            </div>

          </form>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR - THREADS PANELS (Drawn conditionally via state) */}
      <AnimatePresence>
        {liveActiveThreadMessage && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 340, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-[#FCFBF9] border-l border-slate-250 flex flex-col shrink-0 text-slate-800 h-full w-full md:w-[340px] shadow-sm fixed md:relative inset-0 md:inset-auto z-40 md:z-20"
          >
            {/* Thread Header */}
            <div className="p-4 border-b border-slate-205 bg-slate-50 flex items-center justify-between">
              <div className="text-left font-sans">
                <span className="text-xs font-bold text-slate-950 flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-slate-500" /> Threads e Tópicos
                </span>
                <p className="text-[10px] text-slate-400">Canal: #{channels.find(c => c.id === activeChannelId)?.nome}</p>
              </div>
              <button 
                onClick={() => setActiveThreadMessage(null)}
                className="p-1 hover:bg-slate-200 rounded-full transition text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Root Thread message focused */}
            <div className="p-4 bg-amber-50/20 border-b border-slate-200 text-left">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-extrabold text-[#0a192f]">{liveActiveThreadMessage.autorNome}</span>
                <span className="text-[9px] text-slate-400">{liveActiveThreadMessage.dataHora}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{liveActiveThreadMessage.texto}"
              </p>
            </div>

            {/* Replies Board list scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-left mb-2">
                Respostas ({liveActiveThreadMessage.replies?.length || 0})
              </span>
              
              {!liveActiveThreadMessage.replies || liveActiveThreadMessage.replies.length === 0 ? (
                <div className="p-8 text-center text-[11px] text-slate-400">
                  Nenhuma resposta ainda. Evite misturar assuntos, digite uma resposta abaixo!
                </div>
              ) : (
                liveActiveThreadMessage.replies.map((reply) => (
                  <div key={reply.id} className="pl-3 border-l-2 border-slate-200 text-left py-0.5 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] bg-slate-100 rounded-full w-4 h-4 flex items-center justify-center">{reply.avatar}</span>
                        <span className="text-xs font-bold text-slate-850">{reply.autorNome}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">{reply.dataHora.split(' ')[1]}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-normal pl-2">{reply.texto}</p>
                  </div>
                ))
              )}
              <div ref={threadEndRef} />
            </div>

            {/* Thread Input Reply composer */}
            <div className="p-3 border-t border-slate-200 bg-white">
              <form onSubmit={handleSendThreadReply} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Responder no tópico..."
                  value={newThreadReplyText}
                  onChange={(e) => setNewThreadReplyText(e.target.value)}
                  className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-[#FCFBF9] text-slate-800 outline-none focus:border-[#1F4E89]"
                />
                <button 
                  type="submit"
                  disabled={!newThreadReplyText.trim()}
                  className="px-3 py-2 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0A192F] text-xs font-semibold rounded-lg disabled:opacity-30 transition"
                >
                  Enviar
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. RIGHT SIDEBAR - PINNED / RECENT ATTACHMENTS PANELS (Shared drawer toggle) */}
      <AnimatePresence>
        {showChannelInfoPanel && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-white border-l border-slate-200 flex flex-col shrink-0 text-slate-850 h-full w-full md:w-[280px] shadow-sm fixed md:relative inset-0 md:inset-auto z-40 md:z-30"
          >
            {/* Header selector toggle tabs */}
            <div className="p-3 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <div className="flex gap-2.5">
                <button 
                  onClick={() => setCurrentInfoTab('pinned')}
                  className={`text-xs font-bold tracking-tight pb-0.5 border-b-2 transition ${
                    currentInfoTab === 'pinned' ? 'border-[#D4AF37] text-[#0A192F]' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Fixados
                </button>
                <button 
                  onClick={() => setCurrentInfoTab('files')}
                  className={`text-xs font-bold tracking-tight pb-0.5 border-b-2 transition ${
                    currentInfoTab === 'files' ? 'border-[#D4AF37] text-[#0A192F]' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Arquivos Recentes
                </button>
              </div>
              <button 
                onClick={() => setShowChannelInfoPanel(false)}
                className="p-1 hover:bg-slate-200 rounded-full transition"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Pinned Messages panel */}
            <div className="flex-1 overflow-y-auto p-3 text-left">
              {currentInfoTab === 'pinned' ? (
                <div className="space-y-3.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Decisões, Tarefas e Avisos Fixados</span>
                  
                  {messages.filter(m => m.channelId === activeChannelId && m.pinned).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-[#FCFBF9] border border-dashed rounded-lg">
                      Nenhuma mensagem fixada neste canal de setor.
                      <p className="text-[9px] text-slate-400 mt-1">Passe o mouse por cima de uma mensagem e clique no ícone de alfinete (Pin) para salvar aqui!</p>
                    </div>
                  ) : (
                    messages.filter(m => m.channelId === activeChannelId && m.pinned).map(msg => (
                      <div key={msg.id} className="p-2.5 bg-amber-50/50 border border-amber-200/60 rounded-lg text-xs leading-relaxed">
                        <div className="flex items-center gap-1.5 mb-1.5 justify-between">
                          <span className="font-bold text-slate-800 text-[11px]">{msg.autorNome}</span>
                          <span className="text-[9px] text-slate-400">{msg.dataHora.split(' ')[0]}</span>
                        </div>
                        <p className="text-slate-700 italic">"{msg.texto}"</p>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-3.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Documentação, PDFs e Mídias</span>
                  
                  {messages.filter(m => m.channelId === activeChannelId && m.anexos && m.anexos.length > 0).length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-[#FCFBF9] border border-dashed rounded-lg">
                      Nenhum anexo compartilhado neste canal ainda.
                    </div>
                  ) : (
                    messages.filter(m => m.channelId === activeChannelId && m.anexos && m.anexos.length > 0).map(msg => (
                      msg.anexos?.map((file, fIdx) => (
                        <div key={fIdx} className="p-2 border border-slate-150 rounded-lg bg-[#FCFBF9] space-y-2 text-left">
                          <div className="flex items-center gap-1.5 text-xs truncate">
                            {file.tipo === 'pdf' ? <FileText className="w-4 h-4 text-red-500" /> : <Image className="w-4 h-4 text-emerald-500" />}
                            <span className="font-semibold text-slate-850 truncate inline-block w-4/5">{file.nome}</span>
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-slate-400">
                            <span>Enviado por: {msg.autorNome}</span>
                            <a href="#" className="text-[#1F4E89] font-bold hover:underline bg-white px-2 py-0.5 rounded border border-slate-200">Ver</a>
                          </div>
                        </div>
                      ))
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL 1: NEW CHANNEL OPERATIONAL SELECTOR */}
      <AnimatePresence>
        {showChannelModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 text-left shadow-lg space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold bg-[#0A192F] text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Criar Canal de Setor
                </h3>
                <button onClick={() => setShowChannelModal(false)} className="p-1 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateChannel} className="space-y-4">
                <div className="text-xs space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">Identificador do Canal (Sem espaços, minúsculo)</label>
                  <input 
                    type="text" 
                    placeholder="ex: pautas-reuniao" 
                    required
                    value={newChanName}
                    onChange={(e) => setNewChanName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-[#FCFBF9] text-slate-800 outline-none focus:border-[#1F4E89]"
                  />
                  <p className="text-[10px] text-slate-400">Os canais serão mostrados no padrão de URL: #pautas-reuniao</p>
                </div>

                <div className="text-xs space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">Descrição Operacional</label>
                  <input 
                    type="text" 
                    placeholder="ex: Metas semanais e alinhamento de processos" 
                    value={newChanDesc}
                    onChange={(e) => setNewChanDesc(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 bg-[#FCFBF9] text-slate-800 outline-none focus:border-[#1F4E89]"
                  />
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-150">
                  <div className="text-left leading-none space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1 shrink-0">
                      <Lock className="w-3.5 h-3.5 text-amber-500" /> Canal Privado (Exclusivo)
                    </span>
                    <span className="text-[10px] text-slate-400">Somente administradores e marcados podem ver.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={newChanPrivate}
                    onChange={(e) => setNewChanPrivate(e.target.checked)}
                    className="w-4 h-4 text-[#1F4E89] border-slate-300 focus:ring-[#1F4E89]"
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs font-bold pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowChannelModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 bg-white"
                  >
                    Mudar de Ideia
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-[#0A192F] hover:bg-[#D4AF37] text-white hover:text-[#0a192f] rounded-lg transition"
                  >
                    Criar Canal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: DELEGATE CHAT TO TASK SYNC */}
      <AnimatePresence>
        {showTaskModal && (
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 text-left shadow-lg space-y-4"
            >
              <div className="flex justify-between items-center bg-slate-50 -mx-6 -mt-6 p-4 border-b border-slate-150 rounded-t-2xl">
                <h3 className="text-xs font-extrabold uppercase text-[#1F4E89] flex items-center gap-1">
                  <CheckSquare className="w-4 h-4 text-violet-600" /> Transformar em Tarefa Executiva (Firebase)
                </h3>
                <button onClick={() => { setShowTaskModal(false); setTaskMessageSource(null); }} className="p-1 hover:bg-slate-200 rounded-full">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {taskMessageSource && (
                <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl mb-2 text-xs text-left leading-relaxed">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mb-1 uppercase">
                    <span>Mensagem de Origem</span>
                    <span>•</span>
                    <span>{taskMessageSource.autorNome}</span>
                  </div>
                  <p className="text-slate-750 italic">"{taskMessageSource.texto}"</p>
                </div>
              )}

              <div className="space-y-4 text-xs font-sans">
                <div className="space-y-1 text-left">
                  <label className="font-bold text-slate-700 block">Título de Tarefa Delegada (Sincronizada no Firebase)</label>
                  <input 
                    type="text" 
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-[#FCFBF9] text-slate-800 outline-none focus:border-[#1F4E89]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-1 text-left">
                    <label className="font-bold text-slate-700 block">Responsável Operacional</label>
                    <select 
                      value={taskAssignee} 
                      onChange={(e) => setTaskAssignee(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2.5 bg-[#FCFBF9] text-slate-800 outline-none focus:border-[#1F4E89]"
                    >
                      {OPERATORS.map(op => <option key={op.id} value={op.nome}>{op.nome}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="font-bold text-slate-700 block">Prazo Final (Due Date)</label>
                    <input 
                      type="date" 
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2.5 bg-[#FCFBF9] text-slate-800 outline-none focus:border-[#1F4E89]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="space-y-1 text-left">
                    <label className="font-bold text-slate-700 block">Prioridade</label>
                    <div className="flex gap-2">
                      {['baixa', 'media', 'alta'].map(prio => (
                        <button 
                          key={prio}
                          type="button" 
                          onClick={() => setTaskPriority(prio)}
                          className={`flex-1 py-1.5 border capitalize text-[11px] font-bold rounded-lg transition ${
                            taskPriority === prio 
                              ? 'bg-[#1F4E89] text-white border-[#1F4E89]' 
                              : 'bg-white text-slate-650 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {prio}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="font-bold text-slate-700 block">Descrição e Memorando Interno</label>
                  <textarea 
                    rows={4}
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-[#FCFBF9] text-slate-800 outline-none text-[11px] focus:border-[#1F4E89] leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs font-bold pt-3 border-t border-slate-150">
                <button 
                  type="button"
                  onClick={() => { setShowTaskModal(false); setTaskMessageSource(null); }}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveDelegatedTask}
                  className="px-4 py-2 bg-[#0A192F] hover:bg-[#D4AF37] text-[#FCFBF9] hover:text-[#0A192F] rounded-lg transition shadow-sm"
                >
                  Sincronizar no Kanban de Tarefas
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: OPERATIONAL GOVERNANCE & EXTERNAL INGESTION */}
      <AnimatePresence>
        {showGovernanceModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 text-left shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center bg-slate-50 -mx-6 -mt-6 p-4 border-b border-slate-200 rounded-t-2xl">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1F4E89] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Governança de Canais e Ingestão de Fora para Dentro
                </h3>
                <button onClick={() => setShowGovernanceModal(false)} className="p-1 hover:bg-slate-200 rounded-full transition">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* SECTION A: DECON / DEMO VERSION CONTROL STATE */}
              <div className="p-4 bg-[#FCFBF9] border border-amber-500/20 rounded-2xl shadow-2xs text-xs space-y-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-[#0A192F] text-xs">Excluir Mensagens Demo / Ativar Canal Real</h4>
                    <p className="text-slate-500 mt-1 leading-relaxed">
                      O canal operacional é inicializado com conversas de demonstração para fins de teste. Se você gostaria de iniciar o canal corporativo 100% limpo com dados e comunicações de produção reais, exclua as versões de demonstração.
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider shrink-0 border ${
                    localStorage.getItem('ilg_comunicacao_real') === 'true'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {localStorage.getItem('ilg_comunicacao_real') === 'true' ? 'Canal Real Ativo' : 'Modo Demo/Teste'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  {localStorage.getItem('ilg_comunicacao_real') === 'true' ? (
                    <button
                      onClick={handleRestoreDemoContent}
                      className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl font-bold text-slate-705 text-[11px] transition cursor-pointer"
                    >
                      Reativar Exemplos / Demonstração
                    </button>
                  ) : (
                    <button
                      onClick={handleWipeDemoContent}
                      className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Limpar Todas as Mensagens de Demonstração (Ativar Produção Real)
                    </button>
                  )}
                </div>
              </div>

              {/* SECTION B: PUBLIC EXTRANET LINK INGESTION */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-3.5">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-[#1F4E89] text-xs flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-[#D4AF37]" /> Compartilhamento de Arquivos "De Fora para Dentro"
                  </h4>
                  <p className="text-slate-500 leading-relaxed">
                    Você pode receber documentos (comprovantes de pagamento, PDFs de onboarding, fichas cadastrais) enviados por terceiros diretamente para dentro dos canais operacionais. Copie e envie esse link abaixo para o seu remetente:
                  </p>
                </div>

                {/* Dynamic Copy Link Input */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2 shrink-0">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/?externo=true` : 'https://institutolianagomes.com.br/?externo=true'}
                    className="flex-1 bg-transparent border-none outline-none text-slate-800 font-mono text-[10px] select-all truncate px-1"
                  />
                  <button
                    onClick={() => {
                      const link = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/?externo=true` : '';
                      navigator.clipboard.writeText(link);
                      alert('Link copiado com sucesso! Você pode enviá-lo por mensagem direta ou WhatsApp para quem precisa lhe enviar arquivos.');
                    }}
                    className="px-3 py-1.5 bg-[#0A192F] hover:bg-[#D4AF37] hover:text-[#0A192F] text-[#D4AF37] rounded-lg font-bold text-[10px] transition duration-200 shrink-0 select-none cursor-pointer whitespace-nowrap"
                  >
                    Copiar Link Seguro
                  </button>
                </div>

                <div className="bg-amber-50/55 border border-amber-250 p-3 rounded-lg text-[10px] text-amber-900 leading-snug flex items-start gap-2.5">
                  <div className="p-0.5 shrink-0 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full">
                    <Pin className="w-3 h-3" />
                  </div>
                  <div>
                    <b>Como funciona na prática:</b> Quando um aluno ou parceiro acessar esse link, ele verá uma tela de envio institucional. Ao selecionar seu arquivo e clicar em enviar, o arquivo entrará automaticamente em tempo real no canal do setor correto (como <i>#suporte-alunos</i> ou <i>#comercial</i>) com o identificador de Ingestão Externa.
                  </div>
                </div>
              </div>

              {/* Modal controls */}
              <div className="flex justify-end gap-2 text-xs font-bold pt-3 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setShowGovernanceModal(false)}
                  className="px-6 py-2 bg-[#0A192F] hover:bg-[#10243e] text-white rounded-xl transition shadow-sm cursor-pointer"
                >
                  Concluir e Voltar ao Painel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
