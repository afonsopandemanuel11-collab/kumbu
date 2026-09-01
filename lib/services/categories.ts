import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryKind = Database["public"]["Enums"]["category_kind"];

export async function getCategories(
  supabase: SupabaseClient<Database>,
  kind?: CategoryKind
) {
  let query = supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (kind) {
    query = query.eq("kind", kind);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(
  supabase: SupabaseClient<Database>,
  category: {
    user_id: string;
    name: string;
    kind: CategoryKind;
    icon?: string | null;
  }
) {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: category.user_id,
      name: category.name,
      kind: category.kind,
      icon: category.icon ?? null,
      scope: "USER",
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
