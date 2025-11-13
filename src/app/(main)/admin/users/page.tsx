"use client";

import { useState, useMemo, useEffect } from "react";
import { MoreHorizontal, PlusCircle, Search, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAddDialog } from "@/components/user-add-dialog";
import type { User } from "@/lib/types";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const usersCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading } = useCollection<User>(usersCollectionRef);
  
  const [isUserDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleOpenDialog = (user?: User) => {
    setEditingUser(user);
    setUserDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingUser(undefined);
    setUserDialogOpen(false);
  };

  const handleSaveUser = (userData: Omit<User, 'id' | 'avatarUrl' | 'activo'>, newUserId?: string) => {
    if (!firestore) return;
    
    if (editingUser) {
      // Edit existing user
      const userRef = doc(firestore, "users", editingUser.id);
      updateDocumentNonBlocking(userRef, userData);
      toast({ title: "Usuario actualizado", description: `Los datos de ${userData.nombres} se han guardado.` });

    } else if (newUserId) {
      // Add new user (the auth part is handled in the dialog)
      const newUserRef = doc(firestore, "users", newUserId);
      const newUser: User = {
        ...(userData as User),
        id: newUserId,
        activo: true,
        avatarUrl: `https://picsum.photos/seed/${newUserId}/100/100`,
      };
      setDocumentNonBlocking(newUserRef, newUser, { merge: false });

      // If it's an admin, add to the roles collection
      if (newUser.rol === 'admin') {
        const adminRoleRef = doc(firestore, "roles_admin", newUserId);
        setDocumentNonBlocking(adminRoleRef, { grantedAt: new Date() }, { merge: true });
      }
      toast({ title: "Usuario creado", description: `El usuario ${userData.nombres} ha sido añadido.` });
    }
  };

  const toggleUserStatus = (user: User) => {
    if (!firestore) return;
    const userRef = doc(firestore, "users", user.id);
    updateDocumentNonBlocking(userRef, { activo: !user.activo });
    toast({ title: "Estado cambiado", description: `El usuario ahora está ${!user.activo ? 'activo' : 'inactivo'}.` });
  };
  
  const promoteToAdmin = (user: User) => {
    if (!firestore) return;
    const userRef = doc(firestore, "users", user.id);
    updateDocumentNonBlocking(userRef, { rol: 'admin' });
    // Also add to roles_admin collection for security rule check
    const adminRoleRef = doc(firestore, "roles_admin", user.id);
    setDocumentNonBlocking(adminRoleRef, { grantedAt: new Date() }, { merge: true });
    toast({ title: "Usuario promovido", description: `${user.nombres} ahora es administrador.` });
  };
  
  const demoteToUser = (user: User) => {
    if (!firestore) return;
    const userRef = doc(firestore, "users", user.id);
    updateDocumentNonBlocking(userRef, { rol: 'user' });
    const adminRoleRef = doc(firestore, "roles_admin", user.id);
    deleteDocumentNonBlocking(adminRoleRef);
    toast({ title: "Usuario degradado", description: `${user.nombres} ahora es un usuario estándar.` });
  };


  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user =>
      `${user.nombres} ${user.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);


  return (
    <div className="container mx-auto px-0">
      <PageHeader
        title="Gestión de Usuarios"
        description="Crea, modifica y gestiona los usuarios del sistema."
      >
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nombre, email..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button size="sm" className="h-9 gap-1" onClick={() => handleOpenDialog()}>
            <PlusCircle className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Añadir Usuario
            </span>
          </Button>
        </div>
      </PageHeader>
      
      <UserAddDialog 
        isOpen={isUserDialogOpen} 
        setIsOpen={handleCloseDialog}
        onSave={handleSaveUser}
        user={editingUser}
      />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">Departamento</TableHead>
                <TableHead className="hidden sm:table-cell">Rol</TableHead>
                <TableHead className="hidden sm:table-cell">Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <TableRow><TableCell colSpan={5}>Cargando usuarios...</TableCell></TableRow>}
              {!isLoading && filteredUsers.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                        No se encontraron usuarios.
                    </TableCell>
                </TableRow>
              )}
              {!isLoading && filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={user.avatarUrl} alt="Avatar" data-ai-hint="person portrait" />
                        <AvatarFallback>{user.nombres.charAt(0)}{user.apellidos.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <span className="font-semibold">{user.nombres} {user.apellidos}</span>
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{user.departamento}</TableCell>
                  <TableCell className="hidden sm:table-cell capitalize">{user.rol}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={user.activo ? "default" : "destructive"} className={user.activo ? "bg-green-600" : ""}>
                      {user.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleOpenDialog(user)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem className={user.activo ? "text-destructive" : ""} onClick={() => toggleUserStatus(user)}>
                          {user.activo ? "Desactivar" : "Activar"}
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        {user.rol === 'admin' ? (
                          <DropdownMenuItem onClick={() => demoteToUser(user)}>
                            <UserCog className="mr-2 h-4 w-4" />
                            Hacer Usuario
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => promoteToAdmin(user)}>
                            <UserCog className="mr-2 h-4 w-4" />
                            Hacer Administrador
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
