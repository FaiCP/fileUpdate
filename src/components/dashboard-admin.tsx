
"use client";

import { useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup, query, orderBy, limit } from "firebase/firestore";
import type { Upload, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, FileCheck2, FileX2, Users, FileText } from "lucide-react";
import { statusConfig } from "@/lib/status-config";
import { cn } from "@/lib/utils";

const StatusBadge = ({ status }: { status: Upload['status'] }) => {
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


export function DashboardAdmin() {
  const firestore = useFirestore();

  // Queries
  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const uploadsQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'uploads') : null, [firestore]);
  const recentUploadsQuery = useMemoFirebase(() => firestore ? query(collectionGroup(firestore, 'uploads'), orderBy('uploadDate', 'desc'), limit(5)) : null, [firestore]);

  // Data fetching
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: allUploads, isLoading: uploadsLoading } = useCollection<Upload>(uploadsQuery);
  const { data: recentUploads, isLoading: recentUploadsLoading } = useCollection<Upload>(recentUploadsQuery);

  // Memoized calculations for metrics
  const metrics = useMemo(() => {
    const totalUploads = allUploads?.length ?? 0;
    const approvedUploads = allUploads?.filter(u => u.status === 'APROBADO').length ?? 0;
    const needsCorrection = allUploads?.filter(u => u.status === 'CORRECCIONES').length ?? 0;
    const activeUsers = users?.filter(u => u.isActive).length ?? 0;
    return { totalUploads, approvedUploads, needsCorrection, activeUsers };
  }, [allUploads, users]);

  // Memoized enrichment of recent uploads with user data
  const recentUploadsWithUsers = useMemo(() => {
    if (!recentUploads || !users) return [];
    return recentUploads.map(upload => {
      const user = users.find(u => u.id === upload.userId);
      return { ...upload, user };
    });
  }, [recentUploads, users]);
  
  const isLoading = usersLoading || uploadsLoading || recentUploadsLoading;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivos Subidos</CardTitle>
            <UploadCloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadsLoading ? '...' : metrics.totalUploads}</div>
            <p className="text-xs text-muted-foreground">Total de archivos en el sistema</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivos Aprobados</CardTitle>
            <FileCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadsLoading ? '...' : metrics.approvedUploads}</div>
            <p className="text-xs text-muted-foreground">Actas generadas y finalizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requieren Corrección</CardTitle>
            <FileX2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadsLoading ? '...' : metrics.needsCorrection}</div>
            <p className="text-xs text-muted-foreground">Archivos devueltos a usuarios</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersLoading ? '...' : metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Total de usuarios en la plataforma</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Los 5 archivos subidos más recientemente por cualquier usuario.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Archivo</TableHead>
                <TableHead className="hidden sm:table-cell">Usuario</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={4} className="text-center">Cargando actividad...</TableCell></TableRow>}
              {!isLoading && recentUploadsWithUsers.length === 0 && (
                 <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                    No hay actividad reciente.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && recentUploadsWithUsers.map((upload) => (
                <TableRow key={upload.id}>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="flex flex-col">
                            <span className="font-medium">{upload.originalName}</span>
                            <span className="text-xs text-muted-foreground sm:hidden">
                                {upload.user ? `${upload.user.firstName} ${upload.user.lastName}` : 'Usuario desconocido'}
                            </span>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {upload.user ? `${upload.user.firstName} ${upload.user.lastName}` : 'Usuario desconocido'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{upload.uploadDate}</TableCell>
                  <TableCell>
                    <StatusBadge status={upload.status} />
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
