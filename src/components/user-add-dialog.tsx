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
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseConfig } from "@/firebase/config";


type UserData = Omit<User, 'id' | 'avatarUrl' | 'isActive'>;

type UserAddDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (user: UserData, userId?: string) => void;
  user?: User;
};

export function UserAddDialog({ isOpen, setIsOpen, onSave, user }: UserAddDialogProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<UserData>>({});
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setFormData({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    identification: user.identification,
                    department: user.department,
                    role: user.role,
                });
                setPassword(''); // Clear password for existing user edit
            } else {
                setFormData({
                    role: 'user',
                    department: 'Recursos Humanos',
                    firstName: '',
                    lastName: '',
                    email: '',
                    identification: '',
                });
                setPassword('');
            }
        }
    }, [user, isOpen]);

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
            } else if (formData.email) {
                // Creating new user in an isolated auth instance
                const tempAppName = `temp-user-creation-${Date.now()}`;
                const tempApp = initializeApp(firebaseConfig, tempAppName);
                const tempAuth = getAuth(tempApp);

                try {
                    const userCredential = await createUserWithEmailAndPassword(tempAuth, formData.email, password);
                    const newUserId = userCredential.user.uid;
                    onSave(formData as UserData, newUserId);
                } finally {
                    // Clean up the temporary app instance
                    await deleteApp(tempApp);
                }

            } else {
                throw new Error("El email es requerido para crear un usuario.");
            }
            
            toast({
                title: user ? "Usuario Actualizado" : "Usuario Creado",
                description: `El usuario ${formData.firstName} ha sido ${user ? 'actualizado' : 'creado'} correctamente.`,
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
          <DialogTitle className="font-headline text-2xl">{user ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</DialogTitle>
          <DialogDescription>
            {user ? 'Modifica la información del usuario.' : 'Completa la información para crear una nueva cuenta en el sistema.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">Nombres</Label>
                        <Input id="firstName" placeholder="Ej: Ana" required value={formData.firstName || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Apellidos</Label>
                        <Input id="lastName" placeholder="Ej: García" required value={formData.lastName || ''} onChange={handleChange} />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" type="email" placeholder="Ej: ana.garcia@institucion.com" required value={formData.email || ''} onChange={handleChange} disabled={!!user}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="identification">Cédula</Label>
                    <Input id="identification" placeholder="Ej: 12345678-9" required value={formData.identification || ''} onChange={handleChange} />
                </div>
                 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="department">Departamento</Label>
                        <Select name="department" required value={formData.department || ''} onValueChange={(value) => handleSelectChange('department', value)}>
                            <SelectTrigger id="department">
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
                        <Label htmlFor="role">Rol</Label>
                        <Select name="role" required value={formData.role || ''} onValueChange={(value) => handleSelectChange('role', value)}>
                            <SelectTrigger id="role">
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
