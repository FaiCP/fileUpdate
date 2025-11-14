"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { Upload, UploadStatus, User } from "@/lib/types";
import { Check, Send, X, Printer } from "lucide-react";
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { ActaPreview } from "./acta-preview";

type UploadWithUser = Upload & { user?: User };

type FileReviewDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  upload: UploadWithUser;
  onUpdateStatus: (upload: UploadWithUser, status: UploadStatus, observations?: string) => Promise<void>;
};

export function FileReviewDialog({ isOpen, setIsOpen, upload, onUpdateStatus }: FileReviewDialogProps) {
  const [observations, setObservations] = useState(upload.observations || "");
  const actaRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => actaRef.current,
    documentTitle: `acta-${upload.id}-${upload.user?.firstName}`,
    onAfterPrint: () => console.log("printed"),
  });


  const handleAction = async (status: UploadStatus) => {
    await onUpdateStatus(upload, status, observations);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-6xl h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Revisar Archivo y Generar Acta</DialogTitle>
          <DialogDescription>
            {upload.originalName} - Subido por {upload.user?.firstName} {upload.user?.lastName}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
            <div className="md:col-span-1 flex flex-col space-y-4">
                <h3 className="font-semibold text-lg">Acciones de Revisión</h3>
                 <div className="space-y-1 text-sm">
                    <p><strong className="font-medium">Usuario:</strong> {upload.user?.firstName} {upload.user?.lastName}</p>
                    <p><strong className="font-medium">Departamento:</strong> {upload.user?.department}</p>
                    <p><strong className="font-medium">Fecha de subida:</strong> {upload.uploadDate}</p>
                    <p><strong className="font-medium">Uso:</strong> <span className="capitalize">{upload.usage}</span></p>
                </div>
                 <Separator />
                 <div className="space-y-2 flex-1 flex flex-col">
                    <Label htmlFor="observations" className="font-semibold">Observaciones</Label>
                    <Textarea 
                        id="observations" 
                        placeholder="Añadir comentarios para el usuario... (visibles si se solicitan correcciones)" 
                        className="flex-1"
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                    />
                 </div>
                 <div className="flex flex-col gap-2">
                    <Button onClick={() => handleAction("CORRECCIONES")} variant="outline">
                        <Send className="mr-2 h-4 w-4" /> Solicitar Correcciones
                    </Button>
                    <Button onClick={() => handleAction("RECHAZADO")} variant="destructive">
                        <X className="mr-2 h-4 w-4" /> Rechazar Archivo
                    </Button>
                 </div>
            </div>
            <div className="md:col-span-1 flex flex-col space-y-4">
                 <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Vista Previa del Acta</h3>
                    <Button onClick={handlePrint} variant="outline" size="sm" disabled={upload.status !== 'APROBADO'}>
                        <Printer className="mr-2 h-4 w-4" /> Imprimir / Guardar PDF
                    </Button>
                 </div>
                <div className="border rounded-lg flex-1 overflow-auto p-4 bg-white">
                     <ActaPreview ref={actaRef} upload={upload} user={upload.user}/>
                </div>
                 <DialogFooter>
                    <Button onClick={() => handleAction("APROBADO")} className="w-full bg-green-600 hover:bg-green-700">
                        <Check className="mr-2 h-4 w-4" /> Aprobar y Habilitar Impresión de Acta
                    </Button>
                 </DialogFooter>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
