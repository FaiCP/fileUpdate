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
import { Upload as UploadIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Upload, User } from "@/lib/types";
import { useFirestore } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";

type FileUploadDialogProps = {
    currentUser: User;
};

const getFileTypeFromExtension = (fileName: string): Upload['fileType'] => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'pdf';
        case 'doc':
        case 'docx':
            return 'word';
        case 'xls':
        case 'xlsx':
            return 'excel';
        case 'zip':
            return 'zip';
        default:
            return 'otro';
    }
}

export function FileUploadDialog({ currentUser }: FileUploadDialogProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!firestore) {
            toast({ variant: "destructive", title: "Error", description: "El servicio de base de datos no está disponible." });
            return;
        }

        const formData = new FormData(e.currentTarget);
        
        if (!files || files.length === 0) {
            toast({ variant: "destructive", title: "Error", description: "Por favor, selecciona al menos un archivo para subir." });
            return;
        }
        
        const usage = formData.get('usage') as Upload['usage'];
        const description = formData.get('description') as string | undefined;
        const location = formData.get('location') as string;

        if (!location) {
            toast({ variant: "destructive", title: "Error", description: "Debes seleccionar una estantería y caja." });
            return;
        }

        const [shelf, box] = location.split('/');

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // 1. Subir el archivo físico al NAS (carpeta pendientes)
                const nasForm = new FormData();
                nasForm.append("file", file);
                const nasRes = await fetch("/api/nas-file", { method: "POST", body: nasForm });
                if (!nasRes.ok) {
                    const nasErr = await nasRes.json().catch(() => ({}));
                    throw new Error(nasErr.error || "No se pudo guardar el archivo en el servidor.");
                }

                // 2. Registrar el documento en Firestore
                const fileType = getFileTypeFromExtension(file.name);
                const newUploadData: Omit<Upload, 'id'> = {
                    userId: currentUser.id,
                    originalName: file.name,
                    fileType: fileType,
                    usage: usage,
                    description: description,
                    uploadDate: new Date().toISOString(),
                    status: 'PENDIENTE',
                    shelf: shelf.trim(),
                    box: box.trim(),
                };

                const uploadsCollectionRef = collection(firestore, 'users', currentUser.id, 'uploads');
                await addDoc(uploadsCollectionRef, newUploadData);
            }
            
            setIsOpen(false);
            setFiles(null);
            (e.target as HTMLFormElement).reset();

            toast({
                title: `Archivos Subidos (${files.length})`,
                description: `Tus archivos se han subido y están pendientes de revisión.`,
            });

        } catch (error) {
             toast({
                variant: "destructive",
                title: "Error al subir archivos",
                description: "No se pudieron guardar los archivos en la base de datos.",
            });
        }
    };

    const hasAssignedLocations = currentUser.assignedLocations && currentUser.assignedLocations.length > 0;

    console.log("Assigned locations:", currentUser.assignedLocations);
    console.log("Has assigned locations:", hasAssignedLocations);


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="text-base" onClick={() => setIsOpen(true)}>
                    <UploadIcon className="mr-2 h-5 w-5" />
                    Subir Archivo(s)
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Subir Nuevos Archivos</DialogTitle>
                <DialogDescription>
                    Completa los detalles y adjunta tus archivos. Serán revisados por un administrador.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Ubicación (Estantería / Caja)</Label>
                            <Select name="location" required disabled={!hasAssignedLocations}>
                                <SelectTrigger id="location">
                                    <SelectValue placeholder={hasAssignedLocations ? "Selecciona una ubicación" : "No tienes ubicaciones asignadas"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {currentUser.assignedLocations?.map((loc, index) => (
                                        <SelectItem key={index} value={`${loc.shelf} / ${loc.box}`}>
                                            Estantería: {loc.shelf} / Caja: {loc.box}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {!hasAssignedLocations && (
                                <p className="text-xs text-destructive">Contacta a un administrador para que te asigne una ubicación.</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 items-center gap-4">
                            <Label htmlFor="file-upload" className="font-medium">
                            Archivos
                            </Label>
                            <Input 
                                id="file-upload" 
                                type="file" 
                                required 
                                multiple
                                className="text-foreground" 
                                onChange={(e) => setFiles(e.target.files)}
                            />
                            {files && <div className="text-sm text-muted-foreground">{files.length} archivo(s) seleccionado(s)</div>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="usage">Uso del Archivo</Label>
                            <Select name="usage" required>
                                <SelectTrigger id="usage">
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
                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción (Opcional)</Label>
                            <Textarea name="description" id="description" placeholder="Añade una breve descripción del contenido de los archivos." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={!hasAssignedLocations}>Subir y Enviar a Revisión</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
