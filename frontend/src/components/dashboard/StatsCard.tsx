"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: any;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  gradient?: string;
}

export default function StatsCard({ title, value, icon, change, changeType = "neutral", gradient = "from-primary-500 to-accent-500" }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-white dark:bg-surface-800/50 border border-gray-200/50 dark:border-surface-700/50 hover:border-primary-500/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} p-2 flex items-center justify-center`}>
          <FontAwesomeIcon icon={icon} className="h-5 w-5 text-white" />
        </div>
        {change && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full",
              changeType === "positive" && "bg-emerald-500/10 text-emerald-400",
              changeType === "negative" && "bg-red-500/10 text-red-400",
              changeType === "neutral" && "bg-gray-100 dark:bg-surface-700/50 text-gray-500 dark:text-surface-400"
            )}
          >
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-sm text-gray-500 dark:text-surface-400">{title}</p>
    </motion.div>
  );
}
