import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  size?: "sm" | "md";
  className?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  size = "md",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-kumbu-200 text-center",
        size === "md" && "px-6 py-10 gap-3",
        size === "sm" && "px-4 py-6 gap-2",
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            "flex items-center justify-center rounded-2xl bg-kumbu-50",
            size === "md" && "h-14 w-14 text-2xl",
            size === "sm" && "h-10 w-10 text-xl",
          )}
        >
          {icon}
        </span>
      )}
      <div>
        <p
          className={cn(
            "font-semibold text-kumbu-800",
            size === "md" && "text-sm",
            size === "sm" && "text-xs",
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              "mt-1 text-kumbu-500",
              size === "md" && "text-xs leading-relaxed max-w-xs mx-auto",
              size === "sm" && "text-[11px] leading-relaxed",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onAction}
          className={cn(size === "sm" && "text-xs h-8 px-3")}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
