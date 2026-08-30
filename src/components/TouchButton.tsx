import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "accent" | "ghost" | "outline";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

// 48px min touch target (DESIGN.md). No transition-all.
const styles: Record<Variant, string> = {
  primary: "bg-brand text-surface hover:opacity-90",
  accent: "bg-accent text-surface hover:opacity-90",
  ghost: "bg-transparent text-brand-ink hover:bg-surface-2",
  outline: "bg-transparent text-brand-ink border border-border hover:bg-surface-2",
};

export function TouchButton({ variant = "primary", className, ...rest }: Props) {
  return (
    <button
      {...rest}
      className={clsx(
        "motion press min-h-[48px] min-w-[48px] rounded-lg px-4 text-base font-semibold",
        "flex items-center justify-center gap-2 disabled:opacity-50",
        styles[variant],
        className
      )}
    />
  );
}
