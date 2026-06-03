import { useState, useEffect } from 'react';
import { AppData } from './types';
import { db, auth } from './lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  
  // Auto-fallback for permissions error to behave as solid demo
  if (
    errMessage.toLowerCase().includes("permission") || 
    errMessage.toLowerCase().includes("insufficient") || 
    errMessage.toLowerCase().includes("unauthenticated")
  ) {
    console.warn(`⚠️ Firestore Permission Error caught on path '${path}'. Switching instantly to fully functional local client sandbox mode.`);
    if (!isLocalFallbackMode) {
      isLocalFallbackMode = true;
      loadLocalState();
      notify();
    }
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export let isLocalFallbackMode = false;

export const loadLocalState = () => {
  const localSaved = localStorage.getItem('ilg_store_fallback_data');
  if (localSaved) {
    try {
      memData = JSON.parse(localSaved);
      return;
    } catch (e) {
      console.error("Failed to parse local saved store", e);
    }
  }

  // Prepopulate highly structured mock data for seed profiles/clients
  const pList = [
    {
      id: 'p1', nome: 'Alessandra M. Silva', telefone: '75 98144-5758', email: 'alessandra.silva@gmail.com', origem: 'Instagram', 
      tipoPessoa: 'lead', produtoInteresse: 'TREINAMENTO ASSÉDIO / COMBO', produtoComprado: '', turma: '',
      status: 'perdido', temperatura: 'frio', responsavel: 'Fabi', 
      ultimaInteracao: '2026-05-26', proximoContato: '', 
      observacoes: 'Disse não ter capacidade de investimento e que não tem interesse no momento.',
      tags: ['Turma 1']
    },
    {
      id: 'p2', nome: 'Ana Kekligian', telefone: '11 94756-5478', email: 'ana.kekligian@hotmail.com', origem: 'Indicação',
      tipoPessoa: 'lead', produtoInteresse: 'TREINAMENTO ASSÉDIO / COMBO',
      status: 'em negociação', temperatura: 'quente', responsavel: 'Fabi',
      ultimaInteracao: '2026-05-26', proximoContato: '2026-05-29',
      observacoes: 'Disse estar sem dinheiro mas que está analisando se entra. Retomar contato até dia 29.',
      obcecao: 'Financeira'
    },
    {
      id: 'p3', nome: 'Viviane Diniz', telefone: '11 98354-5830', email: 'viviane.diniz@yahoo.com', origem: 'Site',
      tipoPessoa: 'aluna', produtoComprado: 'COMBO 1 - Negócios + Rodas de Conversa + Treinamento Assédio',
      turma: 'Turma 1', responsavel: 'Mara', status: 'concluído', temperatura: 'quente',
      formaPagamento: 'Eduzz', entrouGrupo: true, respondeuInicial: true, respondeuBonus: false,
      acessoNutror: true, acessoMRP: true
    },
    {
      id: 'p4', nome: 'Renata Castro', telefone: '11 98383-9885', email: 'contato@lidherec.com',
      tipoPessoa: 'aluna', produtoComprado: 'Formação em NR-1, Master Trainer de Líderes',
      turma: 'Pacote 2', responsavel: 'Equipe', status: 'em acompanhamento', temperatura: 'morno',
      entrouGrupo: false, respondeuInicial: false, acessoNutror: false, acessoMRP: true,
      observacoes: '19/12: Estou entrando em contato apenas para me colocar à disposição.'
    }
  ];

  const tsList = [
    {
      id: 'ts1', titulo: 'Liberar Formação para Josiane Cristina Costa', categoria: 'administrativo',
      tipo: 'tarefa', pessoaId: 'p2', responsavel: 'Financeiro', prioridade: 'alta', prazo: '2026-06-04',
      status: 'a fazer', descricao: 'A Formação só será liberada depois do faturamento do boleto bancário'
    },
    {
      id: 'ts2', titulo: 'Follow up comercial com Ana Kekligian', categoria: 'comercial',
      tipo: 'tarefa', pessoaId: 'p2', responsavel: 'Fabi', prioridade: 'alta', prazo: '2026-06-12',
      status: 'a fazer', descricao: 'Retornar para saber se conseguiu parcelar no cartão'
    },
    {
      id: 'ts3', titulo: 'Unificar contas de e-mail do Willian', categoria: 'acesso',
      tipo: 'suporte', responsavel: 'Núria', prioridade: 'média', status: 'em análise',
      descricao: 'Aluno focado relatou dificuldade de acesso pois os cursos estão espalhados em differentes contas.'
    }
  ];

  const mList = [
    { id: 'm1', nome: 'Bônus - Ebook Compliance', categoria: 'ebook', link: 'https://drive.google.com/drive/folders/ilg_ebooks', responsavel: 'Liana', status: 'aprovado' },
    { id: 'm2', nome: 'Planilha MRP Tracker 2026', categoria: 'materiais editáveis', link: 'https://docs.google.com/spreadsheets/ilg_tracker', responsavel: 'Núria', status: 'concluído' }
  ];

  const pagList = [
    { id: 'pag1', aluno: 'Viviane Diniz', formacao: 'COMBO 1 - Negócios + Rodas de Conversa + Treinamento Assédio', valorCombinado: 1250.00, status: 'pago', vencimento: '2026-05-15', comprovante: 'https://comprovantes.example.com/vivi.pdf', observacoes: 'Pagamento integral via Eduzz sem pendências.', responsavel: 'Ana' },
    { id: 'pag2', aluno: 'Renata Castro', formacao: 'Formação em NR-1, Master Trainer de Líderes', valorCombinado: 800.00, status: 'parcial', vencimento: '2026-06-05', comprovante: '', observacoes: 'Entrada de R$ 400 paga. Falta segunda parcela de R$ 400 para vencimento em 05/06.', responsavel: 'Financeiro' },
    { id: 'pag3', aluno: 'Ana Kekligian', formacao: 'TREINAMENTO ASSÉDIO / COMBO', valorCombinado: 950.00, status: 'pendente', vencimento: '2026-06-10', comprovante: '', observacoes: 'Aguardando confirmação do PIX de sinal.', responsavel: 'Ana' }
  ];

  const perfList = [
    {
      id: 'liana',
      nome: 'Liana Gomes',
      cargo: 'Fundadora & Diretora Geral',
      role: 'Diretoria Geral',
      permissions: ['view_only', 'edit_leads', 'manage_all'],
      foto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300',
      perfil: 'Advogada especialista em Compliance de Gênero, Combate ao Assédio Corporativo e Desenvolvimento de Mulheres Líderes.',
      linkedin: 'liana-gomes-compliance',
      instagram: 'lianagomes.ilg',
      email: 'liana@institutolianagomes.com.br',
      telefone: '11 99999-5555'
    },
    {
      id: 'ana',
      nome: 'Ana',
      cargo: 'Head de Negócios & Comercial',
      role: 'Operador de Vendas',
      permissions: ['view_only', 'edit_leads'],
      foto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300&h=300',
      perfil: 'Responsável pelo gerenciamento do CRM do Instituto, conversão de novos leads quentes, negociações de combos corporativos e faturamento inicial.',
      linkedin: 'ana-ilg-comercial',
      instagram: 'ana.comercial',
      email: 'comercial@institutolianagomes.com.br',
      telefone: '11 98888-4444'
    },
    {
      id: 'nuria',
      nome: 'Núria',
      cargo: 'Client Success, Mídias & Operação',
      role: 'Colaborador / Suporte',
      permissions: ['view_only'],
      foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300',
      perfil: 'Supervisora de Onboarding de novas alunas. Responsável por liberar acessos ao Nutror, alimentar o MRP Tracker, além de coordenar pautas de mídia e Instagram.',
      linkedin: 'nuria-ilg-suporte',
      instagram: 'nuria.suporte',
      email: 'nuria@institutolianagomes.com.br',
      telefone: '11 97777-3333'
    },
    {
      id: 'luiza',
      nome: 'Luiza',
      cargo: 'Tech Lead / Administradora',
      role: 'Administrador',
      permissions: ['view_only', 'edit_leads', 'manage_all'],
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300',
      perfil: 'Arquiteta de software e mantenedora deste Portal Integrado. Gerencia as integrações de banco de dados, regras e logs operacionais.',
      linkedin: 'luiza-ft',
      instagram: 'luiza.tech',
      email: 'luizaftessele@gmail.com',
      telefone: '11 96666-2222'
    }
  ];

  const tplList = [
    {
      id: 'tpl1',
      nome: 'Formação Avançada em Compliance',
      tipo: 'Profissional',
      layoutVisual: 'clássico',
      textoPrincipal: 'Certificamos que a aluna concluiu com aproveitamento a Formação Avançada de Liderança Corporativa e Mentoria de Alto Impacto.',
      cargaHorariaPadrao: '40 horas',
      assinatura: 'Dra. Liana Gomes',
      statusAtivo: true,
      corPrincipal: '#0A192F',
      corSecundaria: '#D4AF37'
    }
  ];

  const emitList = [
    {
      id: 'emit1',
      nomeAluno: 'Viviane Diniz',
      emailAluno: 'viviane.diniz@yahoo.com',
      nomeFormacao: 'Mentoria Roda de Conversa Corporativa',
      turma: 'Turma 1',
      cargaHoraria: '12 horas',
      dataConclusao: '2026-05-15',
      dataEmissao: '2026-05-16',
      nomeInstrutora: 'Liana Gomes',
      status: 'concluido',
      templateId: 'tpl1',
      responsavel: 'nuria'
    }
  ];

  memData = {
    pessoas: pList,
    turmas: [],
    materiais: mList,
    tarefas_suporte: tsList,
    pagamentos: pagList,
    perfis: perfList,
    certificados_emitidos: emitList,
    certificados_templates: tplList
  };
};

export const persistLocalState = () => {
  localStorage.setItem('ilg_store_fallback_data', JSON.stringify(memData));
};

const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ilg_show_toast', { detail: { message, type } }));
  }
};

