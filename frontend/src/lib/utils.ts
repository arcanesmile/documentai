import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getFileIcon(fileType: string): string {
  const icons: Record<string, string> = {
    "application/pdf": "file-pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "file-word",
    "text/plain": "file-alt",
  };
  return icons[fileType] || "file";
}

export function getFileColor(fileType: string): string {
  const colors: Record<string, string> = {
    "application/pdf": "text-red-500",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "text-blue-500",
    "text/plain": "text-gray-400",
  };
  return colors[fileType] || "text-gray-400";
}
