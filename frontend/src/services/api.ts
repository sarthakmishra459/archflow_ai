import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { 
  AuthResponse, 
  DiagramDto, 
  GenerateDiagramRequest, 
  EditDiagramRequest, 
  AnalyticsDto 
} from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to inject Authorization header
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("archflow_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration/401
// Response interceptor to handle token expiration/401/403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Get the URL that triggered the error
      const requestUrl = error.config?.url || "";

      // Skip the redirect if the user is already trying to log in or register
      const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

      if (typeof window !== "undefined" && !isAuthRequest) {
        // Only log out and redirect if they are trying to access protected data
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);


export const authService = {
  login: async (loginData: any): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", loginData);
    return response.data;
  },

  register: async (registerData: any): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", registerData);
    return response.data;
  },
};

export const diagramService = {
  getDiagrams: async (): Promise<DiagramDto[]> => {
    const response = await api.get<DiagramDto[]>("/diagrams");
    return response.data;
  },

  getDiagram: async (id: string): Promise<DiagramDto> => {
    const response = await api.get<DiagramDto>(`/diagrams/${id}`);
    return response.data;
  },

  createDiagram: async (dto: DiagramDto): Promise<DiagramDto> => {
    const response = await api.post<DiagramDto>("/diagrams", dto);
    return response.data;
  },

  updateDiagram: async (id: string, dto: DiagramDto): Promise<DiagramDto> => {
    const response = await api.get<DiagramDto>(`/diagrams/${id}`);
    // Merge or send whole DTO. Let's send the provided DTO.
    const updateResponse = await api.put<DiagramDto>(`/diagrams/${id}`, dto);
    return updateResponse.data;
  },

  deleteDiagram: async (id: string): Promise<void> => {
    await api.delete(`/diagrams/${id}`);
  },

  createVersionSnapshot: async (id: string): Promise<DiagramDto> => {
    const response = await api.post<DiagramDto>(`/diagrams/${id}/version`);
    return response.data;
  },

  getVersionHistory: async (id: string): Promise<DiagramDto[]> => {
    const response = await api.get<DiagramDto[]>(`/diagrams/${id}/versions`);
    return response.data;
  },

  rollbackToVersion: async (id: string, versionId: string): Promise<DiagramDto> => {
    const response = await api.post<DiagramDto>(`/diagrams/${id}/rollback/${versionId}`);
    return response.data;
  },
};

export const aiService = {
  generateDiagram: async (request: GenerateDiagramRequest): Promise<string> => {
    const response = await api.post<string>("/ai/generate", request);
    // Since response body is raw JSON string of nodes and edges, Axios might auto-parse it as object
    // or return it as string. We will handle both cases.
    return typeof response.data === "string" ? response.data : JSON.stringify(response.data);
  },

  editDiagram: async (request: EditDiagramRequest): Promise<string> => {
    const response = await api.post<string>("/ai/edit", request);
    return typeof response.data === "string" ? response.data : JSON.stringify(response.data);
  },
};

export const analyticsService = {
  getAnalytics: async (): Promise<AnalyticsDto> => {
    const response = await api.get<AnalyticsDto>("/analytics");
    return response.data;
  },
};
