"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/currency";
import { formatRelativeDate } from "@/lib/utils/date";
import { useQuickAction } from "@/lib/context/quick-action-context";
import type { FinancialDiaryEntry } from "@/lib/services/transactions";
import type { Account } from "@/lib/services/accounts";

type DiaryViewProps = {
  initialEntries: FinancialDiaryEntry[];
  accounts?: Account[];
};

type FilterType = "ALL" | "INCOME" | "EXPENSE" | "TRANSFER" | "OTHER";

function getEntryDetails(entry: FinancialDiaryEntry) {
  const isIncome = entry.type === "INCOME" || entry.type === "PROJECT_INCOME";
  const isTransfer = entry.type === "TRANSFER";
  const isGoal = entry.type === "SAVING";
  const isDebt = entry.type === "DEBT_PAYMENT";

  const dotColor = isIncome
    ? "bg-emerald-500"
    : isTransfer
      ? "bg-sky-500"
      : isGoal
        ? "bg-amber-500"
        : isDebt
          ? "bg-purple-500"
          : "bg-rose-500";

  const amountColor = isIncome
    ? "text-emerald-700"
    : isTransfer
      ? "text-sky-700"
      : "text-rose-700";

  const sign = isIncome ? "+" : isTransfer || isGoal ? "" : "-";

  const title =
    entry.category_name ||
    (isTransfer
      ? "Transferência"
      : isGoal
        ? "Poupança"
        : isDebt
          ? "Pagamento de Dívida"
          : "Movimento");

  const subtitle = isTransfer
    ? `${entry.account_name ?? "Conta"} → ${entry.destination_account_name ?? "Conta"}`
    : entry.account_name ?? "";

  return { dotColor, amountColor, sign, title, subtitle };
}

