"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { SyncStatus } from "../types";
import {
  initConnectivityWatcher,
  subscribeConnectivity,
  getIsOnline,
} from "../sync/connectivity";
import {
  triggerSync,
  subscribeSyncState,
  getLastSyncedTime,
} from "../sync/engine";
import { retryFailedOperations, getQueueMetrics } from "../repositories/sync-queue";

interface OfflineSyncContextValue {
  syncStatus: SyncStatus;
  isOnline: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncedAt: string | null;
  syncNow: () => Promise<void>;
  retryFailed: () => Promise<void>;
}

const OfflineSyncContext = createContext<OfflineSyncContextValue | undefined>(undefined);

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [failedCount, setFailedCount] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Inicializa monitor de conectividade
  useEffect(() => {
    const cleanupWatcher = initConnectivityWatcher();
    const cleanupConnSub = subscribeConnectivity((online) => {
      setIsOnline(online);
      if (online) {
        // Ao reconectar, dispara sincronização automática imediatamente
        triggerSync().catch(console.error);
      }
    });

    const cleanupSyncSub = subscribeSyncState((status, metrics) => {
      setSyncStatus(status);
      setPendingCount(metrics.pending);
      setFailedCount(metrics.failed);
      getLastSyncedTime().then(setLastSyncedAt).catch(console.error);
    });

    // Carga inicial do timestamp
    getLastSyncedTime().then(setLastSyncedAt).catch(console.error);
    getQueueMetrics().then((m) => {
      setPendingCount(m.pending);
      setFailedCount(m.failed);
    }).catch(console.error);

    return () => {
      cleanupWatcher();
      cleanupConnSub();
      cleanupSyncSub();
    };
  }, []);

  const syncNow = useCallback(async () => {
    await triggerSync();
  }, []);

  const retryFailed = useCallback(async () => {
    await retryFailedOperations();
    await triggerSync();
  }, []);

  return (
    <OfflineSyncContext.Provider
      value={{
        syncStatus,
        isOnline,
        pendingCount,
        failedCount,
        lastSyncedAt,
        syncNow,
        retryFailed,
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
}

export function useOfflineSync() {
  const ctx = useContext(OfflineSyncContext);
  if (!ctx) {
    throw new Error("useOfflineSync deve ser utilizado dentro de um OfflineSyncProvider");
  }
  return ctx;
}
