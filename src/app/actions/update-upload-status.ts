
"use server";

import { firestore } from "@/firebase/server";
import fs from "fs/promises";
import path from "path";

// Define la ruta base del NAS
const NAS_BASE = "\\\\10.0.16.103\\tics\\Pruebas";

/**
 * Mueve un archivo desde la carpeta de pendientes a la de validados en el NAS.
 * @param fileName El nombre del archivo a mover.
 */
async function moveFileOnNAS(fileName: string) {
  const sourcePath = path.join(NAS_BASE, "pendientes", fileName);
  const destinationPath = path.join(NAS_BASE, "validados", fileName);

  try {
    // Verifica si la carpeta de destino existe, si no, la crea
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    // Mueve el archivo
    await fs.rename(sourcePath, destinationPath);
    console.log(`Archivo movido: ${fileName}`);
  } catch (error) {
    console.error(`Error al mover el archivo ${fileName} en el NAS:`, error);
    // Lanza el error para que la función principal lo capture
    throw new Error(`No se pudo mover el archivo en el NAS. Verifica que el archivo "${fileName}" exista en la carpeta "pendientes" y que el servidor tenga permisos.`);
  }
}

export async function updateUploadStatus(
  userId: string,
  uploadId: string,
  originalName: string, // Se necesita el nombre original del archivo
  status: string,
  observations?: string
) {
  try {
    const ref = firestore
      .collection("users")
      .doc(userId)
      .collection("uploads")
      .doc(uploadId);

    const updateData: any = {
      status,
      reviewedAt: new Date().toISOString(),
    };

    if (observations) updateData.observations = observations;

    // Si el estado es APROBADO, intenta mover el archivo
    if (status === "APROBADO") {
      // La función moveFileOnNAS usará el nombre original del archivo
      await moveFileOnNAS(originalName);
      // Guarda la ruta del acta generada
      updateData.acceptanceActPath = path.join(NAS_BASE, "validados", `acta-${uploadId}.pdf`);
    }

    // Actualiza el documento en Firestore
    await ref.update(updateData);

    return { ok: true };
  } catch (err: any) {
    console.error("Error al actualizar estado:", err);
    // Devuelve un mensaje de error claro al cliente
    return { ok: false, error: err.message || "No se pudo actualizar el estado." };
  }
}
