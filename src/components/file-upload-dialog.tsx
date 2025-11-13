"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Upload as UploadType } from "@/lib/types";

type FileUploadDialogProps = {
    onUploadComplete: (uploadData: Omit<UploadType, 'id' | 'user_id' | 'fecha_subida' | 'estado'> & { original_name: string }) => void;
};

export function FileUploadDialog({ onUploadComplete }: FileUploadDialogProps) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        if (!file) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Por favor, selecciona un archivo para subir.",
            });
            return;
        }

        const newUploadData = {
            original_name: file.name,
            tipo_archivo: formData.get('tipo_archivo') as UploadType['tipo_archivo'],
            uso: formData.get('uso') as UploadType['uso'],
            descripcion: formData.get('descripcion') as string | undefined,
        };

        onUploadComplete(newUploadData);
        
        setIsOpen(false);
        setFile(null);
        (e.target as HTMLFormElement).reset();

        toast({
            title: "Archivo Subido",
            description: "Tu archivo se ha subido y está pendiente de revisión.",
        });
    }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="text-base" onClick={() => setIsOpen(true)}>
          <Upload className="mr-2 h-5 w-5" />
          Subir Archivo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Subir Nuevo Archivo</DialogTitle>
          <DialogDescription>
            Completa los detalles y adjunta tu archivo. Será revisado por un administrador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 items-center gap-4">
                <Label htmlFor="file-upload" className="font-medium">
                Archivo
                </Label>
                <Input 
                    id="file-upload" 
                    type="file" 
                    required 
                    className="text-foreground" 
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="tipo_archivo">Tipo de Archivo</Label>
                    <Select name="tipo_archivo" required>
                        <SelectTrigger id="tipo_archivo">
                        <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="word">Word</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="zip">ZIP</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="uso">Uso del Archivo</Label>
                     <Select name="uso" required>
                        <SelectTrigger id="uso">
                        <SelectValue placeholder="Selecciona un uso" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="acta">Acta</SelectItem>
                        <SelectItem value="contrato">Contrato</SelectItem>
                        <SelectItem value="memorando">Memorando</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción (Opcional)</Label>
                <Textarea name="descripcion" id="descripcion" placeholder="Añade una breve descripción del contenido del archivo." />
            </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button type="submit">Subir y Enviar a Revisión</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
