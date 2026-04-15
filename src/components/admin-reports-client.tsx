"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Bar, BarChart, CartesianGrid, XAxis, YAxis,
  Pie, PieChart, Cell,
  ComposedChart, Line, Legend,
} from "recharts";
import { CheckCircle2, FileUp, TrendingUp, XCircle } from "lucide-react";
import type { Upload as UploadType, User as UserType } from "@/lib/types";

type AdminReportsClientPageProps = {
  initialUploads: UploadType[];
  initialUsers: UserType[];
};

const STATUS_COLORS: Record<string, string> = {
  PENDIENTE:    "#eab308",
  "EN REVISION": "#3b82f6",
  CORRECCIONES:  "#f97316",
  APROBADO:     "#22c55e",
  RECHAZADO:    "#ef4444",
};

function getLast6Months(): string[] {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - (5 - i));
    return d.toISOString().substring(0, 7); // "YYYY-MM"
  });
}

function shortMonth(yearMonth: string) {
  return format(new Date(yearMonth + "-01"), "MMM", { locale: es });
}

export function AdminReportsClientPage({ initialUploads, initialUsers }: AdminReportsClientPageProps) {
  // ── KPIs ──────────────────────────────────────────────────────────────────
  const approved  = useMemo(() => initialUploads.filter(u => u.status === "APROBADO").length,  [initialUploads]);
  const rejected  = useMemo(() => initialUploads.filter(u => u.status === "RECHAZADO").length, [initialUploads]);
  const processed = approved + rejected;
  const approvalRate = processed > 0 ? Math.round((approved / processed) * 100) : 0;

  // ── Uploads por mes (últimos 6) ───────────────────────────────────────────
  const uploadsByMonth = useMemo(() => {
    const months = getLast6Months();
    const counts: Record<string, number> = Object.fromEntries(months.map(m => [m, 0]));
    initialUploads.forEach(u => {
      const m = u.uploadDate.substring(0, 7);
      if (m in counts) counts[m]++;
    });
    return months.map(m => ({ month: shortMonth(m), total: counts[m] }));
  }, [initialUploads]);

  // ── Distribución por estado ───────────────────────────────────────────────
  const uploadsByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    initialUploads.forEach(u => {
      counts[u.status] = (counts[u.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [initialUploads]);

  // ── Por departamento ──────────────────────────────────────────────────────
  const uploadsByDepartment = useMemo(() => {
    const counts: Record<string, number> = {};
    initialUploads.forEach(u => {
      const user = initialUsers.find(usr => usr.id === u.userId);
      if (user?.department) counts[user.department] = (counts[user.department] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [initialUploads, initialUsers]);

  // ── Por tipo de uso ───────────────────────────────────────────────────────
  const uploadsByUsage = useMemo(() => {
    const labels: Record<string, string> = { acta: "Acta", contrato: "Contrato", memorando: "Memorando", otro: "Otro" };
    const counts: Record<string, number> = {};
    initialUploads.forEach(u => {
      const key = labels[u.usage] ?? u.usage;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, total]) => ({ name, total }));
  }, [initialUploads]);

  // ── Tendencia aprobaciones vs rechazos por mes ────────────────────────────
  const trendByMonth = useMemo(() => {
    const months = getLast6Months();
    const data: Record<string, { aprobados: number; rechazados: number }> =
      Object.fromEntries(months.map(m => [m, { aprobados: 0, rechazados: 0 }]));
    initialUploads.forEach(u => {
      const m = (u.reviewedAt ?? u.uploadDate).substring(0, 7);
      if (m in data) {
        if (u.status === "APROBADO")  data[m].aprobados++;
        if (u.status === "RECHAZADO") data[m].rechazados++;
      }
    });
    return months.map(m => ({ month: shortMonth(m), ...data[m] }));
  }, [initialUploads]);

  // ── Top 5 usuarios más activos ────────────────────────────────────────────
  const topUsers = useMemo(() => {
    const counts: Record<string, number> = {};
    initialUploads.forEach(u => { counts[u.userId] = (counts[u.userId] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([userId, count]) => {
        const user = initialUsers.find(u => u.id === userId);
        return {
          name:       user ? `${user.nombres} ${user.apellidos}` : "Desconocido",
          department: user?.department ?? "—",
          count,
        };
      });
  }, [initialUploads, initialUsers]);

  return (
    <div className="container mx-auto px-0 space-y-6">
      <PageHeader
        title="Reportes y Estadísticas"
        description="Métricas globales del sistema de gestión de archivos CNE Ecuador."
      />

      {/* ── KPI Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Archivos</CardTitle>
            <FileUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{initialUploads.length}</div>
            <p className="text-xs text-muted-foreground">{initialUsers.length} usuarios registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{approved}</div>
            <p className="text-xs text-muted-foreground">
              {processed > 0 ? `${Math.round((approved / processed) * 100)}% del total procesado` : "Sin datos"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{rejected}</div>
            <p className="text-xs text-muted-foreground">
              {processed > 0 ? `${Math.round((rejected / processed) * 100)}% del total procesado` : "Sin datos"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Aprobación</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground">Sobre {processed} archivos procesados</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Fila 1: Por mes + Por estado ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Archivos Subidos por Mes</CardTitle>
            <CardDescription>Volumen de uploads en los últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="min-h-[220px] w-full">
              <BarChart accessibilityLayer data={uploadsByMonth}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={8} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={30} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" name="Archivos" fill="hsl(var(--chart-1))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>Proporción actual de cada estado en el sistema.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={{}} className="min-h-[220px] w-full max-w-xs">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={uploadsByStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                  labelLine={false}
                >
                  {uploadsByStatus.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] ?? "hsl(var(--chart-1))"} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Fila 2: Por departamento + Por tipo de uso ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Archivos por Departamento</CardTitle>
            <CardDescription>Unidades con mayor volumen de documentos subidos.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="min-h-[220px] w-full">
              <BarChart accessibilityLayer data={uploadsByDepartment} layout="vertical">
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={110} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" name="Archivos" fill="hsl(var(--chart-2))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Archivos por Tipo de Uso</CardTitle>
            <CardDescription>Categorías de documento más frecuentes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="min-h-[220px] w-full">
              <BarChart accessibilityLayer data={uploadsByUsage}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} tickMargin={8} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={30} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" name="Archivos" fill="hsl(var(--chart-3))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Fila 3: Tendencia + Top usuarios ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia: Aprobaciones vs Rechazos</CardTitle>
            <CardDescription>Comparativa mensual de decisiones en los últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="min-h-[220px] w-full">
              <ComposedChart data={trendByMonth}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={8} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={30} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="aprobados" name="Aprobados" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="rechazados" name="Rechazados" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Usuarios Más Activos</CardTitle>
            <CardDescription>Funcionarios con mayor cantidad de archivos subidos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Departamento</TableHead>
                  <TableHead className="text-right">Archivos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Sin datos
                    </TableCell>
                  </TableRow>
                )}
                {topUsers.map((u, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-semibold">{u.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{u.department}</TableCell>
                    <TableCell className="text-right font-bold">{u.count}</TableCell>
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
