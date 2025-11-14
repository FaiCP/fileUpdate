"use client";

import * as React from "react";
import { DashboardAdmin } from "@/components/dashboard-admin";
import { DashboardUser } from "@/components/dashboard-user";
import { PageHeader } from "@/components/page-header";
import type { User } from "@/lib/types";

// This component now receives currentUser as a prop from the layout
export default function DashboardPage({ currentUser }: { currentUser?: User }) {

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

  // Log para verificar el rol del usuario
  console.log("ROL PARA VALIDACIÓN:", currentUser?.role);
  
  const isAdmin = currentUser.role === 'admin';

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
