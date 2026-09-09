"use client";

import React, { useState } from "react";
import { useOfflineSync } from "@/lib/offline/context/offline-sync-context";

export function SyncStatusBadge() {
  const {
    syncStatus,
    isOnline,
    pendingCount,
    failedCount,
    lastSyncedAt,
    syncNow,
    retryFailed,
  } = useOfflineSync();

  const [isOpen, setIsOpen] = useState(false);
  const [isSyncingManual, setIsSyncingManual] = useState(false);

  const handleManualSync = async () => {
    setIsSyncingManual(true);
    try {
      if (failedCount > 0) {
        await retryFailed();
      } else {
        await syncNow();
      }
    } finally {
      setIsSyncingManual(false);
    }
  };

  const formattedLastSync = lastSyncedAt
    ? new Intl.DateTimeFormat("pt-AO", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "short",
      }).format(new Date(lastSyncedAt))
    : "Ainda não sincronizado";

  return (
    <div className="relative inline-block text-left">
      {/* Badge Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs border border-slate-200 dark:border-slate-700 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-hidden"
        title="Estado da ligação e sincronização"
      >
        {syncStatus === "syncing" && (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-amber-700 dark:text-amber-300 font-semibold text-[11px] sm:text-xs">
              A sincronizar...
            </span>
          </>
        )}

        {syncStatus === "pending" && (
          <>
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <span className="text-amber-700 dark:text-amber-300 font-medium text-[11px] sm:text-xs">
              {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
            </span>
          </>
        )}

        {syncStatus === "error" && (
          <>
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            <span className="text-rose-600 dark:text-rose-400 font-medium text-[11px] sm:text-xs">
              Erro de envio
            </span>
          </>
        )}

        {syncStatus === "offline" && (
          <>
            <span className="h-2 w-2 rounded-full bg-slate-400"></span>
            <span className="text-slate-600 dark:text-slate-300 font-medium text-[11px] sm:text-xs">
              Offline
            </span>
          </>
        )}

        {syncStatus === "synced" && (
          <>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-700 dark:text-emerald-300 font-medium text-[11px] sm:text-xs hidden min-[400px]:inline">
              Sincronizado
            </span>
          </>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200/80 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Estado KUMBU 2.0
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  isOnline
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {isOnline ? "Ligação Ativa" : "Sem Internet"}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex justify-between items-center py-1">
                <span>Última sincronização:</span>
                <span className="font-medium text-slate-900 dark:text-white text-right">
                  {formattedLastSync}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span>Operações pendentes:</span>
                <span className={`font-semibold ${pendingCount > 0 ? "text-amber-600" : "text-slate-900 dark:text-white"}`}>
                  {pendingCount}
                </span>
              </div>

              {failedCount > 0 && (
                <div className="flex justify-between items-center py-1 text-rose-600 dark:text-rose-400">
                  <span>Falhas registadas:</span>
                  <span className="font-bold">{failedCount}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={!isOnline || isSyncingManual || syncStatus === "syncing"}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-medium shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isSyncingManual || syncStatus === "syncing" ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    A sincronizar...
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {failedCount > 0 ? "Tentar enviar falhas" : "Sincronizar agora"}
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
