import { useCallback } from "react";
import { useReactFlow, Node, Edge } from "reactflow";
import { useDiagramStore } from "../store/diagramStore";
import { layoutGraph } from "../utils/layoutGraph";

export const useAutoLayout = () => {
  const { nodes, edges, setNodes, setEdges, pushToHistory } = useDiagramStore();
  const { fitView } = useReactFlow();

  /**
   * Layouts current or incoming graph elements and animates the node positions transition.
   * 
   * @param incomingNodes Optional nodes list. Defaults to current store nodes.
   * @param incomingEdges Optional edges list. Defaults to current store edges.
   * @param animate Whether to animate the layout transition (defaults to true)
   */
  const runLayout = useCallback(
    (
      incomingNodes?: Node[],
      incomingEdges?: Edge[],
      animate = true
    ) => {
      const activeNodes = incomingNodes || nodes;
      const activeEdges = (incomingEdges as Edge[]) || edges;

      if (activeNodes.length === 0) return;

      // Calculate final target positions using Dagre layout
      const laidOutNodes = layoutGraph(activeNodes, activeEdges);

      const targetPositions = laidOutNodes.reduce((acc, node) => {
        acc[node.id] = { ...node.position };
        return acc;
      }, {} as Record<string, { x: number; y: number }>);

      // If no animation is requested, set values immediately and fit view
      if (!animate) {
        setNodes(laidOutNodes);
        if (incomingEdges) setEdges(activeEdges);
        pushToHistory(laidOutNodes, activeEdges);
        setTimeout(() => {
          fitView({ duration: 300 });
        }, 50);
        return;
      }

      // Map current/initial positions from existing rendering
      const currentRenderedNodes = useDiagramStore.getState().nodes;
      const initialPositions = activeNodes.reduce((acc, node) => {
        const existingNode = currentRenderedNodes.find((n) => n.id === node.id);
        if (existingNode) {
          acc[node.id] = { ...existingNode.position };
        } else {
          // If it's a new node, start it near a connected neighbor or average center
          const connectedEdge = activeEdges.find(
            (e) =>
              (e.source === node.id && currentRenderedNodes.some((n) => n.id === e.target)) ||
              (e.target === node.id && currentRenderedNodes.some((n) => n.id === e.source))
          );
          
          let startPos = { x: 0, y: 0 };
          if (connectedEdge) {
            const neighborId = connectedEdge.source === node.id ? connectedEdge.target : connectedEdge.source;
            const neighbor = currentRenderedNodes.find((n) => n.id === neighborId);
            if (neighbor) {
              startPos = { ...neighbor.position };
            }
          } else if (currentRenderedNodes.length > 0) {
            const avgX = currentRenderedNodes.reduce((sum, n) => sum + n.position.x, 0) / currentRenderedNodes.length;
            const avgY = currentRenderedNodes.reduce((sum, n) => sum + n.position.y, 0) / currentRenderedNodes.length;
            startPos = { x: avgX, y: avgY };
          }
          acc[node.id] = startPos;
        }
        return acc;
      }, {} as Record<string, { x: number; y: number }>);

      // Render initial positions immediately so they are present in the canvas
      const initialNodes = laidOutNodes.map((node) => ({
        ...node,
        position: { ...initialPositions[node.id] },
      }));

      setNodes(initialNodes);
      if (incomingEdges) setEdges(activeEdges);

      // Animate node positions
      const duration = 500; // ms
      const startTime = performance.now();

      const step = (timestamp: number) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // cubic easeInOut
        const ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        setNodes((currentNodes) =>
          currentNodes.map((node) => {
            const startPos = initialPositions[node.id];
            const targetPos = targetPositions[node.id];
            
            if (startPos && targetPos) {
              return {
                ...node,
                position: {
                  x: startPos.x + (targetPos.x - startPos.x) * ease,
                  y: startPos.y + (targetPos.y - startPos.y) * ease,
                },
              };
            }
            return node;
          })
        );

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // Ensure final layout positions are exactly set and push history
          setNodes(laidOutNodes);
          pushToHistory(laidOutNodes, activeEdges);
          
          // Auto center and fit view nicely
          setTimeout(() => {
            fitView({ duration: 400 });
          }, 80);
        }
      };

      requestAnimationFrame(step);
    },
    [nodes, edges, setNodes, setEdges, pushToHistory, fitView]
  );

  return { runLayout };
};
