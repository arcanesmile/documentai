"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import Link from "next/link";
import StatsCard from "@/components/dashboard/StatsCard";
import UsageBar from "@/components/dashboard/UsageBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileLines,
  faMagnifyingGlass,
  faHardDrive,
  faComments,
} from "@fortawesome/free-solid-svg-icons";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DashboardPage() {
  const { user, fetchProfile } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const usage = user?.subscription?.usage;
  const docsUsed = usage?.documentsUploaded ?? 0;
  const docsLimit = usage?.documentsLimit ?? 10;
  const searchesUsed = usage?.searchesPerformed ?? 0;
  const searchesLimit = usage?.searchesLimit ?? 50;
  const storageUsed = usage?.storageUsed ?? 0;
  const storageLimit = usage?.storageLimit ?? 50 * 1024 * 1024;

  const stats: Array<{
    title: string;
    value: string;
    icon: any;
    change: string;
    changeType: "positive" | "neutral" | "negative";
    gradient: string;
  }> = [
    {
      title: "Documents Uploaded",
      value: String(docsUsed),
      icon: faFileLines,
      change: docsUsed > 0 ? `${docsUsed} total` : "No documents yet",
      changeType: docsUsed > 0 ? "positive" : "neutral",
      gradient: "from-primary-500 to-accent-500",
    },
    {
      title: "Searches Performed",
      value: String(searchesUsed),
      icon: faMagnifyingGlass,
      change: searchesUsed > 0 ? `${searchesUsed} total` : "No searches yet",
      changeType: searchesUsed > 0 ? "positive" : "neutral",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Storage Used",
      value: formatBytes(storageUsed),
      icon: faHardDrive,
      change: `of ${formatBytes(storageLimit)}`,
      changeType: "neutral",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "AI Conversations",
      value: "—",
      icon: faComments,
      change: "Coming soon",
      changeType: "neutral",
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  const storageUsedMB = storageLimit > 0 ? storageUsed / (1024 * 1024) : 0;
  const storageLimitMB = storageLimit / (1024 * 1024);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name || "User"}
        </h1>
        <p className="text-gray-500 dark:text-surface-400 mt-1">Here&apos;s your activity overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-surface-800/50 border border-gray-200/50 dark:border-surface-700/50"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Usage Overview</h2>
          <div className="space-y-4">
            <UsageBar label="Documents" used={docsUsed} limit={docsLimit} />
            <UsageBar label="AI Searches" used={searchesUsed} limit={searchesLimit} />
            <UsageBar label="Storage" used={storageUsedMB} limit={storageLimitMB} unit=" MB" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-surface-800/50 border border-gray-200/50 dark:border-surface-700/50"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/files" className="p-4 rounded-xl bg-gray-100/50 dark:bg-surface-700/50 border border-gray-200/50 dark:border-surface-600/50 hover:border-primary-500/30 hover:bg-gray-200 dark:hover:bg-surface-700 transition-all text-left">
              <FontAwesomeIcon icon={faFileLines} className="h-5 w-5 text-primary-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-surface-200">Upload Document</p>
              <p className="text-xs text-gray-500 dark:text-surface-400 mt-0.5">PDF, DOCX, or TXT</p>
            </Link>
            <Link href="/dashboard/search" className="p-4 rounded-xl bg-gray-100/50 dark:bg-surface-700/50 border border-gray-200/50 dark:border-surface-600/50 hover:border-accent-500/30 hover:bg-gray-200 dark:hover:bg-surface-700 transition-all text-left">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="h-5 w-5 text-accent-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-surface-200">Semantic Search</p>
              <p className="text-xs text-gray-500 dark:text-surface-400 mt-0.5">Ask anything</p>
            </Link>
            <Link href="/dashboard/chat" className="p-4 rounded-xl bg-gray-100/50 dark:bg-surface-700/50 border border-gray-200/50 dark:border-surface-600/50 hover:border-blue-500/30 hover:bg-gray-200 dark:hover:bg-surface-700 transition-all text-left">
              <FontAwesomeIcon icon={faComments} className="h-5 w-5 text-blue-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-surface-200">AI Chat</p>
              <p className="text-xs text-gray-500 dark:text-surface-400 mt-0.5">Chat with documents</p>
            </Link>
            <Link href="/dashboard/settings" className="p-4 rounded-xl bg-gray-100/50 dark:bg-surface-700/50 border border-gray-200/50 dark:border-surface-600/50 hover:border-emerald-500/30 hover:bg-gray-200 dark:hover:bg-surface-700 transition-all text-left">
              <FontAwesomeIcon icon={faHardDrive} className="h-5 w-5 text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-surface-200">Upgrade Plan</p>
              <p className="text-xs text-gray-500 dark:text-surface-400 mt-0.5">Get Pro features</p>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
