"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../hooks/useTheme";
import { diagramService, analyticsService } from "../../services/api";
import { DiagramDto, AnalyticsDto } from "../../types";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import {
  Network,
  Plus,
  Trash2,
  Layout,
  Calendar,
  Clock,
  BrainCircuit,
  LogOut,
  Sun,
  Moon,
  Search,
  ExternalLink,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, initialize } = useAuthStore();
  const { theme, toggleTheme, isDark } = useTheme();

  // State
  const [diagrams, setDiagrams] = useState<DiagramDto[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & form fields
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDiagramName, setNewDiagramName] = useState("");
  const [newDiagramDesc, setNewDiagramDesc] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Check auth
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // If token not present, redirect to login
    if (!localStorage.getItem("archflow_token")) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Fetch diagrams and analytics
  const fetchData = async () => {
    try {
      const [diagramData, analyticsData] = await Promise.all([
        diagramService.getDiagrams(),
        analyticsService.getAnalytics().catch(() => null), // Fallback if API fails
      ]);
      setDiagrams(diagramData);
      if (analyticsData) setAnalytics(analyticsData);
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

 useEffect(() => {
  // Wrap the async call inside an immediately invoked function expression (IIFE)
  (async () => {
    await fetchData();
  })();
}, []);


  const handleCreateDiagram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiagramName) return;

    setCreateLoading(true);
    try {
      const created = await diagramService.createDiagram({
        name: newDiagramName,
        description: newDiagramDesc,
        graphJson: JSON.stringify({ nodes: [], edges: [] }),
        isPublic: false,
      });

      setIsCreateOpen(false);
      setNewDiagramName("");
      setNewDiagramDesc("");
      router.push(`/diagram/${created.id}`);
    } catch (e) {
      console.error("Failed to create diagram:", e);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteDiagram = async () => {
    if (!deleteTargetId) return;

    setDeleteLoading(true);
    try {
      await diagramService.deleteDiagram(deleteTargetId);
      setDiagrams(diagrams.filter((d) => d.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (e) {
      console.error("Failed to delete diagram:", e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredDiagrams = diagrams.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-[#08080a] text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <span className="text-sm font-medium tracking-wider animate-pulse">
            Loading dashboard data...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#08080a] text-zinc-900 dark:text-zinc-50 transition-colors duration-300 pb-16">
      {/* Decorative Blur Background Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Network className="w-5 h-5" />
            </div>
            <span>
              ArchFlow <span className="text-indigo-500 font-medium">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme switch */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* User Profile */}
            <div className="flex flex-col items-end text-xs font-medium">
              <span className="text-zinc-800 dark:text-zinc-200">
                {user?.username || "Developer"}
              </span>
              <span className="text-[10px] text-zinc-400">
                {user?.email || "dev@archflow.ai"}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-6 mt-8">
        {/* Metric Cards (Analytics Panel) */}
        <section className="flex justify-between mb-10">
          <div className="border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 rounded-xl p-5 backdrop-blur-xs flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                AI Provider Breakdown
              </p>
              <h3 className="text-md flex flex-col font-bold mt-0.5  flex-wrap gap-x-3 gap-y-1">
                {analytics?.providerCounts &&
                analytics.providerCounts.length > 0
                  ? analytics.providerCounts.map((item, index) => (
                      <span key={index} className="whitespace-nowrap">
                        {item.provider}: {item.count}
                        {index < analytics.providerCounts.length - 1}
                      </span>
                    ))
                  : "0"}
              </h3>
            </div>
          </div>

          <div className="border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 rounded-xl p-5 backdrop-blur-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Average Latency
              </p>
              <h3 className="text-md flex flex-col font-bold mt-0.5">
                {analytics?.providerLatencies &&
                analytics.providerLatencies.length > 0
                  ? analytics.providerLatencies.map((item, index) => (
                      <span key={index} className="whitespace-nowrap">
                        {item.provider}: {item.avgLatency} ms
                        {index < analytics.providerLatencies.length - 1}
                      </span>
                    ))
                  : "0"}
              </h3>
            </div>
          </div>

          <div className="border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 rounded-xl p-5 backdrop-blur-xs flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg">
              <Layout className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Active Diagrams
              </p>
              <h3 className="text-2xl font-bold mt-0.5">{diagrams.length}</h3>
            </div>
          </div>
        </section>

        {/* Dashboard Title & Actions */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Your Diagrams
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Create, view, and manage your cloud architecture maps
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search diagrams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-56 pl-9 pr-4 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-1.5 text-sm"
            >
              <Plus className="w-4 h-4" /> New Diagram
            </Button>
          </div>
        </section>

        {/* Diagram Cards Grid */}
        <section>
          {filteredDiagrams.length === 0 ? (
            <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-16 text-center">
              <div className="inline-flex p-4 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 rounded-full mb-4">
                <Layout className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                No diagrams found
              </h3>
              <p className="text-sm text-zinc-400 max-w-sm mx-auto mt-2">
                {searchTerm
                  ? "Try refining your search keyword"
                  : "Get started by creating your first diagram or using the AI Assistant inside the canvas."}
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-5 text-sm"
                >
                  Create Diagram
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDiagrams.map((diagram) => (
                <div
                  key={diagram.id}
                  onClick={() => router.push(`/diagram/${diagram.id}`)}
                  className="group relative border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-950/40 rounded-xl p-5 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer backdrop-blur-xs flex flex-col justify-between min-h-[160px]"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-bold text-zinc-800 dark:text-zinc-100 group-hover:text-indigo-500 transition-colors">
                        {diagram.name}
                      </h4>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTargetId(diagram.id || null);
                          }}
                          className="p-1 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                          title="Delete Diagram"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                      {diagram.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-3 mt-4 text-[10px] font-semibold text-zinc-400 tracking-wide uppercase">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(diagram.createdAt)}
                    </span>
                    <span className="flex items-center gap-0.5 text-indigo-500 group-hover:translate-x-0.5 transition-transform">
                      Open Canvas <ExternalLink className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal - Create Diagram */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setNewDiagramName("");
          setNewDiagramDesc("");
        }}
        title="Create New Diagram"
      >
        <form onSubmit={handleCreateDiagram} className="flex flex-col gap-4">
          <Input
            id="diagram-name"
            label="Diagram Name"
            type="text"
            placeholder="e.g. E-Commerce Backend"
            value={newDiagramName}
            onChange={(e) => setNewDiagramName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Description
            </label>
            <textarea
              placeholder="Provide a brief summary of this diagram..."
              value={newDiagramDesc}
              onChange={(e) => setNewDiagramDesc(e.target.value)}
              className="w-full min-h-[80px] p-3 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createLoading}>
              Create & Edit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal - Confirm Delete */}
      <Modal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        title="Delete Diagram"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-zinc-400">
            Are you sure you want to delete this diagram? This action is
            permanent and cannot be undone.
          </p>

          <div className="flex justify-end gap-3 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteTargetId(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteDiagram}
              isLoading={deleteLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
