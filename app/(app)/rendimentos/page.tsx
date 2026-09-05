import { createClient } from "@/lib/supabase/server";
import { getIncomeByCategory, getCurrentMonthSummary } from "@/lib/services/reports";
import { getIncomeSources } from "@/lib/services/income-sources";
import { RendimentosView, type IncomeTransactionItem } from "@/components/rendimentos/rendimentos-view";

export default async function RendimentosPage() {
  const supabase = await createClient();

  const [
    categoryIncomes,
    monthSummary,
    incomeSources,
    { data: transactionsData },
    { data: categoriesData },
    { data: accountsData },
  ] = await Promise.all([
    getIncomeByCategory(supabase),
    getCurrentMonthSummary(supabase),
    getIncomeSources(supabase),
    supabase
      .from("transactions")
      .select(
        "id, amount, currency, transaction_date, description, type, category_id, account_id, categories(name, icon), accounts(name)"
      )
      .in("type", ["INCOME", "PROJECT_INCOME"])
      .is("deleted_at", null)
      .order("transaction_date", { ascending: false })
      .limit(40),
    supabase
      .from("categories")
      .select("id, name, icon")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("accounts")
      .select("id, name")
      .eq("is_active", true)
      .is("archived_at", null)
      .order("name"),
  ]);

  const recentIncomes: IncomeTransactionItem[] = (transactionsData ?? []).map((t) => ({
    id: t.id,
    amount: t.amount,
    currency: t.currency,
    transaction_date: t.transaction_date,
    description: t.description,
    type: t.type,
    category: Array.isArray(t.categories) ? t.categories[0] : t.categories,
    account: Array.isArray(t.accounts) ? t.accounts[0] : t.accounts,
  }));

  return (
    <RendimentosView
      categoryIncomes={categoryIncomes}
      monthSummary={monthSummary}
      recentIncomes={recentIncomes}
      initialIncomeSources={incomeSources}
      categories={categoriesData ?? []}
      accounts={accountsData ?? []}
    />
  );
}
