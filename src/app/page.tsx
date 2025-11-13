"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileArchive, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('ana.garcia@institucion.com');
  const [password, setPassword] = useState('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(true);
  const [seedSuccess, setSeedSuccess] = useState(false);

  useEffect(() => {
    const seedInitialUser = async () => {
      if (!firestore || !auth) return;

      try {
        const usersCollection = collection(firestore, 'users');
        const userSnapshot = await getDocs(usersCollection);

        if (userSnapshot.empty) {
          // No users exist, let's create the initial admin user.
          const adminEmail = 'ana.garcia@institucion.com';
          const adminPassword = 'password';

          // 1. Create Auth user
          const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
          const newUserId = userCredential.user.uid;

          // 2. Create Firestore user document
          const newUser: User = {
            id: newUserId,
            nombres: 'Ana',
            apellidos: 'García (Admin)',
            email: adminEmail,
            cedula: '00000000-0',
            departamento: 'Administración',
            rol: 'admin',
            activo: true,
            avatarUrl: `https://picsum.photos/seed/${newUserId}/100/100`,
          };
          
          const batch = writeBatch(firestore);
          const userRef = doc(firestore, "users", newUserId);
          batch.set(userRef, newUser);

          // 3. Create admin role document
          const adminRoleRef = doc(firestore, "roles_admin", newUserId);
          batch.set(adminRoleRef, { grantedAt: new Date() });

          await batch.commit();
          setSeedSuccess(true);
        }
      } catch (error: any) {
         // This might happen if user exists in Auth but not Firestore, or vice-versa.
         // Or on hot-reloads. We can ignore it for this seeding purpose.
        console.warn("Seeding warning (can be ignored on dev hot reloads):", error.message);
      } finally {
        setIsSeeding(false);
      }
    };
    
    seedInitialUser();
  }, [firestore, auth]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "El servicio de autenticación no está disponible.",
        });
        return;
    }

    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = "Ocurrió un error al iniciar sesión.";
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Correo electrónico o contraseña incorrectos.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El formato del correo electrónico no es válido.';
          break;
        default:
          errorMessage = 'No se pudo iniciar sesión. Por favor, inténtalo de nuevo.';
          break;
      }
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: errorMessage,
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileArchive className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-4xl">Secure File Hub</CardTitle>
            <CardDescription className="pt-2">Acceso seguro para gestión de actas</CardDescription>
          </CardHeader>
          <CardContent>
            {isSeeding ? (
                <div className="text-center text-muted-foreground">Inicializando sistema...</div>
            ) : (
                <>
                {seedSuccess && (
                     <Alert className="mb-4 border-green-500 text-green-700">
                        <Info className="h-4 w-4 !text-green-700" />
                        <AlertTitle>¡Sistema Listo!</AlertTitle>
                        <AlertDescription>
                            Se ha creado el usuario administrador. Ya puedes iniciar sesión.
                        </AlertDescription>
                    </Alert>
                )}
                <form className="space-y-6" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" type="email" placeholder="admin@institucion.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
                  </div>
                  <Button type="submit" className="w-full text-lg font-bold" disabled={isSubmitting}>
                    <LogIn className="mr-2 h-5 w-5" />
                    {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
                  </Button>
                </form>
                </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
