import { createClient } from "@/lib/supabase/server";
import { getDebts } from "@/lib/services/debts";
import { getAccounts } from "@/lib/services/accounts";
import { DebtsView } from "@/components/debts/debts-view";

export default async function DividasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [debts, accounts] = await Promise.all([
    getDebts(supabase),
    getAccounts(supabase),
  ]);

  return (
    <DebtsView
      initialDebts={debts}
      accounts={accounts}
      userId={user!.id}
    />
  );
}
