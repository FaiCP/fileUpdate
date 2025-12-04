
"use client";

import { useEffect, useState, useMemo } from "react";
import { useFirestore } from "@/firebase";
import { 
  collection, 
  collectionGroup, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from "firebase/firestore";

import type { Upload, User } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { 
  UploadCloud, 
  FileCheck2, 
  FileX2, 
  Users, 
  FileText 
} from "lucide-react";

import { statusConfig } from "@/lib/status-config";
import { cn } from "@/lib/utils";


const StatusBadge = ({ status }: { status: Upload['status'] }) => {
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
interface DashboardAdminProps {
  initialUsers?: User[];
  initialUploads?: Upload[];
}

const formatDate = (dateValue: any): string => {
  if (!dateValue) return "";
  // Handle string dates that might already be formatted
  if (typeof dateValue === 'string') {
    // Basic check if it's already in a user-friendly format, otherwise parse it
    if (dateValue.includes('/') || dateValue.includes(':')) {
        return dateValue;
    }
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
        return date.toLocaleString();
    }
    return dateValue; // return as is if parsing fails
  }
  // Handle Firebase Timestamp
  if (dateValue && typeof dateValue.toDate === 'function') {
    return dateValue.toDate().toLocaleString();
  }
  // Handle JavaScript Date object
  if (dateValue instanceof Date) {
    return dateValue.toLocaleString();
  }
  // Fallback for any other type
  return String(dateValue);
};


export function DashboardAdmin({
  initialUsers = [],
  initialUploads = [],
}: DashboardAdminProps) {

  const firestore = useFirestore();

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [allUploads, setAllUploads] = useState<Upload[]>(initialUploads);
  const [recentUploads, setRecentUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);

  // USERS Listener
  useEffect(() => {
    if (!firestore) return;

    const ref = collection(firestore, "users");
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as User[];
      setUsers(data); 
      setLoading(false); // Stop loading once users are fetched
    }, () => setLoading(false)); // Also stop loading on error

    return () => unsub();
  }, [firestore]);

  // UPLOADS Listener
  useEffect(() => {
    if (!firestore) return;
  
    const ref = collectionGroup(firestore, "uploads");
  
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.docs.map((d) => {
        const raw = d.data();
  
        return {
          id: d.id,
          ...raw,
          uploadDate: formatDate(raw.uploadDate),
        };
      }) as Upload[];
  
      setAllUploads(data);
    });
  
    return () => unsub();
  }, [firestore]);
  
  // Last 5 uploads
  useEffect(() => {
    if (!firestore) return;

    const q = query(
      collectionGroup(firestore, "uploads"),
      orderBy("uploadDate", "desc"),
      limit(5)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => {
        const raw = d.data();
        return {
          id: d.id,
          ...raw,
          uploadDate: formatDate(raw.uploadDate),
        };
      }) as Upload[];
    
      setRecentUploads(data);
    });
    

    return () => unsub();
  }, [firestore]);



  // Métricas
  const metrics = useMemo(() => {
    const totalUploads = allUploads.length;
    const approvedUploads = allUploads.filter(u => u.status === "APROBADO").length;
    const needsCorrection = allUploads.filter(u => u.status === "CORRECCIONES").length;
    const activeUsers = users.filter(u => u.isActive).length;

    return { totalUploads, approvedUploads, needsCorrection, activeUsers };
  }, [allUploads, users]);


 // Obtener usuario por id usando nombres y apellidos reales
const recentUploadsWithUsers = useMemo(() => {
  return recentUploads.map(upload => {
    const user = users.find(u => u.id === upload.userId);
    return {
      ...upload,
      user: user || null
    };
  });
}, [recentUploads, users]);



  return (
    <div className="space-y-6">

      {/* ---- CARDS ---- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivos Subidos</CardTitle>
            <UploadCloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : metrics.totalUploads}</div>
            <p className="text-xs text-muted-foreground">Total de archivos en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivos Aprobados</CardTitle>
            <FileCheck2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : metrics.approvedUploads}</div>
            <p className="text-xs text-muted-foreground">Actas generadas y finalizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requieren Corrección</CardTitle>
            <FileX2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : metrics.needsCorrection}</div>
            <p className="text-xs text-muted-foreground">Archivos devueltos a usuarios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Total de usuarios en la plataforma</p>
          </CardContent>
        </Card>

      </div>

      {/* ---- TABLA ---- */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <p className="text-sm text-muted-foreground">
            Los 5 archivos subidos más recientemente por cualquier usuario.
          </p>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Archivo</TableHead>
                <TableHead className="hidden sm:table-cell">Usuario</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Cargando...</TableCell>
                </TableRow>
              )}

              {!loading && recentUploadsWithUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                    No hay actividad reciente.
                  </TableCell>
                </TableRow>
              )}

              {!loading && recentUploadsWithUsers.map(upload => (
                <TableRow key={upload.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-medium">{upload.originalName}</span>
                        <span className="text-xs text-muted-foreground sm:hidden">
                          {upload.user ? `${upload.user.nombres} ${upload.user.apellidos}` : "Usuario desconocido"}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    {upload.user ? `${upload.user.nombres} ${upload.user.apellidos}` : "Usuario desconocido"}
                  </TableCell>

                  <TableCell className="hidden md:table-cell">{upload.uploadDate}</TableCell>

                  <TableCell>
                    <StatusBadge status={upload.status} />
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>

          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
