
"use server";

import { firestore } from "@/firebase/server";
import fs from "fs/promises";
import path from "path";

// Define la ruta base del NAS
const NAS_BASE = "\\\\10.0.16.103\\tics\\Pruebas";

async function moveFileOnNAS(fileName: string) {
  const sourcePath = path.join(NAS_BASE, "pendientes", fileName);
  const destinationPath = path.join(NAS_BASE, "validados", fileName);

  try {
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.rename(sourcePath, destinationPath);
    console.log(`Archivo movido: ${fileName}`);
  } catch (error) {
    console.error(`Error al mover el archivo ${fileName} en el NAS:`, error);
    throw new Error(`No se pudo mover el archivo en el NAS. Verifica que el archivo "${fileName}" exista en la carpeta "pendientes" y que el servidor tenga permisos.`);
  }
}

async function deleteFileFromPendientes(fileName: string) {
  const filePath = path.join(NAS_BASE, "pendientes", fileName);
  try {
    await fs.unlink(filePath);
    console.log(`Archivo eliminado de pendientes: ${fileName}`);
  } catch (error: any) {
    // Si ya no existe, no es un error crítico
    if (error.code !== "ENOENT") {
      console.error(`Error al eliminar el archivo ${fileName} del NAS:`, error);
    }
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

    if (status === "APROBADO") {
      await moveFileOnNAS(originalName);
      updateData.acceptanceActPath = path.join(NAS_BASE, "validados", `acta-${uploadId}.pdf`);
    } else if (status === "RECHAZADO" || status === "CORRECCIONES") {
      await deleteFileFromPendientes(originalName);
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
