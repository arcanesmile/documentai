"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDashboard,
  faFileLines,
  faMagnifyingGlass,
  faComments,
  faGear,
  faUser,
  faShield,
  faChevronLeft,
  faBrain,
} from "@fortawesome/free-solid-svg-icons";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: faDashboard },
  { href: "/dashboard/files", label: "Documents", icon: faFileLines },
  { href: "/dashboard/search", label: "Semantic Search", icon: faMagnifyingGlass },
  { href: "/dashboard/chat", label: "AI Chat", icon: faComments },
  { href: "/dashboard/settings", label: "Settings", icon: faGear },
];

const adminItems = [
  { href: "/dashboard/admin", label: "Admin Panel", icon: faShield },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, closeSidebar } = useUIStore();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-surface-700/50">
        <Link href="/dashboard" onClick={closeSidebar} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <FontAwesomeIcon icon={faBrain} className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            RealAI
          </span>
        </Link>
        <button
          onClick={closeSidebar}
          className="p-1.5 rounded-lg text-gray-500 dark:text-surface-400 hover:text-gray-900 dark:hover:text-surface-100 hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors lg:hidden"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                  : "text-gray-500 dark:text-surface-400 hover:text-gray-900 dark:hover:text-surface-100 hover:bg-gray-100 dark:hover:bg-surface-800/50 border border-transparent"
              )}
            >
              <FontAwesomeIcon icon={item.icon} className={cn("h-4 w-4", isActive && "text-primary-400")} />
              <span className="text-sm font-medium">{item.label}</span>
              {isActive && <motion.div layoutId="activeIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-gray-200/50 dark:border-surface-700/50">
          <p className="px-3 text-xs font-medium text-gray-400 dark:text-surface-500 uppercase tracking-wider mb-2">Admin</p>
        </div>

        {adminItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary-500/10 text-primary-400 border border-primary-500/20"
                  : "text-gray-500 dark:text-surface-400 hover:text-gray-900 dark:hover:text-surface-100 hover:bg-gray-100 dark:hover:bg-surface-800/50 border border-transparent"
              )}
            >
              <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200/50 dark:border-surface-700/50">
        <Link
          href="/dashboard/settings"
          onClick={closeSidebar}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-gray-500 dark:text-surface-400 hover:text-gray-900 dark:hover:text-surface-100 hover:bg-gray-100 dark:hover:bg-surface-800/50",
            pathname === "/dashboard/settings" && "bg-primary-500/10 text-primary-400"
          )}
        >
          <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
          <span className="text-sm font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar (drawer) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-[280px] bg-white dark:bg-surface-900 border-r border-gray-200/50 dark:border-surface-700/50 z-50 lg:hidden"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar (always visible) */}
      <aside className="hidden lg:flex lg:flex-col fixed left-0 top-0 h-full w-[280px] bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-surface-700/50 z-40">
        {sidebarContent}
      </aside>
    </>
  );
}
