"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/app/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signInAction({
        email,
        password,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      console.error("Erro no login:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro de ligação ao servidor. Tenta novamente.",
      );
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          O teu dinheiro. O teu controlo.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Palavra-passe</Label>
            <Link
              href="/recuperar-palavra-passe"
              className="text-xs font-medium text-kumbu-600 hover:text-kumbu-700"
            >
              Esqueceste-te?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
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

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "A entrar..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-kumbu-500">
        Ainda não tens conta?{" "}
        <Link href="/registo" className="font-medium text-kumbu-700 hover:text-kumbu-800">
          Criar conta
        </Link>
      </p>
    </Card>
  );
}
