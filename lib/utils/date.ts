export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return String(dateString);
    
    return new Intl.DateTimeFormat("pt-AO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return String(dateString);
  }
}

export function formatRelativeDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return String(dateString);

    const now = new Date();
    
    const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays === -1) return "Amanhã";
    
    return formatDate(date);
  } catch {
    return String(dateString);
  }
}

export function getTodayISODate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function sanitizeDate(dateStr?: string | null): string | undefined {
  if (!dateStr || !dateStr.trim()) return undefined;
  // If already YYYY-MM-DD, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    return dateStr.trim();
  }
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString().split("T")[0];
  } catch {
    return undefined;
  }
}
