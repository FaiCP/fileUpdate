import { Timestamp } from "firebase/firestore";

export type AssignedLocation = {
  shelf: string;
  box: string;
};

export type User = {
  id: string; // Changed to string to match Firebase Auth UID
  nombres: string;
  apellidos: string;
  identification: string;
  department: string;
  email: string;
  rol: 'user' | 'admin';
  isActive: boolean;
  avatarUrl?: string;
  dateJoined?: Timestamp;
  assignedLocations?: AssignedLocation[];
};

export type UploadStatus = 'PENDIENTE' | 'EN REVISION' | 'CORRECCIONES' | 'APROBADO' | 'RECHAZADO';

export type Upload = {
  id: string; // Changed to string for Firestore document ID
  userId: string; // Renamed from user_id for consistency
  originalName: string; // Renamed from original_name
  fileType: 'pdf' | 'word' | 'excel' | 'zip' | 'otro'; // Renamed from tipo_archivo
  usage: 'acta' | 'contrato' | 'memorando' | 'otro'; // Renamed from uso
  description?: string;
  uploadDate: string; // Renamed from fecha_subida
  status: UploadStatus; // Renamed from estado
  observations?: string; // Renamed from observaciones
  acceptanceActPath?: string; // Renamed from acta_pdf_path
  shelf: string;
  box: string;
};
