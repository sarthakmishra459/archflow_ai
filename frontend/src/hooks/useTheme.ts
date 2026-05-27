import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>("dark"); // Default to dark mode for modern SaaS aesthetic

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("archflow_theme") as Theme;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      setTheme(initial);
      applyTheme(initial);
    }
  }, []);

  const applyTheme = (t: Theme) => {
    const root = window.document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("archflow_theme", next);
  };

  return { theme, toggleTheme, isDark: theme === "dark" };
};
