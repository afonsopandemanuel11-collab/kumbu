import type { SupabaseClient } from "@supabase/supabase-js";

export type AllocationRule = {
  id: string;
  user_id?: string;
  name: string;
  percentage: number;
  color?: string;
  icon?: string;
  target_account_id?: string | null;
  target_category_id?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
};

export const DEFAULT_ALLOCATION_RULES: Omit<AllocationRule, "id">[] = [
  { name: "Investimento / Futuro", percentage: 20, color: "bg-blue-500", icon: "📈", is_active: true, sort_order: 1 },
  { name: "Eu / Lazer & Pessoal", percentage: 20, color: "bg-amber-500", icon: "🌴", is_active: true, sort_order: 2 },
  { name: "Fundo Protegido (Reserva)", percentage: 10, color: "bg-purple-500", icon: "🛡️", is_active: true, sort_order: 3 },
  { name: "Família / Essenciais", percentage: 30, color: "bg-emerald-500", icon: "🏠", is_active: true, sort_order: 4 },
  { name: "Metas & Projectos", percentage: 20, color: "bg-kumbu-600", icon: "🎯", is_active: true, sort_order: 5 },
];

export async function getAllocationRules(
  supabase: SupabaseClient<any>
): Promise<AllocationRule[]> {
  try {
    const { data, error } = await supabase
      .from("allocation_rules")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      // Return default rules if table is empty or not yet migrated
      return DEFAULT_ALLOCATION_RULES.map((rule, idx) => ({
        ...rule,
        id: `default-${idx}`,
      }));
    }

    return data as AllocationRule[];
  } catch {
    return DEFAULT_ALLOCATION_RULES.map((rule, idx) => ({
      ...rule,
      id: `default-${idx}`,
    }));
  }
}

export async function saveAllocationRule(
  supabase: SupabaseClient<any>,
  rule: {
    user_id: string;
    name: string;
    percentage: number;
    color?: string;
    icon?: string;
    sort_order?: number;
  }
) {
  const { data, error } = await supabase
    .from("allocation_rules")
    .insert({
      user_id: rule.user_id,
      name: rule.name,
      percentage: rule.percentage,
      color: rule.color ?? "bg-kumbu-600",
      icon: rule.icon ?? "💰",
      sort_order: rule.sort_order ?? 0,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAllocationRule(
  supabase: SupabaseClient<any>,
  ruleId: string,
  updates: Partial<Omit<AllocationRule, "id" | "user_id" | "created_at">>
) {
  const { data, error } = await supabase
    .from("allocation_rules")
    .update(updates)
    .eq("id", ruleId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAllocationRule(
  supabase: SupabaseClient<any>,
  ruleId: string
) {
  const { error } = await supabase
    .from("allocation_rules")
    .delete()
    .eq("id", ruleId);

  if (error) throw error;
  return true;
}

export async function resetDefaultAllocationRules(
  supabase: SupabaseClient<any>,
  userId: string
) {
  // First remove existing rules
  await supabase.from("allocation_rules").delete().eq("user_id", userId);

  // Re-insert default rules
  const toInsert = DEFAULT_ALLOCATION_RULES.map((r) => ({
    ...r,
    user_id: userId,
  }));

  const { data, error } = await supabase
    .from("allocation_rules")
    .insert(toInsert)
    .select();

  if (error) throw error;
  return data as AllocationRule[];
}

export async function syncAllocationRules(
  supabase: SupabaseClient<any>,
  userId: string,
  rules: { name: string; percentage: number; color?: string; icon?: string; sort_order?: number }[]
) {
  // Clear old rules for this user
  await supabase.from("allocation_rules").delete().eq("user_id", userId);

  const toInsert = rules.map((r, idx) => ({
    user_id: userId,
    name: r.name,
    percentage: r.percentage,
    color: r.color ?? "bg-kumbu-600",
    icon: r.icon ?? "💰",
    sort_order: r.sort_order ?? idx + 1,
    is_active: true,
  }));

  const { data, error } = await supabase
    .from("allocation_rules")
    .insert(toInsert)
    .select();

  if (error) throw error;
  return data as AllocationRule[];
}
