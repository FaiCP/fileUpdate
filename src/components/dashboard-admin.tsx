"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getUserById } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { Upload, UploadStatus, User } from "@/lib/types";
import { FileCheck2, FileClock, FileX2, Hourglass, Users as UsersIcon } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, collectionGroup, query, limit, orderBy } from "firebase/firestore";
import { useMemo } from "react";

const statusConfig: Record<UploadStatus, { label: string; icon: React.ElementType; color: string }> = {
  PENDIENTE: { label: "Pendiente", icon: Hourglass, color: "bg-yellow-500" },
  'EN REVISION': { label: "En Revisión", icon: FileClock, color: "bg-blue-500" },
  CORRECCIONES: { label: "Correcciones", icon: FileX2, color: "bg-orange-500" },
  APROBADO: { label: "Aprobado", icon: FileCheck2, color: "bg-green-500" },
  RECHAZADO: { label: "Rechazado", icon: FileX2, color: "bg-red-500" },
};

const StatusBadge = ({ status }: { status: UploadStatus }) => {
  const config = statusConfig[status];
  if (!config) return <Badge>Desconocido</Badge>;
  
  const { label, icon: Icon, color } = config;
  return (
    <Badge variant="outline" className="flex items-center gap-2 pl-2 text-sm whitespace-nowrap">
      <span className={cn("h-2 w-2 rounded-full", color)}></span>
      {label}
    </Badge>
  );
};


// Chart data would ideally come from an aggregation, but we'll simulate it for now.
const chartData = [
  { date: 'Jun 1', uploads: 5 }, { date: 'Jun 2', uploads: 8 }, { date: 'Jun 3', uploads: 3 },
  { date: 'Jun 4', uploads: 10 }, { date: 'Jun 5', uploads: 6 }, { date: 'Jun 6', uploads: 12 },
  { date: 'Jun 7', uploads: 7 },
];

export function DashboardAdmin() {
    const firestore = useFirestore();
    
    const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
    
    const allUploadsQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, 'uploads') : null, [firestore]);
    const { data: allUploads, isLoading: uploadsLoading } = useCollection<Upload>(allUploadsQuery);
    
    const recentUploadsQuery = useMemoFirebase(() => 
        firestore ? query(collectionGroup(firestore, 'uploads'), orderBy('uploadDate', 'desc'), limit(5)) : null,
        [firestore]
    );
    const { data: recentUploadsData, isLoading: recentUploadsLoading } = useCollection<Upload>(recentUploadsQuery);

    const recentUploads = useMemo(() => {
        if (!recentUploadsData || !users) return [];
        return recentUploadsData.map(upload => ({ ...upload, user: getUserById(upload.userId, users) }));
    }, [recentUploadsData, users]);


    const pendingCount = allUploads?.filter(u => u.status === 'PENDIENTE').length ?? 0;
    const approvedCount = allUploads?.filter(u => u.status === 'APROBADO').length ?? 0;
    const activeUsersCount = users?.filter(u => u.isActive).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivos Pendientes</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadsLoading ? '...' : pendingCount}</div>
            <p className="text-xs text-muted-foreground">Esperando revisión</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivos Aprobados</CardTitle>
            <FileCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadsLoading ? '...' : approvedCount}</div>
            <p className="text-xs text-muted-foreground">Actas generadas este mes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersLoading ? '...' : activeUsersCount}</div>
            <p className="text-xs text-muted-foreground">Total de usuarios en el sistema</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Actividad de Carga</CardTitle>
            <CardDescription>Archivos subidos en los últimos 7 días.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  cursor={{ fill: "hsl(var(--muted))" }}
                />
                <Bar dataKey="uploads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimos 5 movimientos en la plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Archivo</TableHead>
                            <TableHead>Usuario</TableHead>
                            <TableHead className="text-right">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(recentUploadsLoading || usersLoading) && <TableRow><TableCell colSpan={3} className="text-center">Cargando...</TableCell></TableRow>}
                      {!recentUploadsLoading && !usersLoading && recentUploads.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-10">No hay actividad reciente.</TableCell></TableRow>}
                      {recentUploads.map(upload => (
                            <TableRow key={upload.id}>
                                <TableCell className="font-medium truncate max-w-[120px]">{upload.originalName}</TableCell>
                                <TableCell>{upload.user ? `${upload.user.firstName} ${upload.user.lastName}` : 'Desconocido'}</TableCell>
                                <TableCell className="text-right">
                                    <StatusBadge status={upload.status} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
