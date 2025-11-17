import { firestore } from "../server";
import type { User, Upload } from "@/lib/types";
import { cookies } from "next/headers";

// ✔ Obtener todos los usuarios
export async function getUsers(): Promise<User[]> {
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
  };
}
