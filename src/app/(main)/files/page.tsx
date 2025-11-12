"use client"

import { Clock, Download, FileCheck2, FileClock, FileText, FileX2, Hourglass, ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUploadsForUser, users } from "@/lib/data";
import type { UploadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const statusConfig: Record<UploadStatus, { label: string; icon: React.ElementType; color: string; textColor: string }> = {
  PENDIENTE: { label: "Pendiente", icon: Hourglass, color: "bg-yellow-100 dark:bg-yellow-900", textColor: "text-yellow-700 dark:text-yellow-300"},
  'EN REVISION': { label: "En Revisión", icon: FileClock, color: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-700 dark:text-blue-300"},
  CORRECCIONES: { label: "Correcciones", icon: FileX2, color: "bg-orange-100 dark:bg-orange-900", textColor: "text-orange-700 dark:text-orange-300"},
  APROBADO: { label: "Aprobado", icon: FileCheck2, color: "bg-green-100 dark:bg-green-900", textColor: "text-green-700 dark:text-green-300"},
  RECHAZADO: { label: "Rechazado", icon: FileX2, color: "bg-red-100 dark:bg-red-900", textColor: "text-red-700 dark:text-red-300"},
};

const StatusBadge = ({ status }: { status: UploadStatus }) => {
  const { label, icon: Icon, color, textColor } = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 border-0 font-normal", color, textColor)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  );
};


export default function UserFilesPage() {
  // In a real app, this would come from the user's session
  const currentUser = users.find(u => u.rol === 'user' && u.id === 2);
  if (!currentUser) return null;

  const userUploads = getUploadsForUser(currentUser.id);

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
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filtrar
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                Aprobado
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Pendiente</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Rechazado</DropdownMenuCheckboxItem>
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
              {userUploads.map((upload) => (
                <TableRow key={upload.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-semibold">{upload.original_name}</span>
                        <div className="sm:hidden text-xs text-muted-foreground">{upload.uso} - <StatusBadge status={upload.estado} /></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell capitalize">{upload.uso}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusBadge status={upload.estado} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{upload.fecha_subida}</TableCell>
                  <TableCell className="text-right">
                    {upload.estado === 'APROBADO' && upload.acta_pdf_path && (
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar Acta
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Pagination className="mt-6">
        <PaginationContent>
            <PaginationItem>
                <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
                <PaginationLink href="#" isActive>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
                <PaginationNext href="#" />
            </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}