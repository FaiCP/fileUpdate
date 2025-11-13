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
    // If Firebase auth is still loading, we are in a loading state.
    if (isAuthLoading) {
      setLayoutState('loading');
      return;
    }

    // If Firebase auth is done loading and there's no authenticated user,
    // it's an unauthenticated state, so we should redirect.
    if (!authUser) {
      setLayoutState('unauthenticated');
      router.replace('/');
      return;
    }

    // If we have an authenticated user but haven't fetched their Firestore profile yet.
    if (authUser && !currentUser) {
      const fetchUserDocument = async () => {
        const userDocRef = doc(firestore, 'users', authUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setCurrentUser(userDocSnap.data() as User);
          setLayoutState('authenticated');
        } else {
          // The user is authenticated, but their profile doesn't exist in Firestore.
          // This is an error state, redirect to login to be safe.
          console.error("Error: User document not found for authenticated user.");
          setLayoutState('unauthenticated');
          router.replace('/');
        }
      };

      fetchUserDocument();
    }
  }, [isAuthLoading, authUser, currentUser, firestore, router]);


  // Render based on the layout state
  if (layoutState === 'loading' || layoutState === 'unauthenticated' || !currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div>Cargando datos de usuario...</div>
      </div>
    );
  }

  // If we are authenticated and have the user data, render the full layout.
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
