/**
 * Detetor de Conectividade em Tempo Real
 * Combina eventos do navegador (online/offline) com uma verificação real de ping HTTP.
 */

type ConnectivityListener = (isOnline: boolean) => void;

let listeners: Set<ConnectivityListener> = new Set();
let currentStatus: boolean = typeof navigator !== "undefined" ? navigator.onLine : true;
let isCheckingRealPing = false;

/**
 * Realiza uma verificação HTTP leve com timeout para garantir conectividade real à internet
 */
export async function checkRealConnectivity(): Promise<boolean> {
  if (typeof window === "undefined") return true;
  if (!navigator.onLine) return false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // Usa um asset estático seguro com timestamp anti-cache
    const res = await fetch(`/favicon.svg?_t=${Date.now()}`, {
      method: "HEAD",
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return res.ok || res.status === 304;
  } catch {
    return false;
  }
}

/**
 * Notifica todos os ouvintes registados
 */
function notifyListeners(status: boolean) {
  currentStatus = status;
  listeners.forEach((listener) => {
    try {
      listener(status);
    } catch (e) {
      console.error("[Connectivity] Erro no listener:", e);
    }
  });
}

/**
 * Inicia a escuta global de conectividade
 */
export function initConnectivityWatcher(): () => void {
  if (typeof window === "undefined") return () => {};

  const handleOnline = async () => {
    if (isCheckingRealPing) return;
    isCheckingRealPing = true;
    const real = await checkRealConnectivity();
    isCheckingRealPing = false;
    notifyListeners(real);
  };

  const handleOffline = () => {
    notifyListeners(false);
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Verificação inicial
  handleOnline();

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

/**
 * Permite subscrever mudanças no estado de conectividade
 */
export function subscribeConnectivity(listener: ConnectivityListener): () => void {
  listeners.add(listener);
  listener(currentStatus);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Retorna o estado atual síncrono
 */
export function getIsOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return currentStatus;
}
