import { create } from "zustand";
import { User } from "../types";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  initialize: () => void;
  login: (token: string, username: string, email: string, userId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  initialize: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("archflow_token");
    const userJson = localStorage.getItem("archflow_user");
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        set({ token, user, isAuthenticated: true });
      } catch (e) {
        localStorage.removeItem("archflow_token");
        localStorage.removeItem("archflow_user");
        set({ token: null, user: null, isAuthenticated: false });
      }
    }
  },

  login: (token, username, email, userId) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("archflow_token", token);
      localStorage.setItem("archflow_user", JSON.stringify({ id: userId, username, email }));
    }
    set({ token, user: { id: userId, username, email }, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("archflow_token");
      localStorage.removeItem("archflow_user");
    }
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
