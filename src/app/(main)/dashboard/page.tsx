import { DashboardAdmin } from "@/components/dashboard-admin";
import { DashboardUser } from "@/components/dashboard-user";
import { PageHeader } from "@/components/page-header";
import { getCurrentUser, getUsers, getUploads } from "@/firebase/firestore/server-actions";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  const users = await getUsers();
  const uploads = await getUploads();

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

  const isAdmin = currentUser.rol === "admin";

  return (
    <div className="container mx-auto px-0">
      <PageHeader
        title="Dashboard"
        description={isAdmin ? "Vista general para administradores." : "Resumen de tu actividad."}
      />

      {isAdmin 
        ? (
            <DashboardAdmin 
              initialUsers={users}
              initialUploads={uploads}
            />
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
