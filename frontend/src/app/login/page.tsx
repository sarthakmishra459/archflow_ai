"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Network } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, initialize } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ username, password });
      login(response.token, response.username, response.email, response.userId);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error(err);
      const apiError = err as { response?: { data?: string } };
      setError(
        apiError.response?.data || "Invalid username or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-[#08080a] p-4 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      {/* Decorative gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md border border-zinc-200/50 bg-white/70 dark:border-zinc-800/50 dark:bg-zinc-950/70 backdrop-blur-xl shadow-2xl rounded-2xl p-8 z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-indigo-600 rounded-xl text-white mb-3 shadow-lg shadow-indigo-600/20">
            <Network className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
            Log in to manage your system diagrams
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            id="username"
            label="Username"
            type="text"
            placeholder="enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            className="w-full mt-2 py-2.5 font-semibold text-sm"
            isLoading={loading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
