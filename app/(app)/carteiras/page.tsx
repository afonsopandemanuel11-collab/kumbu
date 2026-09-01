import { createClient } from "@/lib/supabase/server";
import { getAccounts } from "@/lib/services/accounts";
import { AccountsView } from "@/components/accounts/accounts-view";

export default async function CarteirasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const accounts = await getAccounts(supabase);

  return <AccountsView initialAccounts={accounts} userId={user!.id} />;
}
