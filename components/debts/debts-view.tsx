"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/date";
import { DebtModal } from "@/components/debts/debt-modal";
import { PayDebtModal } from "@/components/debts/pay-debt-modal";
import type { Debt, DebtType, DebtStatus } from "@/lib/services/debts";
import type { Account } from "@/lib/services/accounts";

type DebtsViewProps = {
  initialDebts: Debt[];
  accounts: Account[];
  userId: string;
};

const statusBadges: Record<
  DebtStatus,
  { label: string; variant: "default" | "success" | "danger" | "warning" | "info" | "neutral" }
> = {
  OPEN: { label: "Pendente", variant: "warning" },
  PARTIALLY_PAID: { label: "Parcial", variant: "info" },
  PAID: { label: "Liquidada", variant: "success" },
  OVERDUE: { label: "Em Atraso", variant: "danger" },
  CANCELLED: { label: "Cancelada", variant: "neutral" },
};

export function DebtsView({ initialDebts, accounts, userId }: DebtsViewProps) {
  const [activeTab, setActiveTab] = useState<DebtType>("I_OWE");
  const [debtModalOpen, setDebtModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  const iOweDebts = initialDebts.filter((d) => d.type === "I_OWE");
  const owedToMeDebts = initialDebts.filter((d) => d.type === "OWED_TO_ME");

  const totalIOwe = iOweDebts
    .filter((d) => d.status !== "PAID" && d.status !== "CANCELLED")
    .reduce((sum, d) => sum + (d.remaining_amount ?? 0), 0);

  const totalOwedToMe = owedToMeDebts
    .filter((d) => d.status !== "PAID" && d.status !== "CANCELLED")
    .reduce((sum, d) => sum + (d.remaining_amount ?? 0), 0);

  const currentList = activeTab === "I_OWE" ? iOweDebts : owedToMeDebts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            Dívidas & Empréstimos
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Controla o que deves e o que tens a receber.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedDebt(null);
            setDebtModalOpen(true);
          }}
          className="gap-1.5 self-start"
          size="sm"
        >
          <Icon name="plus" className="w-4 h-4" />
          Registar Dívida
        </Button>
      </div>

      {/* Summary tiles — clickable tabs */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("I_OWE")}
          className={`rounded-2xl border p-4 text-left transition-all ${
            activeTab === "I_OWE"
              ? "border-rose-200 bg-rose-50 shadow-sm"
              : "border-kumbu-100 bg-white hover:border-kumbu-200"
          }`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-rose-700">
            Eu Devo
          </p>
          <p className="mt-2 text-xl font-extrabold text-rose-800 tabular-nums">
            {formatCurrency(totalIOwe)}
          </p>
          <p className="mt-1 text-xs text-rose-600">
            {iOweDebts.filter((d) => d.status !== "PAID" && d.status !== "CANCELLED").length}{" "}
            pendente(s)
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("OWED_TO_ME")}
          className={`rounded-2xl border p-4 text-left transition-all ${
            activeTab === "OWED_TO_ME"
              ? "border-emerald-200 bg-emerald-50 shadow-sm"
              : "border-kumbu-100 bg-white hover:border-kumbu-200"
          }`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
            Devem-me
          </p>
          <p className="mt-2 text-xl font-extrabold text-emerald-800 tabular-nums">
            {formatCurrency(totalOwedToMe)}
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            {owedToMeDebts.filter((d) => d.status !== "PAID" && d.status !== "CANCELLED").length}{" "}
            a receber
          </p>
        </button>
      </div>

      {/* Tab labels */}
      <div className="flex gap-4 border-b border-kumbu-100">
        {(["I_OWE", "OWED_TO_ME"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "border-b-2 border-kumbu-700 text-kumbu-900"
                : "text-kumbu-400 hover:text-kumbu-700"
            }`}
          >
            {tab === "I_OWE" ? "Eu Devo" : "Devem-me"}
            <span className="ml-1.5 text-[11px] text-kumbu-400">
              ({(tab === "I_OWE" ? iOweDebts : owedToMeDebts).length})
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {currentList.length === 0 ? (
        <EmptyState
          icon={activeTab === "I_OWE" ? "🤝" : "💰"}
          title={
            activeTab === "I_OWE"
              ? "Nenhuma dívida a pagar registada."
              : "Nenhum valor a receber registado."
          }
          description={
            activeTab === "I_OWE"
              ? "Regista sempre que contraíres uma obrigação financeira."
              : "Regista empréstimos concedidos para não te esqueceres."
          }
          actionLabel="+ Registar dívida"
          onAction={() => {
            setSelectedDebt(null);
            setDebtModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {currentList.map((debt) => {
            const badge = statusBadges[debt.status] ?? statusBadges.OPEN;
            const isSettled =
              debt.status === "PAID" || debt.status === "CANCELLED";
            const paidPct =
              debt.original_amount > 0
                ? Math.min(
                    100,
                    Math.round(
                      ((debt.original_amount - debt.remaining_amount) /
                        debt.original_amount) *
                        100,
                    ),
                  )
                : 0;

            return (
              <div
                key={debt.id}
                className="rounded-2xl border border-kumbu-100 bg-white p-4 space-y-3 hover:border-kumbu-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-kumbu-900">
                      {debt.person_name}
                    </p>
                    <p className="text-xs text-kumbu-400">
                      {debt.due_date
                        ? `Vence a ${formatDate(debt.due_date)}`
                        : "Sem prazo definido"}
                    </p>
                  </div>
                  <Badge variant={badge.variant} size="sm">
                    {badge.label}
                  </Badge>
                </div>

                {debt.description && (
                  <p className="text-xs text-kumbu-500 line-clamp-2">
                    {debt.description}
                  </p>
                )}

                <div className="rounded-xl bg-kumbu-50 px-3 py-2.5 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-kumbu-500">Restante</span>
                    <span className="text-sm font-bold text-kumbu-900 tabular-nums">
                      {formatCurrency(debt.remaining_amount, debt.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-kumbu-400">Original</span>
                    <span className="text-[11px] text-kumbu-400 tabular-nums">
                      {formatCurrency(debt.original_amount, debt.currency)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {paidPct > 0 && (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-kumbu-100">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-kumbu-400 text-right">
                      {paidPct}% pago
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-kumbu-50 pt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDebt(debt);
                      setDebtModalOpen(true);
                    }}
                    className="text-xs font-medium text-kumbu-400 hover:text-kumbu-700 transition-colors"
                  >
                    Editar
                  </button>
                  {!isSettled && (
                    <Button
                      size="sm"
                      variant={
                        activeTab === "I_OWE" ? "primary" : "secondary"
                      }
                      onClick={() => {
                        setSelectedDebt(debt);
                        setPayModalOpen(true);
                      }}
                      className="h-8 text-xs px-3"
                    >
                      {activeTab === "I_OWE" ? "Pagar" : "Receber"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <DebtModal
        isOpen={debtModalOpen}
        onClose={() => setDebtModalOpen(false)}
        debtToEdit={selectedDebt}
        defaultType={activeTab}
        userId={userId}
      />
      <PayDebtModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        debt={selectedDebt}
        accounts={accounts}
      />
    </div>
  );
}
