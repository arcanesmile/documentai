"use client";
import { cn } from "@/lib/utils";

interface UsageBarProps {
  label: string;
  used: number;
  limit: number;
  unit?: string;
}

export default function UsageBar({ label, used, limit, unit = "" }: UsageBarProps) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-surface-400">{label}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-surface-200">
          {used}{unit} / {limit}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-surface-700 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isCritical
              ? "bg-gradient-to-r from-red-500 to-red-400"
              : isWarning
              ? "bg-gradient-to-r from-amber-500 to-amber-400"
              : "bg-gradient-to-r from-primary-500 to-accent-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
