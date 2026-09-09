/**
 * KUMBU 2.0 - IndexedDB Native Storage Engine
 * Fornece persistência local assíncrona baseada em Promises nativas,
 * sem dependências externas, segura para dados financeiros.
 */

const DB_NAME = "kumbu_offline_db";
const DB_VERSION = 1;

export const STORES = {
  TRANSACTIONS: "transactions",
  SYNC_QUEUE: "sync_queue",
  WALLETS: "wallets",
  CATEGORIES: "categories",
  GOALS: "goals",
  DEBTS: "debts",
  PROJECTS: "projects",
  METADATA: "metadata",
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

export function isIndexedDBAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

export function openKumbuDB(): Promise<IDBDatabase> {
  if (!isIndexedDBAvailable()) {
    return Promise.reject(new Error("IndexedDB não está disponível neste ambiente."));
  }

  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Transactions Store (key: client_operation_id)
      if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
        const txStore = db.createObjectStore(STORES.TRANSACTIONS, {
          keyPath: "client_operation_id",
        });
        txStore.createIndex("by_account", "account_id", { unique: false });
        txStore.createIndex("by_date", "transaction_date", { unique: false });
        txStore.createIndex("by_sync_status", "sync_status", { unique: false });
      }

      // 2. Sync Queue Store (key: operation_id)
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const queueStore = db.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: "operation_id",
        });
        queueStore.createIndex("by_status", "status", { unique: false });
        queueStore.createIndex("by_created_at", "created_at", { unique: false });
      }

      // 3. Master Data Stores
      if (!db.objectStoreNames.contains(STORES.WALLETS)) {
        db.createObjectStore(STORES.WALLETS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
        const catStore = db.createObjectStore(STORES.CATEGORIES, { keyPath: "id" });
        catStore.createIndex("by_kind", "kind", { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.GOALS)) {
        db.createObjectStore(STORES.GOALS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORES.DEBTS)) {
        db.createObjectStore(STORES.DEBTS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        db.createObjectStore(STORES.PROJECTS, { keyPath: "id" });
      }

      // 4. Metadata Store
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: "key" });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;

      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
        dbPromise = null;
      };

      dbInstance.onclose = () => {
        dbInstance = null;
        dbPromise = null;
      };

      resolve(dbInstance);
    };

    request.onerror = (event) => {
      dbPromise = null;
      const error = (event.target as IDBOpenDBRequest).error;
      reject(error || new Error("Erro ao abrir IndexedDB"));
    };

    request.onblocked = () => {
      console.warn("[IndexedDB] Base de dados bloqueada por versão anterior aberta.");
    };
  });

  return dbPromise;
}

/**
 * Executa uma transação genérica no IndexedDB
 */
export async function executeTx<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T> {
  const db = await openKumbuDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);

    let result: T;

    tx.oncomplete = () => {
      resolve(result);
    };

    tx.onerror = () => {
      reject(tx.error || new Error(`Erro na transação de ${storeName}`));
    };

    tx.onabort = () => {
      reject(tx.error || new Error(`Transação abortada em ${storeName}`));
    };

    try {
      const req = callback(store);
      if (req) {
        req.onsuccess = () => {
          result = req.result;
        };
      }
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Operações CRUD primitivas em stores
 */
export async function idbGet<T>(storeName: StoreName, key: IDBValidKey): Promise<T | undefined> {
  const db = await openKumbuDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.get(key);

    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function idbGetAll<T>(
  storeName: StoreName,
  indexName?: string,
  query?: IDBValidKey | IDBKeyRange
): Promise<T[]> {
  const db = await openKumbuDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const target = indexName ? store.index(indexName) : store;
    const req = query ? target.getAll(query) : target.getAll();

    req.onsuccess = () => resolve((req.result as T[]) || []);
    req.onerror = () => reject(req.error);
  });
}

export async function idbPut<T>(storeName: StoreName, value: T): Promise<void> {
  const db = await openKumbuDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.put(value);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function idbPutMany<T>(storeName: StoreName, items: T[]): Promise<void> {
  if (items.length === 0) return;
  const db = await openKumbuDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    items.forEach((item) => store.put(item));

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbDelete(storeName: StoreName, key: IDBValidKey): Promise<void> {
  const db = await openKumbuDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.delete(key);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function idbClear(storeName: StoreName): Promise<void> {
  const db = await openKumbuDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function idbCount(storeName: StoreName, indexName?: string, query?: IDBValidKey | IDBKeyRange): Promise<number> {
  const db = await openKumbuDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const target = indexName ? store.index(indexName) : store;
    const req = query ? target.count(query) : target.count();

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
