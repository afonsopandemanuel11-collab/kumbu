import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type Budget = Database["public"]["Tables"]["budgets"]["Row"];
export type BudgetVsActual = Database["public"]["Views"]["v_budget_vs_actual"]["Row"];
export type BudgetPeriodType = Database["public"]["Enums"]["budget_period_type"];
export type RecurringTransaction = Database["public"]["Tables"]["recurring_transactions"]["Row"];
export type CashFlowProjection = Database["public"]["Views"]["v_cash_flow_projection"]["Row"];

export async function getBudgets(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("budgets")
    .select("*, categories(name, kind, icon), accounts(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getBudgetVsActual(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("v_budget_vs_actual")
    .select("*");

  if (error) throw error;
  return data ?? [];
}

export async function createBudget(
  supabase: SupabaseClient<Database>,
  budget: {
    user_id: string;
    amount: number;
    category_id?: string | null;
    account_id?: string | null;
    period_type?: BudgetPeriodType;
    start_date: string;
    end_date: string;
  }
) {
  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: budget.user_id,
      amount: budget.amount,
      category_id: budget.category_id ?? null,
      account_id: budget.account_id ?? null,
      period_type: budget.period_type ?? "MONTHLY",
      start_date: budget.start_date,
      end_date: budget.end_date,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBudget(
  supabase: SupabaseClient<Database>,
  budgetId: string,
  updates: Partial<Omit<Budget, "id" | "user_id" | "created_at">>
) {
  const { data, error } = await supabase
    .from("budgets")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", budgetId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRecurringTransactions(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("recurring_transactions")
    .select("*, categories(name, icon), accounts(name)")
    .order("next_occurrence", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getCashFlowProjections(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("v_cash_flow_projection")
    .select("*")
    .order("next_occurrence", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createRecurringTransaction(
  supabase: SupabaseClient<Database>,
  recurring: {
    user_id: string;
    account_id: string;
    destination_account_id?: string | null;
    category_id?: string | null;
    project_id?: string | null;
    type: Database["public"]["Enums"]["transaction_type"];
    amount: number;
    frequency: Database["public"]["Enums"]["recurring_frequency"];
    start_date: string;
    end_date?: string | null;
    next_occurrence: string;
    description?: string | null;
  }
) {
  const { data, error } = await supabase
    .from("recurring_transactions")
    .insert({
      user_id: recurring.user_id,
      account_id: recurring.account_id,
      destination_account_id: recurring.destination_account_id ?? null,
      category_id: recurring.category_id ?? null,
      project_id: recurring.project_id ?? null,
      type: recurring.type,
      amount: recurring.amount,
      frequency: recurring.frequency,
      start_date: recurring.start_date,
      end_date: recurring.end_date ?? null,
      next_occurrence: recurring.next_occurrence,
      description: recurring.description ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
