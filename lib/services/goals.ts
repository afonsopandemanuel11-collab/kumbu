import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type GoalProgress = Database["public"]["Views"]["v_goal_progress"]["Row"];
export type GoalPriority = Database["public"]["Enums"]["goal_priority"];
export type GoalStatus = Database["public"]["Enums"]["goal_status"];

export async function getGoals(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("goals")
    .select("*, accounts(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getGoalProgress(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("v_goal_progress")
    .select("*");

  if (error) throw error;
  return data ?? [];
}

export async function createGoal(
  supabase: SupabaseClient<Database>,
  goal: {
    user_id: string;
    name: string;
    target_amount: number;
    account_id?: string | null;
    currency?: string;
    deadline?: string | null;
    priority?: GoalPriority;
    description?: string | null;
  }
) {
  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: goal.user_id,
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: 0,
      account_id: goal.account_id ?? null,
      currency: goal.currency ?? "AOA",
      deadline: goal.deadline ?? null,
      priority: goal.priority ?? "MEDIUM",
      description: goal.description ?? null,
      status: "ACTIVE",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGoal(
  supabase: SupabaseClient<Database>,
  goalId: string,
  updates: Partial<Omit<Goal, "id" | "user_id" | "created_at">>
) {
  const { data, error } = await supabase
    .from("goals")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getGoalById(
  supabase: SupabaseClient<Database>,
  goalId: string
) {
  const { data, error } = await supabase
    .from("goals")
    .select("*, accounts(name)")
    .eq("id", goalId)
    .single();

  if (error) throw error;
  return data;
}

export async function getGoalContributions(
  supabase: SupabaseClient<Database>,
  goalId: string
) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*, accounts:accounts!transactions_account_id_fkey(name)")
    .eq("goal_id", goalId)
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false });

  if (error) throw error;
  return (data as any) ?? [];
}
