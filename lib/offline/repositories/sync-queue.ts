import { STORES, idbGet, idbGetAll, idbPut, idbDelete, idbCount, isIndexedDBAvailable } from "../db";
import type { SyncQueueItem, SyncQueueItemStatus, SyncOperationType, SyncOperationPayload } from "../types";

const MAX_DEFAULT_RETRIES = 5;

/**
 * Adiciona uma nova operação financeira à fila de sincronização
 */
export async function enqueueOperation(
  operationType: SyncOperationType,
  payload: SyncOperationPayload,
  clientOperationId?: string
): Promise<SyncQueueItem> {
  if (!isIndexedDBAvailable()) {
    throw new Error("Armazenamento offline indisponível no navegador.");
  }

  const operationId = clientOperationId || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  const now = new Date().toISOString();

  const item: SyncQueueItem = {
    operation_id: operationId,
    operation_type: operationType,
    payload,
    status: "PENDING",
    retry_count: 0,
    max_retries: MAX_DEFAULT_RETRIES,
    last_error: null,
    created_at: now,
    updated_at: now,
  };

  await idbPut<SyncQueueItem>(STORES.SYNC_QUEUE, item);
  return item;
}

/**
 * Retorna todas as operações pendentes ordenadas cronologicamente (FIFO)
 */
export async function getPendingOperations(): Promise<SyncQueueItem[]> {
  if (!isIndexedDBAvailable()) return [];

  try {
    const items = await idbGetAll<SyncQueueItem>(STORES.SYNC_QUEUE, "by_status", IDBKeyRange.only("PENDING"));
    return items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } catch {
    // Fallback: carregar tudo e filtrar caso índice esteja a atualizar
    const all = await idbGetAll<SyncQueueItem>(STORES.SYNC_QUEUE);
    return all
      .filter((item) => item.status === "PENDING")
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }
}

/**
 * Retorna todas as operações da fila para auditoria e interface
 */
export async function getAllQueueOperations(): Promise<SyncQueueItem[]> {
  if (!isIndexedDBAvailable()) return [];
  const items = await idbGetAll<SyncQueueItem>(STORES.SYNC_QUEUE);
  return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Atualiza o estado de uma operação na fila
 */
export async function updateOperationStatus(
  operationId: string,
  status: SyncQueueItemStatus,
  lastError: string | null = null
): Promise<void> {
  if (!isIndexedDBAvailable()) return;

  const item = await idbGet<SyncQueueItem>(STORES.SYNC_QUEUE, operationId);
  if (!item) return;

  item.status = status;
  item.last_error = lastError;
  item.updated_at = new Date().toISOString();

  await idbPut<SyncQueueItem>(STORES.SYNC_QUEUE, item);
}

/**
 * Regista uma tentativa falhada com incremento de retry e tolerância máxima
 */
export async function recordOperationFailure(
  operationId: string,
  errorMessage: string
): Promise<SyncQueueItem | null> {
  if (!isIndexedDBAvailable()) return null;

  const item = await idbGet<SyncQueueItem>(STORES.SYNC_QUEUE, operationId);
  if (!item) return null;

  item.retry_count += 1;
  item.last_error = errorMessage;
  item.updated_at = new Date().toISOString();

  if (item.retry_count >= item.max_retries) {
    item.status = "FAILED";
  } else {
    item.status = "PENDING";
  }

  await idbPut<SyncQueueItem>(STORES.SYNC_QUEUE, item);
  return item;
}

/**
 * Força reprocessamento de operações que falharam (manual retry)
 */
export async function retryFailedOperations(): Promise<void> {
  if (!isIndexedDBAvailable()) return;

  const all = await idbGetAll<SyncQueueItem>(STORES.SYNC_QUEUE);
  const failed = all.filter((i) => i.status === "FAILED");

  for (const item of failed) {
    item.status = "PENDING";
    item.retry_count = 0;
    item.last_error = null;
    item.updated_at = new Date().toISOString();
    await idbPut<SyncQueueItem>(STORES.SYNC_QUEUE, item);
  }
}

/**
 * Retorna contagem de operações pendentes e com erro
 */
export async function getQueueMetrics(): Promise<{ pending: number; failed: number; total: number }> {
  if (!isIndexedDBAvailable()) return { pending: 0, failed: 0, total: 0 };

  try {
    const all = await idbGetAll<SyncQueueItem>(STORES.SYNC_QUEUE);
    const pending = all.filter((i) => i.status === "PENDING" || i.status === "SYNCING").length;
    const failed = all.filter((i) => i.status === "FAILED").length;
    return { pending, failed, total: all.length };
  } catch {
    return { pending: 0, failed: 0, total: 0 };
  }
}

/**
 * Limpa itens já sincronizados (SYNCED) mais antigos que N dias para evitar consumo de memória
 */
export async function cleanupOldSyncedOperations(days = 7): Promise<number> {
  if (!isIndexedDBAvailable()) return 0;

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const all = await idbGetAll<SyncQueueItem>(STORES.SYNC_QUEUE);

  let removed = 0;
  for (const item of all) {
    if (item.status === "SYNCED" && new Date(item.updated_at).getTime() < cutoff) {
      await idbDelete(STORES.SYNC_QUEUE, item.operation_id);
      removed++;
    }
  }

  return removed;
}
