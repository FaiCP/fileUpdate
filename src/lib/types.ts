import { Timestamp } from "firebase/firestore";

export type User = {
  id: string; // Changed to string to match Firebase Auth UID
  nombres: string;
  apellidos: string;
  cedula: string;
  departamento: string;
  email: string;
  rol: 'user' | 'admin';
  activo: boolean;
  avatarUrl: string;
  dateJoined?: Timestamp;
};

export type UploadStatus = 'PENDIENTE' | 'EN REVISION' | 'CORRECCIONES' | 'APROBADO' | 'RECHAZADO';

export type Upload = {
  id: number;
  user_id: string; // Changed to string to match Firebase Auth UID
  original_name: string;
  tipo_archivo: 'pdf' | 'word' | 'excel' | 'zip' | 'otro';
  uso: 'acta' | 'contrato' | 'memorando' | 'otro';
  descripcion?: string;
  fecha_subida: string;
  estado: UploadStatus;
  observaciones?: string;
  acta_pdf_path?: string;
};
