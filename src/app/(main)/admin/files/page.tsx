"use client";

import { FileCheck2, FileClock, FileText, FileX2, Hourglass, ListFilter, MoreHorizontal, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { uploads, getUserById } from "@/lib/data";
import type { UploadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { FileReviewDialog } from "@/components/file-review-dialog";

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

export default function AdminFilesPage() {
    const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedUpload, setSelectedUpload] = useState(uploads[0]);

    const handleReviewClick = (upload: typeof uploads[0]) => {
        setSelectedUpload(upload);
        setReviewDialogOpen(true);
    };

  return (
    <div className="container mx-auto px-0">
      <PageHeader
        title="Revisión de Actas"
        description="Gestiona, revisa y aprueba los archivos subidos por los usuarios."
      />
      <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending">Pendientes</TabsTrigger>
              <TabsTrigger value="approved">Aprobados</TabsTrigger>
              <TabsTrigger value="rejected">Rechazados</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative ml-auto flex-1 md:grow-0">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar por nombre o usuario..."
                  className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                />
              </div>
            </div>
          </div>
        <Card className="mt-4">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Archivo</TableHead>
                  <TableHead className="hidden sm:table-cell">Usuario</TableHead>
                  <TableHead className="hidden sm:table-cell">Estado</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha</TableHead>
                  <TableHead>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploads.map((upload) => {
                  const user = getUserById(upload.user_id);
                  return (
                    <TableRow key={upload.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                            <div>
                                <div>{upload.original_name}</div>
                                <div className="text-sm text-muted-foreground sm:hidden">
                                {user?.nombres} {user?.apellidos}
                                </div>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{user?.nombres} {user?.apellidos}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <StatusBadge status={upload.estado} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{upload.fecha_subida}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleReviewClick(upload)}>Revisar Archivo</DropdownMenuItem>
                            <DropdownMenuItem>Aprobar Directamente</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Rechazar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Tabs>
      <FileReviewDialog 
        isOpen={isReviewDialogOpen} 
        setIsOpen={setReviewDialogOpen} 
        upload={selectedUpload}
      />
    </div>
  );
}
