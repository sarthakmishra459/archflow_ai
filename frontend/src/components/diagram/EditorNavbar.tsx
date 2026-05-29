import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useDiagramStore } from "../../store/diagramStore";
import { useTheme } from "../../hooks/useTheme";
import {
  exportToJson,
  exportToPng,
  exportToSvg,
  importFromJson,
} from "../../utils/exportUtils";
import { Button } from "../ui/Button";
import {
  ArrowLeft,
  Save,
  Camera,
  Download,
  Upload,
  Sun,
  Moon,
  Check,
  Loader2,
  Edit3,
  History,
} from "lucide-react";

interface EditorNavbarProps {
  onToggleVersions: () => void;
  showVersions: boolean;
}

export default function EditorNavbar({
  onToggleVersions,
  showVersions,
}: EditorNavbarProps) {
  const router = useRouter();
  const { theme, toggleTheme, isDark } = useTheme();

  const {
    name,
    diagramId,
    description,
    isPublic,
    nodes,
    edges,
    isSaving,
    setDiagramDetails,
    saveDiagram,
    createSnapshot,
    setNodes,
    setEdges,
    pushToHistory,
  } = useDiagramStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameSave = () => {
    if (editedName.trim()) {
      setDiagramDetails({ name: editedName, description, isPublic });
      setIsEditingName(false);
    }
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importFromJson(file);
      setDiagramDetails({ name: data.name, description, isPublic });
      setNodes(data.nodes);
      setEdges(data.edges);
      pushToHistory(data.nodes, data.edges);
    } catch (error: unknown) {
      // Check if error is an object containing a message string
      const errorMessage =
        error instanceof Error ? error.message : "Failed to import JSON file.";
      alert(errorMessage);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <nav className="h-14 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 px-4 flex items-center justify-between z-10 shadow-xs">
      {/* Left side actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            // Trigger auto-save before going back
            saveDiagram();
            router.push("/dashboard");
          }}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          {isEditingName ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                autoFocus
                className="px-2 py-1 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md focus:outline-none focus:border-indigo-500 font-semibold"
              />
              <button
                onClick={handleNameSave}
                className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-md"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 select-none">
                {name}
              </h2>
              <button
                onClick={() => {
                  setEditedName(name);
                  setIsEditingName(true);
                }}
                className="p-1 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Saving Indicator */}
          <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider ml-2">
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>Saving...</span>
              </>
            ) : (
              <span className="text-zinc-300 dark:text-zinc-700">
                All saved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side operations */}
      <div className="flex items-center gap-3">
        {/* Undo/Redo buttons in navbar for utility */}
        <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 bg-zinc-50/50 dark:bg-zinc-900/50 mr-2">
          <button
            onClick={() => useDiagramStore.getState().undo()}
            className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-md disabled:opacity-30"
            disabled={useDiagramStore.getState().historyIndex <= 0}
            title="Undo"
          >
            Undo
          </button>
          <div className="w-[1px] h-3 bg-zinc-200 dark:bg-zinc-800 mx-1" />
          <button
            onClick={() => useDiagramStore.getState().redo()}
            className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-md disabled:opacity-30"
            disabled={
              useDiagramStore.getState().historyIndex >=
              useDiagramStore.getState().history.length - 1
            }
            title="Redo"
          >
            Redo
          </button>
        </div>

        {/* Database Manual Save */}
        <Button
          variant="outline"
          size="sm"
          onClick={saveDiagram}
          isLoading={isSaving}
          className="gap-1.5"
        >
          <Save className="w-3.5 h-3.5" /> Save
        </Button>

        {/* Create Manual Version Snapshot */}
        <Button
          variant="outline"
          size="sm"
          onClick={createSnapshot}
          className="gap-1.5"
        >
          <Camera className="w-3.5 h-3.5" /> Snapshot
        </Button>

        {/* Show Version History Log Sidebar */}
        <Button
          variant={showVersions ? "secondary" : "outline"}
          size="sm"
          onClick={onToggleVersions}
          className="gap-1.5"
        >
          <History className="w-3.5 h-3.5" /> Version History
        </Button>

        {/* Import JSON */}
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleImportJson}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" /> Import
        </Button>

        {/* Export Dropdown Menu */}
        <div className="relative">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </Button>

          {showExportMenu && (
            <>
              {/* Overlay cover to close dropdown */}
              <div
                onClick={() => setShowExportMenu(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute right-0 mt-2 w-40 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-lg shadow-xl py-1.5 z-50">
                <button
                  onClick={() => {
                    exportToJson(name, nodes, edges);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => {
                    exportToPng(name);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold"
                >
                  Export as PNG
                </button>
                <button
                  onClick={() => {
                    exportToSvg(name);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold"
                >
                  Export as SVG
                </button>
              </div>
            </>
          )}
        </div>

        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          {isDark ? (
            <Sun className="w-4.5 h-4.5" />
          ) : (
            <Moon className="w-4.5 h-4.5" />
          )}
        </button>
      </div>
    </nav>
  );
}
