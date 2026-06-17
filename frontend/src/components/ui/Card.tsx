"use client";
import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, children, ...props }, ref) => {
    const variants = {
      default: "bg-white dark:bg-surface-800/80 border border-gray-200/50 dark:border-surface-700/50",
      glass: "bg-white/70 dark:bg-surface-800/20 backdrop-blur-xl border border-gray-200/30 dark:border-surface-700/30",
      gradient: "bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-surface-800/90 dark:to-surface-900/90 border border-gray-200/50 dark:border-surface-700/50",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl shadow-xl",
          variants[variant],
          hover && "transition-all duration-300 hover:shadow-2xl hover:border-primary-500/30 hover:shadow-primary-500/5",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
export default Card;
