export function formatCurrency(amount: number | null | undefined, currency = "AOA"): string {
  const value = amount ?? 0;
  const formatted = new Intl.NumberFormat("pt-AO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

  if (currency === "AOA" || !currency) {
    return `${formatted} Kz`;
  }

  return `${formatted} ${currency}`;
}

export function parseCurrencyInput(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/\s+/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
