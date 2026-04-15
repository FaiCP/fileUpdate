"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/lib/types";
import { KeyRound, LogOut, User as UserIcon } from "lucide-react";
import { ChangePasswordDialog } from "./change-password-dialog";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

type UserNavProps = {
  user: User;
};

export function UserNav({ user }: UserNavProps) {
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
    await fetch("/api/session", { method: "DELETE", credentials: "include" });
    router.replace("/");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatarUrl} alt={`${user.nombres} ${user.apellidos}`} data-ai-hint="person portrait" />
              <AvatarFallback>
                {user.nombres && user.apellidos ? `${user.nombres.charAt(0)}${user.apellidos.charAt(0)}` : ""}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.nombres} {user.apellidos}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPasswordDialogOpen(true)}>
              <KeyRound className="mr-2 h-4 w-4" />
              <span>Cambiar contraseña</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog
        mode="self"
        isOpen={isPasswordDialogOpen}
        setIsOpen={setPasswordDialogOpen}
        userEmail={user.email}
      />
    </>
  );
}