export function DiaryView({ initialEntries, accounts = [] }: DiaryViewProps) {
  const { openQuickRegister } = useQuickAction();
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredEntries = useMemo(() => {
    return initialEntries.filter((entry) => {
      // Type filter
      if (filter === "INCOME") {
        if (entry.type !== "INCOME" && entry.type !== "PROJECT_INCOME") return false;
      } else if (filter === "EXPENSE") {
        if (entry.type !== "EXPENSE" && entry.type !== "PROJECT_EXPENSE") return false;
      } else if (filter === "TRANSFER") {
        if (entry.type !== "TRANSFER") return false;
      } else if (filter === "OTHER") {
        if (
          entry.type === "INCOME" ||
          entry.type === "EXPENSE" ||
          entry.type === "TRANSFER"
        )
          return false;
      }

      // Account filter
      if (selectedAccountId !== "ALL") {
        const matchAccount =
          entry.account_name === selectedAccountId ||
          entry.destination_account_name === selectedAccountId;
        if (!matchAccount) return false;
      }

      // Date range filter
      if (entry.transaction_date) {
        const entryDate = entry.transaction_date.split("T")[0];
        if (startDate && entryDate < startDate) return false;
        if (endDate && entryDate > endDate) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        return [
          entry.description,
          entry.category_name,
          entry.account_name,
          entry.destination_account_name,
          entry.project_name,
        ].some((s) => s?.toLowerCase().includes(term));
      }

      return true;
    });
  }, [initialEntries, filter, selectedAccountId, startDate, endDate, searchTerm]);

  // Group by date
  const groupedByDate: Record<string, FinancialDiaryEntry[]> = {};
  filteredEntries.forEach((entry) => {
    const rawDate = entry.transaction_date
      ? entry.transaction_date.split("T")[0]
      : "Outras Datas";
    if (!groupedByDate[rawDate]) groupedByDate[rawDate] = [];
    groupedByDate[rawDate].push(entry);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    b.localeCompare(a),
  );

  const filters: { id: FilterType; label: string }[] = [
    { id: "ALL", label: "Todos" },
    { id: "INCOME", label: "Ganhos" },
    { id: "EXPENSE", label: "Gastos" },
    { id: "TRANSFER", label: "Transferências" },
    { id: "OTHER", label: "Outros" },
  ];

  const hasActiveFilters =
    filter !== "ALL" ||
    selectedAccountId !== "ALL" ||
    Boolean(searchTerm.trim()) ||
    Boolean(startDate) ||
    Boolean(endDate);

  function resetFilters() {
    setFilter("ALL");
    setSelectedAccountId("ALL");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Diário Financeiro
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Histórico cronológico de todos os teus movimentos financeiros.
          </p>
        </div>
        <Button
          onClick={() => openQuickRegister("EXPENSE")}
          size="sm"
          className="gap-1.5 self-start"
        >
          <Icon name="plus" className="w-4 h-4" />
          Registar Movimento
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="space-y-3 rounded-2xl border border-kumbu-100 bg-white p-4">
        {/* Type pills */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {filters.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id)}
                className={cn(
                  "shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                  filter === t.id
                    ? "bg-kumbu-900 text-white shadow-sm"
                    : "bg-kumbu-50 text-kumbu-600 hover:bg-kumbu-100 hover:text-kumbu-900",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-kumbu-500 hover:text-kumbu-800 underline transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Detailed Controls: Account, Dates, Search */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <Input
              placeholder="Pesquisar descrição, categoria, projecto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {accounts.length > 0 && (
            <div>
              <Select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="h-9 text-xs"
              >
                <option value="ALL">Todas as Carteiras</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.name}>
                    {acc.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 text-[11px]"
              title="Data inicial"
            />
            <span className="text-kumbu-400 text-xs">-</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 text-[11px]"
              title="Data final"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {initialEntries.length === 0 ? (
        <EmptyState
          icon="📖"
          title="Ainda não tens movimentos registados."
          description="Todos os teus ganhos, gastos e transferências aparecerão aqui organizados cronologicamente."
          actionLabel="+ Registar primeiro movimento"
          onAction={() => openQuickRegister("EXPENSE")}
        />
      ) : sortedDates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-kumbu-200 p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-kumbu-700">
            Nenhum movimento encontrado para os filtros activos.
          </p>
          <p className="text-xs text-kumbu-400">
            Tenta ajustar ou limpar os filtros de pesquisa.
          </p>
          <Button size="sm" variant="secondary" onClick={resetFilters}>
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedDates.map((dateKey) => {
            const dayEntries = groupedByDate[dateKey];
            const displayDate = formatRelativeDate(dateKey);

            // Compute daily totals
            const dayIncome = dayEntries
              .filter((e) => e.type === "INCOME" || e.type === "PROJECT_INCOME")
              .reduce((s, e) => s + (e.amount ?? 0), 0);
            const dayExpense = dayEntries
              .filter((e) => e.type === "EXPENSE" || e.type === "PROJECT_EXPENSE")
              .reduce((s, e) => s + (e.amount ?? 0), 0);

            return (
              <div key={dateKey}>
                {/* Date header */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-kumbu-400" />
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-kumbu-500">
                      {displayDate}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    {dayIncome > 0 && (
                      <span className="font-semibold text-emerald-600">
                        +{formatCurrency(dayIncome)}
                      </span>
                    )}
                    {dayExpense > 0 && (
                      <span className="font-semibold text-rose-600">
                        -{formatCurrency(dayExpense)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Entries */}
                <div className="overflow-hidden rounded-2xl border border-kumbu-100 bg-white divide-y divide-kumbu-50">
                  {dayEntries.map((entry, index) => {
                    const { dotColor, amountColor, sign, title, subtitle } =
                      getEntryDetails(entry);

                    return (
                      <div
                        key={entry.id ?? `diary-${dateKey}-${index}`}
                        className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-kumbu-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={cn(
                              "h-2 w-2 shrink-0 rounded-full",
                              dotColor,
                            )}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-kumbu-900 truncate">
                                {title}
                              </p>
                              {entry.project_name && (
                                <Badge variant="info" size="sm">
                                  {entry.project_name}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-kumbu-400 truncate">
                              {subtitle}
                              {entry.description ? ` · ${entry.description}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p
                            className={cn(
                              "text-sm font-semibold tabular-nums",
                              amountColor,
                            )}
                          >
                            {sign}
                            {formatCurrency(entry.amount ?? 0, entry.currency ?? "AOA")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
