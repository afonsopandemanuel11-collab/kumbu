"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg";
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "sm",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWClass =
    maxWidth === "sm"
      ? "max-w-md"
      : maxWidth === "md"
        ? "max-w-lg"
        : "max-w-2xl";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        className={cn(
          "relative z-10 w-full bg-white shadow-xl",
          "rounded-t-3xl sm:rounded-2xl",
          "max-h-[92dvh] overflow-y-auto",
          maxWClass,
        )}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-kumbu-200" />
        </div>

        <div className="px-5 pb-6 pt-4 sm:p-6">
          {(title || description) && (
            <div className="mb-5">
              {title && (
                <h2
                  id="modal-title"
                  className="text-base font-semibold text-kumbu-900"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-kumbu-500">{description}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
