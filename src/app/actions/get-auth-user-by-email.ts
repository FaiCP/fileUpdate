"use server";

import { firebaseApp } from "@/firebase/server";
import { getAuth } from "firebase-admin/auth";

/**
 * Busca un usuario en Firebase Auth por email usando el Admin SDK.
 * Útil cuando createUserWithEmailAndPassword falla con auth/email-already-in-use
 * (el usuario existe en Auth pero no tiene documento en Firestore).
 */
export async function getAuthUserByEmail(email: string): Promise<{ uid: string } | null> {
  try {
    const adminAuth = getAuth(firebaseApp);
    const user = await adminAuth.getUserByEmail(email);
    return { uid: user.uid };
  } catch {
    return null;
  }
}
