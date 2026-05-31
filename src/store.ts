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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
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

const collections = ['pessoas', 'turmas', 'materiais', 'tarefas_suporte', 'pagamentos', 'perfis'] as const;

let memData: AppData = {
  pessoas: [],
  turmas: [],
  materiais: [],
  tarefas_suporte: [],
  pagamentos: [],
  perfis: []
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

let isListening = false;
export const startFirebaseListeners = () => {
  if (isListening) return;
  isListening = true;
  
  collections.forEach(col => {
    onSnapshot(collection(db, col), (snapshot) => {
      const dbData: any = [];
      snapshot.forEach(d => dbData.push({ id: d.id, ...d.data() }));
      memData = { ...memData, [col]: dbData };
      notify();
    }, (error) => {
      console.error(`Erro ao sincronizar '${col}':`, error);
      handleFirestoreError(error, OperationType.GET, col);
    });
  });
};

export const syncNow = async () => {
  const promises = collections.map(async (col) => {
    try {
      const querySnapshot = await getDocs(collection(db, col));
      const dbData: any = [];
      querySnapshot.forEach(d => dbData.push({ id: d.id, ...d.data() }));
      memData = { ...memData, [col]: dbData };
    } catch (error) {
      console.error(`Erro ao recarregar '${col}':`, error);
      handleFirestoreError(error, OperationType.GET, col);
    }
  });
  await Promise.all(promises);
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

  const updateModuleData = async (moduleId: keyof AppData, newModuleData: any[]) => {
    const currentList = memData[moduleId];
    const newIds = new Set(newModuleData.map(i => i.id));
    
    // Delete items removed from the new array
    for (const item of currentList) {
      if (!newIds.has(item.id)) {
        try {
          await deleteDoc(doc(db, moduleId, item.id));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `${moduleId}/${item.id}`);
        }
      }
    }
    
    // Add or update items
    for (const item of newModuleData) {
      const { id, ...itemData } = item;
      try {
        await setDoc(doc(db, moduleId, String(id)), itemData, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `${moduleId}/${id}`);
      }
    }
  };

  return { data, updateModuleData };
};
