import { createClient } from "@/lib/supabase/server";
import {
  getRecurringTransactions,
  getCashFlowProjections,
  getBudgetVsActual,
} from "@/lib/services/budgets";
import { getCurrentMonthSummary } from "@/lib/services/reports";
import { PlaneamentoView } from "@/components/planeamento/planeamento-view";

export default async function PlaneamentoPage() {
  const supabase = await createClient();

  const [recurringList, cashFlowList, budgetVsActualList, monthSummary] =
    await Promise.all([
      getRecurringTransactions(supabase),
      getCashFlowProjections(supabase),
      getBudgetVsActual(supabase),
      getCurrentMonthSummary(supabase),
    ]);

  return (
    <PlaneamentoView
      recurringList={recurringList}
      cashFlowList={cashFlowList}
      budgetVsActualList={budgetVsActualList}
      monthSummary={monthSummary}
    />
  );
}
