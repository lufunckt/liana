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
  const { data, updateModuleData } = useStore();
  const [currentUser, setCurrentUser] = useState(OPERATORS[3]); // Default operator Luiza (the logged in gestora)

  // Sub-tab / UI states
  const [activeChannelId, setActiveChannelId] = useState('geral');
  const [mobileView, setMobileView] = useState<'channels' | 'chat'>('channels');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<InternalNotification[]>([]);
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

  // Auto scroll reference
  const chatEndRef = useRef<HTMLDivElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Initialize and Seed mock database values in LocalStorage for communication consistency
  useEffect(() => {
    // 1. CHANNELS
    const savedChannelsData = localStorage.getItem('ilgc_canais');
    let initialChannels: Channel[] = [];
    if (savedChannelsData) {
      initialChannels = JSON.parse(savedChannelsData);
    } else {
      initialChannels = [
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
      localStorage.setItem('ilgc_canais', JSON.stringify(initialChannels));
    }
    setChannels(initialChannels);

    // 2. MESSAGES
    const savedMessagesData = localStorage.getItem('ilgc_mensagens');
    let initialMessages: Message[] = [];
    if (savedMessagesData) {
      initialMessages = JSON.parse(savedMessagesData);
    } else {
      initialMessages = [
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
      localStorage.setItem('ilgc_mensagens', JSON.stringify(initialMessages));
    }
    setMessages(initialMessages);

    // 3. NOTIFICATIONS
    const savedNotifications = localStorage.getItem('ilgc_notificações');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
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
      localStorage.setItem('ilgc_notificações', JSON.stringify(initialNotes));
      setNotifications(initialNotes);
    }
  }, []);

  // Sync state helpers
  const saveChannelsState = (updated: Channel[]) => {
    setChannels(updated);
    localStorage.setItem('ilgc_canais', JSON.stringify(updated));
  };

  const saveMessagesState = (updated: Message[]) => {
    setMessages(updated);
    localStorage.setItem('ilgc_mensagens', JSON.stringify(updated));
  };

  const saveNotificationsState = (updated: InternalNotification[]) => {
    setNotifications(updated);
    localStorage.setItem('ilgc_notificações', JSON.stringify(updated));
  };

  // Auto scroll effects
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThreadMessage]);

  // Handle send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessageText.trim() && !fileSimName) return;

    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      channelId: activeChannelId,
      autorId: currentUser.id,
      autorNome: currentUser.nome,
      avatar: currentUser.avatar,
      texto: newMessageText,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reacoes: [],
      replies: []
    };

    // Embed simulated attachment if selected
    if (fileSimName && fileSimType) {
      newMsg.anexos = [{
        nome: fileSimName,
        tipo: fileSimType,
        url: '#'
      }];
    }

    const updated = [...messages, newMsg];
    saveMessagesState(updated);

    // AI simulation response based on channel for active team testing
    handleSimulatedResponse(newMessageText, activeChannelId);

    // Clear composer states
    setNewMessageText('');
    setFileSimName('');
    setFileSimType(null);
  };

  // Trigger simulated reactions and responses from the other operational operators so the chat feels lived in
  const handleSimulatedResponse = (userText: string, channelId: string) => {
    const isMention = userText.includes('@Liana') || userText.includes('@Nuria') || userText.includes('@Ana') || userText.includes('@Luiza');
    
    setTimeout(() => {
      // Periodic responses to make the workspace highly reactive and fully demonstrate all 14 channels
      let replyAuthor = OPERATORS[0]; // Liana
      let textResponse = 'Entendido! Já anotei o alinhamento aqui para conferirmos na reunião de metas.';
      
      if (channelId === 'comercial') {
        replyAuthor = OPERATORS[2]; // Ana
        textResponse = 'Excelente ponto Luiza! Vou puxar os dados dessa lead e encaminhar o link no WhatsApp Assistente agora.';
      } else if (channelId === 'suporte-alunos') {
        replyAuthor = OPERATORS[1]; // Nuria
        textResponse = 'Registrado. Vou cruzar esse feedback com o painel do Onboarding na aba de espaços de trabalho!';
      } else if (channelId === 'design') {
        replyAuthor = OPERATORS[1]; // Nuria (handles design too)
        textResponse = 'Prontinho! Acabei de subir os arquivos revisados de mockup no nosso mural de criativos.';
      } else if (channelId === 'financeiro') {
        replyAuthor = OPERATORS[3]; // Luiza
        textResponse = 'Relatório importado no modulo financeiro com sucesso. Alunas em atraso já foram alertadas.';
      } else if (isMention) {
        replyAuthor = OPERATORS[0]; // Liana
        textResponse = 'Obrigada pelo aviso! Vou revisar e responder em thread para não perdermos o foco operacional.';
      } else {
        return; // No simulation for other standard updates unless matching
      }

      // Add actual reply
      const simulatedMsg: Message = {
        id: 'msg_sim_' + Date.now(),
        channelId: channelId,
        autorId: replyAuthor.id,
        autorNome: replyAuthor.nome,
        avatar: replyAuthor.avatar,
        texto: textResponse,
        dataHora: new Date().toISOString().replace('T', ' ').substring(0, 16),
        reacoes: [{ emoji: '👍', count: 1, users: ['luiza'] }]
      };

      setMessages(prev => {
        const next = [...prev, simulatedMsg];
        localStorage.setItem('ilgc_mensagens', JSON.stringify(next));
        return next;
      });

      // Push custom reactive notification
      const newNote: InternalNotification = {
        id: 'note_' + Date.now(),
        tipo: 'message',
        conteudo: `${replyAuthor.nome} respondeu no canal #${channels.find(c => c.id === channelId)?.nome || channelId}`,
        origem: replyAuthor.nome,
        dataHora: 'Agora',
        lida: false,
        channelId: channelId
      };
      setNotifications(prev => {
        const next = [newNote, ...prev];
        localStorage.setItem('ilgc_notificações', JSON.stringify(next));
        return next;
      });

    }, 2500);
  };

  // Thread replies sending
  const handleSendThreadReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadReplyText.trim() || !activeThreadMessage) return;

    const newReply: MessageReply = {
      id: 'rep_' + Date.now(),
      autorNome: currentUser.nome,
      autorId: currentUser.id,
      avatar: currentUser.avatar,
      texto: newThreadReplyText,
      dataHora: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updated = messages.map(msg => {
      if (msg.id === activeThreadMessage.id) {
        const replies = msg.replies ? [...msg.replies, newReply] : [newReply];
        const updatedMsg = { ...msg, replies };
        // Sync the thread sidebar view too
        setActiveThreadMessage(updatedMsg);
        return updatedMsg;
      }
      return msg;
    });

    saveMessagesState(updated);
    setNewThreadReplyText('');

    // Trigger simulation reply inside the thread
    setTimeout(() => {
      const simReply: MessageReply = {
        id: 'rep_sim_' + Date.now(),
        autorNome: 'Liana Gomes',
        autorId: 'liana',
        avatar: '👑',
        texto: 'Apoiado! Vamos centralizar essa decisão na nossa ata de processos de Lançamento.',
        dataHora: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      setMessages(prev => {
        const next = prev.map(m => {
          if (m.id === activeThreadMessage.id) {
            const replies = m.replies ? [...m.replies, simReply ] : [simReply];
            const u = { ...m, replies };
            setActiveThreadMessage(u);
            return u;
          }
          return m;
        });
        localStorage.setItem('ilgc_mensagens', JSON.stringify(next));
        return next;
      });

      // Notify the operator
      const newNote: InternalNotification = {
        id: 'note_' + Date.now(),
        tipo: 'reply',
        conteudo: `Liana Gomes respondeu em thread no #${channels.find(c => c.id === activeChannelId)?.nome}`,
        origem: 'Liana Gomes',
        dataHora: 'Agora',
        lida: false,
        channelId: activeChannelId
      };
      setNotifications(prev => {
        const next = [newNote, ...prev];
        localStorage.setItem('ilgc_notificações', JSON.stringify(next));
        return next;
      });

    }, 1800);
  };

  // Message Actions: Pin / Edit / Remove
  const handleTogglePin = (msgId: string) => {
    const updated = messages.map(msg => {
      if (msg.id === msgId) {
        return { ...msg, pinned: !msg.pinned };
      }
      return msg;
    });
    saveMessagesState(updated);
  };

  const handleStartEdit = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditingText(msg.texto);
  };

  const handleSaveEdit = (msgId: string) => {
    const updated = messages.map(msg => {
      if (msg.id === msgId) {
        return { ...msg, texto: editingText };
      }
      return msg;
    });
    saveMessagesState(updated);
    setEditingMessageId(null);
  };

  const handleDeleteMessage = (msgId: string) => {
    if (confirm('Tem certeza que deseja apagar esta mensagem permanentemente?')) {
      const updated = messages.filter(msg => msg.id !== msgId);
      saveMessagesState(updated);
      if (activeThreadMessage?.id === msgId) {
        setActiveThreadMessage(null);
      }
    }
  };

  // Reactions Simple Emojis
  const handleEmojiReact = (msgId: string, emoji: string) => {
    const updated = messages.map(msg => {
      if (msg.id === msgId) {
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
        return { ...msg, reacoes: rx.filter(r => r.count > 0) };
      }
      return msg;
    });
    saveMessagesState(updated);
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

  // Simulated drop files
  const handleAttachVirtualFile = (tipo: 'image' | 'pdf' | 'spreadsheet' | 'doc') => {
    setFileSimType(tipo);
    const names = {
      image: 'mock_banner_design_promo.png',
      pdf: 'planejamento_reuniao_estrategica.pdf',
      spreadsheet: 'leads_conversao_lancamento_ilg.xlsx',
      doc: 'roteiro_live_liana.docx'
    };
    setFileSimName(names[tipo]);
  };

  // Notifications helper
  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map(n => ({ ...n, lida: true }));
    saveNotificationsState(updated);
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
              const matched = OPERATORS.find(op => op.id === e.target.value);
              if (matched) setCurrentUser(matched);
            }}
            className="bg-transparent text-[10px] text-[#D4AF37] font-bold border-none outline-none cursor-pointer p-0"
          >
            {OPERATORS.map(op => <option key={op.id} value={op.id} className="text-slate-900 font-normal">{op.nome.split(' ')[0]}</option>)}
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
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-255 rounded text-[10px] font-bold text-[#1F4E89]"
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
        {activeThreadMessage && (
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
                <span className="text-xs font-extrabold text-[#0a192f]">{activeThreadMessage.autorNome}</span>
                <span className="text-[9px] text-slate-400">{activeThreadMessage.dataHora}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{activeThreadMessage.texto}"
              </p>
            </div>

            {/* Replies Board list scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-left mb-2">
                Respostas ({activeThreadMessage.replies?.length || 0})
              </span>
              
              {!activeThreadMessage.replies || activeThreadMessage.replies.length === 0 ? (
                <div className="p-8 text-center text-[11px] text-slate-400">
                  Nenhuma resposta ainda. Evite misturar assuntos, digite uma resposta abaixo!
                </div>
              ) : (
                activeThreadMessage.replies.map((reply) => (
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

    </div>
  );
}
