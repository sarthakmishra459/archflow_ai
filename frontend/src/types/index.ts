export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  userId: string;
}

export interface DiagramDto {
  id?: string;
  name: string;
  description: string;
  graphJson: string;
  userId?: string;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerateDiagramRequest {
  prompt: string;
  provider: string;
  diagramId?: string;
}

export interface EditDiagramRequest {
  editInstruction: string;
  currentGraphJson: string;
  provider: string;
  diagramId?: string;
}

export interface AnalyticsDto {
  totalPrompts: number;
  providerCounts: Record<string, number>;
  averageLatencyMs: number;
  totalTokensUsed: number;
  promptHistory: {
    id: string;
    prompt: string;
    responseJson: string;
    provider: string;
    latencyMs: number;
    tokenUsage: number;
    createdAt: string;
  }[];
}
