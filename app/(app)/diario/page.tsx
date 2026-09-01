import { createClient } from "@/lib/supabase/server";
import { getFinancialDiary } from "@/lib/services/transactions";
import { DiaryView } from "@/components/diary/diary-view";

export default async function DiarioPage() {
  const supabase = await createClient();
  const entries = await getFinancialDiary(supabase, { limit: 100 });

  return <DiaryView initialEntries={entries} />;
}
