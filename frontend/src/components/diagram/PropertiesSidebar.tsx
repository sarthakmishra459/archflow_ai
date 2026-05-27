import React, { useState, useEffect } from "react";
import { useDiagramStore } from "../../store/diagramStore";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { Info, Trash2, Sliders, X } from "lucide-react";

export default function PropertiesSidebar() {
  const { nodes, updateNodeLabel, updateNodeType, deleteNode } = useDiagramStore();
  
  // Find the selected node
  const selectedNode = nodes.find((node) => node.selected);
  
  const [label, setLabel] = useState("");

  // Sync state when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || "");
    }
  }, [selectedNode]);

  const handleLabelChange = (newVal: string) => {
    setLabel(newVal);
    if (selectedNode) {
      updateNodeLabel(selectedNode.id, newVal);
    }
  };

  const handleTypeChange = (newType: string) => {
    if (selectedNode) {
      updateNodeType(selectedNode.id, newType);
    }
  };

  const handleDelete = () => {
    if (selectedNode) {
      deleteNode(selectedNode.id);
    }
  };

  const nodeTypesList = [
    { value: "client", label: "Client" },
    { value: "gateway", label: "Gateway" },
    { value: "service", label: "Service" },
    { value: "database", label: "Database" },
    { value: "queue", label: "Queue" },
    { value: "cache", label: "Cache" },
  ];

  if (!selectedNode) {
    return (
      <div className="w-72 border-l border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 p-6 flex flex-col items-center justify-center text-center select-none text-zinc-400">
        <Sliders className="w-8 h-8 mb-3 opacity-30 animate-pulse text-indigo-500" />
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
          Inspector
        </p>
        <p className="text-xs text-zinc-400 max-w-[200px] mt-1.5 leading-relaxed">
          Select any node on the canvas to configure properties
        </p>
      </div>
    );
  }

  return (
    <div className="w-72 border-l border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between z-10 shadow-xs">
      <div className="flex flex-col gap-6">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2">
            <Sliders className="w-4.5 h-4.5 text-indigo-500" />
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
              Element Inspector
            </h3>
          </div>
          <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            Node
          </span>
        </div>

        {/* Node Properties Form */}
        <div className="flex flex-col gap-5">
          <Input
            id="node-label"
            label="Node Name"
            type="text"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
          />

          <Select
            id="node-type"
            label="Component Type"
            options={nodeTypesList}
            value={selectedNode.type || "service"}
            onChange={(e) => handleTypeChange(e.target.value)}
          />

          {/* Positional Coordinates readout */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Coordinates
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg p-2.5">
              <div>
                <span className="text-zinc-400 font-sans mr-1">X:</span>
                {Math.round(selectedNode.position.x)}px
              </div>
              <div>
                <span className="text-zinc-400 font-sans mr-1">Y:</span>
                {Math.round(selectedNode.position.y)}px
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete trigger */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900">
        <Button
          variant="danger"
          onClick={handleDelete}
          className="w-full gap-2 text-sm py-2"
        >
          <Trash2 className="w-4 h-4" /> Delete Element
        </Button>
      </div>
    </div>
  );
}
