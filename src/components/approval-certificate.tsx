"use client";

import React, { forwardRef } from 'react';
import type { Upload, User } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type ApprovalCertificateProps = {
  upload: Upload;
  user?: User;
  adminName?: string;
};

// ── Shared cell styles ────────────────────────────────────────────────────
const thStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '6px 7px',
  fontWeight: 600,
  textAlign: 'left',
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '7px',
  verticalAlign: 'middle',
};

const fileTypeLabels: Record<string, string> = {
  pdf: 'PDF',
  word: 'Word',
  excel: 'Excel',
  zip: 'ZIP',
  otro: 'Otro',
};

const usageLabels: Record<string, string> = {
  acta: 'Acta',
  contrato: 'Contrato',
  memorando: 'Memorando',
  otro: 'Otro',
};

export const ApprovalCertificate = forwardRef<HTMLDivElement, ApprovalCertificateProps>(
  ({ upload, user, adminName = 'Administrador del Sistema' }, ref) => {
    const approvalDate = upload.reviewedAt
      ? format(new Date(upload.reviewedAt), "dd 'de' MMMM 'de' yyyy", { locale: es })
      : format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: es });

    const uploadDateFormatted = upload.uploadDate
      ? format(new Date(upload.uploadDate), 'dd/MM/yyyy')
      : '-';

    const actaNumber = `ACT-${upload.id.substring(0, 8).toUpperCase()}`;
    const printedAt = format(new Date(), 'dd/MM/yyyy HH:mm');

    return (
      <div ref={ref} style={{ background: 'white', color: 'black', fontFamily: 'Arial, sans-serif', fontSize: '11px', width: '100%', padding: '0' }}>
        <style>{`
          @page { size: A4 landscape; margin: 12mm; }
          @media print { body { margin: 0; } }
        `}</style>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid #003087', paddingBottom: '10px', marginBottom: '14px' }}>
          {/* Logo CNE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#FDB913', borderRadius: '6px', padding: '6px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
              <span style={{ fontWeight: 900, fontSize: '20px', color: '#003087' }}>CNE</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '12px', color: '#003087' }}>CONSEJO NACIONAL ELECTORAL</div>
              <div style={{ fontSize: '9px', color: '#555' }}>República del Ecuador</div>
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#003087', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              INFORME DE ARCHIVOS APROBADOS
            </div>
            <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>
              Secretaría General — CNE Ecuador
            </div>
          </div>

          {/* Metadata */}
          <div style={{ textAlign: 'right', fontSize: '10px', lineHeight: 1.6 }}>
            <div><strong>N° Acta:</strong> {actaNumber}</div>
            <div><strong>Fecha aprobación:</strong> {approvalDate}</div>
          </div>
        </div>

        {/* ── Main Table ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '30px' }}>
          <thead>
            <tr style={{ background: '#003087', color: 'white' }}>
              <th style={thStyle}>Nombre del Archivo</th>
              <th style={{ ...thStyle, textAlign: 'center', width: '60px' }}>Tipo</th>
              <th style={{ ...thStyle, textAlign: 'center', width: '80px' }}>Uso</th>
              <th style={{ ...thStyle, textAlign: 'center', width: '90px' }}>Fecha Subida</th>
              <th style={{ ...thStyle, textAlign: 'center', width: '110px' }}>Fecha Aprobación</th>
              <th style={thStyle}>Usuario</th>
              <th style={thStyle}>Departamento</th>
              <th style={{ ...thStyle, textAlign: 'center', width: '80px' }}>Estantería</th>
              <th style={{ ...thStyle, textAlign: 'center', width: '60px' }}>Caja</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#f4f6fb' }}>
              <td style={{ ...tdStyle, fontWeight: 600 }}>{upload.originalName}</td>
              <td style={{ ...tdStyle, textAlign: 'center' }}>{fileTypeLabels[upload.fileType] ?? upload.fileType}</td>
              <td style={{ ...tdStyle, textAlign: 'center' }}>{usageLabels[upload.usage] ?? upload.usage}</td>
              <td style={{ ...tdStyle, textAlign: 'center' }}>{uploadDateFormatted}</td>
              <td style={{ ...tdStyle, textAlign: 'center' }}>{approvalDate}</td>
              <td style={tdStyle}>{user ? `${user.nombres} ${user.apellidos}` : '-'}</td>
              <td style={tdStyle}>{user?.department ?? '-'}</td>
              <td style={{ ...tdStyle, textAlign: 'center' }}>{upload.shelf || '-'}</td>
              <td style={{ ...tdStyle, textAlign: 'center' }}>{upload.box || '-'}</td>
            </tr>
          </tbody>
        </table>

        {/* ── Description ── */}
        {upload.description && (
          <div style={{ fontSize: '10px', marginBottom: '20px' }}>
            <strong>Descripción:</strong> {upload.description}
          </div>
        )}

        {/* ── Signatures ── */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '60px' }}>
          <div style={{ textAlign: 'center', width: '210px' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '6px' }}>
              <div style={{ fontWeight: 700, fontSize: '10px' }}>{adminName}</div>
              <div style={{ fontSize: '9px', color: '#444' }}>Administrador del Sistema</div>
              <div style={{ fontSize: '9px', color: '#444' }}>CNE Ecuador</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', width: '210px' }}>
            <div style={{ borderTop: '1px solid #000', paddingTop: '6px' }}>
              <div style={{ fontWeight: 700, fontSize: '10px' }}>Director/a del CNE</div>
              <div style={{ fontSize: '9px', color: '#444' }}>Dirección General</div>
              <div style={{ fontSize: '9px', color: '#444' }}>CNE Ecuador</div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #ddd', paddingTop: '6px', fontSize: '8px', color: '#888', textAlign: 'center' }}>
          Documento generado automáticamente por el Sistema de Gestión de Archivos — CNE Ecuador · {printedAt}
        </div>
      </div>
    );
  }
);

ApprovalCertificate.displayName = 'ApprovalCertificate';
