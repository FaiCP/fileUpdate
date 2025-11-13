"use client";

import React, { forwardRef } from 'react';
import type { Upload, User } from '@/lib/types';
import { format } from 'date-fns';

type ActaPreviewProps = {
  upload: Upload;
  user?: User;
};

// Using forwardRef to pass the ref down to the component
export const ActaPreview = forwardRef<HTMLDivElement, ActaPreviewProps>(({ upload, user }, ref) => {
  const currentDate = format(new Date(), 'dd/MM/yyyy');

  // Create some dummy rows for the table based on the upload
  const tableRows = Array.from({ length: 10 }).map((_, index) => ({
    caja: index === 0 ? '1' : '',
    bibliorato: index === 0 ? '2024-A' : '',
    unidad: index === 0 ? user?.departamento : '',
    serie: index === 0 ? 'Contratos' : '',
    año: index === 0 ? new Date(upload.uploadDate).getFullYear() : '',
    descripcion: index === 0 ? upload.originalName : '',
    solicitud: index === 0 ? `SOL-${upload.id}`: '',
    desde: index === 0 ? format(new Date(upload.uploadDate), 'dd/MM/yyyy') : '',
    hasta: index === 0 ? format(new Date(), 'dd/MM/yyyy') : '',
    originalCopia: index === 0 ? 'Original' : '',
    observaciones: index === 0 ? upload.observations || 'Ninguna' : '',
  }));

  return (
    <div ref={ref} className="p-8 bg-white text-black font-sans text-xs">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#FDB913] rounded-md">
                <div className="text-2xl font-bold text-blue-900">CNE</div>
            </div>
            <div className="font-semibold text-blue-900">
              <div>CONSEJO NACIONAL ELECTORAL</div>
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-800">FORMATO DE TRANSFERENCIAS ARCHIVO GENERAL</h1>
        </header>

        {/* Date */}
        <div className="mb-4">
          <span className="font-bold">Fecha de pedido:</span> {currentDate}
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-500">
          <thead>
            <tr className="bg-blue-900 text-white text-[10px] text-center">
              <th className="border border-gray-500 p-1 font-bold">CAJA</th>
              <th className="border border-gray-500 p-1 font-bold">N. BIBLIORATO</th>
              <th className="border border-gray-500 p-1 font-bold">UNIDAD</th>
              <th className="border border-gray-500 p-1 font-bold">SERIE</th>
              <th className="border border-gray-500 p-1 font-bold">AÑO</th>
              <th className="border border-gray-500 p-1 font-bold">DESCRIPCIÓN</th>
              <th className="border border-gray-500 p-1 font-bold">N. SOLICITUD<br />(para uso del personal de Secretaría General)</th>
              <th className="border border-gray-500 p-1 font-bold">DESDE</th>
              <th className="border border-gray-500 p-1 font-bold">HASTA</th>
              <th className="border border-gray-500 p-1 font-bold">ORIGINAL O COPIA</th>
              <th className="border border-gray-500 p-1 font-bold">OBSERVACIONES</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, i) => (
              <tr key={i}>
                <td className="border border-gray-500 p-1 h-8">{row.caja}</td>
                <td className="border border-gray-500 p-1 h-8">{row.bibliorato}</td>
                <td className="border border-gray-500 p-1 h-8">{row.unidad}</td>
                <td className="border border-gray-500 p-1 h-8">{row.serie}</td>
                <td className="border border-gray-500 p-1 h-8">{row.año}</td>
                <td className="border border-gray-500 p-1 h-8">{row.descripcion}</td>
                <td className="border border-gray-500 p-1 h-8">{row.solicitud}</td>
                <td className="border border-gray-500 p-1 h-8">{row.desde}</td>
                <td className="border border-gray-500 p-1 h-8">{row.hasta}</td>
                <td className="border border-gray-500 p-1 h-8">{row.originalCopia}</td>
                <td className="border border-gray-500 p-1 h-8">{row.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <footer className="mt-20 text-center">
            <div className="inline-block border-t border-gray-500 px-4 pt-1">
                ING. NELSON RICARDO CARDENAS HERMOZA-TECNICO ELECTORAL 2
            </div>
        </footer>
      </div>
    </div>
  );
});

ActaPreview.displayName = 'ActaPreview';
