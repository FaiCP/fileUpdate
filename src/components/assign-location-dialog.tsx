
"use client";

import { useState, useEffect } from "react";
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
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

type AssignLocationDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: User;
};

export function AssignLocationDialog({ isOpen, setIsOpen, user }: AssignLocationDialogProps) {
    const { toast } = useToast();
    const firestore = useFirestore();
    
    const [locations, setLocations] = useState<AssignedLocation[]>([]);
    const [newShelf, setNewShelf] = useState("");
    const [newBox, setNewBox] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user?.assignedLocations) {
            setLocations(user.assignedLocations);
        } else {
            setLocations([]);
        }
    }, [user]);

    const handleAddLocation = () => {
        if (!newShelf || !newBox) {
            toast({ variant: "destructive", title: "Campos incompletos", description: "Debes especificar la estantería y la caja." });
            return;
        }
        const newLocation = { shelf: newShelf, box: newBox };
        // Check for duplicates
        if (locations.some(loc => loc.shelf === newShelf && loc.box === newBox)) {
            toast({ variant: "destructive", title: "Ubicación duplicada", description: "Esta estantería y caja ya han sido asignadas." });
            return;
        }
        setLocations(prev => [...prev, newLocation]);
        setNewShelf("");
        setNewBox("");
    };

    const handleRemoveLocation = (index: number) => {
        setLocations(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleSaveChanges = async () => {
        if (!firestore) return;
        setIsSubmitting(true);
        try {
            const userRef = doc(firestore, "users", user.id);
            await updateDoc(userRef, { assignedLocations: locations });
            toast({ title: "Ubicaciones actualizadas", description: `Se guardaron las nuevas ubicaciones para ${user.nombres}.` });
            setIsOpen(false);
        } catch (error) {
            console.error("Error updating locations:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudieron guardar los cambios." });
        } finally {
            setIsSubmitting(false);
        }
    };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Ubicaciones a {user.nombres}</DialogTitle>
          <DialogDescription>
            Añade o elimina las estanterías y cajas disponibles para este usuario.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label>Ubicaciones Asignadas</Label>
                <div className="rounded-md border p-2 min-h-[60px] space-y-2">
                    {locations.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-2">No hay ubicaciones asignadas.</p>
                    ) : (
                        locations.map((loc, index) => (
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
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveChanges} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
