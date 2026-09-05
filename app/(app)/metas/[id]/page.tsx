import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getGoalById,
  getGoalProgress,
  getGoalContributions,
} from "@/lib/services/goals";
import { getAccounts } from "@/lib/services/accounts";
import { GoalDetailView } from "@/components/goals/goal-detail-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GoalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return notFound();

  try {
    const [goal, progressList, contributions, accounts] = await Promise.all([
      getGoalById(supabase, id),
      getGoalProgress(supabase),
      getGoalContributions(supabase, id),
      getAccounts(supabase),
    ]);

    if (!goal) return notFound();

    const progress = progressList.find((p) => p.goal_id === id) ?? null;

    return (
      <GoalDetailView
        goal={goal}
        progress={progress}
        contributions={contributions}
        accounts={accounts}
        userId={user.id}
      />
    );
  } catch (error) {
    console.error("Error loading goal detail:", error);
    return notFound();
  }
}
