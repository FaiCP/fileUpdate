"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileArchive, LogIn, UserPlus } from 'lucide-react';
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
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  
  const [email, setEmail] = useState('ana.garcia@institucion.com');
  const [password, setPassword] = useState('password');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(true);
  const [needsSeeding, setNeedsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Check if the database is empty and seed if necessary
  const checkAndSeedDb = useCallback(async () => {
      if (!firestore || !auth) return;
      setIsSeeding(true);
      try {
        const usersCollection = collection(firestore, 'users');
        const userSnapshot = await getDocs(usersCollection);
        if (userSnapshot.empty) {
          setNeedsSeeding(true);
        } else {
          setNeedsSeeding(false);
        }
      } catch (error) {
        console.error("Error checking database status:", error);
        // Assume seeding is needed if check fails, could be due to rules on an empty DB
        setNeedsSeeding(true);
      } finally {
        setIsSeeding(false);
      }
  }, [firestore, auth]);

  useEffect(() => {
    // We need to wait for firestore to be available
    if (firestore && auth) {
      checkAndSeedDb();
    }
  }, [firestore, auth, checkAndSeedDb]);


  const handleCreateAdmin = async () => {
    if (!firestore || !auth) {
        toast({ title: "Error", description: "Servicios de Firebase no disponibles.", variant: "destructive"});
        return;
    };
    
    setIsCreatingAdmin(true);
    
    const adminEmail = 'ana.garcia@institucion.com';
    const adminPassword = 'password';
    
    try {
        let userId;
        try {
            // 1. Attempt to create Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
            userId = userCredential.user.uid;
        } catch (error: any) {
            // If the user already exists in Auth, log in to get the UID and proceed.
            if (error.code === 'auth/email-already-in-use') {
                const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
                userId = userCredential.user.uid;
                toast({ title: "Info", description: "El usuario ya existe en autenticación, creando registro en base de datos...", variant: "default"});
            } else {
                // For other auth errors (weak password, etc.), re-throw to be caught below.
                throw error;
            }
        }
        
        if (!userId) {
            throw new Error("No se pudo obtener el ID del usuario.");
        }

        // 2. Prepare batch write for Firestore
        const batch = writeBatch(firestore);

        // 3. Create Firestore user document
        const newUser: User = {
            id: userId,
            nombres: 'Ana',
            apellidos: 'García (Admin)',
            email: adminEmail,
            identification: '00000000-0',
            department: 'Administración',
            rol: 'admin',
            isActive: true,
            avatarUrl: `https://picsum.photos/seed/${userId}/100/100`,
        };
        const userRef = doc(firestore, "users", userId);
        batch.set(userRef, newUser);

        // 4. Create admin role document
        const adminRoleRef = doc(firestore, "roles_admin", userId);
        batch.set(adminRoleRef, { grantedAt: new Date().toISOString() });

        // 5. Commit batch
        await batch.commit();
        
        setSeedSuccess(true);
        setNeedsSeeding(false);
        toast({ title: "¡Administrador Creado!", description: "Ya puedes iniciar sesión con las credenciales por defecto."});

    } catch (error: any) {
        console.error("Error creating admin user:", error);
        let errorMessage = "Ocurrió un error al crear el administrador.";
        if (error.code === 'auth/email-already-in-use') {
             errorMessage = "El usuario administrador ya existe en Autenticación, pero la base de datos estaba vacía. Inicia sesión.";
             setNeedsSeeding(false); // User exists, no need to show the button anymore
        }
        toast({ title: "Error", description: errorMessage, variant: "destructive"});
    } finally {
        setIsCreatingAdmin(false);
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    console.log("🔐 UID logueado:", auth.currentUser?.uid);

    setIsSubmitting(true);
  
    try {
      // 1. Login de Firebase
      await signInWithEmailAndPassword(auth, email, password);
  
      const user = auth.currentUser;
      if (!user) throw new Error("No se pudo obtener el usuario autenticado.");
  
      // 2. Guardar cookie en el servidor
      await fetch("/api/session", {
        method: "POST",
        credentials: "include",               // 🔥 Obligatorio
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.uid }),
      });      
  
      // 3. Redirigir a Dashboard
      router.push("/dashboard");
  
    } catch (error: any) {
      console.error(error);
  
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar sesión.",
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
                <div className="text-center text-muted-foreground py-10">Verificando base de datos...</div>
            ) : needsSeeding ? (
                <div className="flex flex-col items-center justify-center text-center p-4 border-2 border-dashed rounded-lg">
                    <CardTitle className="text-xl">Bienvenido</CardTitle>
                    <CardDescription className="mt-2 mb-4">
                        Parece que es la primera vez que se ejecuta la aplicación. Crea el usuario administrador para empezar.
                    </CardDescription>
                    <Button onClick={handleCreateAdmin} disabled={isCreatingAdmin}>
                        <UserPlus className="mr-2 h-5 w-5" />
                        {isCreatingAdmin ? 'Creando...' : 'Crear Administrador Inicial'}
                    </Button>
                </div>
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
