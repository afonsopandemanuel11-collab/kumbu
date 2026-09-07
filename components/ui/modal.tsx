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
          "relative z-10 w-full bg-white shadow-2xl",
          "rounded-t-3xl sm:rounded-2xl",
          "max-h-[88dvh] sm:max-h-[85vh] overflow-y-auto overscroll-contain",
          maxWClass,
        )}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-kumbu-200" />
        </div>

        <div className="px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-base font-bold text-kumbu-900"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-kumbu-500">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar modal"
              className="rounded-xl p-1.5 text-kumbu-400 hover:bg-kumbu-50 hover:text-kumbu-700 transition-colors shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
