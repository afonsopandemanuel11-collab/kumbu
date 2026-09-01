import { createClient } from "@/lib/supabase/server";
import { getProjects, getProjectSummaries } from "@/lib/services/projects";
import { getAccounts } from "@/lib/services/accounts";
import { ProjectsView } from "@/components/projects/projects-view";

export default async function ProjectosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [projects, summaries, accounts] = await Promise.all([
    getProjects(supabase),
    getProjectSummaries(supabase),
    getAccounts(supabase),
  ]);

  return (
    <ProjectsView
      initialProjects={projects}
      summaries={summaries}
      accounts={accounts}
      userId={user!.id}
    />
  );
}
