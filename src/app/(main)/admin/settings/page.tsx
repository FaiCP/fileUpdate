import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="container mx-auto px-0">
      <PageHeader
        title="Administración"
        description="Gestiona administradores, configuraciones del sistema y logs de auditoría."
      />
      <Card>
        <CardContent className="pt-6">
             <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                <CardTitle className="text-2xl">Página en Construcción</CardTitle>
                <CardDescription className="mt-2">La gestión de administradores y los logs de auditoría se mostrarán aquí.</CardDescription>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}