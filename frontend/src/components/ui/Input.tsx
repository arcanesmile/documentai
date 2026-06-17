"use client";
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: any;
  rightIcon?: any;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-600 dark:text-surface-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-surface-400">
              <FontAwesomeIcon icon={leftIcon} className="h-4 w-4" />
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-xl bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 text-gray-900 dark:text-surface-100 placeholder-gray-400 dark:placeholder-surface-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
              "px-4 py-2.5 text-sm",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-surface-400">
              <FontAwesomeIcon icon={rightIcon} className="h-4 w-4" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
