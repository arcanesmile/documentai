"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: any;
  rightIcon?: any;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40",
      secondary:
        "bg-white dark:bg-surface-800 hover:bg-gray-100 dark:hover:bg-surface-700 text-gray-900 dark:text-surface-100 border border-gray-200 dark:border-surface-700",
      outline:
        "bg-transparent border border-primary-500/50 text-primary-400 hover:bg-primary-500/10",
      ghost:
        "bg-transparent text-gray-600 dark:text-surface-300 hover:bg-gray-100 dark:hover:bg-surface-800 hover:text-gray-900 dark:hover:text-surface-100",
      danger:
        "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-surface-900 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <FontAwesomeIcon icon={faSpinner} className="animate-spin h-4 w-4" />
        ) : leftIcon ? (
          <FontAwesomeIcon icon={leftIcon} className="h-4 w-4" />
        ) : null}
        {children}
        {rightIcon && !isLoading && (
          <FontAwesomeIcon icon={rightIcon} className="h-4 w-4" />
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
export default Button;
