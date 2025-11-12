"use client";

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

export function FileUploadDialog() {
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // In a real app, you would handle form submission here.
        // For now, we just close the dialog and show a toast.
        
        // This is a bit of a trick to close the dialog.
        // In a real app, you'd control the 'open' state.
        document.getElementById('close-dialog-btn')?.click();

        toast({
            title: "Archivo Subido",
            description: "Tu archivo se ha subido y está pendiente de revisión.",
        });
    }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="text-base">
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
                <Label htmlFor="file-upload" className="sr-only">
                Archivo
                </Label>
                <Input id="file-upload" type="file" required className="text-foreground" />
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
                <Label htmlFor="departamento">Departamento (Opcional)</Label>
                <Input id="departamento" placeholder="Ej: Finanzas" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción (Opcional)</Label>
                <Textarea id="descripcion" placeholder="Añade una breve descripción del contenido del archivo." />
            </div>
            </div>
            <DialogFooter>
                <Button type="submit">Subir y Enviar a Revisión</Button>
            </DialogFooter>
        </form>
         <button id="close-dialog-btn" style={{ display: 'none' }} onClick={() => (document.querySelector('[data-radix-dialog-content]')?.parentNode as any)?.click()}></button>
      </DialogContent>
    </Dialog>
  );
}
