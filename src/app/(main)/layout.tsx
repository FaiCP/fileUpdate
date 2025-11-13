"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/sidebar-nav";
import { UserNav } from "@/components/user-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { doc } from "firebase/firestore";
import { useDoc } from "@/firebase/firestore/use-doc";
import type { User } from "@/lib/types";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: currentUser, isLoading: isUserDocLoading } = useDoc<User>(userDocRef);

  if (isUserLoading || isUserDocLoading) {
    // You can render a loading skeleton here
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    // This can happen if the user is authenticated but their document doesn't exist in Firestore yet.
    // Or if the user is not authenticated. Redirecting to login might be appropriate.
    // For now, let's just show a message. In a real app, you'd redirect.
     if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }


  return (
    <SidebarProvider>
      <SidebarNav user={currentUser} />
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
            <SidebarTrigger />
            {/* Potentially breadcrumbs or page title here */}
            <div className="flex items-center gap-4">
               <UserNav user={currentUser} />
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
