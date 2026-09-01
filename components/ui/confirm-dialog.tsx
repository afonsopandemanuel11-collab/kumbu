"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
  loading?: boolean;
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} maxWidth="sm">
      <div className="mt-4 flex gap-3 sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1 sm:flex-none">
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={loading} className="flex-1 sm:flex-none">
          {loading ? "A processar..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
