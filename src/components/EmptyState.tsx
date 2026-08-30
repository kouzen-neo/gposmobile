import type { ReactNode } from "react";

// Required states AI forgets (DESIGN.md). One component, three modes.
export function EmptyState({
  title,
  hint,
  icon,
}: {
  title: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {icon && <div className="text-brand/40">{icon}</div>}
      <p className="text-base font-semibold text-brand-ink/70">{title}</p>
      {hint && <p className="text-sm text-brand-ink/50">{hint}</p>}
    </div>
  );
}

export function LoadingState({ label = "Memuat…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-brand-ink/50">
      <span className="h-3 w-3 animate-pulse rounded-full bg-brand" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
