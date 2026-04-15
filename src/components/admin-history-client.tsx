"use client";

import { useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Download, Printer, X } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import type { Upload as UploadType, User as UserType } from "@/lib/types";
import { getUserById } from "@/lib/data";
import { cn } from "@/lib/utils";

type AdminHistoryClientPageProps = {
  initialUploads: UploadType[];
  initialUsers: UserType[];
};

export function AdminHistoryClientPage({ initialUploads, initialUsers }: AdminHistoryClientPageProps) {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo,   setDateTo]   = useState<Date | undefined>(undefined);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `historial-aprobados-${format(new Date(), "yyyy-MM-dd")}`,
  });

  // ── Uploads aprobados filtrados por rango de fecha ────────────────────────
  const approvedFiltered = useMemo(() => {
    return initialUploads.filter(u => {
      if (u.status !== "APROBADO") return false;
      const d = new Date(u.uploadDate);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (d > end) return false;
      }
      return true;
    });
  }, [initialUploads, dateFrom, dateTo]);

  // ── Todos los uploads con datos de usuario, orden desc por fecha ─────────
  const allWithUsers = useMemo(() => {
    return [...initialUploads]
      .sort((a, b) => b.uploadDate.localeCompare(a.uploadDate))
      .map(u => ({ ...u, user: getUserById(u.userId, initialUsers) }));
  }, [initialUploads, initialUsers]);

  // ── CSV download ──────────────────────────────────────────────────────────
  const handleDownloadCSV = () => {
    const headers = [
      "ID", "Usuario", "Departamento", "Nombre Archivo",
      "Tipo", "Uso", "Fecha Subida", "Fecha Aprobación", "Estantería", "Caja",
    ];
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = approvedFiltered.map(u => {
      const user = getUserById(u.userId, initialUsers);
      return [
        u.id,
        user ? `${user.nombres} ${user.apellidos}` : "Desconocido",
        user?.department ?? "",
        u.originalName,
        u.fileType,
        u.usage,
        u.uploadDate,
        u.reviewedAt ?? "",
        u.shelf ?? "",
        u.box ?? "",
      ].map(v => escape(String(v))).join(",");
    });
    const csv = "\ufeff" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial-aprobados-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearDates = () => { setDateFrom(undefined); setDateTo(undefined); };
  const hasFilter = dateFrom || dateTo;

  return (
    <div className="container mx-auto px-0 space-y-6">
      <PageHeader
        title="Historial Global"
        description="Registro completo de actividad y exportación de archivos aprobados para auditoría."
      />

      {/* ── Sección de exportación para auditoría ── */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Historial de Aprobados</CardTitle>
          <CardDescription>
            Filtra por rango de fechas y descarga el registro de archivos aprobados para auditoría.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtros de fecha */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Desde */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-9 gap-2", dateFrom && "border-primary text-primary")}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Desde"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  disabled={(d) => dateTo ? d > dateTo : false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <span className="text-muted-foreground text-sm">—</span>

            {/* Hasta */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("h-9 gap-2", dateTo && "border-primary text-primary")}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {dateTo ? format(dateTo, "dd/MM/yyyy") : "Hasta"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  disabled={(d) => dateFrom ? d < dateFrom : false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {hasFilter && (
              <Button variant="ghost" size="sm" onClick={clearDates} className="h-9 text-muted-foreground">
                <X className="h-4 w-4 mr-1" /> Limpiar
              </Button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {approvedFiltered.length} registro{approvedFiltered.length !== 1 ? "s" : ""}
              </Badge>
              <Button size="sm" variant="outline" onClick={handleDownloadCSV} disabled={approvedFiltered.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Descargar CSV
              </Button>
              <Button size="sm" onClick={handlePrint} disabled={approvedFiltered.length === 0}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir PDF
              </Button>
            </div>
          </div>

          {/* Tabla previa de aprobados filtrados */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Archivo</TableHead>
                <TableHead className="hidden sm:table-cell">Usuario</TableHead>
                <TableHead className="hidden md:table-cell">Departamento</TableHead>
                <TableHead className="hidden sm:table-cell">Fecha Subida</TableHead>
                <TableHead className="hidden lg:table-cell">Fecha Aprobación</TableHead>
                <TableHead className="hidden md:table-cell">Estantería</TableHead>
                <TableHead className="hidden md:table-cell">Caja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedFiltered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    {hasFilter
                      ? "No hay archivos aprobados en ese rango de fechas."
                      : "No hay archivos aprobados en el sistema."}
                  </TableCell>
                </TableRow>
              )}
              {approvedFiltered.map(u => {
                const user = getUserById(u.userId, initialUsers);
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.originalName}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {user ? `${user.nombres} ${user.apellidos}` : "Desconocido"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user?.department ?? "—"}</TableCell>
                    <TableCell className="hidden sm:table-cell">{u.uploadDate}</TableCell>
                    <TableCell className="hidden lg:table-cell">{u.reviewedAt ?? "—"}</TableCell>
                    <TableCell className="hidden md:table-cell">{u.shelf || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell">{u.box || "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Registro completo de actividad ── */}
      <Card>
        <CardHeader>
          <CardTitle>Registro Completo de Actividad</CardTitle>
          <CardDescription>
            Todos los archivos procesados en el sistema, ordenados del más reciente al más antiguo.
          </CardDescription>
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
              {allWithUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No hay actividad registrada.
                  </TableCell>
                </TableRow>
              )}
              {allWithUsers.map(upload => (
                <TableRow key={upload.id}>
                  <TableCell className="font-medium">{upload.originalName}</TableCell>
                  <TableCell>
                    {upload.user ? `${upload.user.nombres} ${upload.user.apellidos}` : "Usuario Desconocido"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{upload.user?.department}</TableCell>
                  <TableCell className="hidden sm:table-cell">{upload.status}</TableCell>
                  <TableCell className="hidden lg:table-cell text-right">
                    {new Date(upload.uploadDate).toLocaleDateString("es-EC")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── Contenido de impresión (oculto en pantalla) ── */}
      <div className="hidden">
        <div ref={printRef} style={{ padding: "20px", fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
          <style>{`@page { size: A4 landscape; margin: 12mm; }`}</style>

          {/* Header de impresión */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "3px solid #003087", paddingBottom: "10px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "#FDB913", borderRadius: "6px", padding: "5px 10px" }}>
                <span style={{ fontWeight: 900, fontSize: "18px", color: "#003087" }}>CNE</span>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "12px", color: "#003087" }}>CONSEJO NACIONAL ELECTORAL</div>
                <div style={{ fontSize: "9px", color: "#555" }}>República del Ecuador</div>
              </div>
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: "13px", color: "#003087", textTransform: "uppercase" }}>
                HISTORIAL DE ARCHIVOS APROBADOS — AUDITORÍA
              </div>
              <div style={{ fontSize: "9px", color: "#555", marginTop: "2px" }}>
                {dateFrom || dateTo
                  ? `Período: ${dateFrom ? format(dateFrom, "dd/MM/yyyy") : "inicio"} — ${dateTo ? format(dateTo, "dd/MM/yyyy") : "hoy"}`
                  : "Todos los períodos"}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "10px" }}>
              <div><strong>Generado:</strong> {format(new Date(), "dd/MM/yyyy HH:mm")}</div>
              <div><strong>Total:</strong> {approvedFiltered.length} registros</div>
            </div>
          </div>

          {/* Tabla de impresión */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px" }}>
            <thead>
              <tr style={{ background: "#003087", color: "white" }}>
                {["ID", "Nombre Archivo", "Usuario", "Departamento", "Tipo", "Uso", "Fecha Subida", "Fecha Aprobación", "Estantería", "Caja"].map(h => (
                  <th key={h} style={{ border: "1px solid #ccc", padding: "5px 6px", fontWeight: 600, textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approvedFiltered.map((u, i) => {
                const user = getUserById(u.userId, initialUsers);
                return (
                  <tr key={u.id} style={{ background: i % 2 === 0 ? "#fff" : "#f4f6fb" }}>
                    <td style={{ border: "1px solid #ddd", padding: "4px 6px" }}>{u.id.substring(0, 8)}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px 6px", fontWeight: 600 }}>{u.originalName}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px 6px" }}>{user ? `${user.nombres} ${user.apellidos}` : "—"}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px 6px" }}>{user?.department ?? "—"}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px 6px" }}>{u.fileType}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px 6px" }}>{u.usage}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px 6px" }}>{u.uploadDate}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px 6px" }}>{u.reviewedAt ?? "—"}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px 6px", textAlign: "center" }}>{u.shelf || "—"}</td>
                    <td style={{ border: "1px solid #ddd", padding: "4px 6px", textAlign: "center" }}>{u.box || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ marginTop: "20px", fontSize: "8px", color: "#888", textAlign: "center", borderTop: "1px solid #ddd", paddingTop: "6px" }}>
            Sistema de Gestión de Archivos — CNE Ecuador · Documento generado el {format(new Date(), "dd/MM/yyyy HH:mm")}
          </div>
        </div>
      </div>
    </div>
  );
}
