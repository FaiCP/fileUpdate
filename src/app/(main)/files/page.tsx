"use client"

import { Download, FileText, ListFilter } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Upload, UploadStatus } from "@/lib/types";
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { statusConfig } from "@/lib/status-config";

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


export default function UserFilesPage() {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();

  const userUploadsQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser?.uid) return null;
    return collection(firestore, 'users', currentUser.uid, 'uploads');
  }, [currentUser, firestore]);

  const { data: userUploads, isLoading } = useCollection<Upload>(userUploadsQuery);

  const dummyPdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  if (!currentUser) return <div>Cargando...</div>;

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
              {isLoading && <TableRow><TableCell colSpan={5}>Cargando archivos...</TableCell></TableRow>}
              {!isLoading && userUploads && userUploads.map((upload) => (
                <TableRow key={upload.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-semibold">{upload.originalName}</span>
                        <div className="sm:hidden text-xs text-muted-foreground">{upload.usage} - <StatusBadge status={upload.status} /></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell capitalize">{upload.usage}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <StatusBadge status={upload.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{upload.uploadDate}</TableCell>
                  <TableCell className="text-right">
                    {upload.status === 'APROBADO' && upload.acceptanceActPath && (
                      <Link href={dummyPdfUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Descargar Acta
                        </Button>
                      </Link>
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
