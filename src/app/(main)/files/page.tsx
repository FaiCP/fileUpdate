"use client"

import React, { useState, useMemo } from "react";
import { FileText, ListFilter, FileCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Upload, UploadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { useCurrentUser } from "@/context/UserContext";
import { collection } from "firebase/firestore";
import { statusConfig } from "@/lib/status-config";
import { UserCertificateDialog } from "@/components/user-certificate-dialog";
import { AlertCircle } from "lucide-react";

const ALL_STATUSES: UploadStatus[] = ['PENDIENTE', 'EN REVISION', 'CORRECCIONES', 'APROBADO', 'RECHAZADO'];

const statusLabels: Record<UploadStatus, string> = {
  PENDIENTE: 'Pendiente',
  'EN REVISION': 'En Revisión',
  CORRECCIONES: 'Correcciones',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
};

const StatusBadge = ({ status }: { status: UploadStatus }) => {
  const config = statusConfig[status];
  if (!config) return null;
  const { label, icon: Icon, color, textColor } = config;
  return (
    <Badge variant="outline" className={cn("gap-1.5 border-0 font-normal", color, textColor)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
};

export default function UserFilesPage() {
  const { user: authUser } = useUser();
  const currentUser = useCurrentUser();
  const firestore = useFirestore();

  const [activeStatuses, setActiveStatuses] = useState<UploadStatus[]>([...ALL_STATUSES]);
  const [certificateUpload, setCertificateUpload] = useState<Upload | null>(null);

  const userUploadsQuery = useMemoFirebase(() => {
    if (!firestore || !authUser?.uid) return null;
    return collection(firestore, 'users', authUser.uid, 'uploads');
  }, [authUser, firestore]);

  const { data: userUploads, isLoading } = useCollection<Upload>(userUploadsQuery);

  const filteredUploads = useMemo(() => {
    if (!userUploads) return [];
    return userUploads.filter(u => activeStatuses.includes(u.status));
  }, [userUploads, activeStatuses]);

  const toggleStatus = (status: UploadStatus) => {
    setActiveStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  if (isLoading || !currentUser) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto px-0">
      <PageHeader
        title="Mi Historial de Archivos"
        description="Aquí puedes ver todos los archivos que has subido y su estado."
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <ListFilter className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filtrar</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ALL_STATUSES.map(status => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={activeStatuses.includes(status)}
                onCheckedChange={() => toggleStatus(status)}
              >
                {statusLabels[status]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Archivo</TableHead>
                <TableHead className="hidden sm:table-cell">Uso</TableHead>
                <TableHead className="hidden sm:table-cell">Estado</TableHead>
                <TableHead className="hidden md:table-cell">Fecha de Subida</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5}>Cargando archivos...</TableCell>
                </TableRow>
              )}
              {!isLoading && filteredUploads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    No hay archivos en esta categoría.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredUploads.map((upload) => (
                <React.Fragment key={upload.id}>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-semibold">{upload.originalName}</span>
                          <div className="sm:hidden text-xs text-muted-foreground">
                            {upload.usage} — <StatusBadge status={upload.status} />
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell capitalize">{upload.usage}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <StatusBadge status={upload.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{upload.uploadDate}</TableCell>
                    <TableCell className="text-right">
                      {upload.status === 'APROBADO' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCertificateUpload(upload)}
                        >
                          <FileCheck className="mr-2 h-4 w-4" />
                          Ver Acta
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Observations alert for CORRECCIONES / RECHAZADO */}
                  {(upload.status === 'CORRECCIONES' || upload.status === 'RECHAZADO') && upload.observations && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-2 px-4 bg-destructive/5">
                        <Alert variant="destructive" className="py-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle className="text-sm font-semibold">
                            Observaciones del administrador
                          </AlertTitle>
                          <AlertDescription className="text-sm">
                            {upload.observations}
                          </AlertDescription>
                        </Alert>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {certificateUpload && currentUser && (
        <UserCertificateDialog
          isOpen={!!certificateUpload}
          setIsOpen={(open) => { if (!open) setCertificateUpload(null); }}
          upload={certificateUpload}
          user={currentUser}
        />
      )}
    </div>
  );
}
