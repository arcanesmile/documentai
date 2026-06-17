"use client";
import { motion } from "framer-motion";
import FileUpload from "@/components/files/FileUpload";
import FileList from "@/components/files/FileList";

export default function FilesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
        <p className="text-gray-500 dark:text-surface-400 mt-1">Upload and manage your documents</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FileUpload />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-white dark:bg-surface-800/50 border border-gray-200/50 dark:border-surface-700/50"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Files</h2>
        <FileList />
      </motion.div>
    </div>
  );
}
