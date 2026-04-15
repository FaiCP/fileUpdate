"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Printer } from "lucide-react";
import type { Upload, User } from "@/lib/types";
import { ApprovalCertificate } from "./approval-certificate";

type UserCertificateDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  upload: Upload;
  user: User;
};

export function UserCertificateDialog({ isOpen, setIsOpen, upload, user }: UserCertificateDialogProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => certRef.current,
    documentTitle: `acta-aprobacion-${upload.id}`,
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-6">
            <DialogTitle>Acta de Aprobación</DialogTitle>
            <Button onClick={handlePrint} size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir / Guardar PDF
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto border rounded-lg p-6 bg-white">
          <ApprovalCertificate ref={certRef} upload={upload} user={user} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
