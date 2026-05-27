import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Monitor, Cpu, Server, Database, MessageSquare, Zap } from "lucide-react";

interface NodeWrapperProps {
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  bgBadgeClass: string;
  selected?: boolean;
  children?: React.ReactNode;
}

const NodeWrapper: React.FC<NodeWrapperProps> = ({
  title,
  icon,
  colorClass,
  bgBadgeClass,
  selected,
  children,
}) => {
  return (
    <div
      className={`min-w-[180px] max-w-[240px] border px-4 py-3 shadow-xl backdrop-blur-md rounded-xl transition-all duration-300 ${
        selected
          ? "border-indigo-500 ring-2 ring-indigo-500/20 scale-[1.02]"
          : "border-zinc-200/60 bg-white/95 dark:border-zinc-800/60 dark:bg-zinc-950/95"
      }`}
    >
      {/* Top Gradient Accent Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${colorClass}`} />

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="w-2.5 h-2.5 bg-indigo-500 border border-white dark:border-zinc-950 !left-[-5px]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-2.5 h-2.5 bg-indigo-500 border border-white dark:border-zinc-950 !right-[-5px]"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-2.5 h-2.5 bg-indigo-500 border border-white dark:border-zinc-950 !top-[-5px]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-2.5 h-2.5 bg-indigo-500 border border-white dark:border-zinc-950 !bottom-[-5px]"
      />

      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg text-white ${bgBadgeClass}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold tracking-wider uppercase opacity-40">
            {title}
          </p>
          <div className="text-sm font-semibold truncate text-zinc-800 dark:text-zinc-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ClientNode = memo(({ data, selected }: NodeProps) => {
  return (
    <NodeWrapper
      title="Client"
      icon={<Monitor className="w-4 h-4" />}
      colorClass="bg-sky-500"
      bgBadgeClass="bg-sky-500 shadow-md shadow-sky-500/20"
      selected={selected}
    >
      {data.label || "Web Client"}
    </NodeWrapper>
  );
});
ClientNode.displayName = "ClientNode";

export const GatewayNode = memo(({ data, selected }: NodeProps) => {
  return (
    <NodeWrapper
      title="Gateway"
      icon={<Cpu className="w-4 h-4" />}
      colorClass="bg-rose-500"
      bgBadgeClass="bg-rose-500 shadow-md shadow-rose-500/20"
      selected={selected}
    >
      {data.label || "API Gateway"}
    </NodeWrapper>
  );
});
GatewayNode.displayName = "GatewayNode";

export const ServiceNode = memo(({ data, selected }: NodeProps) => {
  return (
    <NodeWrapper
      title="Service"
      icon={<Server className="w-4 h-4" />}
      colorClass="bg-indigo-500"
      bgBadgeClass="bg-indigo-500 shadow-md shadow-indigo-500/20"
      selected={selected}
    >
      {data.label || "Microservice"}
    </NodeWrapper>
  );
});
ServiceNode.displayName = "ServiceNode";

export const DatabaseNode = memo(({ data, selected }: NodeProps) => {
  return (
    <NodeWrapper
      title="Database"
      icon={<Database className="w-4 h-4" />}
      colorClass="bg-emerald-500"
      bgBadgeClass="bg-emerald-500 shadow-md shadow-emerald-500/20"
      selected={selected}
    >
      {data.label || "Database"}
    </NodeWrapper>
  );
});
DatabaseNode.displayName = "DatabaseNode";

export const QueueNode = memo(({ data, selected }: NodeProps) => {
  return (
    <NodeWrapper
      title="Queue"
      icon={<MessageSquare className="w-4 h-4" />}
      colorClass="bg-amber-500"
      bgBadgeClass="bg-amber-500 shadow-md shadow-amber-500/20"
      selected={selected}
    >
      {data.label || "Message Queue"}
    </NodeWrapper>
  );
});
QueueNode.displayName = "QueueNode";

export const CacheNode = memo(({ data, selected }: NodeProps) => {
  return (
    <NodeWrapper
      title="Cache"
      icon={<Zap className="w-4 h-4" />}
      colorClass="bg-violet-500"
      bgBadgeClass="bg-violet-500 shadow-md shadow-violet-500/20"
      selected={selected}
    >
      {data.label || "Cache Store"}
    </NodeWrapper>
  );
});
CacheNode.displayName = "CacheNode";

export const nodeTypes = {
  client: ClientNode,
  gateway: GatewayNode,
  service: ServiceNode,
  database: DatabaseNode,
  queue: QueueNode,
  cache: CacheNode,
};
