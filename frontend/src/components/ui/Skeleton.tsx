"use client";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({ className, variant = "text", width, height }: SkeletonProps) {
  const variants = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-surface-700 dark:via-surface-600 dark:to-surface-700 bg-[length:200%_100%] animate-shimmer",
        variants[variant],
        className
      )}
      style={{ width, height }}
    />
  );
}
