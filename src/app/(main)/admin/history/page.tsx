"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts";
import { uploads, users, getUserById } from "@/lib/data";
import { Upload, FileText, Users } from "lucide-react";
import { useMemo } from "react";
import type { Upload as UploadType, User as UserType } from "@/lib/types";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function AdminHistoryPage() {
    const totalUploads = uploads.length;
    const totalUsers = users.length;

    const uploadsByDepartment = useMemo(() => {
        const counts: { [key: string]: number } = {};
        uploads.forEach(upload => {
            const user = getUserById(upload.user_id);
            if (user) {
                counts[user.departamento] = (counts[user.departamento] || 0) + 1;
            }
        });
        return Object.entries(counts).map(([name, total]) => ({ name, total }));
    }, []);

    const uploadsByType = useMemo(() => {
        const counts: { [key: string]: number } = {};
        uploads.forEach(upload => {
            counts[upload.tipo_archivo] = (counts[upload.tipo_archivo] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value, fill: COLORS[Math.floor(Math.random() * COLORS.length)] }));
    }, []);

    const uploadsWithUsers = useMemo(() => {
        return uploads.map(upload => ({
            ...upload,
            user: getUserById(upload.user_id)
        })).sort((a, b) => new Date(b.fecha_subida).getTime() - new Date(a.fecha_subida).getTime());
    }, []);


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
            </CardHeader>
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
                        {uploadsWithUsers.map((upload) => (
                            <TableRow key={upload.id}>
                                <TableCell className="font-medium">{upload.original_name}</TableCell>
                                <TableCell>{upload.user ? `${upload.user.nombres} ${upload.user.apellidos}` : 'Usuario Desconocido'}</TableCell>
                                <TableCell className="hidden md:table-cell">{upload.user?.departamento}</TableCell>
                                <TableCell className="hidden sm:table-cell">{upload.estado}</TableCell>
                                <TableCell className="hidden lg:table-cell text-right">{upload.fecha_subida}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
      </Card>
    </div>
  );
}
