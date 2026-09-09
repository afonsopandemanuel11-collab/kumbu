"use server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export type AuthResult = {
  success?: boolean;
  hasSession?: boolean;
  error?: string;
};

function getFetchErrorDiagnostic(errOrError: unknown): string {
  const { url, anonKey } = getSupabaseEnv();
  let host = "não definida";
  try {
    host = url ? new URL(url).hostname : "não definida";
  } catch {
    host = url ? `inválida (${url.slice(0, 20)}...)` : "não definida";
  }

  const cause =
    (errOrError as { cause?: { code?: string; message?: string } })?.cause?.code ||
    (errOrError as { cause?: { code?: string; message?: string } })?.cause?.message ||
    (errOrError as { status?: number })?.status ||
    "";

  const causeStr = String(cause || "").toLowerCase();
  const errStr = String(errOrError || "").toLowerCase();

  if (
    causeStr.includes("enotfound") ||
    causeStr.includes("econnrefused") ||
    causeStr.includes("fetch failed") ||
    errStr.includes("fetch failed") ||
    errStr.includes("network")
  ) {
    return "Sem ligação à internet. Por favor, liga a tua internet para aceder à tua conta.";
  }

  const hasKey = !!anonKey && anonKey.length > 5;
  return `Falha de ligação ao Supabase [Host: ${host} | Chave: ${hasKey ? "OK" : "Ausente"} | Causa: ${cause || "fetch failed"}]. Verifica as variáveis de ambiente na Vercel.`;
}

export async function signUpAction(params: {
  email: string;
  password: string;
  fullName: string;
  origin?: string;
}): Promise<AuthResult> {
  try {
    const supabase = await createClient();
    const redirectUrl = params.origin
      ? `${params.origin}/auth/callback`
      : undefined;

    const { data, error } = await supabase.auth.signUp({
      email: params.email.trim(),
      password: params.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: params.fullName.trim(),
        },
      },
    });

    if (error) {
      console.error("Erro no signUpAction:", error);
      let msg = error.message;
      if (
        msg.includes("fetch failed") ||
        (error as { status?: number }).status === 0 ||
        error.name === "AuthRetryableFetchError"
      ) {
        msg = getFetchErrorDiagnostic(error);
      } else if (
        msg.includes("User already registered") ||
        msg.includes("already registered")
      ) {
        msg =
          "Este email já se encontra registado. Tenta iniciar sessão ou recuperar a palavra-passe.";
      } else if (msg.includes("Password should be at least")) {
        msg = "A palavra-passe deve ter pelo menos 6 caracteres.";
      } else if (msg.toLowerCase().includes("rate limit")) {
        msg =
          "Limite de tentativas excedido. Aguarda alguns minutos e tenta novamente.";
      } else if (msg.includes("Signups not allowed")) {
        msg =
          "Os novos registos estão desativados nas configurações do Supabase.";
      } else if (msg.includes("Database error saving new user")) {
        msg =
          "Erro ao guardar utilizador na base de dados (trigger do Supabase).";
      }
      return { error: msg };
    }

    if (
      data?.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      return {
        error:
          "Este email já se encontra registado. Tenta iniciar sessão.",
      };
    }

    return {
      success: true,
      hasSession: !!data?.session,
    };
  } catch (err: unknown) {
    console.error("Excepção no signUpAction:", err);
    const errMessage = err instanceof Error ? err.message : "";
    return {
      error: errMessage.includes("fetch failed")
        ? getFetchErrorDiagnostic(err)
        : errMessage || "Erro de comunicação com o servidor. Tenta novamente.",
    };
  }
}

export async function signInAction(params: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: params.email.trim(),
      password: params.password,
    });

    if (error) {
      console.error("Erro no signInAction:", error);
      let msg = error.message;
      if (
        msg.includes("fetch failed") ||
        (error as { status?: number }).status === 0 ||
        error.name === "AuthRetryableFetchError"
      ) {
        msg = getFetchErrorDiagnostic(error);
      } else if (
        msg.includes("Invalid login credentials") ||
        msg.includes("invalid_grant")
      ) {
        msg = "Email ou palavra-passe incorrectos. Tenta novamente.";
      } else if (msg.includes("Email not confirmed")) {
        msg =
          "O teu email ainda não foi confirmado. Verifica a tua caixa de correio antes de entrar.";
      }
      return { error: msg };
    }

    return {
      success: true,
      hasSession: !!data?.session,
    };
  } catch (err: unknown) {
    console.error("Excepção no signInAction:", err);
    const errMessage = err instanceof Error ? err.message : "";
    return {
      error: errMessage.includes("fetch failed")
        ? getFetchErrorDiagnostic(err)
        : errMessage || "Erro de comunicação com o servidor. Tenta novamente.",
    };
  }
}
