import { createClient } from "@/lib/supabase/server";
import { getFinancialDiary } from "@/lib/services/transactions";
import { getAccounts } from "@/lib/services/accounts";
import { DiaryView } from "@/components/diary/diary-view";

export default async function DiarioPage() {
  const supabase = await createClient();
  const [entries, accounts] = await Promise.all([
    getFinancialDiary(supabase, { limit: 150 }),
    getAccounts(supabase),
  ]);

  return <DiaryView initialEntries={entries} accounts={accounts} />;
}
