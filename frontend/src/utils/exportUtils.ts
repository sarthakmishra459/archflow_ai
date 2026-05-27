import { Node, Edge } from "reactflow";
import { toPng, toSvg } from "html-to-image";

export const exportToJson = (name: string, nodes: Node[], edges: Edge[]) => {
  try {
    const dataStr = JSON.stringify({ name, nodes, edges }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.replace(/\s+/g, "_")}_diagram.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export JSON:", error);
  }
};

export const importFromJson = (file: File): Promise<{ name: string; nodes: Node[]; edges: Edge[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.nodes || !parsed.edges) {
          reject(new Error("Invalid file format. Nodes and edges list are required."));
          return;
        }
        resolve({
          name: parsed.name || "Imported Diagram",
          nodes: parsed.nodes,
          edges: parsed.edges,
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("File reading error."));
    reader.readAsText(file);
  });
};

const prepareCanvasForCapture = (): { element: HTMLElement; cleanup: () => void } | null => {
  const element = document.querySelector(".react-flow") as HTMLElement;
  if (!element) return null;

  // Find controls and minimap to hide them temporarily
  const controls = document.querySelector(".react-flow__controls") as HTMLElement;
  const minimap = document.querySelector(".react-flow__minimap") as HTMLElement;

  if (controls) controls.style.display = "none";
  if (minimap) minimap.style.display = "none";

  const cleanup = () => {
    if (controls) controls.style.display = "";
    if (minimap) minimap.style.display = "";
  };

  return { element, cleanup };
};

export const exportToPng = async (filename: string) => {
  const capture = prepareCanvasForCapture();
  if (!capture) return;

  try {
    const dataUrl = await toPng(capture.element, {
      backgroundColor: document.documentElement.classList.contains("dark") ? "#030303" : "#f9fafb",
      style: {
        transform: "none",
      },
    });

    const link = document.createElement("a");
    link.download = `${filename.replace(/\s+/g, "_")}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Failed to export PNG:", error);
  } finally {
    capture.cleanup();
  }
};

export const exportToSvg = async (filename: string) => {
  const capture = prepareCanvasForCapture();
  if (!capture) return;

  try {
    const dataUrl = await toSvg(capture.element, {
      backgroundColor: document.documentElement.classList.contains("dark") ? "#030303" : "#f9fafb",
      style: {
        transform: "none",
      },
    });

    const link = document.createElement("a");
    link.download = `${filename.replace(/\s+/g, "_")}.svg`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Failed to export SVG:", error);
  } finally {
    capture.cleanup();
  }
};
