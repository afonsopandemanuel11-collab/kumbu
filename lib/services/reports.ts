import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type NetWorth = Database["public"]["Views"]["v_net_worth"]["Row"];
export type DailySummary = Database["public"]["Views"]["v_daily_summary"]["Row"];
export type MonthlySummary = Database["public"]["Views"]["v_monthly_summary"]["Row"];
export type CategoryExpenseBreakdown = Database["public"]["Views"]["v_category_expense_breakdown"]["Row"];
export type AccountExpenseBreakdown = Database["public"]["Views"]["v_account_expense_breakdown"]["Row"];
export type IncomeByCategory = Database["public"]["Views"]["v_income_by_category"]["Row"];

export async function getNetWorth(supabase: SupabaseClient<Database>) {
  try {
    const { data, error } = await supabase
      .from("v_net_worth")
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Error in getNetWorth:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Exception in getNetWorth:", err);
    return null;
  }
}

export async function getDailySummaries(supabase: SupabaseClient<Database>, limit = 30) {
  try {
    const { data, error } = await supabase
      .from("v_daily_summary")
      .select("*")
      .order("day", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error in getDailySummaries:", error);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error("Exception in getDailySummaries:", err);
    return [];
  }
}

export async function getTodaySummary(supabase: SupabaseClient<Database>) {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    const { data, error } = await supabase
      .from("v_daily_summary")
      .select("*")
      .eq("day", today)
      .maybeSingle();

    if (error) {
      console.error("Error in getTodaySummary:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Exception in getTodaySummary:", err);
    return null;
  }
}

export async function getMonthlySummaries(supabase: SupabaseClient<Database>, limit = 12) {
  try {
    const { data, error } = await supabase
      .from("v_monthly_summary")
      .select("*")
      .order("month", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error in getMonthlySummaries:", error);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error("Exception in getMonthlySummaries:", err);
    return [];
  }
}

export async function getCurrentMonthSummary(supabase: SupabaseClient<Database>) {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const firstDay = `${year}-${month}-01`;

    // Try matching firstDay of month, fallback to latest summary
    const { data, error } = await supabase
      .from("v_monthly_summary")
      .select("*")
      .eq("month", firstDay)
      .maybeSingle();

    if (!error && data) {
      return data;
    }

    // Fallback query by latest month entry
    const { data: latestData } = await supabase
      .from("v_monthly_summary")
      .select("*")
      .order("month", { ascending: false })
      .limit(1)
      .maybeSingle();

    return latestData ?? null;
  } catch (err) {
    console.error("Exception in getCurrentMonthSummary:", err);
    return null;
  }
}

export async function getCategoryExpenseBreakdown(supabase: SupabaseClient<Database>) {
  try {
    const { data, error } = await supabase
      .from("v_category_expense_breakdown")
      .select("*")
      .order("total", { ascending: false });

    if (error) {
      console.error("Error in getCategoryExpenseBreakdown:", error);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error("Exception in getCategoryExpenseBreakdown:", err);
    return [];
  }
}

export async function getIncomeByCategory(supabase: SupabaseClient<Database>) {
  try {
    const { data, error } = await supabase
      .from("v_income_by_category")
      .select("*")
      .order("total", { ascending: false });

    if (error) {
      console.error("Error in getIncomeByCategory:", error);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error("Exception in getIncomeByCategory:", err);
    return [];
  }
}

export async function getAccountExpenseBreakdown(supabase: SupabaseClient<Database>) {
  try {
    const { data, error } = await supabase
      .from("v_account_expense_breakdown")
      .select("*")
      .order("total", { ascending: false });

    if (error) {
      console.error("Error in getAccountExpenseBreakdown:", error);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error("Exception in getAccountExpenseBreakdown:", err);
    return [];
  }
}
