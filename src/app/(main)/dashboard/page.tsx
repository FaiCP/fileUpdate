"use client";

import * as React from "react";
import { DashboardAdmin } from "@/components/dashboard-admin";
import { DashboardUser } from "@/components/dashboard-user";
import { PageHeader } from "@/components/page-header";
import { useUser, useFirestore } from "@/firebase";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";
import type { User } from "@/lib/types";

export default function DashboardPage() {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = React.useMemo(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: currentUser, isLoading: isUserDocLoading } = useDoc<User>(userDocRef);

  const isLoading = isAuthLoading || isUserDocLoading;

  if (isLoading) {
    return <div>Cargando dashboard...</div>;
  }

  if (!currentUser) {
    // This can happen if the user is authenticated but their document doesn't exist in Firestore yet.
    // Or if the user is not authenticated. Redirecting to login might be appropriate.
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }
  
  const isAdmin = currentUser.rol === 'admin';

  return (
    <div className="container mx-auto px-0">
      <PageHeader
        title="Dashboard"
        description={isAdmin ? "Vista general para administradores." : "Resumen de tu actividad."}
      />

      {isAdmin ? <DashboardAdmin /> : <DashboardUser currentUser={currentUser} />}
    </div>
  );
}
