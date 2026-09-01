import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-kumbu-200 bg-kumbu-50/50 px-6 py-12 text-center",
        className,
      )}
    >
      <h2 className="text-lg font-semibold text-kumbu-900">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-kumbu-500">{description}</p>
      {actionLabel &&
        (actionHref ? (
          <Link href={actionHref} className="mt-6">
            <Button>{actionLabel}</Button>
          </Link>
        ) : (
          <Button className="mt-6" onClick={onAction}>
            {actionLabel}
          </Button>
        ))}
    </div>
  );
}
