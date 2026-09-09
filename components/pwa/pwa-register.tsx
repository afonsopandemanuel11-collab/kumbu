"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[KUMBU PWA] Service Worker activo:", registration.scope);
            // Verifica atualizações periodicamente
            registration.update().catch(() => {});
          })
          .catch((error) => {
            console.warn("[KUMBU PWA] Falha ao registar Service Worker:", error);
          });
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);

  return null;
}
