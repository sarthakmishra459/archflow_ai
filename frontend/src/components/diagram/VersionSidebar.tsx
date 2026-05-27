import React, { useEffect, useState } from "react";
import { useDiagramStore } from "../../store/diagramStore";
import { Button } from "../ui/Button";
import { History, RotateCcw, Camera, Loader2, X } from "lucide-react";

interface VersionSidebarProps {
  onClose: () => void;
}

export default function VersionSidebar({ onClose }: VersionSidebarProps) {
  const {
    versions,
    loadVersions,
    createSnapshot,
    rollbackToVersion,
    isSaving,
    isLoading,
  } = useDiagramStore();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const handleRollback = async (versionId: string) => {
    setLoadingId(versionId);
    try {
      await rollbackToVersion(versionId);
      // After rollback, refresh versions list
      await loadVersions();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="w-80 border-l border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 p-6 flex flex-col z-10 shadow-xs h-full justify-between">
      <div className="flex flex-col gap-6 overflow-hidden h-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <History className="w-4.5 h-4.5 text-indigo-500" />
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
              Version History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Snapshot creation CTA */}
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={createSnapshot}
            isLoading={isSaving}
            className="w-full gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" /> Capture Current State
          </Button>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-normal px-1">
            Manual snapshots freeze the diagram layout, allowing you to restore it if future edits disrupt your canvas.
          </p>
        </div>

        {/* Version List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5">
          {isLoading && versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">Loading snapshots...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs">
              No version snapshots captured yet.
            </div>
          ) : (
            versions.map((ver, idx) => (
              <div
                key={ver.id}
                className="relative border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30 p-3 rounded-lg flex flex-col gap-2.5 hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors"
              >
                {/* Index badge */}
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Snapshot #{versions.length - idx}
                  </span>
                  {idx === 0 && (
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded font-extrabold uppercase">
                      Current
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="text-xs font-mono text-zinc-600 dark:text-zinc-300">
                  {formatDateTime(ver.createdAt || ver.updatedAt)}
                </div>

                {/* Rollback Action */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRollback(ver.id!)}
                  isLoading={loadingId === ver.id}
                  className="w-full text-xs gap-1.5 py-1.5"
                  disabled={idx === 0} // Can't rollback to the exact current open state
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore Diagram
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
