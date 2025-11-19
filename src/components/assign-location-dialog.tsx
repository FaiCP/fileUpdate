
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { User, AssignedLocation } from "@/lib/types";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

type AssignLocationDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: User;
  onUpdateLocations: (userId: string, locations: AssignedLocation[]) => Promise<void>;
};

export function AssignLocationDialog({ isOpen, setIsOpen, user, onUpdateLocations }: AssignLocationDialogProps) {
    const { toast } = useToast();
    
    // El estado local se deriva directamente de las props. No necesita su propio 'useEffect'.
    const currentLocations = user.assignedLocations || [];
    
    const [newShelf, setNewShelf] = useState("");
    const [newBox, setNewBox] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddLocation = () => {
        if (!newShelf || !newBox) {
            toast({ variant: "destructive", title: "Campos incompletos", description: "Debes especificar la estantería y la caja." });
            return;
        }
        const newLocation = { shelf: newShelf, box: newBox };
        
        if (currentLocations.some(loc => loc.shelf === newShelf && loc.box === newBox)) {
            toast({ variant: "destructive", title: "Ubicación duplicada", description: "Esta estantería y caja ya han sido asignadas." });
            return;
        }
        
        const updatedLocations = [...currentLocations, newLocation];
        onUpdateLocations(user.id, updatedLocations);
        
        setNewShelf("");
        setNewBox("");
    };

    const handleRemoveLocation = (index: number) => {
        const updatedLocations = currentLocations.filter((_, i) => i !== index);
        onUpdateLocations(user.id, updatedLocations);
    };
    
    // El guardado se hace inmediatamente al añadir o quitar, ya no se necesita un botón de "Guardar Cambios" general.
    // Opcionalmente, se puede mantener si se prefiere guardar en lote. Por ahora, lo eliminamos por simplicidad.
    const handleClose = () => {
      // Limpia los campos de texto al cerrar
      setNewShelf("");
      setNewBox("");
      setIsOpen(false);
    }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Ubicaciones a {user.nombres}</DialogTitle>
          <DialogDescription>
            Añade o elimina las estanterías y cajas disponibles para este usuario. Los cambios se guardan automáticamente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>Ubicaciones Asignadas</Label>
                <div className="rounded-md border p-2 min-h-[60px] space-y-2">
                    {currentLocations.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">No hay ubicaciones asignadas.</p>
                    ) : (
                        currentLocations.map((loc, index) => (
                            <Badge key={index} variant="secondary" className="mr-2 p-2 justify-between w-full">
                                <span>Estantería: <strong>{loc.shelf}</strong> / Caja: <strong>{loc.box}</strong></span>
                                <button onClick={() => handleRemoveLocation(index)} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="shelf">Nueva Estantería</Label>
                    <Input id="shelf" value={newShelf} onChange={(e) => setNewShelf(e.target.value)} placeholder="Ej: A-01" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="box">Nueva Caja</Label>
                    <Input id="box" value={newBox} onChange={(e) => setNewBox(e.target.value)} placeholder="Ej: C-12" />
                </div>
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={handleAddLocation}>Añadir Ubicación</Button>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={handleClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
