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
import { getAuthUserByEmail } from "@/app/actions/get-auth-user-by-email";


type UserData = Omit<User, 'id' | 'avatarUrl' | 'isActive' | 'assignedLocations'>;

type UserAddDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (user: UserData, userId?: string) => Promise<void>;
  user?: User;
};

export function UserAddDialog({ isOpen, setIsOpen, onSave, user }: UserAddDialogProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<UserData>>({});
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setFormData({
                    nombres: user.nombres,
                    apellidos: user.apellidos,
                    email: user.email,
                    identification: user.identification,
                    department: user.department,
                    rol: user.rol,
                });
                setPassword(''); // Clear password for existing user edit
            } else {
                setFormData({
                    rol: 'user',
                    department: 'Recursos Humanos',
                    nombres: '',
                    apellidos: '',
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
        setIsSubmitting(true);

        if (!user && !password) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "La contraseña es obligatoria para nuevos usuarios.",
            });
            setIsSubmitting(false);
            return;
        }

        try {
            if (user) {
                // Editing user - no auth changes here, just Firestore
                await onSave(formData as UserData);
            } else if (formData.email) {
                // Creating new user in an isolated auth instance
                const tempAppName = `temp-user-creation-${Date.now()}`;
                const tempApp = initializeApp(firebaseConfig, tempAppName);
                const tempAuth = getAuth(tempApp);

                let newUserId: string;
                try {
                    const userCredential = await createUserWithEmailAndPassword(tempAuth, formData.email, password);
                    newUserId = userCredential.user.uid;
                } catch (authError: any) {
                    if (authError.code === 'auth/email-already-in-use') {
                        // El email ya existe en Auth (quizás de un intento anterior).
                        // Recuperamos el UID para crear solo el documento Firestore.
                        const existing = await getAuthUserByEmail(formData.email);
                        if (!existing) {
                            throw new Error("El correo ya está en uso y no se pudo recuperar el usuario.");
                        }
                        newUserId = existing.uid;
                    } else {
                        throw authError;
                    }
                } finally {
                    await deleteApp(tempApp);
                }
                await onSave(formData as UserData, newUserId);

            } else {
                throw new Error("El email es requerido para crear un usuario.");
            }
            
            toast({
                title: user ? "Usuario Actualizado" : "Usuario Creado",
                description: `El usuario ${formData.nombres} ha sido ${user ? 'actualizado' : 'creado'} correctamente.`,
            });
            setIsOpen(false);
        } catch(error: any) {
            console.warn("UserAddDialog error:", error.code ?? error.message);
            toast({
                variant: "destructive",
                title: "Error al guardar",
                description: error.code === 'auth/email-already-in-use'
                    ? 'Este correo ya está registrado.'
                    : (error.message || "No se pudo crear o actualizar el usuario."),
            });
        } finally {
            setIsSubmitting(false);
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
                        <Label htmlFor="rol">Rol</Label>
                        <Select name="rol" required value={formData.rol || ''} onValueChange={(value) => handleSelectChange('rol', value)}>
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
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
