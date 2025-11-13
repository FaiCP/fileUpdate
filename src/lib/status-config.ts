import { FileCheck2, FileClock, FileX2, Hourglass } from "lucide-react";
import type { UploadStatus } from "./types";

export const statusConfig: Record<UploadStatus, { label: string; icon: React.ElementType; color: string; textColor: string }> = {
  PENDIENTE: { label: "Pendiente", icon: Hourglass, color: "bg-yellow-100 dark:bg-yellow-900", textColor: "text-yellow-700 dark:text-yellow-300"},
  'EN REVISION': { label: "En Revisión", icon: FileClock, color: "bg-blue-100 dark:bg-blue-900", textColor: "text-blue-700 dark:text-blue-300"},
  CORRECCIONES: { label: "Correcciones", icon: FileX2, color: "bg-orange-100 dark:bg-orange-900", textColor: "text-orange-700 dark:text-orange-300"},
  APROBADO: { label: "Aprobado", icon: FileCheck2, color: "bg-green-100 dark:bg-green-900", textColor: "text-green-700 dark:text-green-300"},
  RECHAZADO: { label: "Rechazado", icon: FileX2, color: "bg-red-100 dark:bg-red-900", textColor: "text-red-700 dark:text-red-300"},
};
