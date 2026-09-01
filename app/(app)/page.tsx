import { createClient } from "@/lib/supabase/server";
import { getAccounts } from "@/lib/services/accounts";
import { getFinancialDiary } from "@/lib/services/transactions";
import { getTodaySummary, getCurrentMonthSummary, getNetWorth } from "@/lib/services/reports";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: profile },
    netWorth,
    todaySummary,
    monthSummary,
    accounts,
    recentDiary,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, preferred_currency")
      .eq("id", user!.id)
      .maybeSingle(),
    getNetWorth(supabase),
    getTodaySummary(supabase),
    getCurrentMonthSummary(supabase),
    getAccounts(supabase),
    getFinancialDiary(supabase, { limit: 10 }),
  ]);

  const displayName = profile?.full_name?.split(" ")[0] ?? "a�";
  const currency = profile?.preferred_currency ?? "AOA";
  
  // Calculate total balance from net_worth view or sum of accounts
  const totalBalance = netWorth?.net_worth ?? accounts.reduce((sum, a) => sum + (a.current_balance ?? 0), 0);

  return (
    <DashboardView
      userName={displayName}
      currency={currency}
      totalBalance={totalBalance}
      todaySummary={todaySummary}
      monthSummary={monthSummary}
      accounts={accounts}
      recentDiary={recentDiary}
    />
  );
}
