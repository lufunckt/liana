import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Brain, PenTool, Link2, HardDrive, FileSpreadsheet, Play, Folders, Award, 
  Calendar, Plus, Trash2, Edit2, Copy, Check, Upload, File, Search, Filter, Bookmark, 
  Star, ExternalLink, RefreshCw, CheckCircle2, Clock, ChevronDown, HelpCircle, FileText, 
  Image, MoreVertical, X, CheckSquare, ListTodo, Clipboard, ChevronRight, CheckCircle, Info
} from 'lucide-react';

interface Prompt {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  texto: string;
  favorito: boolean;
}

interface Project {
  id: string;
  nome: string;
  cliente: string;
  tipo: string;
  responsavel: string;
  prazo: string;
  status: 'planejado' | 'em_andamento' | 'aguardando_aprovacao' | 'concluido';
  links: string;
  prompts: string;
  arquivos: string;
  observacoes: string;
}

interface Task {
  id: string;
  titulo: string;
  status: 'a_fazer' | 'em_andamento' | 'aguardando_aprovacao' | 'concluido';
}

interface BookmarkItem {
  id: string;
  titulo: string;
  url: string;
}

interface QuickFile {
  id: string;
  nome: string;
  tamanho: string;
  tipo: string;
  data: string;
  conteudoUrl?: string;
}

const DEFAULT_TOOLS = [
  { id: 'gemini', nome: 'Gemini', link: 'https://gemini.google.com', desc: 'Apoio para ideias, estruturação e análise.', icon: Brain, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'notebooklm', nome: 'NotebookLM', link: 'https://notebooklm.google', desc: 'Organização e análise dos materiais e PDFs do ILG.', icon: Sparkles, color: 'text-amber-500 bg-amber-50 border-amber-200 animate-pulse' },
  { id: 'canva', nome: 'Canva', link: 'https://canva.com', desc: 'Criação de apresentações, ebooks e materiais editáveis.', icon: PenTool, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { id: 'chatgpt', nome: 'ChatGPT', link: 'https://chatgpt.com', desc: 'Assistência adicional de conversação e geração de ideias.', icon: FileText, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'drive', nome: 'Google Drive', link: 'https://drive.google.com', desc: 'Ficheiros e armazenamento geral de materiais da nuvem.', icon: HardDrive, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'docs', nome: 'Google Docs', link: 'https://docs.google.com', desc: 'Edição de textos rápidos e relatórios e pautas.', icon: FileText, color: 'text-blue-500 bg-blue-50/50 border-blue-150' },
  { id: 'sheets', nome: 'Google Sheets', link: 'https://sheets.google.com', desc: 'Planilhas de controle e acompanhamento financeiro/alunos.', icon: FileSpreadsheet, color: 'text-green-600 bg-green-50 border-green-200' },
  { id: 'nutror', nome: 'Nutror', link: 'https://nutror.com', desc: 'Plataforma de cursos das alunas do ILG.', icon: Play, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'youtube', nome: 'YouTube', link: 'https://youtube.com', desc: 'Acesso a vídeos e aulas públicas do canal e Lives.', icon: Play, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { id: 'linktree', nome: 'Linktree', link: 'https://linktree.com', desc: 'Gerenciamento de links externos do instagram e mídias sociais.', icon: Link2, color: 'text-slate-600 bg-slate-100 border-slate-300' },
  { id: 'pasta_materiais', nome: 'Pasta de materiais do ILG', link: 'https://drive.google.com', desc: 'Repositório central de arquivos de marca e PDFs.', icon: Folders, color: 'text-yellow-600 bg-yellow-50 border-yellow-250 animate-pulse' },
  { id: 'pasta_depoimentos', nome: 'Pasta de depoimentos', link: 'https://drive.google.com', desc: 'Coleção de depoimentos de alunas e clientes.', icon: Award, color: 'text-[#D4AF37] bg-amber-50 border-amber-300' },
  { id: 'pasta_certificados', nome: 'Pasta de certificados', link: 'https://drive.google.com', desc: 'Documentos e registros de certificados emitidos.', icon: Award, color: 'text-[#D4AF37] bg-amber-50 border-amber-305' }
];

const DEFAULT_PROMPTS: Prompt[] = [
  {
    id: 'p1',
    titulo: 'Post de Autoridade LinkedIn (Compliance)',
    descricao: 'Para o perfil pessoal de Liana transmitindo liderança intelectual com integridade.',
    categoria: 'LinkedIn',
    texto: 'Atue como redator sênior de branding pessoal para LinkedIn. Com base no assunto [ASSUNTO], escreva um post com tom de liderança intelectual, sério porém empático. Comece com um gancho provocador de até duas linhas, use espaçamento limpo entre parágrafos, adicione 2 estatísticas hipotéticas contextualizadas, traga uma reflexão prática e encerre com uma pergunta para engajamento das conexões. Sem hashtags excessivas.',
    favorito: true
  },
  {
    id: 'p2',
    titulo: 'Estrutura Carrossel de Alto Impacto',
    descricao: 'Construção didática ágil e lógica para postagens sequenciais do Instagram.',
    categoria: 'Carrossel',
    texto: 'Gere um roteiro de 6 slides para carrossel do Instagram sobre [TEMA]. Slide 1: Título ultra chamativo com dor de nível 10. Slide 2: Explicação da dor raiz do mercado. Slide 3: O erro mais comum que as empresas e profissionais cometem. Slide 4: A solução macro por traz do combate a esse erro. Slide 5: Checklist visual de aplicação imediata. Slide 6: Call-to-action de engajamento do feed direcionado para a Núria no suporte.',
    favorito: true
  },
  {
    id: 'p3',
    titulo: 'Capítulo de Ebook Pedagógico (Lei e Proteção)',
    descricao: 'Simplificação de teorias ou regimentos jurídicos com usabilidade direta.',
    categoria: 'Ebook',
    texto: 'Redija um capítulo em formato Markdown sobre o conceito de [CONCEITO] para compor nosso manual educativo oficial do Instituto Liana Gomes. Simplifique termos jurídicos para empresários, adicione 3 exemplos claros de "Caso Real" e "Prática Recomendada", estruture com sumários elegantes e use caixas explicativas no fim.',
    favorito: false
  },
  {
    id: 'p4',
    titulo: 'Treinamento Expert em Feedback',
    descricao: 'Abordagens criativas e slides sobre mediação profissional de feedbacks.',
    categoria: 'Slides',
    texto: 'Construa a estrutura de tópicos e insights para 5 slides sobre Feedback sob Compliance. Slide 1: Introdução à Segurança Psicológica de Gênero. Slide 2: Práticas sutis de gaslighting que destroem feedbacks de lideranças com mulheres. Slide 3: Heurística dos 4 Passos do feedback objetivo. Slide 4: O papel do compliance preventivo. Slide 5: Dinâmica rápida para exercitar em equipes.',
    favorito: false
  },
  {
    id: 'p5',
    titulo: 'Fórmula de Copy para Social Selling',
    descricao: 'Textos atraentes de conversão de leads frios/médios em alunas mentoradas.',
    categoria: 'Social selling',
    texto: 'Escreva um e-mail conversacional para mães líderes e executivas de alta governança. Comece relatando a exaustão oculta provocada por micro-agressões masculinas nas reuniões e como o método de Liana ajudou mais de 230 alunas a encontrarem autonomia sem abrir mão do autocuidado. Convite para preencher formulário operado pela Núria.',
    favorito: true
  },
  {
    id: 'p6',
    titulo: 'Análise Avançada de PDF / Políticas',
    descricao: 'Extração automática de fragilidades de compliance organizacional.',
    categoria: 'Análise de PDF',
    texto: 'Atue como Auditor especialista de Risco Legal e Diversidade do ILG. Analise o seguinte fragmento de política corporativa e extraia: 1. Brechas potenciais de compliance. 2. Pontos que geram desconforto térmico ou de integridade de gênero no ambiente organizacional. 3. Recomendações imediatas para atualizar o regimento de conduta.',
    favorito: false
  }
];

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj1',
    nome: 'Ebook NR-1 - Diversidade & Compliance',
    cliente: 'Instituto Liana Gomes (Interno)',
    tipo: 'Ebook',
    responsavel: 'Núria Onboarding',
    prazo: '2026-06-15',
    status: 'em_andamento',
    links: 'https://canva.com, https://drive.google.com',
    prompts: 'Capítulo de Ebook Pedagógico',
    arquivos: 'politica_nr1_v2.pdf',
    observacoes: 'Desenvolvimento focado nas regras de conduta atualizadas sobre ambientes seguros corporativos.'
  },
  {
    id: 'proj2',
    nome: 'Slides Expert em Feedback',
    cliente: 'Clientes B2B / Parcerias',
    tipo: 'Slides',
    responsavel: 'Núria Onboarding',
    prazo: '2026-06-02',
    status: 'planejado',
    links: 'https://canva.com',
    prompts: 'Treinamento Expert em Feedback',
    arquivos: 'manual_feedback_ilg.docx',
    observacoes: 'Material elegante de treinamento de líderes femininas com cores institucionais do ILG.'
  },
  {
    id: 'proj3',
    nome: 'Carrossel LinkedIn - Autonomia de Gênero',
    cliente: 'Mídias Liana Gomes',
    tipo: 'Carrossel',
    responsavel: 'Luiza Tech',
    prazo: '2026-05-28',
    status: 'concluido',
    links: 'https://linkedin.com',
    prompts: 'Post de Autoridade LinkedIn (Compliance)',
    arquivos: 'rascunho_texto_feed.txt',
    observacoes: 'Post concluído e agendado no perfil da Liana. Gerou alto engajamento orgânico.'
  },
  {
    id: 'proj4',
    nome: 'Kit de Boas-vindas para Alunas Novas',
    cliente: 'Onboarding de Alunas',
    tipo: 'Modelo de Boas-Vindas',
    responsavel: 'Núria Onboarding',
    prazo: '2026-06-25',
    status: 'em_andamento',
    links: 'https://nutror.com, https://google.com',
    prompts: 'Fórmula de Copy para Social Selling',
    arquivos: 'welcome_package_v1.zip',
    observacoes: 'Kit com os editáveis do Canva e primeiras instruções para o MRP Tracker.'
  },
  {
    id: 'proj5',
    nome: 'Certificados Turma 12 - Liderança',
    cliente: 'Formação Geral ILG',
    tipo: 'Certificados',
    responsavel: 'Núria Onboarding',
    prazo: '2026-06-30',
    status: 'planejado',
    links: 'https://certificados.institutolianagomes.com',
    prompts: '',
    arquivos: 'lista_aprovadas_turma12.xlsx',
    observacoes: 'Preparar template premium navy_premium com selo dourado.'
  }
];

