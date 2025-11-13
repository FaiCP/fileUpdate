"use client";

import * as React from "react";
import { DashboardAdmin } from "@/components/dashboard-admin";
import { DashboardUser } from "@/components/dashboard-user";
import { PageHeader } from "@/components/page-header";
import { users } from "@/lib/data"; // In a real app, you'd get this from a session/context

export default function DashboardPage() {
  // In a real app, you would get the current user from a session or context.
  // We'll simulate this by finding a logged-in user.
  const currentUser = users.find(u => u.rol === 'user'); // Simulating user login

  if (!currentUser) {
    // Handle case where user is not found, maybe redirect to login
    return <div>Usuario no encontrado.</div>;
  }
  
  const isAdmin = currentUser.rol === 'admin';

  return (
    <div className="container mx-auto px-0">
      <PageHeader
        title="Dashboard"
        description={isAdmin ? "Vista general para administradores." : "Resumen de tu actividad."}
      />

      {isAdmin ? <DashboardAdmin /> : <DashboardUser />}
    </div>
  );
}
