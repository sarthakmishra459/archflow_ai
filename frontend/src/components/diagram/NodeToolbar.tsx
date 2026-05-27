import React from "react";
import { useDiagramStore } from "../../store/diagramStore";
import { Monitor, Cpu, Server, Database, MessageSquare, Zap, Plus } from "lucide-react";

const NODE_TEMPLATES = [
  { type: "client", label: "Client", icon: <Monitor className="w-4 h-4" />, color: "bg-sky-500" },
  { type: "gateway", label: "Gateway", icon: <Cpu className="w-4 h-4" />, color: "bg-rose-500" },
  { type: "service", label: "Service", icon: <Server className="w-4 h-4" />, color: "bg-indigo-500" },
  { type: "database", label: "Database", icon: <Database className="w-4 h-4" />, color: "bg-emerald-500" },
  { type: "queue", label: "Queue", icon: <MessageSquare className="w-4 h-4" />, color: "bg-amber-500" },
  { type: "cache", label: "Cache", icon: <Zap className="w-4 h-4" />, color: "bg-violet-500" },
];

export default function NodeToolbar() {
  const { addNode } = useDiagramStore();

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleQuickAdd = (type: string) => {
    // Generate a random position offset near the center to avoid exact overlays
    const offset = Math.random() * 60 - 30;
    const newNode = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 300 + offset, y: 200 + offset },
      data: { label: `${type.charAt(0).toUpperCase() + type.slice(1)} Service` },
    };
    addNode(newNode);
  };

  return (
    <div className="absolute top-20 left-6 z-10 flex flex-col gap-2 bg-white/95 dark:bg-zinc-950/95 border border-zinc-200/60 dark:border-zinc-800/60 p-2.5 rounded-xl shadow-xl backdrop-blur-md max-w-[70px] sm:max-w-none">
      <div className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 text-center select-none pb-1.5 border-b border-zinc-100 dark:border-zinc-900">
        Nodes
      </div>
      <div className="flex flex-col gap-1.5 pt-1.5">
        {NODE_TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.type}
            draggable
            onDragStart={(e) => handleDragStart(e, tmpl.type)}
            onClick={() => handleQuickAdd(tmpl.type)}
            className="group relative flex items-center justify-center p-2.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg cursor-grab active:cursor-grabbing hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all"
            title={`Drag to canvas or click to add ${tmpl.label}`}
          >
            <div className={`p-1.5 text-white rounded-md ${tmpl.color}`}>
              {tmpl.icon}
            </div>

            {/* Drag helper tooltip on hover */}
            <span className="absolute left-14 hidden group-hover:block bg-zinc-900 text-zinc-50 text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap shadow-md pointer-events-none uppercase tracking-wide">
              {tmpl.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
