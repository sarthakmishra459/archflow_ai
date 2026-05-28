"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ReactFlowProvider } from "reactflow";
import { useDiagramStore } from "../../../store/diagramStore";
import { useAuthStore } from "../../../store/authStore";
import EditorNavbar from "../../../components/diagram/EditorNavbar";
import ReactFlowCanvas from "../../../components/diagram/ReactFlowCanvas";
import NodeToolbar from "../../../components/diagram/NodeToolbar";
import AIPanel from "../../../components/diagram/AIPanel";
import PropertiesSidebar from "../../../components/diagram/PropertiesSidebar";
import VersionSidebar from "../../../components/diagram/VersionSidebar";

export default function DiagramEditorPage() {
  const params = useParams();
  const router = useRouter();
  const diagramId = params.id as string;

  const { initialize, isAuthenticated } = useAuthStore();
  const { loadDiagram, resetStore, nodes, edges, saveDiagram, isLoading } = useDiagramStore();

  const [showVersions, setShowVersions] = useState(false);

  // Authenticate user
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!localStorage.getItem("archflow_token")) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Load diagram elements
  useEffect(() => {
    if (!diagramId) return;

    resetStore();
    loadDiagram(diagramId);

    return () => {
      resetStore();
    };
  }, [diagramId, loadDiagram, resetStore]);

  // Debounced Autosave - updates database when changes are made to graph elements
  useEffect(() => {
    if (!diagramId || nodes.length === 0) return;

    const timeoutId = setTimeout(() => {
      saveDiagram();
    }, 2500); // 2.5 seconds debounce threshold

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, diagramId, saveDiagram]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-[#08080a] text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <span className="text-sm font-medium tracking-wider animate-pulse">
            Loading canvas elements...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-zinc-50 dark:bg-[#030303] text-zinc-900 dark:text-zinc-50 transition-colors duration-300">
      
      {/* Editor Navbar */}
      <EditorNavbar
        onToggleVersions={() => setShowVersions(!showVersions)}
        showVersions={showVersions}
      />

      {/* Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        <ReactFlowProvider>
          {/* Main Drawing Area */}
          <div className="flex-1 h-full relative">
            <ReactFlowCanvas />
            
            {/* Draggable Component Panel (Left) */}
            <NodeToolbar />

            {/* AI Assistant Panel (Right) */}
            <AIPanel />
          </div>

          {/* Collapsible Inspection Panel (Right Side-Rail) */}
          <div className="h-full flex shrink-0">
            {showVersions ? (
              <VersionSidebar onClose={() => setShowVersions(false)} />
            ) : (
              <PropertiesSidebar />
            )}
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
