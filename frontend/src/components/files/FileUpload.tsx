"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useDocumentStore } from "@/store/documentStore";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp, faFile, faTimes, faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

export default function FileUpload() {
  const { uploadDocument, uploading, uploadProgress } = useDocumentStore();
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        try {
          await uploadDocument(file);
          toast.success(`${file.name} uploaded successfully`);
        } catch (error: any) {
          toast.error(error.message || `Failed to upload ${file.name}`);
        }
      }
    },
    [uploadDocument]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: 50 * 1024 * 1024,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
  });

  return (
    <div
      {...getRootProps()}
      className={`relative p-8 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
        isDragActive || dragOver
          ? "border-primary-500 bg-primary-500/5"
          : "border-gray-300 dark:border-surface-600 hover:border-gray-400 dark:hover:border-surface-500 bg-white dark:bg-surface-800/30"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
          isDragActive ? "bg-primary-500/20 scale-110" : "bg-gray-100 dark:bg-surface-700/50"
        }`}>
          <FontAwesomeIcon
            icon={uploading ? faSpinner : isDragActive ? faCheck : faCloudArrowUp}
            className={`h-8 w-8 ${uploading ? "animate-spin text-primary-400" : isDragActive ? "text-primary-400" : "text-gray-400 dark:text-surface-400"}`}
          />
        </div>
        {uploading ? (
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700 dark:text-surface-200">Uploading...</p>
            <div className="w-48 h-2 rounded-full bg-gray-200 dark:bg-surface-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-surface-400">{uploadProgress}%</p>
          </div>
        ) : (
          <>
            <p className="text-lg font-medium text-gray-700 dark:text-surface-200 mb-1">
              {isDragActive ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-sm text-gray-500 dark:text-surface-400 mb-4">
              or click to browse. Supports PDF, DOCX, TXT (up to 50MB)
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-surface-500">
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faFile} className="h-3 w-3" /> PDF
              </span>
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faFile} className="h-3 w-3" /> DOCX
              </span>
              <span className="flex items-center gap-1">
                <FontAwesomeIcon icon={faFile} className="h-3 w-3" /> TXT
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
