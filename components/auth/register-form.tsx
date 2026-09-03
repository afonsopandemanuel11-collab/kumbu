"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpAction } from "@/app/actions/auth";

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

    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : undefined;

      const res = await signUpAction({
        email,
        password,
        fullName,
        origin,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      if (res.hasSession) {
        router.push("/");
        router.refresh();
        return;
      }

      setSuccess(
        "Conta criada com sucesso! Se a confirmação por email estiver activa, verifica a tua caixa de entrada para confirmar o registo antes de entrar.",
      );
    } catch (err: unknown) {
      console.error("Erro no registo:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro de ligação ao servidor. Tenta novamente.",
      );
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
