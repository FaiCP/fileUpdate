'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseApp, auth, firestore } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // The instances are now imported directly from the centralized index file.
  // This ensures they are initialized only once.
  if (!firebaseApp || !auth || !firestore) {
     // This can happen in a brief moment during initial load or if initialization fails.
     // You might want to show a loading indicator here.
    return <>{children}</>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
