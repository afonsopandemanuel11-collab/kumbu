"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { getTodayISODate, sanitizeDate } from "@/lib/utils/date";
import {
  createIncome,
  createExpense,
  createTransfer,
  payDebt,
  contributeToGoal,
  createProjectTransaction,
} from "@/lib/services/transactions";
import { createDebt } from "@/lib/services/debts";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import type { Account } from "@/lib/services/accounts";
import type { Category } from "@/lib/services/categories";
import type { Goal } from "@/lib/services/goals";
import type { Debt } from "@/lib/services/debts";
import type { Project } from "@/lib/services/projects";
import type { BudgetVsActual } from "@/lib/services/budgets";
import { getAllocationRules, type AllocationRule } from "@/lib/services/allocation-rules";
import {
  enqueueOperation,
  saveOfflineTransaction,
  cacheWallets,
  getCachedWallets,
  cacheCategories,
  getCachedCategories,
  cacheGoals,
  getCachedGoals,
  cacheDebts,
  getCachedDebts,
  cacheProjects,
  getCachedProjects,
  adjustCachedWalletBalance,
  getIsOnline,
  checkRealConnectivity,
  triggerSync,
} from "@/lib/offline";

type ActionType =
  | "INCOME"
  | "EXPENSE"
  | "TRANSFER"
  | "GOAL"
  | "NEW_DEBT"
  | "PAY_DEBT"
  | "PROJECT";

type QuickRegisterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultAction?: ActionType;
  onSuccess?: () => void;
};

const actionTabs: { id: ActionType; label: string; icon: string }[] = [
  { id: "EXPENSE", label: "Gastei", icon: "💸" },
  { id: "INCOME", label: "Ganhei", icon: "💰" },
  { id: "TRANSFER", label: "Transferi", icon: "🔄" },
  { id: "GOAL", label: "Poupei", icon: "🎯" },
  { id: "NEW_DEBT", label: "Dívida", icon: "🤝" },
  { id: "PAY_DEBT", label: "Paguei Dívida", icon: "💳" },
  { id: "PROJECT", label: "Projecto", icon: "🚀" },
];

