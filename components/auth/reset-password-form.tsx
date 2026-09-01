"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback?next=/definicoes`,
      },
    );

    if (resetError) {
      setError("Não foi possível enviar o email. Tenta novamente.");
      setLoading(false);
      return;
    }

    setSuccess("Enviámos instruções para o teu email.");
    setLoading(false);
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Recuperar palavra-passe</CardTitle>
        <CardDescription>
          Enviaremos um link para redefinires a tua palavra-passe.
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

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-kumbu-700" role="status">
            {success}
          </p>
        )}

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "A enviar..." : "Enviar link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-kumbu-500">
        <Link href="/login" className="font-medium text-kumbu-700 hover:text-kumbu-800">
          Voltar ao login
        </Link>
      </p>
    </Card>
  );
}
