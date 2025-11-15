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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { FileReviewDialog } from "@/components/file-review-dialog";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, collectionGroup, updateDoc } from "firebase/firestore";
import { statusConfig } from "@/lib/status-config";
import { PageHeader } from "./page-header";

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

type UploadWithUser = Upload & { user?: User };

export function DashboardAdmin() {
    const { toast } = useToast();
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, "users") : null, [firestore]);
    const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

    const uploadsQuery = useMemoFirebase(() => firestore ? collectionGroup(firestore, "uploads") : null, [firestore]);
    const { data: uploads, isLoading: uploadsLoading } = useCollection<Upload>(uploadsQuery);

    const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedUpload, setSelectedUpload] = useState<UploadWithUser | undefined>(undefined);
    const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
    
    const getUserById = (userId: string, userList: User[]): User | undefined => userList.find(u => u.id === userId);

    const uploadsWithUsers = useMemo(() => {
        if (!uploads || !users) return [];
        return uploads.map(upload => ({
            ...upload,
            user: getUserById(upload.userId, users)
        })).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    }, [uploads, users]);

    const handleReviewClick = (upload: UploadWithUser) => {
        setSelectedUpload(upload);
        setReviewDialogOpen(true);
    };

    const handleUpdateStatus = async (upload: UploadWithUser, status: UploadStatus, observations?: string) => {
      if (!firestore) {
        toast({ title: "Error", description: "Firestore not available.", variant: "destructive" });
        return;
      }
      const uploadRef = doc(firestore, 'users', upload.userId, 'uploads', upload.id);
      
      const updateData: Partial<Upload> = { status };
      if (observations) {
        updateData.observations = observations;
      }
      if (status === 'APROBADO') {
        updateData.acceptanceActPath = `/acts/${upload.id}.pdf`; // Dummy path
      }

      await updateDoc(uploadRef, updateData);
      
      toast({
        title: `Archivo ${status.toLowerCase()}`,
        description: `El archivo "${upload.originalName}" ha sido marcado como ${status.toLowerCase()}.`,
      });
    };

    const filteredUploads = useMemo(() => {
        if (activeFilter === 'all') return uploadsWithUsers;
        return uploadsWithUsers.filter(upload => upload.status === activeFilter);
    }, [uploadsWithUsers, activeFilter]);

  return (
    <div className="space-y-6">
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
                    {(uploadsLoading || usersLoading) && <TableRow><TableCell colSpan={5} className="text-center py-10">Cargando datos...</TableCell></TableRow>}
                    {!uploadsLoading && !usersLoading && filteredUploads.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No hay archivos en esta categoría.</TableCell></TableRow>}
                    {!uploadsLoading && !usersLoading && filteredUploads.map((upload) => {
                      return (
                        <TableRow key={upload.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                                <div>
                                    <div className="font-semibold">{upload.originalName}</div>
                                    <div className="text-sm text-muted-foreground sm:hidden">
                                      {upload.user?.firstName} {upload.user?.lastName}
                                    </div>
                                </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{upload.user?.firstName} {upload.user?.lastName}</TableCell>
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
