"use client";
import { useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faMoon,
  faSun,
  faBell,
  faRightFromBracket,
  faUser,
  faGear,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode, toggleSidebar } = useUIStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(profileRef, () => setIsProfileOpen(false));

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-surface-900/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-surface-700/50">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-500 dark:text-surface-400 hover:text-gray-900 dark:hover:text-surface-100 hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors lg:hidden"
          >
            <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg text-gray-500 dark:text-surface-400 hover:text-gray-900 dark:hover:text-surface-100 hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors">
            <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-gray-500 dark:text-surface-400 hover:text-gray-900 dark:hover:text-surface-100 hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors"
          >
            <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} className="h-5 w-5" />
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-surface-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-surface-100">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-surface-400 mt-0.5">
                      {user?.email || ""}
                    </p>
                  </div>
                  <div className="p-2">
                    <button className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-surface-300 hover:text-gray-900 dark:hover:text-surface-100 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
                      <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                      Profile
                    </button>
                    <button className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-surface-300 hover:text-gray-900 dark:hover:text-surface-100 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
                      <FontAwesomeIcon icon={faCrown} className="h-4 w-4" />
                      Upgrade to Pro
                    </button>
                    <button className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-surface-300 hover:text-gray-900 dark:hover:text-surface-100 hover:bg-gray-100 dark:hover:bg-surface-700 transition-colors">
                      <FontAwesomeIcon icon={faGear} className="h-4 w-4" />
                      Settings
                    </button>
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-surface-700">
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
