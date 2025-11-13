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
import type { Upload, UploadStatus } from "@/lib/types";
import { getUserById } from "@/lib/data";
import { Check, Send, X } from "lucide-react";
import { useState } from "react";

type FileReviewDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  upload: Upload;
  onUpdateStatus: (uploadId: number, status: UploadStatus, observaciones?: string) => void;
};

export function FileReviewDialog({ isOpen, setIsOpen, upload, onUpdateStatus }: FileReviewDialogProps) {
  const user = getUserById(upload.user_id);
  const [observaciones, setObservaciones] = useState(upload.observaciones || "");

  const handleAction = (status: UploadStatus) => {
    onUpdateStatus(upload.id, status, observaciones);
    setIsOpen(false);
  };
  
  const filePreviewUrl = `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Revisar Archivo</DialogTitle>
          <DialogDescription>
            {upload.original_name} - Subido por {user?.nombres} {user?.apellidos}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
            <div className="md:col-span-2 flex flex-col">
                <div className="border rounded-lg flex-1">
                     <iframe src={filePreviewUrl} className="w-full h-full" title={upload.original_name}></iframe>
                </div>
            </div>
            <div className="space-y-4 flex flex-col">
                <h3 className="font-semibold text-lg">Detalles y Acciones</h3>
                <div className="space-y-1 text-sm">
                    <p><strong className="font-medium">Usuario:</strong> {user?.nombres} {user?.apellidos}</p>
                    <p><strong className="font-medium">Departamento:</strong> {user?.departamento}</p>
                    <p><strong className="font-medium">Fecha de subida:</strong> {upload.fecha_subida}</p>
                    <p><strong className="font-medium">Uso:</strong> <span className="capitalize">{upload.uso}</span></p>
                </div>
                 <Separator />
                 <div className="space-y-2 flex-1 flex flex-col">
                    <Label htmlFor="observaciones" className="font-semibold">Observaciones</Label>
                    <Textarea 
                        id="observaciones" 
                        placeholder="Añadir comentarios para el usuario..." 
                        className="flex-1"
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                    />
                 </div>
                 <DialogFooter className="flex-col-reverse sm:flex-col-reverse sm:space-x-0 gap-2">
                    <Button onClick={() => handleAction("APROBADO")} className="w-full bg-green-600 hover:bg-green-700">
                        <Check className="mr-2 h-4 w-4" /> Aprobar y Generar Acta
                    </Button>
                    <Button onClick={() => handleAction("CORRECCIONES")} variant="outline" className="w-full">
                        <Send className="mr-2 h-4 w-4" /> Solicitar Correcciones
                    </Button>
                    <Button onClick={() => handleAction("RECHAZADO")} variant="destructive" className="w-full">
                        <X className="mr-2 h-4 w-4" /> Rechazar Archivo
                    </Button>
                 </DialogFooter>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
