import { cn } from "@/lib/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-kumbu-200 bg-white px-3.5 py-2",
        "text-base sm:text-sm text-kumbu-900 placeholder:text-kumbu-400",
        "transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-kumbu-500 focus:ring-offset-0 focus:border-kumbu-400",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-kumbu-50",
        className,
      )}
      {...props}
    />
  );
}
