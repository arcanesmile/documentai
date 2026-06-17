import { create } from "zustand";

interface UIState {
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  isLoading: boolean;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setLoading: (loading: boolean) => void;
  closeSidebar: () => void;
}

const getInitialDarkMode = (): boolean => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
  }
  return true;
};

export const useUIStore = create<UIState>()((set) => ({
  isDarkMode: getInitialDarkMode(),
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  isLoading: false,

  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.isDarkMode;
      if (typeof window !== "undefined") {
        document.documentElement.classList.toggle("dark", newMode);
        localStorage.setItem("darkMode", String(newMode));
      }
      return { isDarkMode: newMode };
    }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  setLoading: (loading) => set({ isLoading: loading }),

  closeSidebar: () => set({ isSidebarOpen: false }),
}));
