"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils/currency";
import { formatRelativeDate } from "@/lib/utils/date";
import { useQuickAction } from "@/lib/context/quick-action-context";
import { cn } from "@/lib/utils/cn";
import { useOfflineSync } from "@/lib/offline/context/offline-sync-context";
import { getOfflineTransactions, type OfflineTransaction } from "@/lib/offline";
import type { FinancialDiaryEntry } from "@/lib/services/transactions";
import type { Account } from "@/lib/services/accounts";
import type { DailySummary, MonthlySummary, CategoryExpenseBreakdown } from "@/lib/services/reports";
import type { GoalProgress } from "@/lib/services/goals";
import type { DebtSummary } from "@/lib/services/debts";
import type { ProjectSummary } from "@/lib/services/projects";

type DashboardViewProps = {
  userName: string;
  currency: string;
  totalBalance: number;
  todaySummary: DailySummary | null;
  monthSummary: MonthlySummary | null;
  accounts: Account[];
  recentDiary: FinancialDiaryEntry[];
  goalProgress: GoalProgress[];
  debtSummaries: DebtSummary[];
  projectSummaries: ProjectSummary[];
  categoryExpenses: CategoryExpenseBreakdown[];
};

const accountTypeIcon: Record<string, string> = {
  BANK: "🏦",
  CASH: "💵",
  DIGITAL_WALLET: "📱",
  CARD: "💳",
  SAVINGS: "🏛️",
  PROJECT: "🚀",
  OTHER: "💰",
};

const accountTypeLabel: Record<string, string> = {
  BANK: "Banco",
  CASH: "Dinheiro",
  DIGITAL_WALLET: "Digital",
  CARD: "Cartão",
  SAVINGS: "Poupança",
  PROJECT: "Projecto",
  OTHER: "Outro",
};

