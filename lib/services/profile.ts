import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getProfile(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  updates: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