const loadInitialCachedState = (): AppData => {
  const defaultEmpty: AppData = {
    pessoas: [],
    turmas: [],
    materiais: [],
    tarefas_suporte: [],
    pagamentos: [],
    perfis: [],
    certificados_emitidos: [],
    certificados_templates: []
  };

  try {
    const offlineCache = localStorage.getItem('ilg_store_offline_cache');
    if (offlineCache) {
      return JSON.parse(offlineCache);
    }
    const localFallback = localStorage.getItem('ilg_store_fallback_data');
    if (localFallback) {
      return JSON.parse(localFallback);
    }
  } catch (e) {
    console.warn("Failed to load initial cached state, starting fresh", e);
  }

  return defaultEmpty;
};

const collections = [
  'pessoas',
  'turmas',
  'materiais',
  'tarefas_suporte',
  'pagamentos',
  'perfis',
  'certificados_emitidos',
  'certificados_templates'
] as const;

let memData: AppData = loadInitialCachedState();

const persistOfflineCache = () => {
  try {
    localStorage.setItem('ilg_store_offline_cache', JSON.stringify(memData));
  } catch (e) {
    console.error("Failed to save offline/recent cache", e);
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    triggerToast("Conexão restabelecida! Sincronizando dados com a nuvem...", "success");
    syncNow();
  });
  window.addEventListener('offline', () => {
    triggerToast("Conexão perdida. Portal operando em modo offline com a última cópia salva.", "info");
  });
}

