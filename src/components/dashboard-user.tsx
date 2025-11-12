"use client"

import { Clock, Download, FileCheck2, FileClock, FileText, FileX2, Hourglass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUploadsForUser, users } from "@/lib/data";
import type { Upload, UploadStatus } from "@/lib/types";
import { FileUploadDialog } from "@/components/file-upload-dialog";
import { cn } from "@/lib/utils";

const statusConfig: Record<UploadStatus, { label: string; icon: React.ElementType; color: string }> = {
  PENDIENTE: { label: "Pendiente", icon: Hourglass, color: "bg-yellow-500" },
  'EN REVISION': { label: "En Revisión", icon: FileClock, color: "bg-blue-500" },
  CORRECCIONES: { label: "Correcciones", icon: FileX2, color: "bg-orange-500" },
  APROBADO: { label: "Aprobado", icon: FileCheck2, color: "bg-green-500" },
  RECHAZADO: { label: "Rechazado", icon: FileX2, color: "bg-red-500" },
};

const StatusBadge = ({ status }: { status: UploadStatus }) => {
  const { label, icon: Icon, color } = statusConfig[status];
  return (
    <Badge variant="outline" className="flex items-center gap-2 pl-2 text-sm">
      <span className={cn("h-2 w-2 rounded-full", color)}></span>
      {label}
    </Badge>
  );
};


export function DashboardUser() {
  // In a real app, this would come from the user's session
  const currentUser = users.find(u => u.rol === 'user' && u.id === 2);
  if (!currentUser) return null;

  const userUploads = getUploadsForUser(currentUser.id).slice(0, 5);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Bienvenido, {currentUser.nombres}</CardTitle>
          <CardDescription>¿Listo para empezar? Sube tu primer archivo para que sea revisado.</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadDialog />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial Reciente</CardTitle>
          <CardDescription>Tus 5 envíos más recientes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Archivo</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userUploads.map((upload) => (
                <TableRow key={upload.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span>{upload.original_name}</span>
                        <span className="text-xs text-muted-foreground md:hidden">{upload.fecha_subida}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{upload.fecha_subida}</TableCell>
                  <TableCell>
                    <StatusBadge status={upload.estado} />
                  </TableCell>
                  <TableCell className="text-right">
                    {upload.estado === 'APROBADO' && upload.acta_pdf_path && (
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Acta
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
