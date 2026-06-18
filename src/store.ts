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
  const pList: any[] = [];
  const tsList: any[] = [];
  const mList: any[] = [];
  const pagList: any[] = [];
  const perfList: any[] = [];
  const tplList: any[] = [];
  const emitList: any[] = [];
  const defaultTags: any[] = [];

  memData = {
    pessoas: pList,
    turmas: [],
    materiais: mList,
    tarefas_suporte: tsList,
    pagamentos: pagList,
    perfis: perfList,
    certificados_emitidos: emitList,
    certificados_templates: tplList,
    tags_personalizaveis: defaultTags,
    allowed_emails: []
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
    certificados_templates: [],
    tags_personalizaveis: [],
    ilgc_canais: [],
    ilgc_mensagens: [],
    ilgc_notificacoes: [],
    allowed_emails: []
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
  'certificados_templates',
  'tags_personalizaveis',
  'ilgc_canais',
  'ilgc_mensagens',
  'ilgc_notificacoes',
  'allowed_emails'
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

  collections.forEach(col => {
    onSnapshot(collection(db, col), (snapshot) => {
      if (isLocalFallbackMode) return;
      const dbData: any = [];
      snapshot.forEach(d => dbData.push({ id: d.id, ...d.data() }));
      memData = { ...memData, [col]: dbData };
      persistOfflineCache();
      notify();
    }, (error) => {
      console.warn(`Erro de sincronização Firebase para '${col}':`, error.message || error);
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
      console.warn(`Erro ao carregar '${col}' do Firebase:`, error.message || error);
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
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerToast("Conexão com a internet restabelecida!", "success");
    };
    const handleOffline = () => {
      setIsOnline(false);
      triggerToast("Conexão perdida. Central operando em modo offline.", "info");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    startFirebaseListeners();
    const unsubscribe = store.subscribe(() => {
      setDataState(store.getData());
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const updateSingleField = async (moduleId: string, docId: string, fields: any) => {
    // Local memory state helper update
    const updateLocalMem = () => {
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
    };

    if (isLocalFallbackMode) {
      updateLocalMem();
      return;
    }
    
    try {
      // SetDoc directly - Firestore persistent cache will store and queue it natively if offline!
      await setDoc(doc(db, moduleId, String(docId)), fields, { merge: true });
      updateLocalMem();

      if (!navigator.onLine) {
        triggerToast("Atualização gravada em cache offline. Sincronização pendente.", "info");
      }
    } catch (error) {
      console.warn("Firestore setDoc failed, writing to fallback state:", error);
      updateLocalMem();
      triggerToast("Dados salvos no cache operacional local.", "info");
    }
  };

  const deleteSingleDocument = async (moduleId: string, docId: string) => {
    const removeLocalMem = () => {
      const list = memData[moduleId as keyof AppData] || [];
      const updated = list.filter((item: any) => item.id !== docId);
      memData = { ...memData, [moduleId]: updated };
      persistOfflineCache();
      persistLocalState();
      notify();
    };

    if (isLocalFallbackMode) {
      removeLocalMem();
      return;
    }
    
    try {
      // Firestore persistent delete queueing
      await deleteDoc(doc(db, moduleId, String(docId)));
      removeLocalMem();

      if (!navigator.onLine) {
        triggerToast("Remoção salva em cache offline. Sincronização pendente.", "info");
      }
    } catch (error) {
      console.warn("Firestore deleteDoc failed, fallback local write:", error);
      removeLocalMem();
      triggerToast("Removido do cache operacional local.", "info");
    }
  };

  const addSingleDocument = async (moduleId: string, docData: any) => {
    const id = docData.id ? String(docData.id) : `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const { id: _, ...itemData } = docData;

    const addLocalMem = () => {
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
    };

    if (isLocalFallbackMode) {
      addLocalMem();
      return id;
    }
    
    try {
      // Firestore setDoc for add - queues automatically if offline
      await setDoc(doc(db, moduleId, id), itemData, { merge: true });
      addLocalMem();

      if (!navigator.onLine) {
        triggerToast("Novo registro salvo em cache offline. Sincronização pendente.", "info");
      }
      return id;
    } catch (error) {
      console.warn("Firestore setDoc for add failed, using fallback:", error);
      addLocalMem();
      triggerToast("Criado no cache operacional local.", "info");
      return id;
    }
  };

  const updateModuleData = async (moduleId: keyof AppData, newModuleData: any[]) => {
    const applyBulkLocalMem = () => {
      memData = { ...memData, [moduleId]: newModuleData };
      persistOfflineCache();
      persistLocalState();
      notify();
    };

    if (isLocalFallbackMode) {
      applyBulkLocalMem();
      return;
    }
    
    const currentList = memData[moduleId] || [];
    const newIds = new Set(newModuleData.map(i => i.id));
    
    try {
      // Propagate additions/edits/deletions via Firestore cache so native queue catches them
      for (const item of currentList) {
        if (!newIds.has(item.id)) {
          await deleteDoc(doc(db, moduleId, item.id));
        }
      }
      
      for (const item of newModuleData) {
        const { id, ...itemData } = item;
        await setDoc(doc(db, moduleId, String(id)), itemData, { merge: true });
      }

      applyBulkLocalMem();

      if (!navigator.onLine) {
        triggerToast("Alterações salvas offline. Sincronização pendente.", "info");
      }
    } catch (error) {
      console.warn("Bulk update failed, saving offline local copy:", error);
      applyBulkLocalMem();
    }
  };

  return { 
    data, 
    isLocalFallbackMode,
    isOnline,
    updateModuleData,
    updateSingleField,
    addSingleDocument,
    deleteSingleDocument
  };
};
