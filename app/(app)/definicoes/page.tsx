import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings/settings-form";

export default async function DefinicoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-kumbu-900">
          Definições & Perfil
        </h1>
        <p className="mt-1 text-sm text-kumbu-500">
          Gere as tuas preferências pessoais e dados da conta.
        </p>
      </div>

      <SettingsForm
        initialProfile={profile}
        userEmail={user?.email ?? ""}
        userId={user!.id}
      />
    </div>
  );
}