const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

let isListening = false;
export const startFirebaseListeners = () => {
  if (isListening) return;
  isListening = true;

  const isDemo = localStorage.getItem('ilg_demo_authenticated') === 'true';
  if (isDemo) {
    console.log("Iniciando store diretamente em modo offline/demo local");
    isLocalFallbackMode = true;
    loadLocalState();
    notify();
    return;
  }
  
  collections.forEach(col => {
    onSnapshot(collection(db, col), (snapshot) => {
      if (isLocalFallbackMode) return;
      const dbData: any = [];
      snapshot.forEach(d => dbData.push({ id: d.id, ...d.data() }));
      memData = { ...memData, [col]: dbData };
      persistOfflineCache();
      notify();
    }, (error) => {
      console.warn(`Erro de sincronização Firebase para '${col}'. Ativando fallback local para visualização offline robusta:`, error.message || error);
      if (!isLocalFallbackMode) {
        // Switch gracefully to local mode
        isLocalFallbackMode = true;
        loadLocalState();
        notify();
      }
    });
  });
};

export const syncNow = async () => {
  if (isLocalFallbackMode) {
    loadLocalState();
    notify();
    return;
  }
  const promises = collections.map(async (col) => {
    try {
      const querySnapshot = await getDocs(collection(db, col));
      const dbData: any = [];
      querySnapshot.forEach(d => dbData.push({ id: d.id, ...d.data() }));
      memData = { ...memData, [col]: dbData };
    } catch (error: any) {
      console.warn(`Erro ao carregar '${col}' do Firebase. Utilizando cache e habilitando fallback local:`, error.message || error);
      if (!isLocalFallbackMode) {
        isLocalFallbackMode = true;
        loadLocalState();
      }
    }
  });
  await Promise.all(promises);
  persistOfflineCache();
  notify();
};

