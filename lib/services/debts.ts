import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type Debt = Database["public"]["Tables"]["debts"]["Row"];
export type DebtSummary = Database["public"]["Views"]["v_debt_summary"]["Row"];
export type DebtType = Database["public"]["Enums"]["debt_type"];
export type DebtStatus = Database["public"]["Enums"]["debt_status"];

export async function getDebts(
  supabase: SupabaseClient<Database>,
  type?: DebtType
) {
  let query = supabase
    .from("debts")
    .select("*")
    .order("created_at", { ascending: false });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getDebtSummaries(
  supabase: SupabaseClient<Database>,
  type?: DebtType
) {
  let query = supabase.from("v_debt_summary").select("*");

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createDebt(
  supabase: SupabaseClient<Database>,
  debt: {
    user_id: string;
    person_name: string;
    type: DebtType;
    original_amount: number;
    currency?: string;
    due_date?: string | null;
    description?: string | null;
  }
) {
  const { data, error } = await supabase
    .from("debts")
    .insert({
      user_id: debt.user_id,
      person_name: debt.person_name,
      type: debt.type,
      original_amount: debt.original_amount,
      remaining_amount: debt.original_amount,
      currency: debt.currency ?? "AOA",
      due_date: debt.due_date ?? null,
      description: debt.description ?? null,
      status: "OPEN",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDebt(
  supabase: SupabaseClient<Database>,
  debtId: string,
  updates: Partial<Omit<Debt, "id" | "user_id" | "created_at">>
) {
  const { data, error } = await supabase
    .from("debts")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", debtId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
