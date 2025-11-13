"use client"

import { useState } from "react";
import Link from "next/link";
import { Clock, Download, FileCheck2, FileClock, FileText, FileX2, Hourglass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUploadsForUser, uploads as allUploads } from "@/lib/data";
import type { Upload, UploadStatus, User } from "@/lib/types";
import { FileUploadDialog } from "@/components/file-upload-dialog";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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

type DashboardUserProps = {
  currentUser: User;
}

export function DashboardUser({ currentUser }: DashboardUserProps) {
  const [userUploads, setUserUploads] = useState(() => {
    return getUploadsForUser(currentUser.id);
  });

  const dummyPdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
  
  const handleUploadComplete = (newUploadData: Omit<Upload, 'id' | 'user_id' | 'fecha_subida' | 'estado'> & { original_name: string }) => {
    const newUpload: Upload = {
        ...newUploadData,
        id: Math.max(...allUploads.map(u => u.id), 0) + 1,
        user_id: currentUser.id,
        fecha_subida: format(new Date(), 'yyyy-MM-dd HH:mm'),
        estado: 'PENDIENTE'
    };

    // This would be a DB insert in a real app
    allUploads.unshift(newUpload); 
    setUserUploads(prevUploads => [newUpload, ...prevUploads]);
  };

  const recentUploads = userUploads.slice(0, 5);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Bienvenido, {currentUser.nombres}</CardTitle>
          <CardDescription>¿Listo para empezar? Sube tu primer archivo para que sea revisado.</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadDialog onUploadComplete={handleUploadComplete} />
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
              {recentUploads.map((upload) => (
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
                      <Link href={dummyPdfUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Acta
                        </Button>
                      </Link>
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
