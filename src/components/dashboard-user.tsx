"use client"

import { useState, useMemo } from "react";
import Link from "next/link";
import { Download, FileCheck2, FileClock, FileText, FileX2, Hourglass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Upload, UploadStatus, User } from "@/lib/types";
import { FileUploadDialog } from "@/components/file-upload-dialog";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";

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
  const firestore = useFirestore();
  const dummyPdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  // REMOVED ORDERBY to prevent missing index errors. Sorting is now done on the client.
  const recentUploadsQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser?.id) return null;
    return query(
      collection(firestore, 'users', currentUser.id, 'uploads'),
      limit(5)
    );
  }, [firestore, currentUser.id]);

  const { data: uploadsData, isLoading } = useCollection<Upload>(recentUploadsQuery);

  const recentUploads = useMemo(() => {
      if (!uploadsData) return [];
      // Sort on the client side
      return [...uploadsData].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }, [uploadsData]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Bienvenido, {currentUser.nombres}</CardTitle>
          <CardDescription>¿Listo para empezar? Sube tus archivos para que sean revisados.</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadDialog currentUser={currentUser} />
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
              {isLoading && <TableRow><TableCell colSpan={4} className="text-center">Cargando historial...</TableCell></TableRow>}
              {!isLoading && (!recentUploads || recentUploads.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                    Aún no has subido ningún archivo.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && recentUploads && recentUploads.map((upload) => (
                <TableRow key={upload.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span>{upload.originalName}</span>
                        <span className="text-xs text-muted-foreground md:hidden">{upload.uploadDate}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{upload.uploadDate}</TableCell>
                  <TableCell>
                    <StatusBadge status={upload.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {upload.status === 'APROBADO' && upload.acceptanceActPath && (
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
