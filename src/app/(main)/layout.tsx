"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from "@/firebase";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { UserNav } from "@/components/user-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { doc, getDoc } from "firebase/firestore";
import type { User } from "@/lib/types";
import { UserContext } from "@/context/UserContext";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [layoutState, setLayoutState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    if (isAuthLoading) {
      setLayoutState('loading');
      return;
    }

    if (!authUser) {
      setLayoutState('unauthenticated');
      router.replace('/');
      return;
    }

    // Auth user exists, try to fetch Firestore profile if not already fetched
    if (authUser && !currentUser) {
      const fetchUserDocument = async () => {
        const userDocRef = doc(firestore, 'users', authUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as User;
            setCurrentUser(userData);
            setLayoutState('authenticated');
          } else {
            console.error("CRITICAL: User document not found in Firestore for authenticated user:", authUser.uid);
            setLayoutState('unauthenticated');
            // Optionally, sign out the user here if their DB record is missing
            router.replace('/');
          }
        } catch (error) {
           console.error("CRITICAL: Error fetching user document from Firestore:", error);
           setLayoutState('unauthenticated');
           router.replace('/');
        }
      };

      fetchUserDocument();
    } else if (authUser && currentUser) {
        // This case handles if the effect runs again when everything is already loaded
        setLayoutState('authenticated');
    }
  }, [isAuthLoading, authUser, currentUser, firestore, router]);


  // Render based on the layout state
  if (layoutState === 'loading' || !currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div>Cargando datos de usuario...</div>
      </div>
    );
  }
  
  if (layoutState === 'unauthenticated') {
    // This state is brief as the effect should redirect.
    // Showing a loading indicator is better than a flash of a broken page.
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <div>Redirigiendo a la página de inicio de sesión...</div>
      </div>
    );
  }

  // If we are authenticated and have the user data, render the full layout.
  return (
    <UserContext.Provider value={currentUser}>
      <SidebarProvider>
        <SidebarNav user={currentUser} />
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
              <SidebarTrigger />
              <div className="flex items-center gap-4">
                <UserNav user={currentUser} />
              </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </UserContext.Provider>
  );
}
