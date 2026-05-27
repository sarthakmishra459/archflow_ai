"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

export default function EntryPage() {
  const router = useRouter();
  const { initialize, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const token = localStorage.getItem("archflow_token");
    if (token || isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-400">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <span className="text-sm font-medium tracking-wider animate-pulse">
          Loading ArchFlow AI...
        </span>
      </div>
    </div>
  );
}