const DEFAULT_TASKS: Task[] = [
  { id: 't1', titulo: 'finalizar slides do Expert em Feedback', status: 'em_andamento' },
  { id: 't2', titulo: 'subir ebook NR-1 atualizado no site', status: 'a_fazer' },
  { id: 't3', titulo: 'gerar certificado virtual das mentoradas t12', status: 'a_fazer' },
  { id: 't4', titulo: 'atualizar Linktree institucional com novos links', status: 'concluido' },
  { id: 't5', titulo: 'criar kit editável de boas-vindas para canva', status: 'em_andamento' },
  { id: 't6', titulo: 'organizar depoimentos em vídeo da turma 11', status: 'aguardando_aprovacao' },
  { id: 't7', titulo: 'revisar tutoriais de acesso ao MRP Tracker', status: 'concluido' },
  { id: 't8', titulo: 'criar post LinkedIn sobre violência sutil', status: 'em_andamento' }
];

const DEFAULT_BOOKMARKS = [
  { id: 'b1', titulo: 'Canva Central ILG', url: 'https://canva.com' },
  { id: 'b2', titulo: 'Regis de Depoimentos Alunas', url: 'https://drive.google.com/drive/folders/depoimentos' },
  { id: 'b3', titulo: 'Pasta de Certificados Gerados', url: 'https://drive.google.com/drive/folders/certificados' },
  { id: 'b4', titulo: 'Drive de Livros & Ebooks', url: 'https://drive.google.com/drive/folders/ebooks' },
  { id: 'b5', titulo: 'Grupo Executivo Equipe Whats', url: 'https://chat.whatsapp.com/ExemploGrupoILG' },
  { id: 'b6', titulo: 'Template de Carrossel de Vendas', url: 'https://canva.com/design/carrossel-vendas' },
  { id: 'b7', titulo: 'Página de Vendas Externa ILG', url: 'https://institutolianagomes.com.br' }
];

const DEFAULT_FILES = [
  { id: 'f1', nome: 'brand_handbook_ilg_2026.pdf', tamanho: '4.2 MB', tipo: 'PDF', data: '2026-05-20' },
  { id: 'f2', nome: 'liana_gomes_logo_dourado.png', tamanho: '850 KB', tipo: 'Imagem', data: '2026-05-22' },
  { id: 'f3', nome: 'plano_de_midia_instagram.xlsx', tamanho: '1.4 MB', tipo: 'Planilha', data: '2026-05-25' }
];

