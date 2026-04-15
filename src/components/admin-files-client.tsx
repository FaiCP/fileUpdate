
"use client";

import { FileText, MoreHorizontal, Search } from "lucide-react";
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
import type { Upload, UploadStatus, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { FileReviewDialog } from "@/components/file-review-dialog";
import { useToast } from "@/hooks/use-toast";
import { statusConfig } from "@/lib/status-config";
import { updateUploadStatus } from "@/app/actions/update-upload-status";

type FilterValue = 'all' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'EN REVISION' | 'CORRECCIONES';

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

// We need to enrich the Upload type with the user object for rendering
type UploadWithUser = Upload & { user?: User };

type AdminFilesClientPageProps = {
    initialUploads: Upload[];
    initialUsers: User[];
}

export function AdminFilesClientPage({ initialUploads, initialUsers }: AdminFilesClientPageProps) {
    const { toast } = useToast();
    
    // State to hold and manage uploads and users, starting with server-fetched data.
    // This will allow us to update the UI after an action without a full page reload.
    const [uploads, setUploads] = useState<Upload[]>(initialUploads);
    const [users] = useState<User[]>(initialUsers);

    const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedUpload, setSelectedUpload] = useState<UploadWithUser | undefined>(undefined);
    const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
    
    // Helper to find a user by ID
    const getUserById = (userId: string) => {
      return users.find(u => u.id === userId);
    };
        
    // Enrich uploads with user data
    const uploadsWithUsers = useMemo(() => {
      return uploads.map(upload => ({
        ...upload,
        user: getUserById(upload.userId)
      }));
    }, [uploads, users]);

    const handleReviewClick = (upload: UploadWithUser) => {
        setSelectedUpload(upload);
        setReviewDialogOpen(true);
    };

    const handleUpdateStatus = async (upload: UploadWithUser, status: UploadStatus, observations?: string) => {
        const result = await updateUploadStatus(upload.userId, upload.id, upload.originalName, status, observations);

        if (result.ok) {
            // Update the local state to reflect the change immediately
            setUploads(currentUploads => 
                currentUploads.map(u => 
                    u.id === upload.id ? { ...u, status, observations: observations || u.observations } : u
                )
            );
            toast({
                title: `Archivo ${status.toLowerCase()}`,
                description: `El archivo "${upload.originalName}" ha sido marcado como ${status.toLowerCase()}.`,
            });
            // Cierra el diálogo solo si NO fue aprobado (para que el admin pueda imprimir el acta)
            if(isReviewDialogOpen && status !== 'APROBADO') {
                setReviewDialogOpen(false);
            }
        } else {
            toast({
                variant: "destructive",
                title: "Error en la operación",
                description: result.error,
            });
        }
    };

    const filteredUploads = useMemo(() => {
        if (activeFilter === 'all') return uploadsWithUsers;
        return uploadsWithUsers.filter(upload => upload.status === activeFilter);
    }, [uploadsWithUsers, activeFilter]);

  return (
    <div className="container mx-auto px-0">
      <PageHeader
        title="Revisión de Actas"
        description="Gestiona, revisa y aprueba los archivos subidos por los usuarios."
      />
      <Tabs defaultValue="all" onValueChange={(value) => setActiveFilter(value as FilterValue)}>
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="PENDIENTE">Pendientes</TabsTrigger>
              <TabsTrigger value="APROBADO">Aprobados</TabsTrigger>
              <TabsTrigger value="RECHAZADO">Rechazados</TabsTrigger>
              <TabsTrigger value="CORRECCIONES">Correcciones</TabsTrigger>
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
          <TabsContent value={activeFilter}>
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
                    {filteredUploads.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No hay archivos en esta categoría.</TableCell></TableRow>}
                    {filteredUploads.map((upload) => {
                      // Do not render uploads if the user data hasn't loaded yet
                      if (!upload.user) return null;
                      return (
                        <TableRow key={upload.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                                <div>
                                    <div className="font-semibold">{upload.originalName}</div>
                                    <div className="text-sm text-muted-foreground sm:hidden">
                                      {upload.user?.nombres} {upload.user?.apellidos}
                                    </div>
                                </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{upload.user?.nombres} {upload.user?.apellidos}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <StatusBadge status={upload.status} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{upload.uploadDate}</TableCell>
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
                                <DropdownMenuItem onClick={() => handleUpdateStatus(upload, 'APROBADO')}>Aprobar Directamente</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleUpdateStatus(upload, 'RECHAZADO')}>Rechazar</DropdownMenuItem>
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
          </TabsContent>
      </Tabs>
      {selectedUpload && (
        <FileReviewDialog
          isOpen={isReviewDialogOpen}
          setIsOpen={setReviewDialogOpen}
          upload={selectedUpload}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
