import { create } from "zustand";
import { User } from "@/types";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";

let authInitialized = false;

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => () => void;
  updateUser: (user: Partial<User>) => void;
  fetchProfile: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const mapFirebaseUser = (fu: FirebaseUser): User => ({
  id: fu.uid,
  name: fu.displayName || fu.email?.split("@")[0] || "User",
  email: fu.email || "",
  image: fu.photoURL || undefined,
  role: "user",
});

export const getFirebaseErrorMessage = (error: unknown): string => {
  const code = (error as { code?: string })?.code;
  const fallback = (error as Error)?.message || "An unexpected error occurred";
  const messages: Record<string, string> = {
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Invalid email or password",
    "auth/invalid-credential": "Invalid email or password",
    "auth/email-already-in-use": "An account with this email already exists",
    "auth/weak-password": "Password should be at least 6 characters",
    "auth/invalid-email": "Invalid email address",
    "auth/too-many-requests": "Too many attempts. Please try again later",
    "auth/user-disabled": "This account has been disabled",
    "auth/operation-not-allowed": "This sign-in method is not enabled",
    "auth/popup-blocked": "Pop-up was blocked. Please allow pop-ups for this site",
    "auth/popup-closed-by-user": "",
    "auth/cancelled-popup-request": "",
  };
  return code && code in messages ? messages[code] : fallback;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),

  login: async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    set({ user: mapFirebaseUser(cred.user), isAuthenticated: true, isLoading: false });
    await get().fetchProfile();
  },

  loginWithGoogle: async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    set({ user: mapFirebaseUser(result.user), isAuthenticated: true, isLoading: false });
    await get().fetchProfile();
  },

  signup: async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    set({
      user: { ...mapFirebaseUser(cred.user), name },
      isAuthenticated: true,
      isLoading: false,
    });
    await get().fetchProfile();
  },

  logout: async () => {
    await firebaseSignOut(auth);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  initialize: () => {
    if (!authInitialized) {
      authInitialized = true;
      onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          set({ user: mapFirebaseUser(firebaseUser), isAuthenticated: true, isLoading: false });
          get().fetchProfile();
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      });
    }
    return () => {
      /* singleton — no cleanup needed */
    };
  },

  updateUser: (userData) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...userData } });
    }
  },

  fetchProfile: async () => {
    try {
      const profile = await api.get<any>("/auth/me");
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: {
            ...currentUser,
            ...profile,
          },
        });
      }
    } catch {
      // profile fetch is non-critical; auth still works
    }
  },

  getIdToken: async () => {
    const cu = auth.currentUser;
    if (!cu) return null;
    try {
      return await cu.getIdToken();
    } catch {
      return null;
    }
  },
}));
