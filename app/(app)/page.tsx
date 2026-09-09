import { createClient } from "@/lib/supabase/server";
import { getAccounts, type Account } from "@/lib/services/accounts";
import { getFinancialDiary } from "@/lib/services/transactions";
import {
  getTodaySummary,
  getCurrentMonthSummary,
  getNetWorth,
  getCategoryExpenseBreakdown,
} from "@/lib/services/reports";
import { getGoalProgress } from "@/lib/services/goals";
import { getDebtSummaries } from "@/lib/services/debts";
import { getProjectSummaries } from "@/lib/services/projects";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return (
        <DashboardView
          userName="Utilizador"
          currency="AOA"
          totalBalance={0}
          todaySummary={null}
          monthSummary={null}
          accounts={[]}
          recentDiary={[]}
          goalProgress={[]}
          debtSummaries={[]}
          projectSummaries={[]}
          categoryExpenses={[]}
        />
      );
    }

    const [
      profileRes,
      netWorth,
      todaySummary,
      monthSummary,
      accounts,
      recentDiary,
      goalProgress,
      debtSummaries,
      projectSummaries,
      categoryExpenses,
    ] = await Promise.all([
      Promise.resolve(
        supabase
          .from("profiles")
          .select("full_name, preferred_currency")
          .eq("id", user.id)
          .maybeSingle()
      ).catch(() => ({ data: null })),
      getNetWorth(supabase).catch(() => null),
      getTodaySummary(supabase).catch(() => null),
      getCurrentMonthSummary(supabase).catch(() => null),
      getAccounts(supabase).catch(() => []),
      getFinancialDiary(supabase, { limit: 8 }).catch(() => []),
      getGoalProgress(supabase).catch(() => []),
      getDebtSummaries(supabase).catch(() => []),
      getProjectSummaries(supabase).catch(() => []),
      getCategoryExpenseBreakdown(supabase).catch(() => []),
    ]);

    const profile = (profileRes as any)?.data;
    const displayName =
      profile?.full_name?.split(" ")[0] ??
      user.email?.split("@")[0] ??
      "Utilizador";
    const currency = profile?.preferred_currency ?? "AOA";

    const totalBalance =
      netWorth?.net_worth ??
      ((accounts || []) as Account[]).reduce(
        (sum: number, a: Account) => sum + (a.current_balance ?? 0),
        0
      );

    return (
      <DashboardView
        userName={displayName}
        currency={currency}
        totalBalance={totalBalance}
        todaySummary={todaySummary}
        monthSummary={monthSummary}
        accounts={accounts}
        recentDiary={recentDiary}
        goalProgress={goalProgress}
        debtSummaries={debtSummaries}
        projectSummaries={projectSummaries}
        categoryExpenses={categoryExpenses}
      />
    );
  } catch (err: unknown) {
    if (
      (err as { digest?: string })?.digest === "DYNAMIC_SERVER_USAGE" ||
      String(err).includes("DYNAMIC_SERVER_USAGE")
    ) {
      throw err;
    }
    console.warn("[HomePage] Falha de comunicação remota ao renderizar dashboard:", err);
    return (
      <DashboardView
        userName="Utilizador"
        currency="AOA"
        totalBalance={0}
        todaySummary={null}
        monthSummary={null}
        accounts={[]}
        recentDiary={[]}
        goalProgress={[]}
        debtSummaries={[]}
        projectSummaries={[]}
        categoryExpenses={[]}
      />
    );
  }
}
