
"use client";

import { DashboardAdmin } from "@/components/dashboard-admin";
import { DashboardUser } from "@/components/dashboard-user";
import { PageHeader } from "@/components/page-header";
import { useCurrentUser } from "@/context/UserContext";

export default function DashboardPage() {
  const currentUser = useCurrentUser();

  if (!currentUser) {
    return (
      <div className="container mx-auto px-0">
        <PageHeader
          title="Dashboard"
          description="Cargando información del usuario..."
        />
        <div className="flex items-center justify-center py-20">
            <div>Cargando dashboard...</div>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.rol === "admin";

  return (
    <div className="container mx-auto px-0">
      <PageHeader
        title="Dashboard"
        description={isAdmin ? "Vista general para administradores." : "Resumen de tu actividad."}
      />

      {isAdmin 
        ? (
            // DashboardAdmin already fetches its own real-time data
            <DashboardAdmin />
          ) 
        : (
            <DashboardUser 
              currentUser={currentUser} 
            />
          )
      }
    </div>
  );
}
