import React, { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { useDiagramStore } from "../../store/diagramStore";
import { nodeTypes } from "./nodes/CustomNodes";

export default function ReactFlowCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDragStop,
  } = useDiagramStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Handle Drag Over for Drag-and-Drop addition
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle Drop event to add a node manually
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      // Project client position into React Flow coordinates
      // Since we don't have direct access to reactflow instance methods in this root wrapper easily
      // unless we wrap this whole component inside ReactFlowProvider (which we will do in page.tsx).
      // We can fetch coordinates relative to bounds
      const x = event.clientX - reactFlowBounds.left - 100;
      const y = event.clientY - reactFlowBounds.top - 40;

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type,
        position: { x, y },
        data: { label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}` },
      };

      useDiagramStore.getState().addNode(newNode);
    },
    []
  );

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        fitView
        className="bg-zinc-50 dark:bg-[#030303]"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(129, 140, 248, 0.07)"
        />
        <Controls className="bg-white border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 rounded-lg shadow-md !left-6 !bottom-6" />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case "client":
                return "#0ea5e9";
              case "gateway":
                return "#f43f5e";
              case "service":
                return "#6366f1";
              case "database":
                return "#10b981";
              case "queue":
                return "#f59e0b";
              case "cache":
                return "#8b5cf6";
              default:
                return "#71717a";
            }
          }}
          className="!right-6 !bottom-6 border border-zinc-200/50 bg-white/80 dark:bg-zinc-950/80 dark:border-zinc-800/50 rounded-xl shadow-lg backdrop-blur-md hidden sm:block"
          maskColor="rgba(99, 102, 241, 0.04)"
        />
      </ReactFlow>
    </div>
  );
}
