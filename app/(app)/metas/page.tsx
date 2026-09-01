import { createClient } from "@/lib/supabase/server";
import { getGoals, getGoalProgress } from "@/lib/services/goals";
import { getAccounts } from "@/lib/services/accounts";
import { GoalsView } from "@/components/goals/goals-view";

export default async function MetasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [goals, progressList, accounts] = await Promise.all([
    getGoals(supabase),
    getGoalProgress(supabase),
    getAccounts(supabase),
  ]);

  return (
    <GoalsView
      initialGoals={goals}
      progressList={progressList}
      accounts={accounts}
      userId={user!.id}
    />
  );
}