function QuickRegisterFormInner({
  initialAction,
  onClose,
  onSuccess,
}: {
  initialAction: ActionType;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [action, setAction] = useState<ActionType>(initialAction);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Options
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [budgetsVsActual, setBudgetsVsActual] = useState<BudgetVsActual[]>([]);
  const [showAllocationPreview, setShowAllocationPreview] = useState(false);
  const [allocationRules, setAllocationRules] = useState<AllocationRule[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Form Fields
  const [amount, setAmount] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedDestinationAccountId, setSelectedDestinationAccountId] =
    useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [selectedDebtId, setSelectedDebtId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [projectTxType, setProjectTxType] = useState<
    "PROJECT_EXPENSE" | "PROJECT_INCOME"
  >("PROJECT_EXPENSE");
  const [debtType, setDebtType] = useState<"I_OWE" | "OWED_TO_ME">("I_OWE");
  const [personName, setPersonName] = useState<string>("");
  const [date, setDate] = useState<string>(getTodayISODate());
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const [accRes, catRes, goalRes, debtRes, projRes, budgetRes, allocRules] = await Promise.all([
          supabase
            .from("accounts")
            .select("*")
            .eq("is_active", true)
            .is("archived_at", null)
            .order("name"),
          supabase
            .from("categories")
            .select("*")
            .eq("is_active", true)
            .order("name"),
          supabase
            .from("goals")
            .select("*")
            .eq("status", "ACTIVE")
            .order("name"),
          supabase
            .from("debts")
            .select("*")
            .in("status", ["OPEN", "PARTIALLY_PAID"])
            .order("person_name"),
          supabase
            .from("projects")
            .select("*")
            .eq("status", "ACTIVE")
            .order("name"),
          supabase
            .from("v_budget_vs_actual")
            .select("*"),
          getAllocationRules(supabase),
        ]);

        setAllocationRules(allocRules);
        setBudgetsVsActual((budgetRes.data as BudgetVsActual[]) ?? []);

        const accs = (accRes.data as Account[]) ?? [];
        setAccounts(accs);
        if (accs.length > 0) {
          cacheWallets(
            accs.map((a) => ({
              id: a.id,
              name: a.name,
              type: a.type,
              current_balance: a.current_balance,
              currency: a.currency,
              is_active: a.is_active,
              updated_at: a.updated_at,
            }))
          ).catch(() => {});
          setSelectedAccountId(accs[0].id);
          if (accs.length > 1) {
            setSelectedDestinationAccountId(accs[1].id);
          }
        }

        const cats = (catRes.data as Category[]) ?? [];
        setCategories(cats);
        if (cats.length > 0) {
          cacheCategories(
            cats.map((c) => ({
              id: c.id,
              name: c.name,
              kind: c.kind,
              icon: c.icon,
              is_active: c.is_active,
            }))
          ).catch(() => {});
        }

        const activeGoals = (goalRes.data as Goal[]) ?? [];
        setGoals(activeGoals);
        if (activeGoals.length > 0) {
          cacheGoals(
            activeGoals.map((g) => ({
              id: g.id,
              name: g.name,
              target_amount: g.target_amount,
              current_amount: g.current_amount,
              deadline: g.deadline,
              status: g.status,
            }))
          ).catch(() => {});
          setSelectedGoalId(activeGoals[0].id);
        }

        const activeDebts = (debtRes.data as Debt[]) ?? [];
        setDebts(activeDebts);
        if (activeDebts.length > 0) {
          cacheDebts(
            activeDebts.map((d) => ({
              id: d.id,
              person_name: d.person_name,
              type: d.type,
              original_amount: d.original_amount,
              remaining_amount: d.remaining_amount,
              status: d.status,
            }))
          ).catch(() => {});
          setSelectedDebtId(activeDebts[0].id);
        }

        const activeProjects = (projRes.data as Project[]) ?? [];
        setProjects(activeProjects);
        if (activeProjects.length > 0) {
          cacheProjects(
            activeProjects.map((p) => ({
              id: p.id,
              name: p.name,
              status: p.status,
            }))
          ).catch(() => {});
          setSelectedProjectId(activeProjects[0].id);
        }
      } catch (err: unknown) {
        console.warn("[QuickRegister] Carregamento online falhou, a carregar do cache IndexedDB:", err);
        try {
          const [cachedAccs, cachedCats, cachedGoals, cachedDebts, cachedProjs] = await Promise.all([
            getCachedWallets(),
            getCachedCategories(),
            getCachedGoals(),
            getCachedDebts(),
            getCachedProjects(),
          ]);

          if (cachedAccs.length > 0) {
            setAccounts(cachedAccs as Account[]);
            setSelectedAccountId(cachedAccs[0].id);
            if (cachedAccs.length > 1) setSelectedDestinationAccountId(cachedAccs[1].id);
          }
          if (cachedCats.length > 0) setCategories(cachedCats as Category[]);
          if (cachedGoals.length > 0) {
            setGoals(cachedGoals as Goal[]);
            setSelectedGoalId(cachedGoals[0].id);
          }
          if (cachedDebts.length > 0) {
            setDebts(cachedDebts as Debt[]);
            setSelectedDebtId(cachedDebts[0].id);
          }
          if (cachedProjs.length > 0) {
            setProjects(cachedProjs as Project[]);
            setSelectedProjectId(cachedProjs[0].id);
          }
        } catch (cacheErr) {
          console.error("[QuickRegister] Erro ao carregar cache local:", cacheErr);
        }
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  const currentCategories = categories.filter((c) =>
    action === "INCOME" ||
    (action === "PROJECT" && projectTxType === "PROJECT_INCOME")
      ? c.kind === "INCOME"
      : c.kind === "EXPENSE",
  );

  const effectiveCategoryId =
    selectedCategoryId || currentCategories[0]?.id || "";
  const effectiveAccountId = selectedAccountId || accounts[0]?.id || "";
  const effectiveDestinationAccountId =
    selectedDestinationAccountId ||
    accounts.find((a) => a.id !== effectiveAccountId)?.id ||
    "";
  const effectiveGoalId = selectedGoalId || goals[0]?.id || "";
  const effectiveDebtId = selectedDebtId || debts[0]?.id || "";
  const effectiveProjectId = selectedProjectId || projects[0]?.id || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const numAmount = parseFloat(amount.replace(/\s+/g, "").replace(",", "."));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Por favor, insere um valor válido maior que 0.");
      return;
    }

    if (action !== "NEW_DEBT" && accounts.length === 0) {
      setError("Precisas de ter pelo menos uma carteira criada.");
      return;
    }

    setLoading(true);
    const safeDate = sanitizeDate(date);

    // Função interna para registo local quando offline
    const handleOfflineSubmit = async () => {
      const clientOpId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const nowIso = new Date().toISOString();

      if (action === "INCOME") {
        if (!effectiveAccountId || !effectiveCategoryId)
          throw new Error("Selecciona a carteira e a categoria.");
        await enqueueOperation(
          "CREATE_INCOME",
          {
            accountId: effectiveAccountId,
            amount: numAmount,
            categoryId: effectiveCategoryId,
            date: safeDate,
            description: description.trim() || undefined,
          },
          clientOpId
        );

        await saveOfflineTransaction({
          id: clientOpId,
          client_operation_id: clientOpId,
          account_id: effectiveAccountId,
          amount: numAmount,
          type: "INCOME",
          category_id: effectiveCategoryId,
          currency: "AOA",
          description: description.trim() || null,
          transaction_date: safeDate || nowIso,
          created_at: nowIso,
          sync_status: "PENDING",
        });

        await adjustCachedWalletBalance(effectiveAccountId, numAmount);
        setSuccessMessage(`Ganho de ${numAmount} Kz registado offline! Sincronizará assim que houver ligação.`);
      } else if (action === "EXPENSE") {
        if (!effectiveAccountId || !effectiveCategoryId)
          throw new Error("Selecciona a carteira e a categoria.");
        await enqueueOperation(
          "CREATE_EXPENSE",
          {
            accountId: effectiveAccountId,
            amount: numAmount,
            categoryId: effectiveCategoryId,
            date: safeDate,
            description: description.trim() || undefined,
          },
          clientOpId
        );

        await saveOfflineTransaction({
          id: clientOpId,
          client_operation_id: clientOpId,
          account_id: effectiveAccountId,
          amount: numAmount,
          type: "EXPENSE",
          category_id: effectiveCategoryId,
          currency: "AOA",
          description: description.trim() || null,
          transaction_date: safeDate || nowIso,
          created_at: nowIso,
          sync_status: "PENDING",
        });

        await adjustCachedWalletBalance(effectiveAccountId, -numAmount);
        setSuccessMessage(`Gasto de ${numAmount} Kz registado offline! Sincronizará assim que houver ligação.`);
      } else if (action === "TRANSFER") {
        if (!effectiveAccountId || !effectiveDestinationAccountId)
          throw new Error("Selecciona as contas de origem e destino.");
        if (effectiveAccountId === effectiveDestinationAccountId)
          throw new Error("A conta de destino não pode ser igual à de origem.");

        await enqueueOperation(
          "CREATE_TRANSFER",
          {
            accountId: effectiveAccountId,
            destinationAccountId: effectiveDestinationAccountId,
            amount: numAmount,
            date: safeDate,
            description: description.trim() || undefined,
          },
          clientOpId
        );

        await saveOfflineTransaction({
          id: clientOpId,
          client_operation_id: clientOpId,
          account_id: effectiveAccountId,
          destination_account_id: effectiveDestinationAccountId,
          amount: numAmount,
          type: "TRANSFER",
          currency: "AOA",
          description: description.trim() || null,
          transaction_date: safeDate || nowIso,
          created_at: nowIso,
          sync_status: "PENDING",
        });

        await adjustCachedWalletBalance(effectiveAccountId, -numAmount);
        await adjustCachedWalletBalance(effectiveDestinationAccountId, numAmount);
        setSuccessMessage(`Transferência de ${numAmount} Kz registada offline! Sincronizará assim que houver ligação.`);
      } else if (action === "GOAL") {
        if (!effectiveGoalId || !effectiveAccountId)
          throw new Error("Selecciona a meta e a carteira.");

        await enqueueOperation(
          "CONTRIBUTE_GOAL",
          {
            goalId: effectiveGoalId,
            accountId: effectiveAccountId,
            amount: numAmount,
            date: safeDate,
            description: description.trim() || undefined,
          },
          clientOpId
        );

        await adjustCachedWalletBalance(effectiveAccountId, -numAmount);
        setSuccessMessage(`Poupança de ${numAmount} Kz registada offline! Sincronizará assim que houver ligação.`);
      } else if (action === "NEW_DEBT") {
        if (!personName.trim()) throw new Error("Indica o nome da pessoa.");
        const fallbackUserId = userId || "offline_user";

        await enqueueOperation(
          "CREATE_DEBT",
          {
            user_id: fallbackUserId,
            person_name: personName.trim(),
            type: debtType,
            original_amount: numAmount,
            due_date: safeDate ?? null,
            description: description.trim() || null,
          },
          clientOpId
        );

        setSuccessMessage(`Dívida registada offline! Sincronizará assim que houver ligação.`);
      } else if (action === "PAY_DEBT") {
        if (!effectiveDebtId || !effectiveAccountId)
          throw new Error("Selecciona a dívida e a carteira.");

        await enqueueOperation(
          "PAY_DEBT",
          {
            debtId: effectiveDebtId,
            accountId: effectiveAccountId,
            amount: numAmount,
            date: safeDate,
            description: description.trim() || undefined,
          },
          clientOpId
        );

        await adjustCachedWalletBalance(effectiveAccountId, -numAmount);
        setSuccessMessage(`Pagamento de ${numAmount} Kz registado offline! Sincronizará assim que houver ligação.`);
      } else if (action === "PROJECT") {
        if (!effectiveProjectId || !effectiveAccountId)
          throw new Error("Selecciona o projecto e a carteira.");
        const fallbackUserId = userId || "offline_user";

        await enqueueOperation(
          "CREATE_PROJECT_TRANSACTION",
          {
            userId: fallbackUserId,
            projectId: effectiveProjectId,
            accountId: effectiveAccountId,
            type: projectTxType,
            amount: numAmount,
            categoryId: effectiveCategoryId || null,
            date: safeDate,
            description: description.trim() || undefined,
          },
          clientOpId
        );

        if (projectTxType === "PROJECT_INCOME") {
          await adjustCachedWalletBalance(effectiveAccountId, numAmount);
        } else {
          await adjustCachedWalletBalance(effectiveAccountId, -numAmount);
        }

        setSuccessMessage(`Movimento do projecto registado offline! Sincronizará assim que houver ligação.`);
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("kumbu_offline_tx_created"));
      }
    };

    try {
      const isActuallyOnline = getIsOnline() && (await checkRealConnectivity());

      if (!isActuallyOnline) {
        await handleOfflineSubmit();
      } else {
        const supabase = createClient();
        try {
          if (action === "INCOME") {
            if (!effectiveAccountId || !effectiveCategoryId)
              throw new Error("Selecciona a carteira e a categoria.");
            await createIncome(supabase, {
              accountId: effectiveAccountId,
              amount: numAmount,
              categoryId: effectiveCategoryId,
              date: safeDate,
              description: description.trim() || undefined,
            });
            setSuccessMessage(`Ganho de ${numAmount} Kz registado com sucesso!`);
          } else if (action === "EXPENSE") {
            if (!effectiveAccountId || !effectiveCategoryId)
              throw new Error("Selecciona a carteira e a categoria.");
            await createExpense(supabase, {
              accountId: effectiveAccountId,
              amount: numAmount,
              categoryId: effectiveCategoryId,
              date: safeDate,
              description: description.trim() || undefined,
            });
            setSuccessMessage(`Gasto de ${numAmount} Kz registado com sucesso!`);
          } else if (action === "TRANSFER") {
            if (!effectiveAccountId || !effectiveDestinationAccountId)
              throw new Error("Selecciona as contas de origem e destino.");
            if (effectiveAccountId === effectiveDestinationAccountId)
              throw new Error("A conta de destino não pode ser igual à de origem.");
            await createTransfer(supabase, {
              accountId: effectiveAccountId,
              destinationAccountId: effectiveDestinationAccountId,
              amount: numAmount,
              date: safeDate,
              description: description.trim() || undefined,
            });
            setSuccessMessage(
              `Transferência de ${numAmount} Kz realizada com sucesso!`
            );
          } else if (action === "GOAL") {
            if (!effectiveGoalId || !effectiveAccountId)
              throw new Error("Selecciona a meta e a carteira.");
            await contributeToGoal(supabase, {
              goalId: effectiveGoalId,
              accountId: effectiveAccountId,
              amount: numAmount,
              date: safeDate,
              description: description.trim() || undefined,
            });
            setSuccessMessage(`Poupança de ${numAmount} Kz adicionada à meta!`);
          } else if (action === "NEW_DEBT") {
            if (!personName.trim()) throw new Error("Indica o nome da pessoa.");
            if (!userId) throw new Error("Sessão inválida.");
            await createDebt(supabase, {
              user_id: userId,
              person_name: personName.trim(),
              type: debtType,
              original_amount: numAmount,
              due_date: safeDate ?? null,
              description: description.trim() || null,
            });
            setSuccessMessage(`Dívida registada com sucesso!`);
          } else if (action === "PAY_DEBT") {
            if (!effectiveDebtId || !effectiveAccountId)
              throw new Error("Selecciona a dívida e a carteira.");
            await payDebt(supabase, {
              debtId: effectiveDebtId,
              accountId: effectiveAccountId,
              amount: numAmount,
              date: safeDate,
              description: description.trim() || undefined,
            });
            setSuccessMessage(`Pagamento de dívida de ${numAmount} Kz registado!`);
          } else if (action === "PROJECT") {
            if (!effectiveProjectId || !effectiveAccountId)
              throw new Error("Selecciona o projecto e a carteira.");
            if (!userId) throw new Error("Sessão inválida.");
            await createProjectTransaction(supabase, {
              userId,
              projectId: effectiveProjectId,
              accountId: effectiveAccountId,
              type: projectTxType,
              amount: numAmount,
              categoryId: effectiveCategoryId || null,
              date: safeDate,
              description: description.trim() || undefined,
            });
            setSuccessMessage(`Movimento do projecto registado com sucesso!`);
          }

          // Dispara sincronização em segundo plano caso existam itens pendentes
          triggerSync().catch(() => {});
        } catch (onlineErr: unknown) {
          const errStr = onlineErr instanceof Error ? onlineErr.message : String(onlineErr);
          const isNetworkFailure =
            errStr.toLowerCase().includes("fetch") ||
            errStr.toLowerCase().includes("network") ||
            errStr.toLowerCase().includes("failed to fetch");

          if (isNetworkFailure) {
            console.warn("[QuickRegister] Falha de rede online, a guardar em fila offline:", errStr);
            await handleOfflineSubmit();
          } else {
            throw onlineErr;
          }
        }
      }

      router.refresh();
      onSuccess?.();
      setTimeout(() => {
        onClose();
      }, 750);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Não foi possível guardar este movimento. Tenta novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Action Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-none">
        {actionTabs.map((tab) => {
          const active = action === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setAction(tab.id);
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                active
                  ? "bg-kumbu-600 text-white shadow-xs"
                  : "bg-kumbu-50 text-kumbu-700 hover:bg-kumbu-100"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loadingData ? (
        <div className="py-8 text-center text-sm text-kumbu-500">
          A carregar dados...
        </div>
      ) : accounts.length === 0 && action !== "NEW_DEBT" ? (
        <div className="my-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-sm font-medium text-amber-900">
            Ainda não tens nenhuma carteira criada.
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Cria a tua primeira carteira para poderes registar ganhos, gastos ou transferências.
          </p>
          <Button
            size="sm"
            className="mt-3"
            onClick={() => {
              onClose();
              router.push("/carteiras");
            }}
          >
            + Criar Carteira
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Amount Field */}
          <div className="space-y-1.5">
            <Label htmlFor="quick-amount">Valor (Kz)</Label>
            <Input
              id="quick-amount"
              type="number"
              step="any"
              min="0"
              required
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-semibold tracking-tight text-kumbu-900"
              autoFocus
            />
          </div>

          {/* Action Specific Fields */}
          {action === "EXPENSE" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="exp-category">Categoria</Label>
                  <Select
                    id="exp-category"
                    value={effectiveCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    required
                  >
                    {currentCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon ? `${c.icon} ` : ""}
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exp-account">Saiu de</Label>
                  <Select
                    id="exp-account"
                    value={effectiveAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    required
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.current_balance} Kz)
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Real-time Budget Impact Widget */}
              {(() => {
                const currentBudget = budgetsVsActual.find(
                  (b) => b.category_id === effectiveCategoryId
                );
                if (!currentBudget || !currentBudget.budget_amount) return null;
                const numVal =
                  parseFloat(amount.replace(/\s+/g, "").replace(",", ".")) || 0;
                const budgetAmt = currentBudget.budget_amount ?? 0;
                const actualExp = currentBudget.actual_expense ?? 0;
                const remainingAfter = budgetAmt - actualExp - numVal;
                const isOver = remainingAfter < 0;

                return (
                  <div
                    className={cn(
                      "rounded-2xl border p-3.5 space-y-1.5 transition-all text-xs",
                      isOver
                        ? "border-rose-200 bg-rose-50/70"
                        : "border-kumbu-100 bg-kumbu-50/70"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-kumbu-900">
                        Impacto no Orçamento
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                          isOver
                            ? "bg-rose-100 text-rose-800"
                            : "bg-emerald-100 text-emerald-800"
                        )}
                      >
                        {isOver ? "Excede o limite" : "Dentro do limite"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-kumbu-600">
                      <span>Orçamento: {formatCurrency(budgetAmt)}</span>
                      <span>Gasto actual: {formatCurrency(actualExp)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-kumbu-200/50 text-xs">
                      <span className="font-medium text-kumbu-700">
                        Após este gasto restará:
                      </span>
                      <span
                        className={cn(
                          "font-bold tabular-nums",
                          isOver ? "text-rose-700" : "text-emerald-700"
                        )}
                      >
                        {formatCurrency(remainingAfter)}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {action === "INCOME" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="inc-category">Origem / Categoria</Label>
                  <Select
                    id="inc-category"
                    value={effectiveCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    required
                  >
                    {currentCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon ? `${c.icon} ` : ""}
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inc-account">Vai para</Label>
                  <Select
                    id="inc-account"
                    value={effectiveAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    required
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Dividir para Conquistar Smart Preview */}
              {(() => {
                const numVal =
                  parseFloat(amount.replace(/\s+/g, "").replace(",", ".")) || 0;
                if (numVal <= 0) return null;

                return (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span>🎯</span>
                        <span className="text-xs font-semibold text-emerald-950">
                          Dividir para Conquistar (Sugestão)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setShowAllocationPreview(!showAllocationPreview)
                        }
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline"
                      >
                        {showAllocationPreview ? "Ocultar" : "Ver divisão"}
                      </button>
                    </div>

                    {showAllocationPreview && (
                      <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-3">
                        {allocationRules.map((rule, i) => {
                          const val = Math.round((numVal * rule.percentage) / 100);
                          return (
                            <div
                              key={rule.id ?? i}
                              className="rounded-xl bg-white p-2 border border-emerald-100/60 shadow-2xs"
                            >
                              <p className="text-[10px] text-kumbu-500 truncate flex items-center gap-1">
                                <span>{rule.icon || "💰"}</span>
                                <span className="truncate">{rule.name}</span>
                                <span className="font-semibold text-emerald-700 shrink-0">
                                  ({rule.percentage}%)
                                </span>
                              </p>
                              <p className="text-xs font-bold text-emerald-800 tabular-nums">
                                {formatCurrency(val)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {action === "TRANSFER" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tr-source">De (Origem)</Label>
                <Select
                  id="tr-source"
                  value={effectiveAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  required
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.current_balance} Kz)
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tr-dest">Para (Destino)</Label>
                <Select
                  id="tr-dest"
                  value={effectiveDestinationAccountId}
                  onChange={(e) =>
                    setSelectedDestinationAccountId(e.target.value)
                  }
                  required
                >
                  {accounts
                    .filter((a) => a.id !== effectiveAccountId)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.current_balance} Kz)
                      </option>
                    ))}
                </Select>
              </div>
            </div>
          )}

          {action === "GOAL" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="goal-select">Meta</Label>
                {goals.length === 0 ? (
                  <p className="text-xs text-amber-600">
                    Sem metas activas. Cria uma primeiro.
                  </p>
                ) : (
                  <Select
                    id="goal-select"
                    value={effectiveGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                    required
                  >
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-acc">Saiu da Carteira</Label>
                <Select
                  id="goal-acc"
                  value={effectiveAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  required
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.current_balance} Kz)
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {action === "NEW_DEBT" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="debt-person">Pessoa</Label>
                  <Input
                    id="debt-person"
                    placeholder="Nome da pessoa"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="debt-type">Tipo</Label>
                  <Select
                    id="debt-type"
                    value={debtType}
                    onChange={(e) =>
                      setDebtType(e.target.value as "I_OWE" | "OWED_TO_ME")
                    }
                    required
                  >
                    <option value="I_OWE">Eu devo</option>
                    <option value="OWED_TO_ME">Devem-me</option>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {action === "PAY_DEBT" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pay-debt-select">Dívida a pagar</Label>
                {debts.length === 0 ? (
                  <p className="text-xs text-amber-600">
                    Sem dívidas pendentes.
                  </p>
                ) : (
                  <Select
                    id="pay-debt-select"
                    value={effectiveDebtId}
                    onChange={(e) => setSelectedDebtId(e.target.value)}
                    required
                  >
                    {debts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.type === "I_OWE" ? "Eu devo a " : "Devem-me de "}{" "}
                        {d.person_name} ({d.remaining_amount} Kz)
                      </option>
                    ))}
                  </Select>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pay-debt-acc">Carteira</Label>
                <Select
                  id="pay-debt-acc"
                  value={effectiveAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  required
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.current_balance} Kz)
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {action === "PROJECT" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="proj-select">Projecto</Label>
                  {projects.length === 0 ? (
                    <p className="text-xs text-amber-600">
                      Sem projectos activos.
                    </p>
                  ) : (
                    <Select
                      id="proj-select"
                      value={effectiveProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      required
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="proj-type">Tipo de Movimento</Label>
                  <Select
                    id="proj-type"
                    value={projectTxType}
                    onChange={(e) =>
                      setProjectTxType(
                        e.target.value as "PROJECT_EXPENSE" | "PROJECT_INCOME",
                      )
                    }
                    required
                  >
                    <option value="PROJECT_EXPENSE">Gasto do Projecto</option>
                    <option value="PROJECT_INCOME">Receita do Projecto</option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="proj-acc">Carteira</Label>
                  <Select
                    id="proj-acc"
                    value={effectiveAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    required
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.current_balance} Kz)
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="proj-cat">Categoria</Label>
                  <Select
                    id="proj-cat"
                    value={effectiveCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                  >
                    <option value="">Sem categoria</option>
                    {currentCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon ? `${c.icon} ` : ""}
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Date and Description */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="quick-date">Data</Label>
              <Input
                id="quick-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quick-desc">Descrição (opcional)</Label>
              <Input
                id="quick-desc"
                placeholder="Ex: Almoço, Salário, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div
              className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
              role="alert"
            >
              {error}
            </div>
          )}

          {successMessage && (
            <div
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800"
              role="status"
            >
              {successMessage}
            </div>
          )}

          {/* Submit button */}
          <div className="pt-2">
            <Button
              type="submit"
              fullWidth
              disabled={
                loading || (accounts.length === 0 && action !== "NEW_DEBT")
              }
            >
              {loading ? "A guardar..." : "Guardar Registo"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function QuickRegisterModal({
  isOpen,
  onClose,
  defaultAction = "EXPENSE",
  onSuccess,
}: QuickRegisterModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="O que aconteceu?"
      maxWidth="md"
    >
      <QuickRegisterFormInner
        key={`${defaultAction}-${isOpen}`}
        initialAction={defaultAction}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}
