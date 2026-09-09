import { createClient } from "@/lib/supabase/client";
import {
  createIncome,
  createExpense,
  createTransfer,
  payDebt,
  contributeToGoal,
  createProjectTransaction,
} from "@/lib/services/transactions";
import { createDebt } from "@/lib/services/debts";
import {
  getPendingOperations,
  updateOperationStatus,
  recordOperationFailure,
  getQueueMetrics,
  cleanupOldSyncedOperations,
} from "../repositories/sync-queue";
import { updateOfflineTransactionStatus } from "../repositories/transactions";
import { setOfflineMetadata, getOfflineMetadata } from "../repositories/cache";
import { checkRealConnectivity, getIsOnline } from "./connectivity";
import type {
  SyncStatus,
  SyncQueueItem,
  CreateIncomePayload,
  CreateExpensePayload,
  CreateTransferPayload,
  ContributeGoalPayload,
  PayDebtPayload,
  CreateDebtPayload,
  CreateProjectTransactionPayload,
} from "../types";

type SyncListener = (status: SyncStatus, metrics: { pending: number; failed: number; total: number }) => void;

let isSyncInProgress = false;
const syncListeners: Set<SyncListener> = new Set();

/**
 * Notifica todos os observadores do estado atual da sincronização
 */
async function notifySyncState(status: SyncStatus) {
  const metrics = await getQueueMetrics();
  syncListeners.forEach((fn) => {
    try {
      fn(status, metrics);
    } catch (err) {
      console.error("[SyncEngine] Erro no ouvinte de sincronização:", err);
    }
  });
}

/**
 * Subscreve eventos de estado do motor de sincronização
 */
export function subscribeSyncState(listener: SyncListener): () => void {
  syncListeners.add(listener);
  // Notificação inicial imediata
  getQueueMetrics().then((metrics) => {
    const status: SyncStatus = !getIsOnline()
      ? "offline"
      : metrics.failed > 0
      ? "error"
      : metrics.pending > 0
      ? "pending"
      : "synced";
    listener(status, metrics);
  });

  return () => {
    syncListeners.delete(listener);
  };
}

/**
 * Executa uma operação individual no Supabase
 */
async function processSingleOperation(item: SyncQueueItem): Promise<void> {
  const supabase = createClient();

  switch (item.operation_type) {
    case "CREATE_INCOME": {
      const p = item.payload as CreateIncomePayload;
      await createIncome(supabase, {
        accountId: p.accountId,
        amount: p.amount,
        categoryId: p.categoryId,
        currency: p.currency,
        date: p.date,
        description: p.description,
      });
      break;
    }

    case "CREATE_EXPENSE": {
      const p = item.payload as CreateExpensePayload;
      await createExpense(supabase, {
        accountId: p.accountId,
        amount: p.amount,
        categoryId: p.categoryId,
        currency: p.currency,
        date: p.date,
        description: p.description,
      });
      break;
    }

    case "CREATE_TRANSFER": {
      const p = item.payload as CreateTransferPayload;
      await createTransfer(supabase, {
        accountId: p.accountId,
        destinationAccountId: p.destinationAccountId,
        amount: p.amount,
        date: p.date,
        description: p.description,
      });
      break;
    }

    case "CONTRIBUTE_GOAL": {
      const p = item.payload as ContributeGoalPayload;
      await contributeToGoal(supabase, {
        goalId: p.goalId,
        accountId: p.accountId,
        amount: p.amount,
        destinationAccountId: p.destinationAccountId,
        date: p.date,
        description: p.description,
      });
      break;
    }

    case "PAY_DEBT": {
      const p = item.payload as PayDebtPayload;
      await payDebt(supabase, {
        debtId: p.debtId,
        accountId: p.accountId,
        amount: p.amount,
        date: p.date,
        description: p.description,
      });
      break;
    }

    case "CREATE_DEBT": {
      const p = item.payload as CreateDebtPayload;
      await createDebt(supabase, {
        user_id: p.user_id,
        person_name: p.person_name,
        type: p.type,
        original_amount: p.original_amount,
        due_date: p.due_date,
        description: p.description,
      });
      break;
    }

    case "CREATE_PROJECT_TRANSACTION": {
      const p = item.payload as CreateProjectTransactionPayload;
      await createProjectTransaction(supabase, {
        userId: p.userId,
        projectId: p.projectId,
        accountId: p.accountId,
        type: p.type,
        amount: p.amount,
        categoryId: p.categoryId,
        currency: p.currency,
        date: p.date,
        description: p.description,
      });
      break;
    }

    default:
      throw new Error(`Tipo de operação desconhecido: ${(item as SyncQueueItem).operation_type}`);
  }
}

/**
 * Motor Principal de Sincronização
 * Processa a fila em ordem FIFO garantida, com idempotência e tolerância a falhas.
 */
export async function triggerSync(): Promise<void> {
  if (isSyncInProgress) {
    return;
  }

  const isOnline = await checkRealConnectivity();
  if (!isOnline) {
    await notifySyncState("offline");
    return;
  }

  const pendingItems = await getPendingOperations();
  if (pendingItems.length === 0) {
    const metrics = await getQueueMetrics();
    await notifySyncState(metrics.failed > 0 ? "error" : "synced");
    return;
  }

  isSyncInProgress = true;
  await notifySyncState("syncing");

  try {
    for (const item of pendingItems) {
      // Verifica novamente se a conectividade caiu a meio do processamento
      const stillOnline = getIsOnline();
      if (!stillOnline) {
        await notifySyncState("offline");
        break;
      }

      await updateOperationStatus(item.operation_id, "SYNCING");

      try {
        await processSingleOperation(item);

        // Sucesso
        await updateOperationStatus(item.operation_id, "SYNCED");
        await updateOfflineTransactionStatus(item.operation_id, "SYNCED");
        await setOfflineMetadata("last_synced_at", new Date().toISOString());
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Erro desconhecido na sincronização.";
        console.error(`[SyncEngine] Falha ao sincronizar operação ${item.operation_id}:`, errorMsg);

        // Se for erro de rede (fetch failed/offline), paramos o lote para tentar mais tarde
        const isNetworkError =
          errorMsg.toLowerCase().includes("fetch") ||
          errorMsg.toLowerCase().includes("network") ||
          errorMsg.toLowerCase().includes("failed to fetch");

        if (isNetworkError) {
          await recordOperationFailure(item.operation_id, "Erro de rede durante envio.");
          await notifySyncState("offline");
          break;
        } else {
          // Erro de validação ou regra de negócio — marca falha sem interromper a fila inteira
          await recordOperationFailure(item.operation_id, errorMsg);
          await updateOfflineTransactionStatus(item.operation_id, "FAILED");
        }
      }
    }

    // Limpeza periódica de itens sincronizados com mais de 7 dias
    await cleanupOldSyncedOperations(7);
  } finally {
    isSyncInProgress = false;
    const finalMetrics = await getQueueMetrics();
    const finalStatus: SyncStatus = !getIsOnline()
      ? "offline"
      : finalMetrics.failed > 0
      ? "error"
      : finalMetrics.pending > 0
      ? "pending"
      : "synced";
    await notifySyncState(finalStatus);
  }
}

/**
 * Retorna a data/hora da última sincronização bem-sucedida
 */
export async function getLastSyncedTime(): Promise<string | null> {
  return getOfflineMetadata<string>("last_synced_at");
}
