"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { updateUserPassword } from "@/app/actions/update-user-password";
import { Eye, EyeOff, KeyRound } from "lucide-react";

// ── Tipos ────────────────────────────────────────────────────────────────────

type SelfMode = {
  mode: "self";
  userEmail: string;
};

type AdminMode = {
  mode: "admin";
  targetUserId: string;
  targetUserName: string;
};

type ChangePasswordDialogProps = (SelfMode | AdminMode) & {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

// ── Componente ───────────────────────────────────────────────────────────────

export function ChangePasswordDialog(props: ChangePasswordDialogProps) {
  const { isOpen, setIsOpen, mode } = props;
  const { toast } = useToast();
  const auth = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent,     setShowCurrent]     = useState(false);
  const [showNew,         setShowNew]         = useState(false);
  const [isSubmitting,    setIsSubmitting]    = useState(false);

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
  };

  const handleClose = () => { reset(); setIsOpen(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({ variant: "destructive", title: "Error", description: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Error", description: "Las contraseñas no coinciden." });
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "self") {
        // ── Flujo usuario: reautenticar + actualizar con client SDK ──
        if (!auth?.currentUser) throw new Error("No hay sesión activa.");

        const credential = EmailAuthProvider.credential(
          (props as SelfMode).userEmail,
          currentPassword
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);

        toast({ title: "Contraseña actualizada", description: "Tu contraseña ha sido cambiada correctamente." });
      } else {
        // ── Flujo admin: Server Action con Admin SDK ──
        const result = await updateUserPassword(
          (props as AdminMode).targetUserId,
          newPassword
        );
        if (!result.ok) throw new Error(result.error);

        toast({
          title: "Contraseña actualizada",
          description: `La contraseña de ${(props as AdminMode).targetUserName} fue cambiada.`,
        });
      }

      handleClose();
    } catch (err: any) {
      const isWrongPassword = err.code === "auth/wrong-password" || err.code === "auth/invalid-credential";
      toast({
        variant: "destructive",
        title: "Error",
        description: isWrongPassword
          ? "La contraseña actual es incorrecta."
          : (err.message || "No se pudo cambiar la contraseña."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const title       = mode === "self" ? "Cambiar mi contraseña" : `Cambiar contraseña — ${(props as AdminMode).targetUserName}`;
  const description = mode === "self"
    ? "Ingresa tu contraseña actual y la nueva contraseña."
    : "Como administrador puedes establecer una nueva contraseña sin necesitar la actual.";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Contraseña actual — solo en modo "self" */}
          {mode === "self" && (
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Contraseña actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Nueva contraseña */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                className="pr-10"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className={confirmPassword && confirmPassword !== newPassword ? "border-destructive" : ""}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-destructive">Las contraseñas no coinciden.</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (!!confirmPassword && confirmPassword !== newPassword)}
            >
              {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