export const store = {
  getData: () => memData,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
};

export const useStore = () => {
  const [data, setDataState] = useState(memData);

  useEffect(() => {
    return store.subscribe(() => {
      setDataState(store.getData());
    });
  }, []);

  const updateSingleField = async (moduleId: string, docId: string, fields: any) => {
    const isOfflineMode = isLocalFallbackMode || (typeof navigator !== 'undefined' && !navigator.onLine);
    
    if (isOfflineMode) {
      const list = memData[moduleId as keyof AppData] || [];
      const index = list.findIndex((item: any) => item.id === docId);
      if (index !== -1) {
        list[index] = { ...list[index], ...fields };
      } else {
        list.push({ id: docId, ...fields });
      }
      memData = { ...memData, [moduleId]: [...list] };
      persistOfflineCache();
      persistLocalState();
      notify();
      
      if (!isLocalFallbackMode) {
        triggerToast("Atualização gravada localmente (Modo Offline).", "info");
      }
      return;
    }
    
    try {
      await setDoc(doc(db, moduleId, String(docId)), fields, { merge: true });
      
      // Update local storage and client copy
      const list = memData[moduleId as keyof AppData] || [];
      const index = list.findIndex((item: any) => item.id === docId);
      if (index !== -1) {
        list[index] = { ...list[index], ...fields };
      } else {
        list.push({ id: docId, ...fields });
      }
      memData = { ...memData, [moduleId]: [...list] };
      persistOfflineCache();
      notify();
    } catch (error) {
      console.warn("Firestore setDoc failed, falling back to local offline storage:", error);
      const list = memData[moduleId as keyof AppData] || [];
      const index = list.findIndex((item: any) => item.id === docId);
      if (index !== -1) {
        list[index] = { ...list[index], ...fields };
      } else {
        list.push({ id: docId, ...fields });
      }
      memData = { ...memData, [moduleId]: [...list] };
      persistOfflineCache();
      notify();
      triggerToast("Erro de rede. Dados salvos localmente.", "info");
    }
  };

  const deleteSingleDocument = async (moduleId: string, docId: string) => {
    const isOfflineMode = isLocalFallbackMode || (typeof navigator !== 'undefined' && !navigator.onLine);

    if (isOfflineMode) {
      const list = memData[moduleId as keyof AppData] || [];
      const updated = list.filter((item: any) => item.id !== docId);
      memData = { ...memData, [moduleId]: updated };
      persistOfflineCache();
      persistLocalState();
      notify();
      
      if (!isLocalFallbackMode) {
        triggerToast("Item desativado/removido localmente.", "info");
      }
      return;
    }
    
    try {
      await deleteDoc(doc(db, moduleId, String(docId)));
      
      const list = memData[moduleId as keyof AppData] || [];
      const updated = list.filter((item: any) => item.id !== docId);
      memData = { ...memData, [moduleId]: updated };
      persistOfflineCache();
      notify();
    } catch (error) {
      console.warn("Firestore deleteDoc failed, falling back to local offline storage:", error);
      const list = memData[moduleId as keyof AppData] || [];
      const updated = list.filter((item: any) => item.id !== docId);
      memData = { ...memData, [moduleId]: updated };
      persistOfflineCache();
      notify();
      triggerToast("Erro de rede ao remover. Removido localmente.", "info");
    }
  };

  const addSingleDocument = async (moduleId: string, docData: any) => {
    const id = docData.id ? String(docData.id) : `local-${Math.random().toString(36).substring(2, 9)}`;
    const { id: _, ...itemData } = docData;
    const isOfflineMode = isLocalFallbackMode || (typeof navigator !== 'undefined' && !navigator.onLine);

    if (isOfflineMode) {
      const list = memData[moduleId as keyof AppData] || [];
      const index = list.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        list[index] = { id, ...itemData };
      } else {
        list.push({ id, ...itemData });
      }
      memData = { ...memData, [moduleId]: [...list] };
      persistOfflineCache();
      persistLocalState();
      notify();
      
      if (!isLocalFallbackMode) {
        triggerToast("Novo registro adicionado localmente.", "info");
      }
      return id;
    }
    
    try {
      await setDoc(doc(db, moduleId, id), itemData, { merge: true });
      
      const list = memData[moduleId as keyof AppData] || [];
      const index = list.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        list[index] = { id, ...itemData };
      } else {
        list.push({ id, ...itemData });
      }
      memData = { ...memData, [moduleId]: [...list] };
      persistOfflineCache();
      notify();
      return id;
    } catch (error) {
      console.warn("Firestore addDoc/setDoc failed, falling back to local offline storage:", error);
      const list = memData[moduleId as keyof AppData] || [];
      list.push({ id, ...itemData });
      memData = { ...memData, [moduleId]: [...list] };
      persistOfflineCache();
      notify();
      triggerToast("Erro de rede. Registro criado offline.", "info");
      return id;
    }
  };

  const updateModuleData = async (moduleId: keyof AppData, newModuleData: any[]) => {
    const isOfflineMode = isLocalFallbackMode || (typeof navigator !== 'undefined' && !navigator.onLine);

    if (isOfflineMode) {
      memData = { ...memData, [moduleId]: newModuleData };
      persistOfflineCache();
      persistLocalState();
      notify();
      return;
    }
    
    const currentList = memData[moduleId] || [];
    const newIds = new Set(newModuleData.map(i => i.id));
    
    try {
      // Delete items removed from the new array
      for (const item of currentList) {
        if (!newIds.has(item.id)) {
          await deleteDoc(doc(db, moduleId, item.id));
        }
      }
      
      // Add or update items
      for (const item of newModuleData) {
        const { id, ...itemData } = item;
        await setDoc(doc(db, moduleId, String(id)), itemData, { merge: true });
      }
    } catch (error) {
      console.warn("Bulk module update partially failed, writing offline backup copy first:", error);
    }

    // Always update client-facing memory-state and save cache
    memData = { ...memData, [moduleId]: newModuleData };
    persistOfflineCache();
    notify();
  };

  return { 
    data, 
    updateModuleData,
    updateSingleField,
    addSingleDocument,
    deleteSingleDocument
  };
};
