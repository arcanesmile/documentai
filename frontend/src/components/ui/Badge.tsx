"use client";
import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "error" | "info" | "premium";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = "default",
  size = "sm",
  children,
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-gray-200/50 dark:bg-surface-700/50 text-gray-600 dark:text-surface-300 border-gray-300 dark:border-surface-600",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    premium: "bg-gradient-to-r from-primary-500/20 to-accent-500/20 text-primary-300 border-primary-500/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