export function DashboardView({
  userName,
  currency,
  totalBalance,
  todaySummary,
  monthSummary,
  accounts,
  recentDiary,
  goalProgress,
  debtSummaries,
  projectSummaries,
  categoryExpenses,
}: DashboardViewProps) {
  const { openQuickRegister } = useQuickAction();

  const firstName = userName.split(" ")[0];

  const { syncStatus, isOnline, pendingCount, lastSyncedAt } = useOfflineSync();
  const [offlineTxs, setOfflineTxs] = useState<OfflineTransaction[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadOffline = async () => {
      try {
        const txs = await getOfflineTransactions();
        if (isMounted) {
          const pending = txs.filter(
            (t) => t.sync_status === "PENDING" || t.sync_status === "SYNCING"
          );
          setOfflineTxs(pending);
        }
      } catch (err) {
        console.error("Erro ao ler transações offline:", err);
      }
    };

    loadOffline();

    const handleCustomEvent = () => {
      loadOffline();
    };

    window.addEventListener("kumbu_offline_tx_created", handleCustomEvent);
    return () => {
      isMounted = false;
      window.removeEventListener("kumbu_offline_tx_created", handleCustomEvent);
    };
  }, [pendingCount, syncStatus]);

  // Saldo ajustado com operações offline pendentes
  const effectiveTotalBalance = useMemo(() => {
    let delta = 0;
    for (const tx of offlineTxs) {
      if (tx.type === "INCOME") delta += tx.amount;
      else if (tx.type === "EXPENSE" || tx.type === "GOAL" || tx.type === "DEBT") delta -= tx.amount;
      else if (tx.type === "PROJECT") delta -= tx.amount;
    }
    return totalBalance + delta;
  }, [totalBalance, offlineTxs]);

  // Combina actividades recentes com itens pendentes locais no topo
  const combinedRecentDiary = useMemo(() => {
    const offlineMapped: (FinancialDiaryEntry & { isPendingOffline?: boolean })[] =
      offlineTxs.map((t) => ({
        id: t.id,
        user_id: "",
        account_id: t.account_id,
        amount: t.amount,
        type: (t.type === "INCOME"
          ? "INCOME"
          : t.type === "TRANSFER"
          ? "TRANSFER"
          : t.type === "GOAL"
          ? "SAVING"
          : "EXPENSE") as FinancialDiaryEntry["type"],
        category_id: t.category_id ?? null,
        destination_account_id: t.destination_account_id ?? null,
        goal_id: null,
        debt_id: null,
        project_id: null,
        transaction_date: t.transaction_date,
        currency: t.currency ?? currency,
        description: t.description ?? null,
        created_at: t.created_at,
        account_name: t.account_name || "Carteira",
        destination_account_name: t.destination_account_name || "Carteira",
        category_name: t.category_name || (t.type === "INCOME" ? "Ganho" : "Gasto"),
        category_icon: null,
        goal_name: null,
        debt_person_name: null,
        project_name: null,
        isPendingOffline: true,
      }));

    return [...offlineMapped, ...recentDiary];
  }, [offlineTxs, recentDiary]);

  const todayIncome = todaySummary?.daily_income ?? 0;
  const todayExpense = todaySummary?.daily_expense ?? 0;
  const todayNet = todaySummary?.daily_net ?? todayIncome - todayExpense;

  const monthIncome = monthSummary?.income ?? 0;
  const monthExpense = monthSummary?.expense ?? 0;
  const monthNet = monthSummary?.net ?? monthIncome - monthExpense;
  const monthSaving = monthSummary?.saving ?? 0;

  const isZeroState =
    effectiveTotalBalance === 0 &&
    accounts.length === 0 &&
    combinedRecentDiary.length === 0 &&
    todayIncome === 0 &&
    todayExpense === 0;

  const activeAccounts = accounts.filter((a) => a.is_active && !a.archived_at);

  // Insights
  const topExpenseCategory = categoryExpenses[0];
  const activeGoals = goalProgress.filter((g) => g.status === "ACTIVE");
  const pendingDebts = debtSummaries.filter(
    (d) => d.status === "OPEN" || d.status === "PARTIALLY_PAID"
  );
  const activeProjects = projectSummaries.filter((p) => p.project !== null);

  const savingsRate =
    monthIncome > 0 ? Math.round((monthSaving / monthIncome) * 100) : 0;

  const healthDiagnosis = useMemo(() => {
    if (isZeroState) return null;
    if (monthIncome > 0 && monthExpense > monthIncome) {
      return {
        status: "Atenção" as const,
        color: "bg-rose-50/80 border-rose-200 text-rose-950",
        badgeVariant: "danger" as const,
        reason: `Os gastos deste mês (${formatCurrency(monthExpense, currency)}) ultrapassaram as entradas (${formatCurrency(monthIncome, currency)}). Prioriza compromissos essenciais e reduz saídas variáveis.`,
      };
    }
    if (monthIncome > 0 && monthExpense <= monthIncome * 0.7) {
      return {
        status: "Melhorou" as const,
        color: "bg-emerald-50/80 border-emerald-200 text-emerald-950",
        badgeVariant: "success" as const,
        reason: `Despesas sob controlo (${Math.round((monthExpense / monthIncome) * 100)}% das entradas). Taxa de poupança positiva de ${savingsRate}% e margem financeira saudável.`,
      };
    }
    return {
      status: "Estável" as const,
      color: "bg-kumbu-50/80 border-kumbu-200 text-kumbu-950",
      badgeVariant: "default" as const,
      reason: `Equilíbrio entre entradas e saídas no período. Mantém o acompanhamento dos teus projectos e protege o teu fundo de reserva.`,
    };
  }, [isZeroState, monthIncome, monthExpense, currency, savingsRate]);

  return (
    <div className="space-y-6">
      {/* Page greeting & quick register */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-kumbu-900 truncate">
            Olá, {firstName} 👋
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-kumbu-500 truncate">
            Como estão as tuas finanças hoje?
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => openQuickRegister("EXPENSE")}
          className="shrink-0 flex gap-1.5 rounded-xl shadow-xs"
        >
          <Icon name="plus" className="w-4 h-4" />
          <span className="font-semibold">Registar</span>
        </Button>
      </div>

      {/* Hero balance card */}
      <div className="relative overflow-hidden rounded-3xl bg-kumbu-800 p-5 sm:p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-kumbu-700/50" />
        <div className="pointer-events-none absolute -bottom-12 -left-6 h-36 w-36 rounded-full bg-kumbu-900/40" />

        <div className="relative">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-kumbu-300">
              Saldo total
            </p>
            {(!isOnline || pendingCount > 0) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/15 text-white backdrop-blur-xs border border-white/20">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    !isOnline ? "bg-slate-300" : "bg-amber-400 animate-pulse"
                  }`}
                />
                {!isOnline ? "Modo Offline" : "A sincronizar"}
                {pendingCount > 0 && ` (${pendingCount})`}
              </span>
            )}
          </div>
          <p className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight tabular-nums truncate">
            {formatCurrency(effectiveTotalBalance, currency)}
          </p>
          <p className="mt-1 text-xs text-kumbu-400">
            {pendingCount > 0
              ? `Saldo atualizado localmente (${pendingCount} pendente${
                  pendingCount > 1 ? "s" : ""
                })`
              : activeAccounts.length > 0
              ? `Disponível em ${activeAccounts.length} carteira${
                  activeAccounts.length !== 1 ? "s" : ""
                }`
              : "Sem carteiras activas"}
          </p>

          {/* Quick actions row */}
          <div className="mt-5 flex gap-2 overflow-x-auto scrollbar-none pb-1 pt-0.5 -mx-1 px-1">
            {[
              { label: "Ganhei", action: "INCOME" as const, color: "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200" },
              { label: "Gastei", action: "EXPENSE" as const, color: "bg-rose-500/20 hover:bg-rose-500/30 text-rose-200" },
              { label: "Transferi", action: "TRANSFER" as const, color: "bg-kumbu-600/40 hover:bg-kumbu-600/60 text-kumbu-200" },
              { label: "Poupei", action: "GOAL" as const, color: "bg-amber-500/20 hover:bg-amber-500/30 text-amber-200" },
              { label: "Dívida", action: "NEW_DEBT" as const, color: "bg-purple-500/20 hover:bg-purple-500/30 text-purple-200" },
            ].map(({ label, action, color }) => (
              <button
                key={action}
                type="button"
                onClick={() => openQuickRegister(action)}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all active:scale-95 ${color}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isZeroState ? (
        <EmptyState
          icon="💡"
          title="O teu Kumbu começa aqui."
          description="Ainda não tens movimentos financeiros. Começa a acompanhar o teu dinheiro registando o primeiro movimento."
          actionLabel="+ Registar primeiro movimento"
          onAction={() => openQuickRegister("INCOME")}
        />
      ) : (
        <>
          {/* Financial Health Diagnosis (Prompt Item 26) */}
          {healthDiagnosis && (
            <div
              className={cn(
                "rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs",
                healthDiagnosis.color
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">🩺</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Situação Financeira do Período:
                    </span>
                    <Badge variant={healthDiagnosis.badgeVariant} size="sm">
                      {healthDiagnosis.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed opacity-90">
                    {healthDiagnosis.reason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Today + This Month */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SummaryCard
              title="Hoje"
              subtitle="Resumo diário"
              income={todayIncome}
              expense={todayExpense}
              net={todayNet}
              currency={currency}
            />
            <SummaryCard
              title="Este Mês"
              subtitle="Resumo mensal"
              income={monthIncome}
              expense={monthExpense}
              net={monthNet}
              currency={currency}
              extra={
                monthIncome > 0
                  ? { label: "Taxa poupança", value: `${savingsRate}%`, positive: savingsRate >= 0 }
                  : undefined
              }
            />
          </div>

          {/* Insights strip — top expense category */}
          {topExpenseCategory && monthExpense > 0 && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 flex items-center gap-3">
              <span className="text-base">💡</span>
              <p className="text-xs text-amber-800">
                O teu maior gasto este período é em{" "}
                <span className="font-semibold">{topExpenseCategory.category ?? "categorias gerais"}</span>
                {topExpenseCategory.percentage != null
                  ? ` — ${Math.round(topExpenseCategory.percentage)}% do total de despesas.`
                  : "."}
              </p>
            </div>
          )}

          {/* Accounts */}
          {activeAccounts.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-kumbu-800">As tuas Carteiras</h2>
                <Link
                  href="/carteiras"
                  className="flex items-center gap-1 text-xs font-semibold text-kumbu-600 hover:text-kumbu-800 transition-colors"
                >
                  Ver todas ({activeAccounts.length})
                  <Icon name="chevron-right" className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {activeAccounts.slice(0, 4).map((acc) => (
                  <div
                    key={acc.id}
                    className="rounded-2xl border border-kumbu-100 bg-white p-4 space-y-2 hover:border-kumbu-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base" aria-hidden>
                        {accountTypeIcon[acc.type] ?? "💰"}
                      </span>
                      <span className="text-[10px] font-medium text-kumbu-400 uppercase tracking-wide">
                        {accountTypeLabel[acc.type] ?? "Outro"}
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] text-kumbu-500 truncate">{acc.name}</p>
                      <p className="text-sm font-bold text-kumbu-900 tabular-nums">
                        {formatCurrency(acc.current_balance, acc.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Goals in progress */}
          {activeGoals.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-kumbu-800">🎯 As minhas Metas</h2>
                <Link
                  href="/metas"
                  className="flex items-center gap-1 text-xs font-semibold text-kumbu-600 hover:text-kumbu-800 transition-colors"
                >
                  Ver todas ({activeGoals.length})
                  <Icon name="chevron-right" className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="rounded-2xl border border-kumbu-100 bg-white divide-y divide-kumbu-50 overflow-hidden">
                {activeGoals.slice(0, 3).map((goal) => {
                  const pct = Math.min(
                    100,
                    Math.round(goal.progress_percentage ?? 0)
                  );
                  return (
                    <div key={goal.goal_id} className="px-4 py-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-kumbu-900 truncate">{goal.name}</p>
                        <span className="text-xs font-bold text-kumbu-600 shrink-0 ml-2">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-kumbu-100">
                        <div
                          className="h-full rounded-full bg-kumbu-600 animate-progress"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-kumbu-400">
                        <span>{formatCurrency(goal.current_amount ?? 0, currency)}</span>
                        <span>Meta: {formatCurrency(goal.target_amount ?? 0, currency)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Active Projects */}
          {activeProjects.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-kumbu-800">🚀 Projectos Activos</h2>
                <Link
                  href="/projectos"
                  className="flex items-center gap-1 text-xs font-semibold text-kumbu-600 hover:text-kumbu-800 transition-colors"
                >
                  Ver todos
                  <Icon name="chevron-right" className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {activeProjects.slice(0, 2).map((proj) => (
                  <div
                    key={proj.project_id}
                    className="rounded-2xl border border-kumbu-100 bg-white p-4 space-y-1"
                  >
                    <p className="text-xs font-semibold text-kumbu-900 truncate">{proj.project}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-rose-600 tabular-nums">
                        Gasto: {formatCurrency(proj.expense ?? 0, currency)}
                      </span>
                      <span className="text-[11px] text-emerald-600 tabular-nums">
                        Receita: {formatCurrency(proj.income ?? 0, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pending Debts */}
          {pendingDebts.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-kumbu-800">🤝 Dívidas Pendentes</h2>
                <Link
                  href="/dividas"
                  className="flex items-center gap-1 text-xs font-semibold text-kumbu-600 hover:text-kumbu-800 transition-colors"
                >
                  Ver todas
                  <Icon name="chevron-right" className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="rounded-2xl border border-kumbu-100 bg-white divide-y divide-kumbu-50 overflow-hidden">
                {pendingDebts.slice(0, 3).map((debt) => (
                  <div
                    key={debt.debt_id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-kumbu-900">{debt.person_name}</p>
                      <p className="text-[10px] text-kumbu-400">
                        {debt.type === "I_OWE" ? "Eu devo" : "Devem-me"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-xs font-bold tabular-nums",
                        debt.type === "I_OWE" ? "text-rose-600" : "text-emerald-600"
                      )}>
                        {formatCurrency(debt.remaining_amount ?? 0, currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent activity */}
          {combinedRecentDiary.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-kumbu-800">Actividade Recente</h2>
                <Link
                  href="/diario"
                  className="flex items-center gap-1 text-xs font-semibold text-kumbu-600 hover:text-kumbu-800 transition-colors"
                >
                  Ver diário
                  <Icon name="chevron-right" className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="rounded-2xl border border-kumbu-100 bg-white divide-y divide-kumbu-50 overflow-hidden">
                {combinedRecentDiary.slice(0, 6).map((entry, index) => {
                  const isIncome =
                    entry.type === "INCOME" || entry.type === "PROJECT_INCOME";
                  const isTransfer = entry.type === "TRANSFER";
                  const isGoal = entry.type === "SAVING";
                  const isPending = (entry as any).isPendingOffline;

                  const sign = isIncome ? "+" : isTransfer ? "" : "-";
                  const amountColor = isIncome
                    ? "text-emerald-700"
                    : isTransfer
                    ? "text-kumbu-700"
                    : "text-rose-700";

                  const dotColor = isPending
                    ? "bg-amber-400 animate-pulse"
                    : isIncome
                    ? "bg-emerald-500"
                    : isTransfer
                    ? "bg-sky-500"
                    : isGoal
                    ? "bg-amber-500"
                    : "bg-rose-500";

                  return (
                    <div
                      key={entry.id ?? `entry-${index}`}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-semibold text-kumbu-900 truncate">
                              {entry.category_name ||
                                (isTransfer ? "Transferência" : "Movimento")}
                            </p>
                            {isPending && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold bg-amber-100 text-amber-800">
                                Pendente
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-kumbu-400 truncate">
                            {isTransfer
                              ? `${entry.account_name} → ${entry.destination_account_name}`
                              : entry.account_name}
                            {entry.description ? ` · ${entry.description}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-3">
                        <p className={`text-xs font-semibold tabular-nums ${amountColor}`}>
                          {sign}
                          {formatCurrency(
                            entry.amount ?? 0,
                            entry.currency ?? "AOA",
                          )}
                        </p>
                        <p className="text-[10px] text-kumbu-400">
                          {isPending ? "Agora mesmo" : formatRelativeDate(entry.transaction_date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  subtitle,
  income,
  expense,
  net,
  currency,
  extra,
}: {
  title: string;
  subtitle: string;
  income: number;
  expense: number;
  net: number;
  currency: string;
  extra?: { label: string; value: string; positive: boolean };
}) {
  return (
    <div className="rounded-2xl border border-kumbu-100 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-kumbu-900">{title}</p>
        <p className="text-[11px] text-kumbu-400">{subtitle}</p>
      </div>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <div className="rounded-xl bg-emerald-50 p-2 sm:p-3 min-w-0">
          <p className="text-[9px] sm:text-[10px] font-medium text-emerald-700 uppercase tracking-wide truncate">Ganhos</p>
          <p className="mt-1 text-[11px] sm:text-xs font-bold text-emerald-800 tabular-nums truncate">
            +{formatCurrency(income, currency)}
          </p>
        </div>
        <div className="rounded-xl bg-rose-50 p-2 sm:p-3 min-w-0">
          <p className="text-[9px] sm:text-[10px] font-medium text-rose-700 uppercase tracking-wide truncate">Gastos</p>
          <p className="mt-1 text-[11px] sm:text-xs font-bold text-rose-800 tabular-nums truncate">
            -{formatCurrency(expense, currency)}
          </p>
        </div>
        <div className="rounded-xl bg-kumbu-50 p-2 sm:p-3 min-w-0">
          <p className="text-[9px] sm:text-[10px] font-medium text-kumbu-700 uppercase tracking-wide truncate">Resultado</p>
          <p className={`mt-1 text-[11px] sm:text-xs font-bold tabular-nums truncate ${net >= 0 ? "text-kumbu-900" : "text-rose-700"}`}>
            {net >= 0 ? "+" : ""}{formatCurrency(net, currency)}
          </p>
        </div>
      </div>
      {extra && (
        <div className="flex items-center justify-between rounded-xl bg-kumbu-50 px-3 py-2">
          <p className="text-[11px] text-kumbu-600">{extra.label}</p>
          <p className={cn(
            "text-xs font-bold tabular-nums",
            extra.positive ? "text-kumbu-700" : "text-rose-700"
          )}>{extra.value}</p>
        </div>
      )}
    </div>
  );
}
