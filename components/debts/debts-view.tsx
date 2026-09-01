"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
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

const statusBadges: Record<DebtStatus, { label: string; variant: "default" | "success" | "danger" | "warning" | "info" | "neutral" }> = {
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

  function handleCreate() {
    setSelectedDebt(null);
    setDebtModalOpen(true);
  }

  function handleEdit(debt: Debt) {
    setSelectedDebt(debt);
    setDebtModalOpen(true);
  }

  function handlePay(debt: Debt) {
    setSelectedDebt(debt);
    setPayModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
            D�vidas & Empr�stimos
          </h1>
          <p className="mt-0.5 text-sm text-kumbu-500">
            Controla os valores que deves e os valores que terceiros t�m a pagar-te.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-1.5 self-start sm:self-auto">
          <span>+</span> Registar D�vida
        </Button>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div
          onClick={() => setActiveTab("I_OWE")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            activeTab === "I_OWE"
              ? "border-rose-300 bg-rose-50/50 shadow-xs"
              : "border-kumbu-100 bg-white hover:border-kumbu-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              Eu Devo
            </span>
            <span className="text-base">??</span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-rose-800">
            {formatCurrency(totalIOwe)}
          </p>
          <p className="mt-1 text-xs text-rose-600">
            {iOweDebts.filter((d) => d.status !== "PAID" && d.status !== "CANCELLED").length} d�vida(s) pendente(s)
          </p>
        </div>

        <div
          onClick={() => setActiveTab("OWED_TO_ME")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            activeTab === "OWED_TO_ME"
              ? "border-emerald-300 bg-emerald-50/50 shadow-xs"
              : "border-kumbu-100 bg-white hover:border-kumbu-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Devem-me
            </span>
            <span className="text-base">??</span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-800">
            {formatCurrency(totalOwedToMe)}
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            {owedToMeDebts.filter((d) => d.status !== "PAID" && d.status !== "CANCELLED").length} valor(es) a receber
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-kumbu-100 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("I_OWE")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === "I_OWE"
              ? "border-b-2 border-kumbu-900 text-kumbu-900"
              : "text-kumbu-500 hover:text-kumbu-800"
          }`}
        >
          Eu Devo ({iOweDebts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("OWED_TO_ME")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === "OWED_TO_ME"
              ? "border-b-2 border-kumbu-900 text-kumbu-900"
              : "text-kumbu-500 hover:text-kumbu-800"
          }`}
        >
          Devem-me ({owedToMeDebts.length})
        </button>
      </div>

      {/* Debt List or Empty State */}
      {currentList.length === 0 ? (
        <EmptyState
          title={
            activeTab === "I_OWE"
              ? "N�o tens d�vidas a pagar registadas."
              : "N�o tens valores a receber registados."
          }
          description={
            activeTab === "I_OWE"
              ? "Mant�m as tuas finan�as organizadas registando sempre que contra�res uma obriga��o."
              : "Regista empr�stimos concedidos a amigos ou colegas para n�o te esqueceres."
          }
          actionLabel="+ Registar d�vida"
          onAction={handleCreate}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {currentList.map((debt) => {
            const badge = statusBadges[debt.status] ?? statusBadges.OPEN;
            const isSettled = debt.status === "PAID" || debt.status === "CANCELLED";

            return (
              <Card
                key={debt.id}
                className="flex flex-col justify-between space-y-3 transition-all hover:border-kumbu-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-kumbu-900">{debt.person_name}</h3>
                      <p className="text-xs text-kumbu-500">
                        {debt.due_date ? `Vence a: ${formatDate(debt.due_date)}` : "Sem data limite"}
                      </p>
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>

                  {debt.description && (
                    <p className="mt-2 text-xs text-kumbu-500 line-clamp-2">
                      {debt.description}
                    </p>
                  )}

                  <div className="mt-3 rounded-xl bg-kumbu-50 p-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-kumbu-500">Valor Restante:</span>
                      <span className="font-bold text-kumbu-900">
                        {formatCurrency(debt.remaining_amount, debt.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-kumbu-400">
                      <span>Valor Original:</span>
                      <span>{formatCurrency(debt.original_amount, debt.currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-kumbu-50 pt-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(debt)}
                    className="text-xs font-medium text-kumbu-500 hover:text-kumbu-900"
                  >
                    Editar
                  </button>
                  {!isSettled && (
                    <Button
                      size="sm"
                      variant={activeTab === "I_OWE" ? "primary" : "secondary"}
                      onClick={() => handlePay(debt)}
                      className="text-xs py-1.5 h-8"
                    >
                      {activeTab === "I_OWE" ? "Pagar" : "Receber"}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
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
