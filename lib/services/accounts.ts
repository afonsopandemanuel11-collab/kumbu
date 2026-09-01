import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type Account = Database["public"]["Tables"]["accounts"]["Row"];
export type AccountInsert = Database["public"]["Tables"]["accounts"]["Insert"];
export type AccountUpdate = Database["public"]["Tables"]["accounts"]["Update"];
export type AccountType = Database["public"]["Enums"]["account_type"];

export async function getAccounts(supabase: SupabaseClient<Database>, includeArchived = false) {
  let query = supabase
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: true });

  if (!includeArchived) {
    query = query.is("archived_at", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getAccountById(supabase: SupabaseClient<Database>, accountId: string) {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .single();

  if (error) throw error;
  return data;
}

export async function createAccount(
  supabase: SupabaseClient<Database>,
  account: {
    user_id: string;
    name: string;
    type?: AccountType;
    currency?: string;
    initial_balance?: number;
    description?: string | null;
  }
) {
  const initial = account.initial_balance ?? 0;
  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: account.user_id,
      name: account.name,
      type: account.type ?? "BANK",
      currency: account.currency ?? "AOA",
      initial_balance: initial,
      current_balance: initial,
      description: account.description ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAccount(
  supabase: SupabaseClient<Database>,
  accountId: string,
  updates: AccountUpdate
) {
  const { data, error } = await supabase
    .from("accounts")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function archiveAccount(supabase: SupabaseClient<Database>, accountId: string) {
  const { data, error } = await supabase
    .from("accounts")
    .update({
      is_active: false,
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
