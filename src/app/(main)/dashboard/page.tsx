"use client";

import * as React from "react";
import { DashboardAdmin } from "@/components/dashboard-admin";
import { DashboardUser } from "@/components/dashboard-user";
import { PageHeader } from "@/components/page-header";
import { useCurrentUser } from "@/context/UserContext";

export default function DashboardPage() {
  // Consume the user data from the context
  const currentUser = useCurrentUser();

  // If for some reason currentUser is not available, show a loading/error state.
  if (!currentUser) {
    return (
      <div className="container mx-auto px-0">
         <PageHeader
          title="Dashboard"
          description="Cargando información del usuario..."
        />
        <div>Cargando dashboard...</div>
      </div>
    );
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
