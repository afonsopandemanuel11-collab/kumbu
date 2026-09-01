import { EmptyState } from "@/components/ui/empty-state";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-kumbu-900">{title}</h1>
      <p className="mt-1 text-sm text-kumbu-500">{description}</p>
      <EmptyState
        className="mt-6"
        title="Em breve"
        description="Esta secção será implementada na próxima fase, ligada ao Supabase real."
      />
    </div>
  );
}
