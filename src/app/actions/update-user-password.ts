"use server";

import { firebaseApp } from "@/firebase/server";
import { getAuth } from "firebase-admin/auth";

export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (newPassword.length < 6) {
    return { ok: false, error: "La contraseña debe tener al menos 6 caracteres." };
  }

  try {
    const adminAuth = getAuth(firebaseApp);
    await adminAuth.updateUser(userId, { password: newPassword });
    return { ok: true };
  } catch (err: any) {
    console.warn("updateUserPassword error:", err.code ?? err.message);
    return { ok: false, error: "No se pudo actualizar la contraseña." };
  }
}
