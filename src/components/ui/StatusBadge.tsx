"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "blue" | "success" | "warning" | "error" | "outline" | "custom";

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  /** Custom background color (only used with variant="custom") */
  color?: string;
  size?: "sm" | "md";
}

const variantClasses: Record<Exclude<BadgeVariant, "custom">, string> = {
  default: "badge",
  blue: "badge-blue",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
  outline: "badge-outline",
};

export function StatusBadge({
  children,
  variant = "default",
  className,
  color,
  size = "sm",
}: StatusBadgeProps) {
  if (variant === "custom" && color) {
    return (
      <span
        className={cn(
          "inline-block font-semibold rounded-full",
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
          className
        )}
        style={{ background: color, color: "#fff" }}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        variantClasses[variant as Exclude<BadgeVariant, "custom">],
        size === "md" && "px-3 py-1 text-sm",
        className
      )}
    >
      {children}
    </span>
  );
}
