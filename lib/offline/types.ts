export type SyncStatus = "synced" | "syncing" | "pending" | "error" | "offline";

export type SyncQueueItemStatus = "PENDING" | "SYNCING" | "SYNCED" | "FAILED";

export type SyncOperationType =
  | "CREATE_INCOME"
  | "CREATE_EXPENSE"
  | "CREATE_TRANSFER"
  | "CONTRIBUTE_GOAL"
  | "PAY_DEBT"
  | "CREATE_DEBT"
  | "CREATE_PROJECT_TRANSACTION";

export interface CreateIncomePayload {
  accountId: string;
  amount: number;
  categoryId: string;
  currency?: string;
  date?: string;
  description?: string;
}

export interface CreateExpensePayload {
  accountId: string;
  amount: number;
  categoryId: string;
  currency?: string;
  date?: string;
  description?: string;
}

export interface CreateTransferPayload {
  accountId: string;
  destinationAccountId: string;
  amount: number;
  date?: string;
  description?: string;
}

export interface ContributeGoalPayload {
  goalId: string;
  accountId: string;
  amount: number;
  destinationAccountId?: string;
  date?: string;
  description?: string;
}

export interface PayDebtPayload {
  debtId: string;
  accountId: string;
  amount: number;
  date?: string;
  description?: string;
}

export interface CreateDebtPayload {
  user_id: string;
  person_name: string;
  type: "I_OWE" | "OWED_TO_ME";
  original_amount: number;
  due_date: string | null;
  description: string | null;
}

export interface CreateProjectTransactionPayload {
  userId: string;
  projectId: string;
  accountId: string;
  type: "PROJECT_INCOME" | "PROJECT_EXPENSE";
  amount: number;
  categoryId?: string | null;
  currency?: string;
  date?: string;
  description?: string;
}

export type SyncOperationPayload =
  | CreateIncomePayload
  | CreateExpensePayload
  | CreateTransferPayload
  | ContributeGoalPayload
  | PayDebtPayload
  | CreateDebtPayload
  | CreateProjectTransactionPayload;

export interface SyncQueueItem {
  operation_id: string; // UUID v4 (client_operation_id)
  operation_type: SyncOperationType;
  payload: SyncOperationPayload;
  status: SyncQueueItemStatus;
  retry_count: number;
  max_retries: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfflineTransaction {
  id: string;
  client_operation_id: string;
  account_id: string;
  destination_account_id?: string | null;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER" | "GOAL" | "DEBT" | "PROJECT";
  category_id?: string | null;
  category_name?: string | null;
  account_name?: string | null;
  destination_account_name?: string | null;
  description?: string | null;
  currency: string;
  transaction_date: string;
  created_at: string;
  sync_status: SyncQueueItemStatus;
}

export interface OfflineWallet {
  id: string;
  name: string;
  type: string;
  current_balance: number;
  currency: string;
  is_active: boolean;
  updated_at: string;
}

export interface OfflineCategory {
  id: string;
  name: string;
  kind: "INCOME" | "EXPENSE";
  icon?: string | null;
  color?: string | null;
  is_active: boolean;
}

export interface OfflineGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string | null;
  status: string;
}

export interface OfflineDebt {
  id: string;
  person_name: string;
  type: "I_OWE" | "OWED_TO_ME";
  original_amount: number;
  remaining_amount: number;
  status: string;
}

export interface OfflineProject {
  id: string;
  name: string;
  status: string;
}

export interface OfflineMetadata {
  last_synced_at: string | null;
  last_cache_update: string | null;
}
