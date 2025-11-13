import type { User, Upload, UploadStatus } from '@/lib/types';
import { subDays, format } from 'date-fns';

export const users: User[] = [
  // This data is now managed in Firestore.
  // The structure is kept here for reference on the type.
];

export const getUserById = (userId: string, allUsers: User[]): User | undefined => allUsers.find(u => u.id === userId);


const now = new Date();
export const uploads: Upload[] = [
    {
        id: 101,
        user_id: "2", // Changed to string to match Firestore ID
        original_name: 'contrato_servicios_2024.pdf',
        tipo_archivo: 'pdf',
        uso: 'contrato',
        descripcion: 'Contrato de servicios de consultoría para el Q3 2024.',
        fecha_subida: format(subDays(now, 1), 'yyyy-MM-dd HH:mm'),
        estado: 'APROBADO',
        acta_pdf_path: '/path/to/acta_101.pdf',
    },
    {
        id: 102,
        user_id: "2",
        original_name: 'reporte_financiero_mayo.xlsx',
        tipo_archivo: 'excel',
        uso: 'otro',
        fecha_subida: format(subDays(now, 2), 'yyyy-MM-dd HH:mm'),
        estado: 'PENDIENTE',
    },
    {
        id: 103,
        user_id: "3",
        original_name: 'acta_reunion_directorio.docx',
        tipo_archivo: 'word',
        uso: 'acta',
        descripcion: 'Acta de la reunión del directorio del 15 de mayo.',
        fecha_subida: format(subDays(now, 5), 'yyyy-MM-dd HH:mm'),
        estado: 'CORRECCIONES',
        observaciones: 'Falta la firma del secretario. Por favor, añadirla y volver a subir el documento.',
    },
    {
        id: 104,
        user_id: "3",
        original_name: 'memorando_interno_005.pdf',
        tipo_archivo: 'pdf',
        uso: 'memorando',
        fecha_subida: format(subDays(now, 10), 'yyyy-MM-dd HH:mm'),
        estado: 'RECHAZADO',
        observaciones: 'El formato no corresponde con el estándar de la institución.',
    },
    {
        id: 105,
        user_id: "2",
        original_name: 'anexos_proyecto_alpha.zip',
        tipo_archivo: 'zip',
        uso: 'otro',
        fecha_subida: format(subDays(now, 12), 'yyyy-MM-dd HH:mm'),
        estado: 'APROBADO',
        acta_pdf_path: '/path/to/acta_105.pdf',
    },
    {
        id: 106,
        user_id: "4",
        original_name: 'propuesta_migracion_cloud.pdf',
        tipo_archivo: 'pdf',
        uso: 'contrato',
        descripcion: 'Propuesta técnica y económica para la migración a servicios en la nube.',
        fecha_subida: format(subDays(now, 15), 'yyyy-MM-dd HH:mm'),
        estado: 'EN REVISION',
    },
];

export const getUploadsForUser = (userId: string) => uploads.filter(u => u.user_id === userId);
