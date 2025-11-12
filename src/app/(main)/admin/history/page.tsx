import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminHistoryPage() {
  return (
    <div className="container mx-auto px-0">
      <PageHeader
        title="Historial Global"
        description="Registro de todos los archivos procesados en el sistema."
      />
      <Card>
        <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                <CardTitle className="text-2xl">Página en Construcción</CardTitle>
                <CardDescription className="mt-2">El historial global y las opciones de exportación estarán disponibles aquí.</CardDescription>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}