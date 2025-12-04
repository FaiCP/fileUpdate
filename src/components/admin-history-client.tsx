
"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts";
import { Upload, FileText, Users } from "lucide-react";
import { useMemo } from "react";
import type { Upload as UploadType, User as UserType } from "@/lib/types";
import { getUserById } from "@/lib/data";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

type AdminHistoryClientPageProps = {
    initialUploads: UploadType[];
    initialUsers: UserType[];
}

export function AdminHistoryClientPage({ initialUploads, initialUsers }: AdminHistoryClientPageProps) {

    const users = initialUsers;
    const uploads = initialUploads;

    const totalUploads = uploads?.length || 0;
    const totalUsers = users?.length || 0;

    const uploadsByDepartment = useMemo(() => {
        if (!users || !uploads) return [];
        const counts: { [key: string]: number } = {};
        uploads.forEach(upload => {
            const user = getUserById(upload.userId, users);
            if (user && user.department) {
                counts[user.department] = (counts[user.department] || 0) + 1;
            }
        });
        return Object.entries(counts).map(([name, total]) => ({ name, total }));
    }, [users, uploads]);

    const uploadsByType = useMemo(() => {
        if (!uploads) return [];
        const counts: { [key: string]: number } = {};
        uploads.forEach(upload => {
            counts[upload.fileType] = (counts[upload.fileType] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value, fill: COLORS[Math.floor(Math.random() * COLORS.length)] }));
    }, [uploads]);

    const uploadsWithUsers = useMemo(() => {
        if (!users || !uploads) return [];
        return uploads.map(upload => ({
            ...upload,
            user: getUserById(upload.userId, users)
        }));
        // Data is already sorted by date from the server query
    }, [users, uploads]);


  return (
    <div className="container mx-auto px-0 space-y-6">
      <PageHeader
        title="Historial y Métricas Globales"
        description="Analiza la actividad de carga de archivos en todo el sistema."
      />
      <div className="grid gap-6 md:grid-cols-2">
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Archivos Subidos</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUploads}</div>
            <p className="text-xs text-muted-foreground">Archivos totales en el sistema</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Usuarios registrados en la plataforma</p>
          </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Archivos por Departamento</CardTitle>
                <CardDescription>Volumen de archivos subidos desde cada departamento.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={{}} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={uploadsByDepartment}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="total" fill="hsl(var(--chart-1))" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Distribución por Tipo de Archivo</CardTitle>
                <CardDescription>Formatos de archivo más comunes.</CardDescription>
            </Header>
            <CardContent>
                <ChartContainer config={{}} className="min-h-[200px] w-full">
                    <PieChart>
                         <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                        <Pie data={uploadsByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            {uploadsByType.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
       </div>

        <Card>
            <CardHeader>
                <CardTitle>Registro Completo de Actividad</CardTitle>
                <CardDescription>Todos los archivos procesados en el sistema, ordenados del más reciente al más antiguo.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Archivo</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead className="hidden md:table-cell">Departamento</TableHead>
                        <TableHead className="hidden sm:table-cell">Estado</TableHead>
                        <TableHead className="hidden lg:table-cell text-right">Fecha</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {uploadsWithUsers.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-10">No hay actividad registrada.</TableCell></TableRow>}
                        {uploadsWithUsers.map((upload) => (
                            <TableRow key={upload.id}>
                                <TableCell className="font-medium">{upload.originalName}</TableCell>
                                <TableCell>{upload.user ? `${upload.user.nombres} ${upload.user.apellidos}` : 'Usuario Desconocido'}</TableCell>
                                <TableCell className="hidden md:table-cell">{upload.user?.department}</TableCell>
                                <TableCell className="hidden sm:table-cell">{upload.status}</TableCell>
                                <TableCell className="hidden lg:cell text-right">{new Date(upload.uploadDate).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
      </Card>
    </div>
  );
}
