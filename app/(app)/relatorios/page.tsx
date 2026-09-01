import { createClient } from "@/lib/supabase/server";
import {
  getNetWorth,
  getDailySummaries,
  getMonthlySummaries,
  getCategoryExpenseBreakdown,
  getIncomeByCategory,
  getAccountExpenseBreakdown,
} from "@/lib/services/reports";
import { ReportsView } from "@/components/reports/reports-view";

export default async function RelatoriosPage() {
  const supabase = await createClient();

  const [
    netWorth,
    dailySummaries,
    monthlySummaries,
    categoryExpenses,
    categoryIncomes,
    accountExpenses,
  ] = await Promise.all([
    getNetWorth(supabase),
    getDailySummaries(supabase, 30),
    getMonthlySummaries(supabase, 12),
    getCategoryExpenseBreakdown(supabase),
    getIncomeByCategory(supabase),
    getAccountExpenseBreakdown(supabase),
  ]);

  return (
    <ReportsView
      netWorth={netWorth}
      dailySummaries={dailySummaries}
      monthlySummaries={monthlySummaries}
      categoryExpenses={categoryExpenses}
      categoryIncomes={categoryIncomes}
      accountExpenses={accountExpenses}
    />
  );
}
