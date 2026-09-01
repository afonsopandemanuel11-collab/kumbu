import { cn } from "@/lib/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl border border-kumbu-200 bg-white px-3 text-sm text-kumbu-900",
        "placeholder:text-kumbu-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kumbu-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
