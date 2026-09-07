"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f7f6] px-4 py-12 text-center">
      <div className="w-full max-w-sm rounded-3xl border border-kumbu-100 bg-white p-8 shadow-sm">
        {/* Logo */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-kumbu-600 text-white text-xl font-bold shadow-sm">
          K
        </div>

        <h1 className="text-xl font-bold tracking-tight text-kumbu-900">
          Sem Ligação à Internet
        </h1>

        <p className="mt-2 text-xs leading-relaxed text-kumbu-600">
          O KUMBU protege os teus dados financeiros através de ligações seguras e directas com o servidor.
        </p>

        <p className="mt-2 text-[11px] text-kumbu-400">
          Verifica a tua ligação de dados móveis ou Wi-Fi para aceder à tua carteira e movimentos.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Tentar novamente
          </Button>

          <Link
            href="/"
            className="text-xs font-semibold text-kumbu-600 hover:text-kumbu-800 transition-colors py-1"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
