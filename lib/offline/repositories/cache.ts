import { STORES, idbGetAll, idbPutMany, idbGet, idbPut, isIndexedDBAvailable } from "../db";
import type {
  OfflineWallet,
  OfflineCategory,
  OfflineGoal,
  OfflineDebt,
  OfflineProject,
} from "../types";

/**
 * Cache de Carteiras
 */
export async function cacheWallets(wallets: OfflineWallet[]): Promise<void> {
  if (!isIndexedDBAvailable() || !wallets.length) return;
  await idbPutMany(STORES.WALLETS, wallets);
}

export async function getCachedWallets(): Promise<OfflineWallet[]> {
  if (!isIndexedDBAvailable()) return [];
  const items = await idbGetAll<OfflineWallet>(STORES.WALLETS);
  return items.filter((w) => w.is_active);
}

/**
 * Ajusta o saldo de uma carteira localmente (Optimistic UI)
 */
export async function adjustCachedWalletBalance(
  walletId: string,
  amountChange: number
): Promise<void> {
  if (!isIndexedDBAvailable()) return;

  const wallet = await idbGet<OfflineWallet>(STORES.WALLETS, walletId);
  if (!wallet) return;

  wallet.current_balance = (wallet.current_balance || 0) + amountChange;
  wallet.updated_at = new Date().toISOString();
  await idbPut(STORES.WALLETS, wallet);
}

/**
 * Cache de Categorias
 */
export async function cacheCategories(categories: OfflineCategory[]): Promise<void> {
  if (!isIndexedDBAvailable() || !categories.length) return;
  await idbPutMany(STORES.CATEGORIES, categories);
}

export async function getCachedCategories(): Promise<OfflineCategory[]> {
  if (!isIndexedDBAvailable()) return [];
  const items = await idbGetAll<OfflineCategory>(STORES.CATEGORIES);
  return items.filter((c) => c.is_active);
}

/**
 * Cache de Metas
 */
export async function cacheGoals(goals: OfflineGoal[]): Promise<void> {
  if (!isIndexedDBAvailable() || !goals.length) return;
  await idbPutMany(STORES.GOALS, goals);
}

export async function getCachedGoals(): Promise<OfflineGoal[]> {
  if (!isIndexedDBAvailable()) return [];
  const items = await idbGetAll<OfflineGoal>(STORES.GOALS);
  return items.filter((g) => g.status === "ACTIVE");
}

/**
 * Cache de Dívidas
 */
export async function cacheDebts(debts: OfflineDebt[]): Promise<void> {
  if (!isIndexedDBAvailable() || !debts.length) return;
  await idbPutMany(STORES.DEBTS, debts);
}

export async function getCachedDebts(): Promise<OfflineDebt[]> {
  if (!isIndexedDBAvailable()) return [];
  const items = await idbGetAll<OfflineDebt>(STORES.DEBTS);
  return items.filter((d) => d.status === "OPEN" || d.status === "PARTIALLY_PAID");
}

/**
 * Cache de Projectos
 */
export async function cacheProjects(projects: OfflineProject[]): Promise<void> {
  if (!isIndexedDBAvailable() || !projects.length) return;
  await idbPutMany(STORES.PROJECTS, projects);
}

export async function getCachedProjects(): Promise<OfflineProject[]> {
  if (!isIndexedDBAvailable()) return [];
  const items = await idbGetAll<OfflineProject>(STORES.PROJECTS);
  return items.filter((p) => p.status === "ACTIVE");
}

/**
 * Metadados de sincronização (ex: last_synced_at)
 */
export async function setOfflineMetadata(key: string, value: unknown): Promise<void> {
  if (!isIndexedDBAvailable()) return;
  await idbPut(STORES.METADATA, { key, value, updated_at: new Date().toISOString() });
}

export async function getOfflineMetadata<T>(key: string): Promise<T | null> {
  if (!isIndexedDBAvailable()) return null;
  const item = await idbGet<{ key: string; value: T }>(STORES.METADATA, key);
  return item ? item.value : null;
}
