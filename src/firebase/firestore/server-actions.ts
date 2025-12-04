import { firestore } from "../server";
import type { User, Upload } from "@/lib/types";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

const NAS_BASE = "\\\\10.0.16.103\\tics\\Pruebas";

async function moveFileOnNAS(fileName: string) {
  const from = path.join(NAS_BASE, "pendientes", fileName);
  const to   = path.join(NAS_BASE, "validados", fileName);

  await fs.rename(from, to);
}

// Helper function to check if admin SDK is available
const isAdminSdkAvailable = () => {
  if (!firestore) {
    console.error("Firestore Admin SDK is not available. Server actions requiring admin privileges will fail.");
    return false;
  }
  return true;
}

// ✔ Obtener todos los usuarios
export async function getUsers(): Promise<User[]> {
  if (!isAdminSdkAvailable()) return [];

  const snap = await firestore.collection("users").get();

  return snap.docs.map(doc => {
    const data = doc.data();

    return {
      id: doc.id,
      nombres: data.nombres ?? "",
      apellidos: data.apellidos ?? "",
      identification: data.identification ?? "",
      department: data.department ?? "",
      rol: data.rol ?? "",
      email: data.email ?? "",
      isActive: data.isActive ?? false,
    };
  });
}

// ✔ Obtener uploads
export async function getUploads(): Promise<Upload[]> {
  if (!isAdminSdkAvailable()) return [];

  const snap = await firestore.collectionGroup("uploads").get();

  return snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Upload[];
}

// ✔ Obtener usuario actual desde cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  console.log("🍪 userId cookie:", userId);
  
  if (!userId) return null;
  if (!isAdminSdkAvailable()) return null; // Prevent crash if SDK is not initialized
  
  const docSnap = await firestore.collection("users").doc(userId).get();
  console.log("📄 Firestore exists:", docSnap.exists);
  if (!docSnap.exists) return null;

  const data = docSnap.data()!;
  console.log("🧍 Usuario Firestore:", data);
  return {
    id: docSnap.id,
    nombres: data.nombres ?? "",
    apellidos: data.apellidos ?? "",
    identification: data.identification ?? "",
    department: data.department ?? "",
    rol: data.rol ?? "",
    email: data.email ?? "",
    isActive: data.isActive ?? false,
    assignedLocations: data.assignedLocations || [], 
  };
}
