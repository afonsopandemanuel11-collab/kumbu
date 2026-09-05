import type { SupabaseClient } from "@supabase/supabase-js";

export type IncomeSourceFrequency =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "YEARLY"
  | "OCCASIONAL";

export type IncomeSource = {
  id: string;
  user_id?: string;
  name: string;
  amount: number;
  currency: string;
  frequency: IncomeSourceFrequency;
  hours_per_period: number;
  category_id?: string | null;
  account_id?: string | null;
  is_active: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  categories?: { name: string; icon: string | null } | null;
  accounts?: { name: string } | null;
};

export const frequencyDisplay: Record<IncomeSourceFrequency, string> = {
  WEEKLY: "Semanal",
  BIWEEKLY: "Quinzenal",
  MONTHLY: "Mensal",
  YEARLY: "Anual",
  OCCASIONAL: "Ocasional",
};

export async function getIncomeSources(
  supabase: SupabaseClient<any>
): Promise<IncomeSource[]> {
  try {
    const { data, error } = await supabase
      .from("income_sources")
      .select("*, categories(name, icon), accounts(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("income_sources table not yet available in Supabase:", error.message);
      return [];
    }

    return (data as IncomeSource[]) ?? [];
  } catch (err) {
    console.warn("Could not query income_sources:", err);
    return [];
  }
}

export async function createIncomeSource(
  supabase: SupabaseClient<any>,
  source: {
    user_id: string;
    name: string;
    amount: number;
    currency?: string;
    frequency?: IncomeSourceFrequency;
    hours_per_period?: number;
    category_id?: string | null;
    account_id?: string | null;
    notes?: string | null;
  }
) {
  const { data, error } = await supabase
    .from("income_sources")
    .insert({
      user_id: source.user_id,
      name: source.name,
      amount: source.amount,
      currency: source.currency ?? "AOA",
      frequency: source.frequency ?? "MONTHLY",
      hours_per_period: source.hours_per_period ?? 0,
      category_id: source.category_id ?? null,
      account_id: source.account_id ?? null,
      notes: source.notes ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateIncomeSource(
  supabase: SupabaseClient<any>,
  sourceId: string,
  updates: Partial<Omit<IncomeSource, "id" | "user_id" | "created_at">>
) {
  const { data, error } = await supabase
    .from("income_sources")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sourceId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteIncomeSource(
  supabase: SupabaseClient<any>,
  sourceId: string
) {
  const { error } = await supabase
    .from("income_sources")
    .delete()
    .eq("id", sourceId);

  if (error) throw error;
  return true;
}
