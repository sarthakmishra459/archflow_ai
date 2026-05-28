import React, { useState } from "react";
import { useDiagramStore, graphJsonToReactFlow, reactFlowToGraphJson } from "../../store/diagramStore";
import { aiService } from "../../services/api";
import { useAutoLayout } from "../../hooks/useAutoLayout";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { Sparkles, ArrowRight, BrainCircuit, Wand2, Compass, AlertCircle, X } from "lucide-react";

const SUGGESTED_PROMPTS = [
  { text: "Serverless web app with API Gateway, Lambda, and DynamoDB", title: "Serverless Stack" },
  { text: "Microservices design with API Gateway, Auth Service, and Payment Service", title: "Microservices" },
  { text: "CI/CD Pipeline flow using GitHub, AWS CodeBuild, and Vercel", title: "CI/CD Pipeline" },
];

const PRESETS_EDIT = [
  "Add a cache layer between service and database",
  "Introduce a gateway route to handle traffic validation",
  "Scale client traffic by adding an AWS CloudFront CDN",
];

export default function AIPanel() {
  const {
    diagramId,
    nodes,
    edges,
    provider,
    aiLoading,
    setProvider,
    setAiLoading,
    setNodes,
    setEdges,
    pushToHistory,
  } = useDiagramStore();

  const { runLayout } = useAutoLayout();

  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="absolute top-20 right-6 z-10 p-3 bg-white/95 dark:bg-zinc-950/95 border border-zinc-200/60 dark:border-zinc-800/60 rounded-full shadow-xl backdrop-blur-md text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center group"
        title="Open AI Assistant"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="absolute right-14 hidden group-hover:block bg-zinc-900 text-zinc-50 text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap shadow-md pointer-events-none uppercase tracking-wide">
          AI Assistant
        </span>
      </button>
    );
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setError("");
    setAiLoading(true);

    try {
      const graphJson = await aiService.generateDiagram({
        prompt: prompt.trim(),
        provider: provider.toLowerCase(),
        diagramId: diagramId || undefined,
      });

      const { nodes: newNodes, edges: newEdges } = graphJsonToReactFlow(graphJson);
      
      if (newNodes.length === 0) {
        throw new Error("AI returned an empty diagram. Please try a different prompt.");
      }

      runLayout(newNodes, newEdges, true);
      setPrompt("");
    } catch (e: any) {
      console.error(e);
      setError(
        e.response?.data || e.message || "Failed to generate diagram. Check API connection or provider key."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!prompt.trim()) return;

    setError("");
    setAiLoading(true);

    try {
      const currentGraphJson = reactFlowToGraphJson(nodes, edges);
      const graphJson = await aiService.editDiagram({
        editInstruction: prompt.trim(),
        currentGraphJson,
        provider: provider.toLowerCase(),
        diagramId: diagramId || undefined,
      });

      const { nodes: newNodes, edges: newEdges } = graphJsonToReactFlow(graphJson);
      
      if (newNodes.length === 0) {
        throw new Error("AI returned an empty diagram. Please try a different prompt.");
      }

      runLayout(newNodes, newEdges, true);
      setPrompt("");
    } catch (e: any) {
      console.error(e);
      setError(
        e.response?.data || e.message || "Failed to edit diagram. Check API connection or provider key."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const providersOptions = [
    { value: "gemini", label: "Google Gemini 2.5 Flash" },
    { value: "groq", label: "Groq LLaMA 3" },
  ];

  return (
    <div className="absolute top-20 right-6 z-10 w-80 bg-white/95 dark:bg-zinc-950/95 border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl shadow-xl backdrop-blur-md p-5 flex flex-col gap-4 max-h-[calc(100vh-120px)] overflow-y-auto">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900 select-none">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
            AI Design Assistant
          </h3>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          title="Minimize Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Model Selector */}
      <Select
        id="ai-provider"
        label="AI Intelligence Model"
        options={providersOptions}
        value={provider}
        onChange={(e) => setProvider(e.target.value)}
      />

      {/* Prompt Area */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Prompt / Instructions
        </label>
        <textarea
          placeholder={
            nodes.length === 0
              ? "e.g. Create a payment microservice flow..."
              : "e.g. Add a Redis cache after the order service..."
          }
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={aiLoading}
          className="w-full min-h-[100px] p-3 text-xs bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-zinc-900 dark:text-zinc-50 leading-relaxed resize-none disabled:opacity-50"
        />
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-semibold flex gap-2 items-start leading-normal">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          onClick={handleGenerate}
          isLoading={aiLoading && prompt !== ""}
          disabled={aiLoading || !prompt.trim()}
          variant="primary"
          size="sm"
          className="w-full font-bold text-xs"
        >
          Generate
        </Button>
        <Button
          onClick={handleEdit}
          isLoading={aiLoading && prompt !== ""}
          disabled={aiLoading || !prompt.trim() || nodes.length === 0}
          variant="outline"
          size="sm"
          className="w-full font-bold text-xs"
        >
          Edit Canvas
        </Button>
      </div>

      {/* Loading Skeleton Overlays inside the panel to show AI state */}
      {aiLoading && (
        <div className="flex flex-col gap-2 mt-2 animate-pulse bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-3 select-none">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-indigo-500 animate-spin" />
            <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest">
              AI Thinking...
            </span>
          </div>
          <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded w-full mt-1.5" />
          <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded w-4/5" />
        </div>
      )}

      {/* Suggested Prompt Options */}
      {nodes.length === 0 && !aiLoading && (
        <div className="flex flex-col gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
            <Compass className="w-3.5 h-3.5" /> Suggested Ideas
          </div>
          <div className="flex flex-col gap-1.5">
            {SUGGESTED_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(item.text)}
                className="w-full text-left px-2.5 py-2 text-[10px] font-semibold bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/40 dark:border-zinc-800/40 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-indigo-500/30 transition-all leading-normal truncate"
              >
                {item.title}: <span className="font-normal opacity-70">{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Edits */}
      {nodes.length > 0 && !aiLoading && (
        <div className="flex flex-col gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
            <Wand2 className="w-3.5 h-3.5" /> Suggested Edits
          </div>
          <div className="flex flex-col gap-1.5">
            {PRESETS_EDIT.map((text, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(text)}
                className="w-full text-left px-2.5 py-2 text-[10px] font-normal bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/40 dark:border-zinc-800/40 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-indigo-500/30 transition-all leading-normal truncate"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
