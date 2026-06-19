import { db, auth } from './firebase';
import { addDoc, collection } from 'firebase/firestore';

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

export const logAuditEvent = async (action: string, pessoaId: string, details: any = {}) => {
  const pathForWrite = 'historico';
  try {
    await addDoc(collection(db, pathForWrite), {
      action,
      pessoaId,
      details,
      userId: auth.currentUser?.uid || (typeof localStorage !== 'undefined' ? localStorage.getItem('ilg_selected_profile') : null) || 'anonymous',
      userEmail: auth.currentUser?.email || (typeof localStorage !== 'undefined' ? localStorage.getItem('ilg_authenticated_email') : null) || 'anonymous',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes('permission')) {
      handleFirestoreError(error, OperationType.WRITE, pathForWrite);
    } else {
      console.error('Failed to log audit event', error);
    }
  }
};
