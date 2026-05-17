import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { Node, Edge } from "reactflow";

import { Workspace } from "@epios/domain";
import { API_BASE_URL } from "../api-config";
import { useApi } from "../hooks/useApi";
import { useSecurity } from "./SecurityContext";

interface WorkspaceContextType {
  selectedWorkspaceId: string | null;
  setSelectedWorkspaceId: (id: string | null) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: React.Dispatch<React.SetStateAction<string | null>>;
  workspaces: Workspace[];
  setWorkspaces: (workspaces: Workspace[]) => void;
  graphStates: Record<string, { nodes: Node[]; edges: Edge[] }>;
  setGraphState: (workspaceId: string, nodes: Node[], edges: Edge[]) => void;
  viewports: Record<string, { x: number; y: number; zoom: number }>;
  setViewport: (
    workspaceId: string,
    x: number,
    y: number,
    zoom: number,
  ) => void;
  activeView: "ROOM" | "ADR" | "ARCHIVE" | "SECURITY";
  setActiveView: (view: "ROOM" | "ADR" | "ARCHIVE" | "SECURITY") => void;
  restoreWorkspace: (id: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    () => {
      return localStorage.getItem("selectedWorkspaceId");
    },
  );
  const [activeView, setActiveView] = useState<
    "ROOM" | "ADR" | "ARCHIVE" | "SECURITY"
  >("ROOM");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const [graphStates, setGraphStates] = useState<
    Record<string, { nodes: Node[]; edges: Edge[] }>
  >(() => {
    const saved = localStorage.getItem("graphStates");
    return saved ? JSON.parse(saved) : {};
  });
  const [viewports, setViewports] = useState<
    Record<string, { x: number; y: number; zoom: number }>
  >(() => {
    const saved = localStorage.getItem("viewports");
    return saved ? JSON.parse(saved) : {};
  });

  // Persist selected workspace
  useEffect(() => {
    if (selectedWorkspaceId) {
      localStorage.setItem("selectedWorkspaceId", selectedWorkspaceId);
    }
  }, [selectedWorkspaceId]);

  // Reset selected node when workspace changes
  useEffect(() => {
    setSelectedNodeId(null);
  }, [selectedWorkspaceId]);

  // Persist graph states
  useEffect(() => {
    localStorage.setItem("graphStates", JSON.stringify(graphStates));
  }, [graphStates]);

  // Persist viewports
  useEffect(() => {
    localStorage.setItem("viewports", JSON.stringify(viewports));
  }, [viewports]);

  const setGraphState = (workspaceId: string, nodes: Node[], edges: Edge[]) => {
    setGraphStates((prev) => ({
      ...prev,
      [workspaceId]: { nodes, edges },
    }));
  };

  const setViewport = (
    workspaceId: string,
    x: number,
    y: number,
    zoom: number,
  ) => {
    setViewports((prev) => ({
      ...prev,
      [workspaceId]: { x, y, zoom },
    }));
  };

  const { activeWorkplace } = useSecurity();
  const { data: fetchedWorkspaces, refresh: refreshWorkspacesApi } = useApi<
    Workspace[]
  >("/workspaces", 30000); // Poll every 30s

  // Sync fetched workspaces with state and local storage overrides
  useEffect(() => {
    if (fetchedWorkspaces) {
      const savedStatuses = JSON.parse(
        localStorage.getItem("workspaceStatuses") || "{}",
      );
      const workspacesWithOverrides = fetchedWorkspaces.map((ws) => ({
        ...ws,
        status: savedStatuses[ws.id] || ws.status,
      })) as Workspace[];

      setWorkspaces(workspacesWithOverrides);

      // Auto-select first if none selected or no longer valid
      const isValidSelection = workspacesWithOverrides.some(
        (ws) => ws.id === selectedWorkspaceId,
      );
      if (
        workspacesWithOverrides.length > 0 &&
        (!selectedWorkspaceId || !isValidSelection)
      ) {
        setSelectedWorkspaceId(workspacesWithOverrides[0].id);
      } else if (workspacesWithOverrides.length === 0) {
        setSelectedWorkspaceId(null);
      }
    }
  }, [fetchedWorkspaces, selectedWorkspaceId, activeWorkplace]);

  const refreshWorkspaces = async () => {
    await refreshWorkspacesApi();
  };

  const restoreWorkspace = async (id: string) => {
    try {
      // 1. Persist to server
      const response = await fetch(`${API_BASE_URL}/workspaces/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "running" }),
      });

      if (!response.ok) throw new Error("Failed to patch workspace");

      // 2. Refresh from server to ensure sync
      await refreshWorkspaces();

      // 3. Update UI state
      setSelectedWorkspaceId(id);
      setActiveView("ROOM");
    } catch (error) {
      console.error("Failed to restore workspace:", error);
      alert("Failed to restore workspace. Please check your connection.");
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        selectedWorkspaceId,
        setSelectedWorkspaceId,
        selectedNodeId,
        setSelectedNodeId,
        workspaces,
        setWorkspaces,
        graphStates,
        setGraphState,
        viewports,
        setViewport,
        activeView,
        setActiveView,
        restoreWorkspace,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
