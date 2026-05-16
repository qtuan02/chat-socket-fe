import type { ReactNode } from "react";

type DetailFieldProps = {
  label: string;
  value?: ReactNode;
  fallback?: ReactNode;
};

export function DetailField({
  label,
  value,
  fallback = "-",
}: DetailFieldProps) {
  return (
    <dl className="grid gap-1">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="font-medium break-all">{value ?? fallback}</dd>
    </dl>
  );
}
