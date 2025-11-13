"use client";

import { useState } from "react";
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
import { users as initialUsers } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserAddDialog } from "@/components/user-add-dialog";
import type { User } from "@/lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isUserDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenDialog = (user?: User) => {
    setEditingUser(user);
    setUserDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingUser(undefined);
    setUserDialogOpen(false);
  };

  const handleSaveUser = (user: Omit<User, 'id' | 'avatarUrl' | 'activo'>) => {
    if (editingUser) {
      // Edit existing user
      setUsers(users.map(u => u.id === editingUser.id ? { ...editingUser, ...user } : u));
    } else {
      // Add new user
      const newUser: User = {
        ...user,
        id: Math.max(...users.map(u => u.id)) + 1,
        activo: true,
        avatarUrl: `https://picsum.photos/seed/${Math.random()}/100/100`,
      };
      setUsers([...users, newUser]);
    }
  };

  const toggleUserStatus = (userId: number) => {
    setUsers(users.map(u => u.id === userId ? { ...u, activo: !u.activo } : u));
  };
  
  const promoteToAdmin = (userId: number) => {
    setUsers(users.map(u => u.id === userId ? { ...u, rol: 'admin' } : u));
  };

  const filteredUsers = users.filter(user =>
    `${user.nombres} ${user.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {filteredUsers.map((user) => (
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
                        <DropdownMenuItem className={user.activo ? "text-destructive" : ""} onClick={() => toggleUserStatus(user.id)}>
                          {user.activo ? "Desactivar" : "Activar"}
                        </DropdownMenuItem>
                         {user.rol !== 'admin' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => promoteToAdmin(user.id)}>
                              <UserCog className="mr-2 h-4 w-4" />
                              Hacer Administrador
                            </DropdownMenuItem>
                          </>
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
