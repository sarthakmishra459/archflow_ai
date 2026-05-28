import React from "react";
import { useReactFlow } from "reactflow";
import { useAutoLayout } from "../../hooks/useAutoLayout";
import { Workflow, ZoomIn, ZoomOut, Maximize } from "lucide-react";

export default function Toolbar() {
  const { runLayout } = useAutoLayout();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-1 bg-white/90 dark:bg-zinc-950/90 border border-zinc-200/60 dark:border-zinc-800/60 px-3 py-1.5 rounded-full shadow-2xl backdrop-blur-md transition-colors duration-300">
      
      {/* Auto Arrange Layout Action */}
      <button
        onClick={() => runLayout()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Automatically arrange diagram layout (LR)"
      >
        <Workflow className="w-4 h-4 text-indigo-500" />
        <span>Auto Arrange</span>
      </button>

      <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 mx-1.5" />

      {/* Zoom In */}
      <button
        onClick={() => zoomIn({ duration: 300 })}
        className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all hover:scale-110 cursor-pointer"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={() => zoomOut({ duration: 300 })}
        className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all hover:scale-110 cursor-pointer"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      {/* Fit View */}
      <button
        onClick={() => fitView({ duration: 400 })}
        className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-all hover:scale-110 cursor-pointer"
        title="Center / Fit View"
      >
        <Maximize className="w-4 h-4" />
      </button>
    </div>
  );
}
