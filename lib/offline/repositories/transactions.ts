import { STORES, idbGet, idbGetAll, idbPut, isIndexedDBAvailable } from "../db";
import type { OfflineTransaction, SyncQueueItemStatus } from "../types";

/**
 * Guarda ou atualiza uma transação offline no IndexedDB
 */
export async function saveOfflineTransaction(tx: OfflineTransaction): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  await idbPut<OfflineTransaction>(STORES.TRANSACTIONS, tx);
}

/**
 * Obtém uma transação por client_operation_id
 */
export async function getOfflineTransaction(
  clientOperationId: string
): Promise<OfflineTransaction | undefined> {
  if (!isIndexedDBAvailable()) return undefined;
  return idbGet<OfflineTransaction>(STORES.TRANSACTIONS, clientOperationId);
}

/**
 * Lista todas as transações guardadas localmente, ordenadas da mais recente para a mais antiga
 */
export async function getOfflineTransactions(): Promise<OfflineTransaction[]> {
  if (!isIndexedDBAvailable()) return [];
  const all = await idbGetAll<OfflineTransaction>(STORES.TRANSACTIONS);
  return all.sort(
    (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
  );
}

/**
 * Atualiza o status de sincronização de uma transação local
 */
export async function updateOfflineTransactionStatus(
  clientOperationId: string,
  status: SyncQueueItemStatus
): Promise<void> {
  if (!isIndexedDBAvailable()) return;

  const tx = await idbGet<OfflineTransaction>(STORES.TRANSACTIONS, clientOperationId);
  if (!tx) return;

  tx.sync_status = status;
  await idbPut<OfflineTransaction>(STORES.TRANSACTIONS, tx);
}
