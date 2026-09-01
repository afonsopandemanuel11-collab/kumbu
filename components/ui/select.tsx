import { cn } from "@/lib/utils/cn";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
};

export function Select({ className, error, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-8 text-sm text-kumbu-900 transition-colors",
          "focus:border-kumbu-500 focus:outline-none focus:ring-2 focus:ring-kumbu-400/20",
          "disabled:cursor-not-allowed disabled:bg-kumbu-50 disabled:opacity-60",
          error ? "border-rose-300 focus:border-rose-500 focus:ring-rose-400/20" : "border-kumbu-200",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-kumbu-400">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}
