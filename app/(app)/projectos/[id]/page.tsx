import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getProjectById,
  getProjectSummaries,
  getProjectDailyActivity,
  getProjectTransactions,
} from "@/lib/services/projects";
import { getAccounts } from "@/lib/services/accounts";
import { ProjectDetailView } from "@/components/projects/project-detail-view";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return notFound();

  try {
    const [project, summaries, dailyActivities, transactions, accounts] =
      await Promise.all([
        getProjectById(supabase, id),
        getProjectSummaries(supabase),
        getProjectDailyActivity(supabase, id),
        getProjectTransactions(supabase, id),
        getAccounts(supabase),
      ]);

    if (!project) return notFound();

    const summary = summaries.find((s) => s.project_id === id) ?? null;

    return (
      <ProjectDetailView
        project={project}
        summary={summary}
        dailyActivities={dailyActivities}
        transactions={transactions}
        accounts={accounts}
        userId={user.id}
      />
    );
  } catch (error) {
    console.error("Error loading project detail:", error);
    return notFound();
  }
}
