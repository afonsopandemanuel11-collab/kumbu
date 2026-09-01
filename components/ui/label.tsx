import { cn } from "@/lib/utils/cn";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-sm font-medium text-kumbu-800", className)}
      {...props}
    />
  );
}
