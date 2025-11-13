"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileArchive, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('ana.garcia@institucion.com');
  const [password, setPassword] = useState('password');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Use the official signInWithEmailAndPassword and await the result
      await signInWithEmailAndPassword(auth, email, password);
      // On success, Firebase's onAuthStateChanged listener will handle the user state.
      // We can then safely navigate.
      router.push('/dashboard');
    } catch (error: any) {
      // Handle login errors (e.g., wrong password, user not found)
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
