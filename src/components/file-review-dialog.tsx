"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Upload, UploadStatus, User } from "@/lib/types";
import { Check, Send, X, Printer, Download, FileX } from "lucide-react";
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ApprovalCertificate } from "./approval-certificate";

type UploadWithUser = Upload & { user?: User };

type FileReviewDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  upload: UploadWithUser;
  onUpdateStatus: (upload: UploadWithUser, status: UploadStatus, observations?: string) => Promise<void>;
};

export function FileReviewDialog({ isOpen, setIsOpen, upload, onUpdateStatus }: FileReviewDialogProps) {
  const [observations, setObservations] = useState(upload.observations || "");
  const [locallyApproved, setLocallyApproved] = useState(upload.status === "APROBADO");
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => certRef.current,
    documentTitle: `acta-${upload.id}-${upload.user?.nombres}`,
  });

  const handleAction = async (status: UploadStatus) => {
    if (status === "APROBADO") setLocallyApproved(true);
    await onUpdateStatus(upload, status, observations);
  };

  const canPrint = locallyApproved || upload.status === "APROBADO";
  const isPdf = upload.fileType === "pdf";
  const previewUrl = `/api/nas-file?filename=${encodeURIComponent(upload.originalName)}`;
  const downloadUrl = previewUrl;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Revisión de Archivo</DialogTitle>
          <DialogDescription>
            {upload.originalName} — Subido por {upload.user?.nombres} {upload.user?.apellidos}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">

          {/* ── Left panel: actions ── */}
          <div className="md:col-span-1 flex flex-col space-y-4 overflow-y-auto pr-1">
            <h3 className="font-semibold text-lg">Acciones de Revisión</h3>

            <div className="space-y-1 text-sm">
              <p><strong className="font-medium">Usuario:</strong> {upload.user?.nombres} {upload.user?.apellidos}</p>
              <p><strong className="font-medium">Departamento:</strong> {upload.user?.department}</p>
              <p><strong className="font-medium">Fecha de subida:</strong> {upload.uploadDate}</p>
              <p><strong className="font-medium">Uso:</strong> <span className="capitalize">{upload.usage}</span></p>
              <p>
                <strong className="font-medium">Estantería:</strong> {upload.shelf || "—"}
                &nbsp;<strong className="font-medium">Caja:</strong> {upload.box || "—"}
              </p>
            </div>

            <Separator />

            <div className="space-y-2 flex-1 flex flex-col">
              <Label htmlFor="observations" className="font-semibold">
                Observaciones / Notas
              </Label>
              <Textarea
                id="observations"
                placeholder="Añadir comentarios o notas de revisión para el usuario..."
                className="flex-1 min-h-[120px]"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleAction("APROBADO")}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={canPrint && upload.status === "APROBADO"}
              >
                <Check className="mr-2 h-4 w-4" />
                {upload.status === "APROBADO" ? "Ya Aprobado" : "Aprobar Archivo"}
              </Button>

              <Button onClick={() => handleAction("CORRECCIONES")} variant="outline">
                <Send className="mr-2 h-4 w-4" /> Solicitar Correcciones
              </Button>

              <Button onClick={() => handleAction("RECHAZADO")} variant="destructive">
                <X className="mr-2 h-4 w-4" /> Rechazar Archivo
              </Button>

              <Separator />

              <Button onClick={handlePrint} variant="secondary" disabled={!canPrint}>
                <Printer className="mr-2 h-4 w-4" />
                {canPrint ? "Imprimir / Guardar Acta PDF" : "Aprobar para imprimir acta"}
              </Button>
            </div>
          </div>

          {/* ── Right panel: document preview ── */}
          <div className="md:col-span-2 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">Documento Original</h3>
              <Button asChild variant="outline" size="sm">
                <a href={downloadUrl} download={upload.originalName}>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar
                </a>
              </Button>
            </div>

            <div className="border rounded-lg flex-1 min-h-0 overflow-hidden bg-muted/30">
              {isPdf ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title={upload.originalName}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground p-8">
                  <FileX className="h-16 w-16 opacity-40" />
                  <p className="text-center text-sm">
                    La vista previa no está disponible para archivos de tipo{" "}
                    <strong>{upload.fileType}</strong>.
                  </p>
                  <Button asChild variant="outline">
                    <a href={downloadUrl} download={upload.originalName}>
                      <Download className="mr-2 h-4 w-4" />
                      Descargar archivo para revisar
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden certificate for printing — never visible on screen */}
        <div className="hidden">
          <ApprovalCertificate ref={certRef} upload={upload} user={upload.user} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
