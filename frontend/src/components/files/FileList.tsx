"use client";
import { useEffect } from "react";
import { useDocumentStore } from "@/store/documentStore";
import { motion, AnimatePresence } from "framer-motion";
import { formatBytes, formatDate, getFileColor } from "@/lib/utils";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faFilePdf, faFileWord, faFileAlt } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const fileIcons: Record<string, any> = {
  "application/pdf": faFilePdf,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": faFileWord,
  "text/plain": faFileAlt,
};

export default function FileList() {
  const { documents, isLoading, fetchDocuments, deleteDocument } = useDocumentStore();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteDocument(id);
      toast.success(`${name} deleted`);
    } catch {
      toast.error("Failed to delete file");
    }
  };

  if (isLoading) {
    return <LoadingSpinner className="py-12" />;
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-surface-700/50 flex items-center justify-center mx-auto mb-4">
          <FontAwesomeIcon icon={faFileAlt} className="h-8 w-8 text-gray-400 dark:text-surface-500" />
        </div>
        <p className="text-gray-500 dark:text-surface-400">No documents uploaded yet</p>
        <p className="text-sm text-gray-400 dark:text-surface-500 mt-1">Upload your first document above</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {documents.map((doc) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-xl bg-white dark:bg-surface-800/30 border border-gray-200/50 dark:border-surface-700/50 hover:border-gray-300 dark:hover:border-surface-600 transition-all group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gray-100 dark:bg-surface-700/50 flex items-center justify-center flex-shrink-0 ${getFileColor(doc.fileType)}`}>
              <FontAwesomeIcon icon={fileIcons[doc.fileType] || faFileAlt} className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <p className="text-sm font-medium text-gray-700 dark:text-surface-200 truncate">{doc.originalName}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <span className="text-xs text-gray-500 dark:text-surface-400">{formatBytes(doc.fileSize)}</span>
                <span className="text-xs text-gray-400 dark:text-surface-500 hidden sm:inline">·</span>
                <span className="text-xs text-gray-500 dark:text-surface-400">{doc.chunks} chunks</span>
                <span className="text-xs text-gray-400 dark:text-surface-500 hidden sm:inline">·</span>
                <span className="text-xs text-gray-500 dark:text-surface-400">{formatDate(doc.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Badge variant={doc.indexed ? "success" : "warning"} size="sm">
                {doc.indexed ? "Indexed" : "Processing"}
              </Badge>
              <button
                onClick={() => handleDelete(doc.id, doc.originalName)}
                className="p-2 rounded-lg text-gray-400 dark:text-surface-500 hover:text-red-400 hover:bg-red-500/10 transition-all sm:opacity-0 sm:group-hover:opacity-100"
              >
                <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
