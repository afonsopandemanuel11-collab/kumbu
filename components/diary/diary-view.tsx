"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils/currency";
import { formatRelativeDate } from "@/lib/utils/date";
import { useQuickAction } from "@/lib/context/quick-action-context";
import type { FinancialDiaryEntry } from "@/lib/services/transactions";

type DiaryViewProps = {
  initialEntries: FinancialDiaryEntry[];
};

type FilterType = "ALL" | "INCOME" | "EXPENSE" | "TRANSFER" | "OTHER";

export function DiaryView({ initialEntries }: DiaryViewProps) {
  const { openQuickRegister } = useQuickAction();
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEntries = initialEntries.filter((entry) => {
    // Filter by type
    if (filter === "INCOME") {
      if (entry.type !== "INCOME" && entry.type !== "PROJECT_INCOME") return false;
    } else if (filter === "EXPENSE") {
      if (entry.type !== "EXPENSE" && entry.type !== "PROJECT_EXPENSE") return false;
    } else if (filter === "TRANSFER") {
      if (entry.type !== "TRANSFER") return false;
    } else if (filter === "OTHER") {
      if (entry.type === "INCOME" || entry.type === "EXPENSE" || entry.type === "TRANSFER") return false;
    }

    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchDesc = entry.description?.toLowerCase().includes(term);
      const matchCat = entry.category_name?.toLowerCase().includes(term);
      const matchAcc = entry.account_name?.toLowerCase().includes(term);
      const matchDest = entry.destination_account_name?.toLowerCase().includes(term);
      const matchProj = entry.project_name?.toLowerCase().includes(term);
      if (!matchDesc && !matchCat && !matchAcc && !matchDest && !matchProj) {
        return false;
      }
    }

    return true;
  });

  // Group by date
  const groupedByDate: Record<string, FinancialDiaryEntry[]> = {};
  filteredEntries.forEach((entry) => {
    const rawDate = entry.transaction_date ? entry.transaction_date.split("T")[0] : "Outras Datas";
    if (!groupedByDate[rawDate]) {
      groupedByDate[rawDate] = [];
    }
    groupedByDate[rawDate].push(entry);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  function getEntryDetails(entry: FinancialDiaryEntry) {
    const isPositive = entry.type === "INCOME" || entry.type === "PROJECT_INCOME";
    const isTransfer = entry.type === "TRANSFER";
    const isGoal = entry.type === "SAVING";
    const isDebt = entry.type === "DEBT_PAYMENT";

    let icon = "??";
    let sign = "-";
    let colorClass = "text-rose-600";

    if (isPositive) {
      icon = "??";
      sign = "+";
      colorClass = "text-emerald-600 font-semibold";
    } else if (isTransfer) {
      icon = "?";
      sign = "";
      colorClass = "text-kumbu-800 font-medium";
    } else if (isGoal) {
      icon = "??";
      sign = "";
      colorClass = "text-sky-700 font-medium";
    } else if (isDebt) {
      icon = "??";
      sign = "-";
      colorClass = "text-amber-700 font-medium";
    }

    const title = entry.category_name || (isTransfer ? "Transfer�ncia" : isGoal ? "Poupan�a" : isDebt ? "Pagamento de D�vida" : "Movimento");
    const accountInfo = isTransfer
      ? `${entry.account_name ?? "Conta"} ? ${entry.destination_account_name ?? "Conta"}`
      : isPositive
      ? `? ${entry.account_name ?? "Conta"}`
      : `? ${entry.account_name ?? "Conta"}`;

    return { icon, sign, colorClass, title, accountInfo };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Di�rio Financeiro
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Hist�rico completo de todos os teus movimentos agrupados por dia.
          </p>
        </div>
        <Button onClick={() => openQuickRegister("EXPENSE")} className="gap-1.5 self-start sm:self-auto">
          <span>+</span> Registar Movimento
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(
            [
              { id: "ALL", label: "Todos" },
              { id: "INCOME", label: "Ganhos" },
              { id: "EXPENSE", label: "Gastos" },
              { id: "TRANSFER", label: "Transfer�ncias" },
              { id: "OTHER", label: "Outros" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                filter === t.id
                  ? "bg-kumbu-900 text-white shadow-xs"
                  : "bg-white border border-kumbu-100 text-kumbu-700 hover:bg-kumbu-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Pesquisar no di�rio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Entries List or Empty State */}
      {initialEntries.length === 0 ? (
        <EmptyState
          title="Ainda n�o tens movimentos registados."
          description="Todos os teus ganhos, gastos e transfer�ncias aparecer�o aqui organizados cronologicamente."
          actionLabel="+ Registar primeiro movimento"
          onAction={() => openQuickRegister("EXPENSE")}
        />
      ) : sortedDates.length === 0 ? (
        <div className="rounded-2xl border border-kumbu-100 bg-white p-8 text-center text-sm text-kumbu-500">
          Nenhum movimento encontrado para os filtros seleccionados.
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const dayEntries = groupedByDate[dateKey];
            const displayDate = formatRelativeDate(dateKey);

            return (
              <div key={dateKey} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-kumbu-400">
                    {displayDate}
                  </h2>
                  <div className="h-px flex-1 bg-kumbu-100" />
                </div>

                <div className="space-y-1.5">
                  {dayEntries.map((entry, index) => {
                    const { icon, sign, colorClass, title, accountInfo } = getEntryDetails(entry);

                    return (
                      <Card
                        key={entry.id ?? `diary-entry-${dateKey}-${index}`}
                        className="flex items-center justify-between p-3.5 transition-colors hover:border-kumbu-200"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kumbu-50 text-lg">
                            {icon}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-kumbu-900">
                                {title}
                              </p>
                              {entry.project_name && (
                                <Badge variant="info" size="sm">
                                  {entry.project_name}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-kumbu-500">
                              {accountInfo}
                              {entry.description ? ` � ${entry.description}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`text-sm ${colorClass}`}>
                            {sign}
                            {formatCurrency(entry.amount, entry.currency ?? "AOA")}
                          </p>
                        </div>
                      </Card>
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
