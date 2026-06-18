import React, { createContext, useEffect, useState } from 'react';
import { auth, loginAnonymously } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { startFirebaseListeners } from '../store';

const FirebaseAuthContext = createContext<User | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Start database listeners immediately since we support unauthenticated/custom PIN login access syncs
    startFirebaseListeners();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  return (
    <FirebaseAuthContext.Provider value={user}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
