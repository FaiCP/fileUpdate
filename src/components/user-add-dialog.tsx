"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { useAuth } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

type UserData = Omit<User, 'id' | 'avatarUrl' | 'activo'>;

type UserAddDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (user: UserData, userId?: string) => void;
  user?: User;
  isFirstUser?: boolean;
};

export function UserAddDialog({ isOpen, setIsOpen, onSave, user, isFirstUser = false }: UserAddDialogProps) {
    const auth = useAuth();
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<UserData>>({});
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setFormData({
                    nombres: user.nombres,
                    apellidos: user.apellidos,
                    email: user.email,
                    cedula: user.cedula,
                    departamento: user.departamento,
                    rol: user.rol,
                });
                setPassword(''); // Clear password for existing user edit
            } else {
                // If it's the first user, default the role to admin.
                setFormData({
                    rol: isFirstUser ? 'admin' : 'user',
                    departamento: 'Recursos Humanos',
                    nombres: isFirstUser ? 'Admin' : '',
                    apellidos: isFirstUser ? 'Principal' : '',
                    email: isFirstUser ? 'admin@institucion.com' : '',
                    cedula: isFirstUser ? '00000000-0' : '',
                });
                setPassword(isFirstUser ? 'password' : '');
            }
        }
    }, [user, isOpen, isFirstUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user && !password) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "La contraseña es obligatoria para nuevos usuarios.",
            });
            return;
        }

        try {
            if (user) {
                // Editing user - no auth changes here, just Firestore
                onSave(formData as UserData);
            } else if (auth && formData.email) {
                // Creating new user
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, password);
                const newUserId = userCredential.user.uid;
                onSave(formData as UserData, newUserId);
            } else {
                throw new Error("El servicio de autenticación no está disponible o falta el email.");
            }
            
            toast({
                title: user ? "Usuario Actualizado" : "Usuario Creado",
                description: `El usuario ${formData.nombres} ha sido ${user ? 'actualizado' : 'creado'} correctamente.`,
            });
            setIsOpen(false);
        } catch(error: any) {
            console.error("Error saving user:", error);
             toast({
                variant: "destructive",
                title: "Error al guardar",
                description: error.code === 'auth/email-already-in-use' ? 'Este correo electrónico ya está en uso.' : (error.message || "No se pudo crear o actualizar el usuario."),
            });
        }
    }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{user ? 'Editar Usuario' : isFirstUser ? 'Crear Primer Administrador' : 'Añadir Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {user ? 'Modifica la información del usuario.' : isFirstUser ? 'Este será el primer usuario administrador del sistema. Inicia sesión con estas credenciales después de crearlo.' : 'Completa la información para crear una nueva cuenta en el sistema.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="nombres">Nombres</Label>
                        <Input id="nombres" placeholder="Ej: Ana" required value={formData.nombres || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="apellidos">Apellidos</Label>
                        <Input id="apellidos" placeholder="Ej: García" required value={formData.apellidos || ''} onChange={handleChange} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" type="email" placeholder="Ej: ana.garcia@institucion.com" required value={formData.email || ''} onChange={handleChange} disabled={!!user}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cedula">Cédula</Label>
                    <Input id="cedula" placeholder="Ej: 12345678-9" required value={formData.cedula || ''} onChange={handleChange} />
                </div>
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="departamento">Departamento</Label>
                        <Select name="departamento" required value={formData.departamento || ''} onValueChange={(value) => handleSelectChange('departamento', value)}>
                            <SelectTrigger id="departamento">
                            <SelectValue placeholder="Selecciona un departamento" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                                <SelectItem value="Finanzas">Finanzas</SelectItem>
                                <SelectItem value="Legal">Legal</SelectItem>
                                <SelectItem value="Tecnología">Tecnología</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rol">Rol</Label>
                        <Select name="rol" required value={formData.rol || ''} onValueChange={(value) => handleSelectChange('rol', value)} disabled={isFirstUser && !user}>
                            <SelectTrigger id="rol">
                            <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">Usuario</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">{user ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!user} />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
