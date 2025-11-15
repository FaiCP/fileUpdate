"use client";

import * as React from "react";
import { DashboardAdmin } from "@/components/dashboard-admin";
import { DashboardUser } from "@/components/dashboard-user";
import { PageHeader } from "@/components/page-header";
import { useCurrentUser } from "@/context/UserContext";

// This component now receives currentUser as a prop from the layout
export default function DashboardPage() {
  const currentUser = useCurrentUser();

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
  console.log("ROL PARA VALIDACIÓN:", currentUser?.rol);
  
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
