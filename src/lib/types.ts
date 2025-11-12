export type User = {
  id: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  departamento: string;
  email: string;
  rol: 'user' | 'admin';
  activo: boolean;
  avatarUrl: string;
};

export type UploadStatus = 'PENDIENTE' | 'EN REVISION' | 'CORRECCIONES' | 'APROBADO' | 'RECHAZADO';

export type Upload = {
  id: number;
  user_id: number;
  original_name: string;
  tipo_archivo: 'pdf' | 'word' | 'excel' | 'zip' | 'otro';
  uso: 'acta' | 'contrato' | 'memorando' | 'otro';
  descripcion?: string;
  fecha_subida: string;
  estado: UploadStatus;
  observaciones?: string;
  acta_pdf_path?: string;
};
