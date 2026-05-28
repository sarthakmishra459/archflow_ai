import dagre from "dagre";
import { Node, Edge } from "reactflow";

/**
 * Computes left-to-right hierarchical positions for React Flow nodes using Dagre.
 * 
 * @param nodes Current React Flow nodes
 * @param edges Current React Flow edges
 * @param direction Layout direction ('LR' for Left-to-Right, default)
 * @returns React Flow nodes with updated coordinates
 */
export const layoutGraph = (nodes: Node[], edges: Edge[], direction = "LR"): Node[] => {
  if (nodes.length === 0) return [];

  const g = new dagre.graphlib.Graph();
  
  // Set configuration according to professional layout specifications
  g.setGraph({
    rankdir: direction,
    nodesep: 120,
    ranksep: 180,
    marginx: 50,
    marginy: 50,
  });

  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    // React Flow measures nodes dynamically. If already measured, use those.
    // Otherwise fallback to the default styling dimensions of NodeWrapper (200x80).
    const width = node.width || 200;
    const height = node.height || 80;
    
    g.setNode(node.id, { width, height });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Compute layout
  dagre.layout(g);

  // Return nodes with calculated positions (shifted to align from node center to top-left corner)
  return nodes.map((node) => {
    const dagreNode = g.node(node.id);
    const width = node.width || 200;
    const height = node.height || 80;

    return {
      ...node,
      position: {
        x: dagreNode.x - width / 2,
        y: dagreNode.y - height / 2,
      },
    };
  });
};
