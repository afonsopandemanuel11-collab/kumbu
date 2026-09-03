"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setError(
        "Configuração em falta: As variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não estão configuradas na Vercel (Project Settings > Environment Variables).",
      );
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (signUpError) {
        console.error("Erro no signUp Supabase:", signUpError);
        let msg = signUpError.message;
        if (msg.includes("User already registered") || msg.includes("already registered")) {
          msg = "Este email já se encontra registado. Tenta iniciar sessão ou recuperar a palavra-passe.";
        } else if (msg.includes("Password should be at least")) {
          msg = "A palavra-passe deve ter pelo menos 6 caracteres.";
        } else if (msg.toLowerCase().includes("rate limit")) {
          msg = "Limite de tentativas excedido. Aguarda alguns minutos e tenta novamente.";
        } else if (msg.includes("Signups not allowed")) {
          msg = "Os novos registos estão desativados nas configurações de autenticação do Supabase.";
        } else if (msg.includes("Database error saving new user")) {
          msg = "Erro ao criar utilizador na base de dados (trigger do Supabase). Verifica a tabela profiles.";
        }
        setError(msg);
        setLoading(false);
        return;
      }

      // Se o utilizador já existe com confirmação por email activa, o Supabase devolve identities vazio
      if (
        signUpData?.user &&
        signUpData.user.identities &&
        signUpData.user.identities.length === 0
      ) {
        setError("Este email já se encontra registado. Tenta iniciar sessão.");
        setLoading(false);
        return;
      }

      // Se devolveu sessão directamente (confirmação por email desactivada no Supabase)
      if (signUpData?.session) {
        router.push("/");
        router.refresh();
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        router.push("/");
        router.refresh();
        return;
      }

      setSuccess(
        "Conta criada com sucesso! Se a confirmação por email estiver activa, verifica a tua caixa de entrada para confirmar o registo antes de entrar.",
      );
    } catch (err: unknown) {
      console.error("Erro inesperado no registo:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Erro de ligação. Verifica as variáveis de ambiente na Vercel.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>
          Começa a gerir as tuas finanças com o Kumbu.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome</Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="O teu nome"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Palavra-passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error && (
          <div
            className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800"
            role="status"
          >
            {success}
          </div>
        )}

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "A criar conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-kumbu-500">
        Já tens conta?{" "}
        <Link href="/login" className="font-medium text-kumbu-700 hover:text-kumbu-800">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
