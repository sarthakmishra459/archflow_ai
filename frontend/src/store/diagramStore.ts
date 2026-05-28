import { create } from "zustand";
import { 
  Connection, 
  Edge, 
  Node, 
  addEdge as rfAddEdge, 
  applyNodeChanges, 
  applyEdgeChanges,
  NodeChange,
  EdgeChange
} from "reactflow";
import { diagramService } from "../services/api";
import { DiagramDto } from "../types";

interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
}

interface DiagramState {
  diagramId: string | null;
  name: string;
  description: string;
  isPublic: boolean;
  nodes: Node[];
  edges: Edge[];
  isLoading: boolean;
  isSaving: boolean;
  aiLoading: boolean;
  provider: string;
  history: HistoryEntry[];
  historyIndex: number;
  versions: DiagramDto[];

  // Action methods
  setDiagramDetails: (details: { name: string; description: string; isPublic: boolean }) => void;
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  setProvider: (provider: string) => void;
  setAiLoading: (loading: boolean) => void;
  
  // React Flow handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeDragStop: () => void;

  // Custom node methods
  addNode: (node: Node) => void;
  updateNodeLabel: (id: string, label: string) => void;
  updateNodeType: (id: string, type: string) => void;
  deleteNode: (id: string) => void;
  
  // Undo/Redo
  pushToHistory: (nodes?: Node[], edges?: Edge[]) => void;
  undo: () => void;
  redo: () => void;

  // API operations
  loadDiagram: (id: string) => Promise<void>;
  saveDiagram: () => Promise<void>;
  loadVersions: () => Promise<void>;
  createSnapshot: () => Promise<void>;
  rollbackToVersion: (versionId: string) => Promise<void>;
  resetStore: () => void;
}

// Convert backend graphJson string to React Flow nodes/edges
export const graphJsonToReactFlow = (graphJson: string): { nodes: Node[]; edges: Edge[] } => {
  try {
    if (!graphJson) return { nodes: [], edges: [] };
    const parsed = JSON.parse(graphJson);
    const nodes = (parsed.nodes || []).map((n: any) => ({
      id: n.id,
      type: n.type || "service",
      position: n.position || { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: n.label || "" },
      width: n.width,
      height: n.height,
    }));
    const edges = (parsed.edges || []).map((e: any) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label || "",
      animated: true,
      style: { stroke: "#6366f1" },
    }));
    return { nodes, edges };
  } catch (error) {
    console.error("Failed to parse graphJson:", error);
    return { nodes: [], edges: [] };
  }
};

// Convert React Flow nodes/edges back to backend graphJson format
export const reactFlowToGraphJson = (nodes: Node[], edges: Edge[]): string => {
  const backendNodes = nodes.map((n) => ({
    id: n.id,
    type: n.type || "service",
    label: n.data.label || "",
    position: n.position,
    width: n.width,
    height: n.height,
  }));
  const backendEdges = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label || "",
  }));
  return JSON.stringify({ nodes: backendNodes, edges: backendEdges });
};

