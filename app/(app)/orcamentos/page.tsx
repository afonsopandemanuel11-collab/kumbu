import { createClient } from "@/lib/supabase/server";
import { getBudgets, getBudgetVsActual, getRecurringTransactions, getCashFlowProjections } from "@/lib/services/budgets";
import { getCategories } from "@/lib/services/categories";
import { getAccounts } from "@/lib/services/accounts";
import { BudgetsView } from "@/components/budgets/budgets-view";

export default async function OrcamentosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    budgets,
    budgetVsActualList,
    recurringList,
    cashFlowList,
    categories,
    accounts,
  ] = await Promise.all([
    getBudgets(supabase),
    getBudgetVsActual(supabase),
    getRecurringTransactions(supabase),
    getCashFlowProjections(supabase),
    getCategories(supabase),
    getAccounts(supabase),
  ]);

  return (
    <BudgetsView
      initialBudgets={budgets}
      budgetVsActualList={budgetVsActualList}
      recurringList={recurringList}
      cashFlowList={cashFlowList}
      categories={categories}
      accounts={accounts}
      userId={user!.id}
    />
  );
}
