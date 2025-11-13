"use client";

import React from "react";
import { useUser, useFirestore } from "@/firebase";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { UserNav } from "@/components/user-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { doc } from "firebase/firestore";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useMemoFirebase } from "@/firebase/provider";
import type { User } from "@/lib/types";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: currentUser, isLoading: isUserDocLoading } = useDoc<User>(userDocRef);

  // The final loading state depends on both auth and Firestore doc loading.
  const isLoading = isAuthLoading || (authUser && isUserDocLoading);

  // While loading, show a full-page loading indicator.
  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div>Cargando datos de usuario...</div>
        </div>
    );
  }
  
  // After loading, if there's no authenticated user or no corresponding Firestore document, redirect.
  if (!authUser || !currentUser) {
     if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    // Return null to prevent rendering children during the redirect.
    return null;
  }

  // If loading is complete and we have a user, render the layout.
  return (
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
            {/* Clone the child element and pass the currentUser prop */}
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                // @ts-ignore
                return React.cloneElement(child, { currentUser });
              }
              return child;
            })}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