export const useDiagramStore = create<DiagramState>((set, get) => ({
  diagramId: null,
  name: "Untitled Diagram",
  description: "",
  isPublic: false,
  nodes: [],
  edges: [],
  isLoading: false,
  isSaving: false,
  aiLoading: false,
  provider: "gemini",
  history: [],
  historyIndex: -1,
  versions: [],

  setDiagramDetails: (details) => {
    set(details);
  },

  setNodes: (nodesOrFn) => {
    const nextNodes = typeof nodesOrFn === "function" ? nodesOrFn(get().nodes) : nodesOrFn;
    set({ nodes: nextNodes });
  },

  setEdges: (edgesOrFn) => {
    const nextEdges = typeof edgesOrFn === "function" ? edgesOrFn(get().edges) : edgesOrFn;
    set({ edges: nextEdges });
  },

  setProvider: (provider) => set({ provider }),
  
  setAiLoading: (loading) => set({ aiLoading: loading }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    const nextEdges = rfAddEdge(
      { 
        ...connection, 
        id: `edge-${Date.now()}`, 
        animated: true, 
        style: { stroke: "#6366f1" } 
      }, 
      get().edges
    );
    set({ edges: nextEdges });
    get().pushToHistory(get().nodes, nextEdges);
  },

  onNodeDragStop: () => {
    get().pushToHistory();
  },

  addNode: (node) => {
    const nextNodes = [...get().nodes, node];
    set({ nodes: nextNodes });
    get().pushToHistory(nextNodes, get().edges);
  },

  updateNodeLabel: (id, label) => {
    const nextNodes = get().nodes.map((node) => {
      if (node.id === id) {
        return {
          ...node,
          data: { ...node.data, label },
        };
      }
      return node;
    });
    set({ nodes: nextNodes });
    get().pushToHistory(nextNodes, get().edges);
  },

  updateNodeType: (id, type) => {
    const nextNodes = get().nodes.map((node) => {
      if (node.id === id) {
        return { ...node, type };
      }
      return node;
    });
    set({ nodes: nextNodes });
    get().pushToHistory(nextNodes, get().edges);
  },

  deleteNode: (id) => {
    const nextNodes = get().nodes.filter((node) => node.id !== id);
    const nextEdges = get().edges.filter(
      (edge) => edge.source !== id && edge.target !== id
    );
    set({ nodes: nextNodes, edges: nextEdges });
    get().pushToHistory(nextNodes, nextEdges);
  },

  pushToHistory: (nodesVal, edgesVal) => {
    const currentNodes = nodesVal || get().nodes;
    const currentEdges = edgesVal || get().edges;
    
    // Deep clone lists
    const nodesCopy = JSON.parse(JSON.stringify(currentNodes));
    const edgesCopy = JSON.parse(JSON.stringify(currentEdges));
    
    const history = get().history.slice(0, get().historyIndex + 1);
    
    // Limit stack size to 30 steps
    if (history.length >= 30) {
      history.shift();
    }
    
    set({
      history: [...history, { nodes: nodesCopy, edges: edgesCopy }],
      historyIndex: history.length,
    });
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const prevEntry = history[historyIndex - 1];
      set({
        nodes: JSON.parse(JSON.stringify(prevEntry.nodes)),
        edges: JSON.parse(JSON.stringify(prevEntry.edges)),
        historyIndex: historyIndex - 1,
      });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const nextEntry = history[historyIndex + 1];
      set({
        nodes: JSON.parse(JSON.stringify(nextEntry.nodes)),
        edges: JSON.parse(JSON.stringify(nextEntry.edges)),
        historyIndex: historyIndex + 1,
      });
    }
  },

  loadDiagram: async (id) => {
    set({ isLoading: true, nodes: [], edges: [], history: [], historyIndex: -1 });
    try {
      const data = await diagramService.getDiagram(id);
      const { nodes, edges } = graphJsonToReactFlow(data.graphJson);
      
      set({
        diagramId: data.id || null,
        name: data.name,
        description: data.description,
        isPublic: data.isPublic,
        nodes,
        edges,
        history: [{ nodes, edges }],
        historyIndex: 0,
      });
    } catch (e) {
      console.error("Failed to load diagram:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  saveDiagram: async () => {
    const { diagramId, name, description, isPublic, nodes, edges } = get();
    if (!diagramId) return;

    set({ isSaving: true });
    try {
      const graphJson = reactFlowToGraphJson(nodes, edges);
      await diagramService.updateDiagram(diagramId, {
        name,
        description,
        isPublic,
        graphJson,
      });
    } catch (e) {
      console.error("Failed to save diagram:", e);
    } finally {
      set({ isSaving: false });
    }
  },

  loadVersions: async () => {
    const { diagramId } = get();
    if (!diagramId) return;

    try {
      const data = await diagramService.getVersionHistory(diagramId);
      set({ versions: data });
    } catch (e) {
      console.error("Failed to load versions:", e);
    }
  },

  createSnapshot: async () => {
    const { diagramId } = get();
    if (!diagramId) return;

    set({ isSaving: true });
    try {
      // Autosave current graph state first
      await get().saveDiagram();
      // Call createVersionSnapshot
      await diagramService.createVersionSnapshot(diagramId);
      // Reload versions list
      await get().loadVersions();
    } catch (e) {
      console.error("Failed to create version snapshot:", e);
    } finally {
      set({ isSaving: false });
    }
  },

  rollbackToVersion: async (versionId) => {
    const { diagramId } = get();
    if (!diagramId) return;

    set({ isLoading: true });
    try {
      const restored = await diagramService.rollbackToVersion(diagramId, versionId);
      const { nodes, edges } = graphJsonToReactFlow(restored.graphJson);
      
      set({
        name: restored.name,
        description: restored.description,
        isPublic: restored.isPublic,
        nodes,
        edges,
      });
      get().pushToHistory(nodes, edges);
    } catch (e) {
      console.error("Failed to rollback to version:", e);
    } finally {
      set({ isLoading: false });
    }
  },

  resetStore: () => {
    set({
      diagramId: null,
      name: "Untitled Diagram",
      description: "",
      isPublic: false,
      nodes: [],
      edges: [],
      isLoading: false,
      isSaving: false,
      aiLoading: false,
      history: [],
      historyIndex: -1,
      versions: [],
    });
  },
}));