export function WorkspaceCriativoModule() {
  // Navigation tabs of the Workspace module
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ferramentas' | 'prompts' | 'projetos' | 'tarefas' | 'arquivos'>('dashboard');

  // Shared state persisted in localStorage
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    const saved = localStorage.getItem('ilg_workspace_prompts');
    return saved ? JSON.parse(saved) : DEFAULT_PROMPTS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('ilg_workspace_projects');
    return saved ? JSON.parse(saved) : DEFAULT_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('ilg_workspace_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    const saved = localStorage.getItem('ilg_workspace_bookmarks');
    return saved ? JSON.parse(saved) : DEFAULT_BOOKMARKS;
  });

  const [customToolUrls, setCustomToolUrls] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('ilg_workspace_custom_links');
    return saved ? JSON.parse(saved) : {};
  });

  const [quickFiles, setQuickFiles] = useState<QuickFile[]>(() => {
    const saved = localStorage.getItem('ilg_workspace_quick_files');
    return saved ? JSON.parse(saved) : DEFAULT_FILES;
  });

  // Saving states to localStorage
  useEffect(() => {
    localStorage.setItem('ilg_workspace_prompts', JSON.stringify(prompts));
  }, [prompts]);

  useEffect(() => {
    localStorage.setItem('ilg_workspace_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('ilg_workspace_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('ilg_workspace_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('ilg_workspace_custom_links', JSON.stringify(customToolUrls));
  }, [customToolUrls]);

  useEffect(() => {
    localStorage.setItem('ilg_workspace_quick_files', JSON.stringify(quickFiles));
  }, [quickFiles]);

  // Alert/Toast simulation
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modern search/filters
  const [promptSearch, setPromptSearch] = useState('');
  const [selectedPromptCategory, setSelectedPromptCategory] = useState<string>('All');
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('All');

  // Forms / Modals
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptDesc, setNewPromptDesc] = useState('');
  const [newPromptCat, setNewPromptCat] = useState('LinkedIn');
  const [newPromptText, setNewPromptText] = useState('');

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjNome, setNewProjNome] = useState('');
  const [newProjCliente, setNewProjCliente] = useState('');
  const [newProjTipo, setNewProjTipo] = useState('');
  const [newProjResp, setNewProjResp] = useState('Núria Onboarding');
  const [newProjPrazo, setNewProjPrazo] = useState('');
  const [newProjStatus, setNewProjStatus] = useState<'planejado' | 'em_andamento' | 'aguardando_aprovacao' | 'concluido'>('planejado');
  const [newProjLinks, setNewProjLinks] = useState('');
  const [newProjPrompts, setNewProjPrompts] = useState('');
  const [newProjArquivos, setNewProjArquivos] = useState('');
  const [newProjObs, setNewProjObs] = useState('');

  const [isCustomizeToolModalOpen, setIsCustomizeToolModalOpen] = useState(false);
  const [customizingToolId, setCustomizingToolId] = useState<string | null>(null);
  const [customizingToolName, setCustomizingToolName] = useState('');
  const [customizingUrlInput, setCustomizingUrlInput] = useState('');

  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [newBookmarkUrl, setNewBookmarkUrl] = useState('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);

  const [newQuickTaskTitle, setNewQuickTaskTitle] = useState('');

  const [dragActive, setDragActive] = useState(false);

  // CATEGORIES FOR PROMPTS
  const categories = [
    'LinkedIn', 'Carrossel', 'Ebook', 'Slides', 'Certificados', 
    'IA', 'Social selling', 'Conteúdo da Liana', 'Análise de PDF', 'Copy', 'Automação'
  ];

  // LOGS FOR TEAM AND LOGINS
  const recentActivities = [
    { text: 'Ebook NR-1 Diversidade editado por Núria', type: 'edit', time: '10m atrás' },
    { text: 'Prompt de LinkedIn copiado por Liana', type: 'copy', time: '1 hora atrás' },
    { text: 'Novo Certificado virtual adicionado às tarefas', type: 'task', time: '3 horas atrás' },
    { text: 'Canva Central atualizado com nova identidade', type: 'canva', time: 'Ontem' },
  ];

  const handleCopyText = (text: string, title?: string) => {
    navigator.clipboard.writeText(text);
    triggerToast(`Prompt "${title || 'Texto'}" copiado para a área de transferência!`);
  };

  // TASK HANDLING
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuickTaskTitle.trim()) return;
    const newTaskItem: Task = {
      id: `task_${Date.now()}`,
      titulo: newQuickTaskTitle.trim(),
      status: 'a_fazer'
    };
    setTasks(prev => [newTaskItem, ...prev]);
    setNewQuickTaskTitle('');
    triggerToast('Tarefa criativa adicionada com sucesso!');
  };

  const handleToggleTaskStatus = (id: string, currentStatus: Task['status']) => {
    const statuses: Task['status'][] = ['a_fazer', 'em_andamento', 'aguardando_aprovacao', 'concluido'];
    const nextIdx = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIdx];
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t));
    triggerToast('Status da tarefa atualizado!');
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    triggerToast('Tarefa removida!');
  };

  // BOOKMARK HANDLING
  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookmarkTitle.trim() || !newBookmarkUrl.trim()) return;
    let url = newBookmarkUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const newItem: BookmarkItem = {
      id: `bk_${Date.now()}`,
      titulo: newBookmarkTitle.trim(),
      url
    };
    setBookmarks(prev => [...prev, newItem]);
    setNewBookmarkTitle('');
    setNewBookmarkUrl('');
    setIsAddingBookmark(false);
    triggerToast('Link favorito fixado com sucesso!');
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
    triggerToast('Favorito removido!');
  };

  // TOOL CUSTOMIZATION
  const handleOpenCustomizeTool = (toolId: string, toolName: string, defaultLink: string) => {
    setCustomizingToolId(toolId);
    setCustomizingToolName(toolName);
    setCustomizingUrlInput(customToolUrls[toolId] || defaultLink);
    setIsCustomizeToolModalOpen(true);
  };

  const handleSaveCustomToolUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customizingToolId) return;
    let url = customizingUrlInput.trim();
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    setCustomToolUrls(prev => ({
      ...prev,
      [customizingToolId]: url
    }));
    setIsCustomizeToolModalOpen(false);
    setCustomizingToolId(null);
    triggerToast(`Link personalizado para "${customizingToolName}" salvo!`);
  };

  const handleResetToolUrl = (toolId: string) => {
    setCustomToolUrls(prev => {
      const copy = { ...prev };
      delete copy[toolId];
      return copy;
    });
    setIsCustomizeToolModalOpen(false);
    setCustomizingToolId(null);
    triggerToast('Link restaurado para o padrão do ILG.');
  };

  // FILE UPLOAD SIMULATOR
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (filesList: FileList) => {
    const file = filesList[0];
    const newFile: QuickFile = {
      id: `file_${Date.now()}`,
      nome: file.name,
      tamanho: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      tipo: file.type.includes('pdf') ? 'PDF' : file.type.includes('image') ? 'Imagem' : 'Documento',
      data: new Date().toISOString().split('T')[0]
    };
    setQuickFiles(prev => [newFile, ...prev]);
    triggerToast(`Arquivo "${file.name}" importado com sucesso para a central temporária!`);
  };

  const handleDeleteFile = (id: string) => {
    setQuickFiles(prev => prev.filter(f => f.id !== id));
    triggerToast('Arquivo temporário removido!');
  };

  // PROMPTS MANAGER
  const handleOpenPromptModal = (prompt?: Prompt) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setNewPromptTitle(prompt.titulo);
      setNewPromptDesc(prompt.descricao);
      setNewPromptCat(prompt.categoria);
      setNewPromptText(prompt.texto);
    } else {
      setEditingPrompt(null);
      setNewPromptTitle('');
      setNewPromptDesc('');
      setNewPromptCat('LinkedIn');
      setNewPromptText('');
    }
    setIsPromptModalOpen(true);
  };

  const handleSavePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptTitle.trim() || !newPromptText.trim()) return;

    if (editingPrompt) {
      setPrompts(prev => prev.map(p => p.id === editingPrompt.id ? {
        ...p,
        titulo: newPromptTitle.trim(),
        descricao: newPromptDesc.trim(),
        categoria: newPromptCat,
        texto: newPromptText.trim()
      } : p));
      triggerToast('Prompt atualizado na biblioteca!');
    } else {
      const newest: Prompt = {
        id: `p_${Date.now()}`,
        titulo: newPromptTitle.trim(),
        descricao: newPromptDesc.trim(),
        categoria: newPromptCat,
        texto: newPromptText.trim(),
        favorito: false
      };
      setPrompts(prev => [newest, ...prev]);
      triggerToast('Novo prompt salvo com sucesso!');
    }
    setIsPromptModalOpen(false);
  };

  const handleDeletePrompt = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este prompt?')) {
      setPrompts(prev => prev.filter(p => p.id !== id));
      triggerToast('Prompt removido da biblioteca.');
    }
  };

  const handleTogglePromptFavorite = (id: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, favorito: !p.favorito } : p));
    triggerToast('Preferências de favoritos atualizadas!');
  };

  // PROJECTS MANAGER
  const handleOpenProjectModal = (proj?: Project) => {
    if (proj) {
      setEditingProject(proj);
      setNewProjNome(proj.nome);
      setNewProjCliente(proj.cliente);
      setNewProjTipo(proj.tipo);
      setNewProjResp(proj.responsavel);
      setNewProjPrazo(proj.prazo);
      setNewProjStatus(proj.status);
      setNewProjLinks(proj.links);
      setNewProjPrompts(proj.prompts);
      setNewProjArquivos(proj.arquivos);
      setNewProjObs(proj.observacoes);
    } else {
      setEditingProject(null);
      setNewProjNome('');
      setNewProjCliente('');
      setNewProjTipo('');
      setNewProjResp('Núria Onboarding');
      setNewProjPrazo('');
      setNewProjStatus('planejado');
      setNewProjLinks('');
      setNewProjPrompts('');
      setNewProjArquivos('');
      setNewProjObs('');
    }
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjNome.trim()) return;

    if (editingProject) {
      setProjects(prev => prev.map(p => p.id === editingProject.id ? {
        ...p,
        nome: newProjNome.trim(),
        cliente: newProjCliente.trim(),
        tipo: newProjTipo.trim(),
        responsavel: newProjResp,
        prazo: newProjPrazo,
        status: newProjStatus,
        links: newProjLinks,
        prompts: newProjPrompts,
        arquivos: newProjArquivos,
        observacoes: newProjObs
      } : p));
      triggerToast('Projeto atualizado!');
    } else {
      const newest: Project = {
        id: `proj_${Date.now()}`,
        nome: newProjNome.trim(),
        cliente: newProjCliente.trim(),
        tipo: newProjTipo.trim(),
        responsavel: newProjResp,
        prazo: newProjPrazo,
        status: newProjStatus,
        links: newProjLinks,
        prompts: newProjPrompts,
        arquivos: newProjArquivos,
        observacoes: newProjObs
      };
      setProjects(prev => [newest, ...prev]);
      triggerToast('Projeto registrado!');
    }
    setIsProjectModalOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm('Deletar este projeto?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
      triggerToast('Projeto removido.');
    }
  };

  // FILTERED LISTS
  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const matchS = p.titulo.toLowerCase().includes(promptSearch.toLowerCase()) || 
                     p.descricao.toLowerCase().includes(promptSearch.toLowerCase()) ||
                     p.texto.toLowerCase().includes(promptSearch.toLowerCase());
      const matchC = selectedPromptCategory === 'All' || p.categoria === selectedPromptCategory;
      return matchS && matchC;
    });
  }, [prompts, promptSearch, selectedPromptCategory]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchS = p.nome.toLowerCase().includes(projectSearch.toLowerCase()) || 
                     p.cliente.toLowerCase().includes(projectSearch.toLowerCase()) ||
                     p.observacoes.toLowerCase().includes(projectSearch.toLowerCase());
      const matchSt = projectStatusFilter === 'All' || p.status === projectStatusFilter;
      return matchS && matchSt;
    });
  }, [projects, projectSearch, projectStatusFilter]);

  return (
    <div className="space-y-6 text-left" id="workspace_criativo_view">
      
      {/* Dynamic Toast feedback */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#0A192F] border border-[#D4AF37]/40 text-white rounded-lg px-4 py-3 shadow-lg flex items-center gap-2 duration-300 animate-in fade-in slide-in-from-top-4 font-sans text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Premium Banner */}
      <div className="bg-[#0A192F] p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[#D4AF37]/5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-transparent rounded-full pointer-events-none" />
        <div className="space-y-1.5 z-10 text-left">
          <div className="flex items-center gap-2">
            <span className="bg-[#D4AF37]/15 text-[#D4AF37] px-2.5 py-0.5 text-[10px] uppercase font-black rounded-full border border-[#D4AF37]/20 letter tracking-wider">
              Onboarding & Mídias
            </span>
            <span className="text-slate-400 text-xs">• Workspace da Núria</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight font-sans">
            Workspace Criativo <span className="text-[#D4AF37]">ILG</span>
          </h1>
          <p className="text-xs text-slate-350 max-w-xl font-normal leading-relaxed">
            Central operacional de produção de materiais do Instituto Liana Gomes. Reduza abas soltas, salve prompts estratégicos e gerencie arquivos e projetos de mídias de forma limpa e unificada.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 z-10">
          <button 
            onClick={() => setActiveTab('ferramentas')} 
            className="px-3.5 py-1.5 rounded-lg bg-[#1F4E89] hover:bg-opacity-80 text-white text-xs font-bold transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Ferramentas</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('prompts')} 
            className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#FCFBF9] hover:text-[#0A192F] text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Biblioteca Prompts</span>
          </button>
        </div>
      </div>

      {/* Custom Section Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'dashboard', label: 'Painel Geral', icon: ListTodo },
          { id: 'ferramentas', label: 'Ferramentas Inteligentes', icon: Sparkles },
          { id: 'prompts', label: 'Biblioteca de Prompts', icon: Brain },
          { id: 'projetos', label: 'Fluxo de Projetos', icon: Folders },
          { id: 'tarefas', label: 'Quadro de Tarefas', icon: Clipboard },
          { id: 'arquivos', label: 'Upload Rápido (Temporários)', icon: Upload },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive 
                  ? "border-[#D4AF37] text-[#0A192F]" 
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4AF37]' : ''}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB: DASHBOARD                                                */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          {/* Quick shortcuts and stat badges */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Minhas Tarefas</span>
                <span className="text-2xl font-black text-slate-800 block">{tasks.filter(t => t.status !== 'concluido').length}</span>
              </div>
              <span className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-500">
                <CheckSquare className="w-5 h-5" />
              </span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Projetos Ativos</span>
                <span className="text-2xl font-black text-[#1F4E89] block">{projects.filter(p => p.status !== 'concluido').length}</span>
              </div>
              <span className="p-2.5 bg-[#1F4E89]/10 rounded-lg text-[#1F4E89]">
                <Folders className="w-5 h-5" />
              </span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Biblioteca Prompts</span>
                <span className="text-2xl font-black text-slate-800 block">{prompts.length}</span>
              </div>
              <span className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600">
                <Brain className="w-5 h-5" />
              </span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Arquivos Temporários</span>
                <span className="text-2xl font-black text-slate-800 block">{quickFiles.length}</span>
              </div>
              <span className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600">
                <File className="w-5 h-5" />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Hand: Favorite Links & Quick tools bar */}
            <div className="lg:col-span-2 space-y-6 text-left">
              
              {/* Premium Interactive Favorite tools */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h2 className="font-bold text-[#0A192F] text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Acesso Rápido de Trabalho (ILG)
                  </h2>
                  <button onClick={() => setActiveTab('ferramentas')} className="text-xs text-[#1F4E89] hover:underline font-bold flex items-center gap-1">
                    <span>Todas as {DEFAULT_TOOLS.length}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 4 most essential tools */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {DEFAULT_TOOLS.slice(0, 4).map((tool) => {
                    const IconComp = tool.icon;
                    const finalLink = customToolUrls[tool.id] || tool.link;
                    return (
                      <div 
                        key={tool.id} 
                        className="bg-stone-50 hover:bg-[#FCFBF9] p-3 rounded-lg border border-slate-100 hover:border-[#D4AF37]/45 transition duration-200 cursor-pointer flex flex-col justify-between text-left h-28 relative group"
                      >
                        <div className="space-y-1.5">
                          <div className={`p-1.5 rounded w-fit ${tool.color}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-xs text-slate-800 block">{tool.nome}</span>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-normal">{tool.desc}</p>
                        </div>
                        <div className="flex justify-between items-center mt-2 pt-1 border-t border-slate-100/50">
                          <a 
                            href={finalLink} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] font-bold text-[#1F4E89] flex items-center gap-0.5"
                          >
                            <span>Abrir</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                          
                          <button 
                            onClick={() => handleOpenCustomizeTool(tool.id, tool.nome, tool.link)}
                            className="text-[9px] text-slate-400 hover:text-[#0A192F] opacity-0 group-hover:opacity-100 transition absolute top-2 right-2 text-right"
                            title="Salvar link personalizado"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Projects Overview */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-[#0A192F] text-sm flex items-center gap-1.5">
                    <Folders className="w-4 h-4 text-[#D4AF37]" /> Projetos Criativos Recentes
                  </h3>
                  <button onClick={() => setActiveTab('projetos')} className="text-xs text-[#1F4E89] hover:underline font-bold">
                    Gerenciar Fluxo
                  </button>
                </div>

                <div className="divide-y divide-slate-105">
                  {projects.slice(0, 3).map((proj) => (
                    <div key={proj.id} className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 first:pt-0 last:pb-0">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-[#0A192F] text-xs truncate">{proj.nome}</h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase leading-none ${
                            proj.status === 'concluido' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            proj.status === 'em_andamento' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                            proj.status === 'aguardando_aprovacao' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-50 text-slate-505 border-slate-200'
                          }`}>
                            {proj.status === 'concluido' ? 'Concluído' :
                             proj.status === 'em_andamento' ? 'Em Andamento' :
                             proj.status === 'aguardando_aprovacao' ? 'Aguardando Aprovação' :
                             'Planejado'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">Cliente/Setor: <strong className="font-medium text-slate-600">{proj.cliente}</strong> • Responsável: <strong className="font-medium text-slate-600">{proj.responsavel}</strong></p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Prazo: {proj.prazo}
                        </span>

                        <div className="flex items-center gap-1">
                          {proj.links && proj.links.split(',').map((link, idx) => (
                            <a 
                              key={idx} 
                              href={link.trim()} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-[#0A192F]"
                              title={`Link ${idx + 1}`}
                            >
                              <Link2 className="w-3.5 h-3.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Materials Overview */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-[#0A192F] text-sm flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#D4AF37]" /> Central de Materiais Recentes
                  </h3>
                  <button onClick={() => setActiveTab('arquivos')} className="text-xs text-[#1F4E89] hover:underline font-bold">
                    Subir Novo
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quickFiles.slice(0, 4).map((file) => (
                    <div key={file.id} className="p-3 bg-stone-50 border border-slate-100 hover:border-slate-200 rounded-lg flex items-center justify-between text-left text-xs">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="p-2 bg-slate-200 text-slate-600 rounded">
                          {file.tipo === 'PDF' ? <FileText className="w-4 h-4 text-rose-500" /> : file.tipo === 'Imagem' ? <Image className="w-4 h-4 text-teal-500" /> : <File className="w-4 h-4 text-blue-500" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-700 truncate">{file.nome}</h4>
                          <p className="text-[10px] text-slate-405">{file.tamanho} • {file.data}</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => triggerToast(`Visualizando arquivo: ${file.nome}`)}
                        className="text-[10px] font-bold text-[#1F4E89] hover:underline shrink-0"
                      >
                        Abrir
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Hand Sidebar widget - Focus and quick items */}
            <div className="space-y-6 text-left">
              
              {/* Dynamic Bookmarks Panel */}
              <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-[#0A192F] text-xs uppercase tracking-wider flex items-center gap-1">
                    <Bookmark className="w-4 h-4 text-[#D4AF37]" /> Links Favoritos Dinâmicos
                  </h3>
                  <button 
                    onClick={() => setIsAddingBookmark(!isAddingBookmark)} 
                    className="p-1 hover:bg-slate-50 text-slate-500 rounded hover:text-[#0A192F]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {isAddingBookmark && (
                  <form onSubmit={handleAddBookmark} className="p-3 bg-stone-50 rounded-lg space-y-2.5 border border-slate-100 text-xs text-left animate-in slide-in-from-top-2">
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Título Curto</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Grupo de Suporte"
                        value={newBookmarkTitle}
                        onChange={e => setNewBookmarkTitle(e.target.value)}
                        className="w-full border border-slate-200 rounded p-1 outline-none font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Link / URL do Favorito</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: drive.google.com/..."
                        value={newBookmarkUrl}
                        onChange={e => setNewBookmarkUrl(e.target.value)}
                        className="w-full border border-slate-200 rounded p-1 outline-none font-medium text-slate-700"
                      />
                    </div>
                    <div className="flex gap-1 justify-end">
                      <button 
                        type="button" 
                        onClick={() => setIsAddingBookmark(false)} 
                        className="px-2 py-1 bg-white border rounded hover:bg-slate-50 text-[10px]"
                      >
                        Recusar
                      </button>
                      <button type="submit" className="px-2 py-1 bg-[#0A192F] text-white rounded text-[10px] font-bold">
                        Gravar
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {bookmarks.map((bk) => (
                    <div key={bk.id} className="p-2.5 bg-[#FCFBF9] hover:bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between group transition">
                      <a 
                        href={bk.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-semibold text-slate-800 hover:text-[#1F4E89] flex items-center gap-1.5 truncate max-w-[180px]"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-[#D4AF37]/50" />
                        <span className="truncate">{bk.titulo}</span>
                      </a>
                      <button 
                        onClick={() => handleDeleteBookmark(bk.id)} 
                        className="text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks Creative mini-list */}
              <div className="bg-[#FCFBF9] border border-slate-200 p-5 rounded-xl space-y-4 text-left">
                <div className="flex justify-between items-center border-b border-indigo-100/50 pb-3">
                  <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1">
                    <CheckSquare className="w-4 h-4 text-teal-600" /> Tarefas da Núria
                  </h3>
                  <button onClick={() => setActiveTab('tarefas')} className="text-[10px] text-[#1F4E89] hover:underline font-bold">
                    Quadro Completo
                  </button>
                </div>

                <form onSubmit={handleAddTask} className="flex gap-1.5">
                  <input 
                    type="text" 
                    required
                    placeholder="Adicionar tarefa rápida..."
                    value={newQuickTaskTitle}
                    onChange={e => setNewQuickTaskTitle(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-[#D4AF37]"
                  />
                  <button type="submit" className="p-1 px-2.5 bg-[#0A192F] text-white rounded text-xs font-bold hover:bg-[#D4AF37] hover:text-[#0A192F] transition">
                    Ok
                  </button>
                </form>

                <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="p-2 bg-white border border-slate-150 rounded-lg flex gap-2.5 text-xs text-left group">
                      <button 
                        onClick={() => handleToggleTaskStatus(task.id, task.status)}
                        className={`w-4 h-4 text-stone-200 hover:text-emerald-500 border border-slate-300 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                          task.status === 'concluido' ? 'bg-emerald-500 text-white border-emerald-500 hover:text-white' : ''
                        }`}
                        title="Alternar estado da tarefa"
                      >
                        {task.status === 'concluido' && <Check className="w-3 h-3" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <span className={`block font-medium ${task.status === 'concluido' ? 'line-through text-slate-350' : 'text-slate-800'}`}>
                          {task.titulo}
                        </span>

                        <span className={`text-[8px] uppercase tracking-wide px-1.5 rounded inline-block mt-0.5 font-bold ${
                          task.status === 'concluido' ? 'bg-emerald-50 text-emerald-600' :
                          task.status === 'em_andamento' ? 'bg-sky-50 text-sky-600' :
                          task.status === 'aguardando_aprovacao' ? 'bg-amber-50 text-amber-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>

                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition inline-block shrink-0 mt-0.5 self-start"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: FERRAMENTAS INTEGRADAS                                   */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'ferramentas' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          <div className="p-4 bg-amber-500/10 border border-[#D4AF37]/20 rounded-xl text-xs space-y-1">
            <h4 className="font-bold text-[#0A192F] uppercase text-[10px] tracking-wide flex items-center gap-1">
              <Info className="w-4 h-4 text-[#D4AF37]" /> Links e URLs Personalizáveis
            </h4>
            <p className="text-slate-650 font-normal leading-relaxed">
              Todos os cards abaixo abrem as ferramentas de trabalho da sua equipe em abas de navegação direta. Caso queira redirecionar um card específico do Google Drive, Canva ou Nutror para um projeto ou link privado do ILG específico, basta clicar no ícone de lápis no canto superior direito para salvar!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {DEFAULT_TOOLS.map((tool) => {
              const IconComp = tool.icon;
              const link = customToolUrls[tool.id] || tool.link;
              const isCustomized = !!customToolUrls[tool.id];

              return (
                <div 
                  key={tool.id} 
                  className="bg-white border hover:border-[#D4AF37]/50 rounded-xl p-5 shadow-xs flex flex-col justify-between text-left relative group duration-200 hover:shadow-md h-[180px]"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className={`p-2 rounded-lg border w-fit ${tool.color}`}>
                        <IconComp className="w-5 h-5" />
                      </div>

                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                        <button 
                          onClick={() => handleOpenCustomizeTool(tool.id, tool.nome, tool.link)}
                          className="p-1 text-slate-400 hover:text-[#0A192F] hover:bg-slate-50 rounded"
                          title="Fazer customização de URL"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-[#0A192F] text-sm">{tool.nome}</h4>
                        {isCustomized && (
                          <span className="text-[7.5px] uppercase font-serif tracking-widest bg-amber-100 text-[#D4AF37] border border-[#D4AF37]/25 px-1 py-0.2 rounded font-extrabold">Link Próprio</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-normal leading-snug line-clamp-3">{tool.desc}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-50">
                    <span className="text-[9px] text-slate-355 font-mono truncate max-w-[130px]" title={link}>
                      {link.replace('https://', '').replace('www.', '')}
                    </span>
                    <a 
                      href={link} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs font-semibold text-[#1F4E89] hover:underline flex items-center gap-1"
                    >
                      <span>Entrar</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: BIBLIOTECA DE PROMPTS                                    */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'prompts' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          {/* Header controls and filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-2 bg-stone-50 border border-slate-200 rounded-lg px-3 py-1.5 w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Buscar prompt ou termo de IA..."
                value={promptSearch}
                onChange={e => setPromptSearch(e.target.value)}
                className="bg-transparent border-none text-xs w-full focus:outline-none placeholder-slate-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">Categorias:</span>
              <button 
                onClick={() => setSelectedPromptCategory('All')} 
                className={`px-3 py-1 rounded text-xs font-bold leading-none ${
                  selectedPromptCategory === 'All' 
                    ? 'bg-[#0A192F] text-white' 
                    : 'bg-stone-50 hover:bg-slate-100 text-slate-600 border border-slate-150'
                }`}
              >
                Todas
              </button>
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPromptCategory(cat)}
                  className={`px-3  py-1 rounded text-xs font-bold leading-none capitalize ${
                    selectedPromptCategory === cat 
                      ? 'bg-[#0A192F] text-[#D4AF37] border border-[#D4AF37]/35' 
                      : 'bg-stone-50 hover:bg-slate-150 text-slate-600 border border-slate-150'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handleOpenPromptModal()} 
              className="px-4 py-2 bg-[#D4AF37] hover:bg-[#0A192F] hover:text-white transition rounded-lg text-slate-950 text-xs font-black shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Prompt</span>
            </button>
          </div>

          {/* Prompt Grid container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPrompts.map((prompt) => (
              <div key={prompt.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between text-left space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[8px] bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-[#0A192F] transition border border-slate-200 px-2.5 py-0.5 rounded-full uppercase font-black tracking-widest leading-none">
                        {prompt.categoria}
                      </span>
                      <h4 className="font-bold text-[#0A192F] text-sm mt-1">{prompt.titulo}</h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleTogglePromptFavorite(prompt.id)}
                        className={`p-1.5 hover:bg-stone-50 rounded transition ${prompt.favorito ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>

                      <button 
                        onClick={() => handleOpenPromptModal(prompt)}
                        className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-stone-50 rounded transition"
                        title="Editar prompt"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => handleDeletePrompt(prompt.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-stone-50 rounded transition"
                        title="Deletar prompt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-normal leading-relaxed">{prompt.descricao}</p>
                  
                  <div className="bg-stone-50 border border-slate-100/50 p-3.5 rounded-xl font-mono text-xs text-slate-700 leading-relaxed overflow-y-auto max-h-36 pr-1 relative">
                    <pre className="whitespace-pre-wrap font-sans leading-relaxed text-slate-800 tracking-wide text-[11px]">{prompt.texto}</pre>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-50 flex justify-end">
                  <button 
                    onClick={() => handleCopyText(prompt.texto, prompt.titulo)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#0A192F] text-white hover:bg-[#D4AF37] hover:text-[#0A192F] transition font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Prompt</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredPrompts.length === 0 && (
              <div className="md:col-span-2 text-center p-12 bg-white border border-dashed rounded-xl space-y-2">
                <Brain className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-semibold text-slate-500">Nenhum prompt encontrado</p>
                <p className="text-xs text-slate-400 font-normal">Tente buscar por um termo alternativo ou crie um novo na categoria.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: FLOW DE PROJETOS                                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'projetos' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="flex items-center gap-2 bg-stone-50 border border-slate-200 rounded-lg px-3 py-1.5 w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Buscar projeto criativo..."
                value={projectSearch}
                onChange={e => setProjectSearch(e.target.value)}
                className="bg-transparent border-none text-xs w-full focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select 
                value={projectStatusFilter} 
                onChange={e => setProjectStatusFilter(e.target.value)}
                className="bg-stone-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="All">Todos os Status</option>
                <option value="planejado">Planejado</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="aguardando_aprovacao">Aguardando Aprovação</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>

            <button 
              onClick={() => handleOpenProjectModal()} 
              className="px-4 py-2 bg-[#0A192F] hover:bg-[#D4AF37] hover:text-[#0A192F] transition rounded-lg text-white font-bold text-xs shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Projeto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((proj) => (
              <div key={proj.id} className="bg-white border border-slate-200 hover:border-slate-350 rounded-2xl shadow-xs p-5 space-y-4 flex flex-col justify-between text-left group">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[9px] uppercase tracking-wide font-serif text-slate-400 block">{proj.tipo}</span>
                      <h4 className="font-bold text-[#0A192F] text-sm group-hover:text-[#1F4E89] duration-200">{proj.nome}</h4>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                      <button 
                        onClick={() => handleOpenProjectModal(proj)} 
                        className="p-1 hover:bg-stone-50 rounded text-slate-500"
                        title="Editar detalhes do projeto"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(proj.id)} 
                        className="p-1 hover:bg-stone-50 rounded text-slate-400 hover:text-red-500"
                        title="Deletar projeto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] bg-slate-100 p-2 rounded border border-slate-150">
                    <span className="text-slate-500">Responsável:</span>
                    <strong className="font-bold text-slate-800">{proj.responsavel}</strong>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">{proj.observacoes || 'Sem notas ou observações do projeto.'}</p>
                </div>

                <div className="space-y-3 border-t border-slate-50 pt-3">
                  <div className="text-[11px] grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[9px] uppercase tracking-wide text-slate-405 block">Cliente/Destinatário</span>
                      <span className="font-semibold text-slate-800 truncate block max-w-[125px]" title={proj.cliente}>{proj.cliente}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wide text-slate-405 block">Prazo Data Limite</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                        {proj.prazo}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <div>
                      <span className="text-[9px] uppercase tracking-wide text-slate-405 block mb-0.5">Status</span>
                      <div className="relative">
                        <select
                          value={proj.status}
                          onChange={e => {
                            const val = e.target.value as any;
                            setProjects(prev => prev.map(p => p.id === proj.id ? { ...p, status: val } : p));
                            triggerToast('Status do projeto atualizado!');
                          }}
                          className={`w-full text-[10px] font-bold px-2 py-1 rounded border outline-none bg-white uppercase tracking-wider ${
                            proj.status === 'concluido' ? 'text-emerald-700 border-emerald-250 bg-emerald-50/50' :
                            proj.status === 'em_andamento' ? 'text-sky-700 border-sky-200 bg-sky-50/30' :
                            proj.status === 'aguardando_aprovacao' ? 'text-amber-700 border-amber-250 bg-amber-50/30' :
                            'text-slate-600 border-slate-200 bg-slate-50/30'
                          }`}
                        >
                          <option value="planejado">Planejado</option>
                          <option value="em_andamento">Em Andamento</option>
                          <option value="aguardando_aprovacao">Aguardando Aprovação</option>
                          <option value="concluido">Concluído</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wide text-slate-405 block mb-0.5">Material de IA</span>
                      <div className="text-[10px] bg-slate-100 border border-slate-150 rounded px-2 py-1 h-6 truncate text-slate-600 font-semibold" title={proj.prompts || 'Sem prompt associado'}>
                        {proj.prompts || 'Nenhum'}
                      </div>
                    </div>
                  </div>

                  {proj.links && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.links.split(',').map((link, idx) => {
                        const l = link.trim();
                        return (
                          <a 
                            key={idx} 
                            href={l} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] bg-sky-100 hover:bg-[#D4AF37] hover:text-zinc-950 font-bold px-2 py-0.5 text-[#1F4E89] rounded transition flex items-center gap-1"
                          >
                            <Link2 className="w-3 h-3" />
                            <span>Recurso {idx + 1}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="md:col-span-3 text-center p-12 bg-white border border-dashed rounded-xl space-y-2">
                <Folders className="w-8 h-8 text-slate-350 mx-auto" />
                <p className="text-sm font-semibold text-slate-500">Nenhum projeto cadastrado</p>
                <p className="text-xs text-slate-400">Clique em "Novo Projeto" para registrar uma nova demanda de design/conteúdo.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: QUADRO DE TAREFAS                                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'tarefas' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          <div className="bg-[#FCFBF9] h-auto p-5 border border-slate-200 rounded-2xl text-left space-y-4 shadow-xs">
            <h3 className="font-extrabold text-[#010D1E] text-sm flex items-center gap-1.5">
              <CheckSquare className="w-5 h-5 text-indigo-600 animate-pulse" /> Quadro Kanban Operacional de Tarefas da Núria
            </h3>
            
            <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2 max-w-xl text-xs text-left">
              <input 
                type="text" 
                required
                placeholder="Qual tarefa criativa ou operacional de mídia precisa iniciar?"
                value={newQuickTaskTitle}
                onChange={e => setNewQuickTaskTitle(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3.5 py-2 outline-none focus:border-[#D4AF37] font-semibold text-slate-700 shadow-2xs"
              />
              <button type="submit" className="px-5 py-2 bg-[#0A192F] text-white hover:bg-[#D4AF37] hover:text-[#0A192F] transition rounded-lg font-black shrink-0">
                Lançar Demanda
              </button>
            </form>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start text-left">
            {[
              { id: 'a_fazer', label: 'A Fazer', color: 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' },
              { id: 'em_andamento', label: 'Em Andamento', color: 'bg-sky-50 border-sky-100 text-sky-850' },
              { id: 'aguardando_aprovacao', label: 'Aguardando Aprovação', color: 'bg-amber-50 border-amber-200 text-amber-805' },
              { id: 'concluido', label: 'Concluído', color: 'bg-emerald-50 border-emerald-150 text-emerald-800' }
            ].map((col) => {
              const columnTasks = tasks.filter(t => t.status === col.id);
              return (
                <div key={col.id} className="bg-white border rounded-xl shadow-2xs p-4 space-y-3 min-h-[460px] text-left">
                  <div className={`p-2.5 rounded-lg border flex justify-between items-center font-bold text-xs ${col.color}`}>
                    <span className="uppercase tracking-wider">{col.label}</span>
                    <span className="bg-white/90 px-2 py-0.5 rounded text-[10px] text-slate-700 leading-none">{columnTasks.length}</span>
                  </div>

                  <div className="space-y-2.5 overflow-y-auto max-h-[400px] pr-1">
                    {columnTasks.map((t) => (
                      <div key={t.id} className="p-3 bg-stone-50 border border-slate-150 hover:border-slate-350 hover:bg-white rounded-lg transition text-xs space-y-2 text-left group">
                        <span className={`block font-semibold leading-relaxed ${t.status === 'concluido' ? 'line-through text-slate-350' : 'text-slate-800'}`}>
                          {t.titulo}
                        </span>

                        <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                          {/* Moving handle button */}
                          <button 
                            onClick={() => handleToggleTaskStatus(t.id, t.status)}
                            className="text-[9px] text-[#1F4E89] hover:underline flex items-center gap-0.5 font-bold"
                            title="Avançar status da tarefa"
                          >
                            <span>Avançar</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>

                          <button 
                            onClick={() => handleDeleteTask(t.id)} 
                            className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {columnTasks.length === 0 && (
                      <div className="text-center py-10 text-slate-400 italic text-[11px]">Nenhuma demanda alocada aqui.</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: UPLOAD DE ARQUIVOS (TEMPORARIOS)                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'arquivos' && (
        <div className="space-y-6 animate-in fade-in duration-200 text-left">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Real Area Upload drop-zone drag and clickable */}
            <div className="lg:col-span-1 space-y-4 text-left">
              <div 
                onDragEnter={() => setDragActive(true)}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-xl p-8 py-12 text-center text-xs space-y-4 transition ${
                  dragActive 
                    ? 'border-[#D4AF37] bg-amber-500/10 text-slate-[#0A192F]' 
                    : 'border-slate-300 bg-white hover:border-[#1F4E89] text-slate-400'
                }`}
              >
                <div className="p-3 bg-slate-50 border rounded-full w-fit mx-auto text-slate-500">
                  <Upload className="w-6 h-6 animate-bounce" />
                </div>

                <div className="space-y-1 block">
                  <p className="font-bold text-slate-705">Arraste seu documento de mídias aqui</p>
                  <p className="text-[10px] text-slate-400 font-normal">Aceita PDFs, Imagens rascunhos, Planilhas excel e Editáveis em Geral.</p>
                </div>

                <span className="text-[10px] font-bold text-slate-300 block">OU</span>

                <label className="px-4 py-2 bg-[#0A192F] hover:bg-[#D4AF37] hover:text-[#0A192F] transition duration-200 text-white font-bold rounded-lg cursor-pointer inline-block shadow-2xs">
                  <span>Selecionar do Computador</span>
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                </label>
              </div>

              <div className="p-4 bg-[#FCFBF9] border border-slate-205 rounded-xl text-left text-[11px] leading-relaxed text-slate-500 font-sans space-y-1">
                <h4 className="font-black text-slate-700 uppercase tracking-wider text-[9.5px]">O que é a Central Temporária?</h4>
                <p>Use esta área para repassar artes, apresentações, depoimentos crus de clientes ou PDFs que acabou de baixar para o seu editor atual nas abas externas (como Canva, ChatGPT, NotebookLM). O browser os mantém guardados para que você não precise gastar tempo caçando pastas imediatas no seu computador!</p>
              </div>
            </div>

            {/* List of files */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 space-y-4 text-left">
              <h3 className="font-bold text-[#010D1E] text-sm border-b border-slate-100 pb-3">Compartimento de Arquivos Ativo ({quickFiles.length})</h3>

              <div className="divide-y divide-slate-105">
                {quickFiles.map((file) => (
                  <div key={file.id} className="py-3.5 flex items-center justify-between group text-xs text-left">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="p-2.5 bg-stone-100 border border-slate-200 text-slate-600 rounded">
                        {file.tipo === 'PDF' ? <FileText className="w-5 h-5 text-rose-500" /> : file.tipo === 'Imagem' ? <Image className="w-5 h-5 text-teal-500" /> : <File className="w-5 h-5 text-indigo-500" />}
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 truncate leading-snug">{file.nome}</h4>
                        <p className="text-[10.5px] text-slate-400">Tamanho: <strong className="font-medium text-slate-600">{file.tamanho}</strong> • Enviado em: <strong className="font-medium text-slate-600">{file.data}</strong></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => triggerToast(`Visualizando arquivo: ${file.nome}`)}
                        className="px-3 py-1 bg-stone-100 hover:bg-[#1F4E89] hover:text-white transition duration-200 text-[#1F4E89] font-bold rounded"
                      >
                        Visualizar
                      </button>

                      <button 
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1 hover:bg-slate-50 text-slate-400 hover:text-red-600 rounded transition"
                        title="Excluir arquivo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {quickFiles.length === 0 && (
                  <div className="text-center py-24 text-slate-400 font-semibold space-y-1">
                    <Upload className="w-8 h-8 text-slate-300 mx-auto" />
                    <p>Central de rascunhos vazia</p>
                    <p className="text-[10px] text-slate-400 font-normal">Importe um arquivo de mídia para começar a organizar seu fluxo temporariamente.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL: CUSTOMAIZE TOOL URL                                        */}
      {/* ----------------------------------------------------------------- */}
      {isCustomizeToolModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A192F]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveCustomToolUrl} 
            className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 text-left"
          >
            <div className="bg-[#0A192F] p-5 text-white flex justify-between items-center border-b border-slate-800 text-left">
              <div>
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest leading-none">Customizar Acesso</h4>
                <h3 className="font-bold text-base mt-1">Configurar URL ({customizingToolName})</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsCustomizeToolModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-left text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-slate-600 font-sans leading-relaxed">
                Personalize o link de destino deste card para abrir diretamente sua pasta ou espaço privado no Canva ou Google Drive da sua conta!
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-500">Link personalizado (Drive / Canva / Sheets)</label>
                <input 
                  type="text" 
                  required
                  placeholder="https://..."
                  value={customizingUrlInput}
                  onChange={e => setCustomizingUrlInput(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 outline-none focus:border-[#D4AF37] text-slate-750 font-medium"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-stone-50 border-t border-slate-105 flex justify-between gap-2">
              <button 
                type="button" 
                onClick={() => customizingToolId && handleResetToolUrl(customizingToolId)}
                className="px-3 py-2 bg-stone-100 hover:bg-rose-50 text-rose-600 border border-slate-200 rounded-lg font-bold text-xs"
              >
                Restaurar Padrão
              </button>

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsCustomizeToolModalOpen(false)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-xs hover:bg-slate-50 text-slate-700"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-[#0A192F] hover:bg-[#D4AF37] hover:text-[#0A192F] transition duration-200 text-white rounded-lg font-bold text-xs">
                  Salvar Mudança
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL: PROMPT REGISTER / EDIT                                    */}
      {/* ----------------------------------------------------------------- */}
      {isPromptModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A192F]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSavePrompt} 
            className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 text-left"
          >
            <div className="bg-[#0A192F] p-5 text-white flex justify-between items-center border-b border-slate-800 text-left">
              <div>
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest leading-none">Biblioteca de Heurísticas</h4>
                <h3 className="font-bold text-base mt-1">{editingPrompt ? 'Editar Prompt de Equipe' : 'Cadastrar Novo Prompt Estratégico'}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsPromptModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-left text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Título do Prompt</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Roteiro Carrossel Carreira"
                    value={newPromptTitle}
                    onChange={e => setNewPromptTitle(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 outline-none focus:border-[#D4AF37] text-slate-800 font-bold"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Categoria do Prompt</label>
                  <select
                    value={newPromptCat}
                    onChange={e => setNewPromptCat(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 outline-none focus:border-[#D4AF37] bg-white text-slate-700 font-bold"
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-500">Descrição/Objetivo</label>
                <input 
                  type="text" 
                  placeholder="Ex: Utilizado para gerar ideias para posts semanais com tons empáticos..."
                  value={newPromptDesc}
                  onChange={e => setNewPromptDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 outline-none focus:border-[#D4AF37] text-slate-700"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-500">Texto Integral do Prompt (Heurística de IA)</label>
                <textarea 
                  required
                  rows={6}
                  placeholder={`Insira aqui todas as instruções, regras de escrita e variáveis entre colchetes. Ex: Atue como um especialista...`}
                  value={newPromptText}
                  onChange={e => setNewPromptText(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 outline-none focus:border-[#D4AF37] text-slate-705 font-mono text-[11px] resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-stone-50 border-t border-slate-105 flex justify-end gap-2 text-right">
              <button 
                type="button" 
                onClick={() => setIsPromptModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-xs hover:bg-slate-50 text-slate-700"
              >
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-[#0A192F] hover:bg-[#D4AF37] hover:text-[#0A192F] transition duration-200 text-white rounded-lg font-bold text-xs shadow-xs">
                {editingPrompt ? 'Atualizar Prompt' : 'Gravar na Biblioteca'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL: PROJECT REGISTER / EDIT                                    */}
      {/* ----------------------------------------------------------------- */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A192F]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveProject} 
            className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 text-left"
          >
            <div className="bg-[#0A192F] p-5 text-white flex justify-between items-center border-b border-slate-800 text-left">
              <div>
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest leading-none">Fluxo de Conteúdo</h4>
                <h3 className="font-bold text-base mt-1">{editingProject ? 'Editar Projeto Criativo' : 'Iniciar Novo Projeto de Mídias/Materiais'}</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsProjectModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-left text-xs max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Nome do Projeto/Material</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Ebook Expert em Prevenção"
                    value={newProjNome}
                    onChange={e => setNewProjNome(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#D4AF37] text-slate-800 font-bold"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Cliente Interno / Solicitante / Setor</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Onboarding alunas / RH Corporativo"
                    value={newProjCliente}
                    onChange={e => setNewProjCliente(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#D4AF37] text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                <div className="md:col-span-2 space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Tipo de Trabalho/Material</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Slides Canva / Carrossel feed / Ebook v2"
                    value={newProjTipo}
                    onChange={e => setNewProjTipo(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#D4AF37] text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Responsável</label>
                  <select
                    value={newProjResp}
                    onChange={e => setNewProjResp(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#D4AF37] bg-white text-slate-700 font-bold"
                  >
                    <option value="Núria Onboarding">Núria (Onboarding)</option>
                    <option value="Liana Gomes">Liana Gomes (Diretora)</option>
                    <option value="Ana Comercial">Ana (Comercial)</option>
                    <option value="Luiza Tech">Luiza (Tech Lead)</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Data Limite de Prazo</label>
                  <input 
                    type="date" 
                    value={newProjPrazo}
                    onChange={e => setNewProjPrazo(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#D4AF37] text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Status Inicial</label>
                  <select
                    value={newProjStatus}
                    onChange={e => setNewProjStatus(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#D4AF37] bg-white text-slate-700 font-bold"
                  >
                    <option value="planejado">Planejado</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="aguardando_aprovacao">Aguardando Aprovação</option>
                    <option value="concluido">Concluído</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Prompt Associado</label>
                  <select
                    value={newProjPrompts}
                    onChange={e => setNewProjPrompts(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#D4AF37] bg-white text-slate-700"
                  >
                    <option value="">Nenhum Prompt Associado</option>
                    {prompts.map(p => (
                      <option key={p.id} value={p.titulo}>{p.titulo}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Arquivos relacionados (nome do arquivo)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: checklist_turma12.pdf"
                    value={newProjArquivos}
                    onChange={e => setNewProjArquivos(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#D4AF37] text-slate-700 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-500">Links úteis do projeto (Canva, Drive ou site - separados por vírgula)</label>
                <input 
                  type="text" 
                  placeholder="Ex: https://canva.com/design/..., https://drive.google.com/..."
                  value={newProjLinks}
                  onChange={e => setNewProjLinks(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#D4AF37] text-[#1F4E89]"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-500">Observações Gerais</label>
                <textarea 
                  rows={3}
                  placeholder="Insira detalhes específicos de formatação, referências visuais solicitadas por Liana ou escopos."
                  value={newProjObs}
                  onChange={e => setNewProjObs(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#D4AF37] text-slate-705 resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-stone-50 border-t border-slate-105 flex justify-end gap-2 text-right">
              <button 
                type="button" 
                onClick={() => setIsProjectModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg font-semibold text-xs hover:bg-slate-50 text-slate-700"
              >
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-[#0A192F] hover:bg-[#D4AF37] hover:text-[#0A192F] transition duration-200 text-white rounded-lg font-bold text-xs">
                {editingProject ? 'Salvar Alterações' : 'Lançar Projeto'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
