"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileArchive, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, writeBatch } from 'firebase/firestore';
import type { User } from '@/lib/types';

export default function RegisterPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    departamento: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) {
      toast({ variant: "destructive", title: "Error", description: "Servicios de Firebase no disponibles." });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if there are any existing users.
      const usersCollection = collection(firestore, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const isFirstUser = userSnapshot.empty;
      
      const role = isFirstUser ? 'admin' : 'user';

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const newUserId = userCredential.user.uid;

      // Prepare user data for Firestore
      const newUser: User = {
        id: newUserId,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        cedula: formData.cedula,
        departamento: formData.departamento || 'No Asignado',
        rol: role,
        activo: true,
        avatarUrl: `https://picsum.photos/seed/${newUserId}/100/100`,
      };
      
      // Use a batch to write to users and roles_admin if admin
      const batch = writeBatch(firestore);
      
      const userRef = doc(firestore, "users", newUserId);
      batch.set(userRef, newUser);

      if (role === 'admin') {
        const adminRoleRef = doc(firestore, "roles_admin", newUserId);
        batch.set(adminRoleRef, { grantedAt: new Date() });
      }
      
      await batch.commit();

      toast({
        title: "¡Registro Exitoso!",
        description: `La cuenta para ${formData.nombres} ha sido creada como ${role}. Por favor, inicia sesión.`,
      });
      router.push('/');

    } catch (error: any) {
      console.error("Registration Error:", error);
      let errorMessage = "Ocurrió un error durante el registro.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo electrónico ya está en uso.';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El formato del correo electrónico no es válido.';
          break;
      }
      toast({
        variant: "destructive",
        title: "Error de Registro",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileArchive className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-4xl">Crear Cuenta de Administrador</CardTitle>
            <CardDescription className="pt-2">Registra el primer usuario que tendrá privilegios de administrador.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres</Label>
                  <Input id="nombres" required value={formData.nombres} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos</Label>
                  <Input id="apellidos" required value={formData.apellidos} onChange={handleChange} />
                </div>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="cedula">Cédula</Label>
                  <Input id="cedula" required value={formData.cedula} onChange={handleChange} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input id="departamento" required value={formData.departamento} onChange={handleChange} />
                </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" required value={formData.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" required value={formData.password} onChange={handleChange} />
              </div>
              <Button type="submit" className="w-full text-lg font-bold" disabled={isSubmitting}>
                <UserPlus className="mr-2 h-5 w-5" />
                {isSubmitting ? 'Registrando...' : 'Registrar Administrador'}
              </Button>
               <div className="mt-4 text-center text-sm">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/" className="underline">
                  Inicia sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
