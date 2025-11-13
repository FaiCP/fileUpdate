"use client";

import * as React from "react";
import { DashboardAdmin } from "@/components/dashboard-admin";
import { DashboardUser } from "@/components/dashboard-user";
import { PageHeader } from "@/components/page-header";
import type { User } from "@/lib/types";

// This component now expects `currentUser` to be passed as a prop from MainLayout.
type DashboardPageProps = {
  currentUser?: User;
};

export default function DashboardPage({ currentUser }: DashboardPageProps) {
  // If for some reason currentUser is not available, show a loading/error state.
  if (!currentUser) {
    return <div>Cargando dashboard...</div>;
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
