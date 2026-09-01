"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { updateProfile, type Profile } from "@/lib/services/profile";

type SettingsFormProps = {
  initialProfile: Profile | null;
  userEmail: string;
  userId: string;
};

export function SettingsForm({ initialProfile, userEmail, userId }: SettingsFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialProfile?.full_name ?? "");
  const [currency, setCurrency] = useState(initialProfile?.preferred_currency ?? "AOA");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();
      await updateProfile(supabase, userId, {
        full_name: fullName.trim() || null,
        preferred_currency: currency,
      });

      setMessage({ text: "Perfil actualizado com sucesso!", type: "success" });
      router.refresh();
    } catch {
      setMessage({ text: "N�o foi poss�vel guardar as altera��es. Tenta novamente.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      setPasswordMessage({ text: "Palavra-passe alterada com sucesso!", type: "success" });
      setNewPassword("");
    } catch {
      setPasswordMessage({ text: "N�o foi poss�vel actualizar a palavra-passe. Tenta novamente.", type: "error" });
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informa��es Pessoais</CardTitle>
            <Badge variant="info">
              {initialProfile?.role === "ADMIN" ? "Administrador" : "Utilizador"}
            </Badge>
          </div>
          <CardDescription>
            Actualiza o teu nome e moeda preferida.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleProfileSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={userEmail} disabled className="bg-kumbu-50 opacity-70" />
            <p className="text-[11px] text-kumbu-400">O email de acesso n�o pode ser alterado directamente.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              placeholder="O teu nome"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="currency">Moeda Principal</Label>
            <Select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="AOA">Kwanza Angolano (Kz / AOA)</option>
              <option value="USD">D�lar Americano ($ / USD)</option>
              <option value="EUR">Euro (� / EUR)</option>
              <option value="BRL">Real Brasileiro (R$ / BRL)</option>
            </Select>
          </div>

          {message && (
            <div
              className={`rounded-xl p-3 text-xs ${
                message.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-rose-200 bg-rose-50 text-rose-700"
              }`}
              role="alert"
            >
              {message.text}
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "A guardar..." : "Guardar Altera��es"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <CardTitle>Seguran�a</CardTitle>
          <CardDescription>
            Actualiza a tua palavra-passe de acesso.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">Nova Palavra-passe</Label>
            <Input
              id="new-password"
              type="password"
              minLength={6}
              placeholder="M�nimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          {passwordMessage && (
            <div
              className={`rounded-xl p-3 text-xs ${
                passwordMessage.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border border-rose-200 bg-rose-50 text-rose-700"
              }`}
              role="alert"
            >
              {passwordMessage.text}
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" variant="secondary" disabled={passwordLoading || !newPassword}>
              {passwordLoading ? "A actualizar..." : "Actualizar Palavra-passe"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
