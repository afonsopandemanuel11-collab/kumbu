import { cn } from "@/lib/utils/cn";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "flex h-10 w-full appearance-none rounded-xl border border-kumbu-200 bg-white px-3.5 py-2",
        "text-sm text-kumbu-900",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234d8b74' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem] pr-9",
        "transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-kumbu-500 focus:ring-offset-0 focus:border-kumbu-400",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-kumbu-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
