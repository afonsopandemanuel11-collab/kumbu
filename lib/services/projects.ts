import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectSummary = Database["public"]["Views"]["v_project_summary"]["Row"];
export type ProjectDailyActivity = Database["public"]["Views"]["v_project_daily_activity"]["Row"];
export type ProjectStatus = Database["public"]["Enums"]["project_status"];

export async function getProjects(supabase: SupabaseClient<Database>, includeArchived = false) {
  let query = supabase
    .from("projects")
    .select("*, accounts(name)")
    .order("created_at", { ascending: false });

  if (!includeArchived) {
    query = query.is("archived_at", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getProjectSummaries(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("v_project_summary")
    .select("*");

  if (error) throw error;
  return data ?? [];
}

export async function getProjectDailyActivity(
  supabase: SupabaseClient<Database>,
  projectId: string
) {
  const { data, error } = await supabase
    .from("v_project_daily_activity")
    .select("*")
    .eq("project_id", projectId)
    .order("day", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createProject(
  supabase: SupabaseClient<Database>,
  project: {
    user_id: string;
    name: string;
    budget?: number | null;
    account_id?: string | null;
    currency?: string;
    status?: ProjectStatus;
    start_date?: string | null;
    end_date?: string | null;
    description?: string | null;
  }
) {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: project.user_id,
      name: project.name,
      budget: project.budget ?? null,
      account_id: project.account_id ?? null,
      currency: project.currency ?? "AOA",
      status: project.status ?? "ACTIVE",
      start_date: project.start_date ?? null,
      end_date: project.end_date ?? null,
      description: project.description ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectById(
  supabase: SupabaseClient<Database>,
  projectId: string
) {
  const { data, error } = await supabase
    .from("projects")
    .select("*, accounts(name)")
    .eq("id", projectId)
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectTransactions(
  supabase: SupabaseClient<Database>,
  projectId: string
) {
  const { data, error } = await supabase
    .from("transactions")
    .select("*, categories(name, icon), accounts:accounts!transactions_account_id_fkey(name)")
    .eq("project_id", projectId)
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false });

  if (error) throw error;
  return (data as any) ?? [];
}

export async function updateProject(
  supabase: SupabaseClient<Database>,
  projectId: string,
  updates: Partial<Omit<Project, "id" | "user_id" | "created_at">>
) {
  const { data, error } = await supabase
    .from("projects")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
