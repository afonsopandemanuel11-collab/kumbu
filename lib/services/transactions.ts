import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type FinancialDiaryEntry = Database["public"]["Views"]["v_financial_diary"]["Row"];
export type TransactionType = Database["public"]["Enums"]["transaction_type"];

export async function createIncome(
  supabase: SupabaseClient<Database>,
  params: {
    accountId: string;
    amount: number;
    categoryId: string;
    currency?: string;
    date?: string;
    description?: string;
  }
) {
  const { data, error } = await supabase.rpc("create_income", {
    p_account_id: params.accountId,
    p_amount: params.amount,
    p_category_id: params.categoryId,
    p_currency: params.currency ?? "AOA",
    p_date: params.date,
    p_description: params.description,
  });

  if (error) throw error;
  return data;
}

export async function createExpense(
  supabase: SupabaseClient<Database>,
  params: {
    accountId: string;
    amount: number;
    categoryId: string;
    currency?: string;
    date?: string;
    description?: string;
  }
) {
  const { data, error } = await supabase.rpc("create_expense", {
    p_account_id: params.accountId,
    p_amount: params.amount,
    p_category_id: params.categoryId,
    p_currency: params.currency ?? "AOA",
    p_date: params.date,
    p_description: params.description,
  });

  if (error) throw error;
  return data;
}

export async function createTransfer(
  supabase: SupabaseClient<Database>,
  params: {
    accountId: string;
    destinationAccountId: string;
    amount: number;
    date?: string;
    description?: string;
  }
) {
  const { data, error } = await supabase.rpc("create_transfer", {
    p_account_id: params.accountId,
    p_destination_account_id: params.destinationAccountId,
    p_amount: params.amount,
    p_date: params.date,
    p_description: params.description,
  });

  if (error) throw error;
  return data;
}

export async function payDebt(
  supabase: SupabaseClient<Database>,
  params: {
    debtId: string;
    accountId: string;
    amount: number;
    date?: string;
    description?: string;
  }
) {
  const { data, error } = await supabase.rpc("pay_debt", {
    p_debt_id: params.debtId,
    p_account_id: params.accountId,
    p_amount: params.amount,
    p_date: params.date,
    p_description: params.description,
  });

  if (error) throw error;
  return data;
}

export async function contributeToGoal(
  supabase: SupabaseClient<Database>,
  params: {
    goalId: string;
    accountId: string;
    amount: number;
    destinationAccountId?: string;
    date?: string;
    description?: string;
  }
) {
  const { data, error } = await supabase.rpc("contribute_to_goal", {
    p_goal_id: params.goalId,
    p_account_id: params.accountId,
    p_amount: params.amount,
    p_destination_account_id: params.destinationAccountId,
    p_date: params.date,
    p_description: params.description,
  });

  if (error) throw error;
  return data;
}

export async function createProjectTransaction(
  supabase: SupabaseClient<Database>,
  params: {
    userId: string;
    projectId: string;
    accountId: string;
    type: "PROJECT_INCOME" | "PROJECT_EXPENSE";
    amount: number;
    categoryId?: string | null;
    currency?: string;
    date?: string;
    description?: string;
  }
) {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: params.userId,
      project_id: params.projectId,
      account_id: params.accountId,
      type: params.type,
      amount: params.amount,
      category_id: params.categoryId ?? null,
      currency: params.currency ?? "AOA",
      transaction_date: params.date ?? new Date().toISOString(),
      description: params.description ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFinancialDiary(
  supabase: SupabaseClient<Database>,
  options?: {
    type?: TransactionType | "ALL";
    search?: string;
    limit?: number;
    offset?: number;
  }
) {
  let query = supabase
    .from("v_financial_diary")
    .select("*")
    .order("transaction_date", { ascending: false });

  if (options?.type && options.type !== "ALL") {
    query = query.eq("type", options.type);
  }

  if (options?.search) {
    query = query.or(
      `description.ilike.%${options.search}%,category_name.ilike.%${options.search}%,account_name.ilike.%${options.search}%,project_name.ilike.%${options.search}%`
    );
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
