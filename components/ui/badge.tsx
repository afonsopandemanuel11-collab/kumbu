import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "success" | "danger" | "warning" | "info" | "neutral";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-kumbu-100 text-kumbu-800 border-kumbu-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
  neutral: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: "sm" | "md";
};

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
