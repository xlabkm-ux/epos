import React, { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Node,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { useWorkspace } from "../context/WorkspaceContext";
import { useApi } from "../hooks/useApi";
import { Plus, Layout, Activity, Maximize, Target } from "lucide-react";
import CustomNode from "./CustomNode";

interface GraphData {
  nodes: Array<{ id: string; content: string; type: string }>;
  edges: Array<{
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    type: string;
  }>;
}

const ToolbarButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    title={label}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
      borderRadius: "8px",
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      color: "var(--text-dim)",
      transition: "all 0.2s ease",
      boxShadow: "var(--panel-shadow)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "var(--border-bright)";
      e.currentTarget.style.color = "var(--text-main)";
      e.currentTarget.style.background = "var(--surface-hover)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "var(--border)";
      e.currentTarget.style.color = "var(--text-dim)";
      e.currentTarget.style.background = "var(--bg-card)";
    }}
  >
    {icon}
  </button>
);

const GraphCanvasInner: React.FC = () => {
  const {
    selectedWorkspaceId,
    selectedNodeId,
    setSelectedNodeId,
    graphStates,
    setGraphState,
    viewports,
    setViewport,
  } = useWorkspace();

  const { setCenter, fitView } = useReactFlow();

  const {
    data: graphData,
    loading,
    error,
  } = useApi<GraphData>(
    selectedWorkspaceId ? `/workspaces/${selectedWorkspaceId}/graph` : "",
    5000, // Poll every 5s
  );

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Restore state when workspace changes
  useEffect(() => {
    if (selectedWorkspaceId) {
      const saved = graphStates[selectedWorkspaceId];
      if (saved && Array.isArray(saved.nodes) && Array.isArray(saved.edges)) {
        const shortWsId = selectedWorkspaceId.replace(/^[0-]+/, "") || "0";
        const patchedNodes = saved.nodes.map((node, index) => {
          const rawType = (node.data.type || "hypothesis").toUpperCase();
          const normalizedType =
            rawType === "OBSERVATION"
              ? "EVIDENCE"
              : rawType === "RISK"
                ? "CLAIM"
                : rawType;
          return {
            ...node,
            data: {
              ...node.data,
              type: normalizedType,
              hierarchicalId: `${shortWsId}.${index + 1}`,
            },
          };
        });
        setNodes(patchedNodes);
        setEdges(saved.edges);
      } else {
        setNodes([]);
        setEdges([]);
      }
    }
  }, [selectedWorkspaceId]);

  // Merge API data with current state (polling results)
  useEffect(() => {
    if (graphData && selectedWorkspaceId) {
      setNodes((currentNodes) => {
        const apiNodes = graphData.nodes || [];
        const newNodes = [...currentNodes];
        let hasChanges = false;
        const shortWsId = selectedWorkspaceId.replace(/^[0-]+/, "") || "0";

        apiNodes.forEach((apiNode) => {
          if (!currentNodes.some((n) => n.id === apiNode.id)) {
            hasChanges = true;
            const rawType = (apiNode.type || "hypothesis").toUpperCase();
            const normalizedType =
              rawType === "OBSERVATION"
                ? "EVIDENCE"
                : rawType === "RISK"
                  ? "CLAIM"
                  : rawType;
            newNodes.push({
              id: apiNode.id,
              type: "epistemic",
              position: {
                x: 150 + ((newNodes.length * 280) % 840),
                y: 100 + Math.floor(newNodes.length / 3) * 220,
              },
              data: {
                label: apiNode.content,
                type: normalizedType,
                hierarchicalId: `${shortWsId}.${newNodes.length + 1}`,
              },
            });
          }
        });

        return hasChanges ? newNodes : currentNodes;
      });

      setEdges((currentEdges) => {
        const apiEdges = graphData.edges || [];
        const newEdges = [...currentEdges];
        let hasChanges = false;

        apiEdges.forEach((apiEdge) => {
          if (!currentEdges.some((e) => e.id === apiEdge.id)) {
            hasChanges = true;
            const normalizedEdgeType = (apiEdge.type || "").toUpperCase();
            newEdges.push({
              id: apiEdge.id,
              source: apiEdge.sourceNodeId,
              target: apiEdge.targetNodeId,
              animated: true,
              label: normalizedEdgeType,
              labelStyle: {
                fill: "var(--text-dim)",
                fontSize: "10px",
                fontWeight: 500,
                fontFamily: "var(--font-mono)",
              },
              style: {
                stroke:
                  normalizedEdgeType === "SUPPORTS"
                    ? "var(--success)"
                    : normalizedEdgeType === "CONTRADICTS"
                      ? "var(--accent)"
                      : "var(--primary)",
                strokeWidth: 2,
                opacity: 0.6,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color:
                  normalizedEdgeType === "SUPPORTS"
                    ? "var(--success)"
                    : normalizedEdgeType === "CONTRADICTS"
                      ? "var(--accent)"
                      : "var(--primary)",
              },
            });
          }
        });

        return hasChanges ? newEdges : currentEdges;
      });
    }
  }, [graphData, selectedWorkspaceId]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: "var(--primary)", strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "var(--primary)",
            },
          },
          eds,
        ),
      ),
    [setEdges],
  );

  // Save state on every change
  useEffect(() => {
    if (selectedWorkspaceId && (nodes.length > 0 || edges.length > 0)) {
      setGraphState(selectedWorkspaceId, nodes, edges);
    }
  }, [nodes, edges, selectedWorkspaceId]);

  const onMoveEnd = useCallback(
    (_event: unknown, viewport: { x: number; y: number; zoom: number }) => {
      if (selectedWorkspaceId) {
        setViewport(selectedWorkspaceId, viewport.x, viewport.y, viewport.zoom);
      }
    },
    [selectedWorkspaceId, setViewport],
  );

  const nodeTypes = useMemo(() => ({ epistemic: CustomNode }), []);

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);

      const zoom = 1.0;
      const panelOffset = 384 / 2 / zoom;
      const cardCenterX = 110;
      const cardCenterY = 75;

      setCenter(
        node.position.x + cardCenterX + panelOffset,
        node.position.y + cardCenterY,
        { zoom, duration: 800 },
      );
    },
    [setSelectedNodeId, setCenter],
  );

  // Auto-center camera when selection changes
  useEffect(() => {
    if (selectedNodeId) {
      const node = nodes.find((n) => n.id === selectedNodeId);
      if (node) {
        const zoom = 1.0;
        const panelOffset = 384 / 2 / zoom;
        const cardCenterX = 110;
        const cardCenterY = 75;

        setCenter(
          node.position.x + cardCenterX + panelOffset,
          node.position.y + cardCenterY,
          { zoom, duration: 800 },
        );
      }
    }
  }, [selectedNodeId, setCenter, nodes]);

  // Auto-fit view when workspace changes and nodes are loaded
  useEffect(() => {
    if (selectedWorkspaceId && nodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({
          duration: 1000,
          padding: 0.3,
          includeHiddenNodes: false,
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [selectedWorkspaceId, nodes.length > 0, fitView]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const displayNodes = useMemo(() => {
    if (!selectedNodeId) return nodes;
    const selectedNode = nodes.find((n) => n.id === selectedNodeId);
    if (!selectedNode) return nodes;

    const sPos = selectedNode.position;
    const connectedNodeIds = new Set<string>();
    edges.forEach((edge) => {
      if (edge.source === selectedNodeId) connectedNodeIds.add(edge.target);
      if (edge.target === selectedNodeId) connectedNodeIds.add(edge.source);
    });

    const REPULSION_RADIUS = 440;
    const NEIGHBOR_RADIUS = 350;

    const neighbors = nodes
      .filter((n) => connectedNodeIds.has(n.id))
      .map((n) => ({
        id: n.id,
        originalAngle: Math.atan2(n.position.y - sPos.y, n.position.x - sPos.x),
      }))
      .sort((a, b) => a.originalAngle - b.originalAngle);

    const neighborAngles = new Map<string, number>();
    if (neighbors.length > 0) {
      const baseAngle = neighbors[0].originalAngle;
      const angleStep = (2 * Math.PI) / neighbors.length;
      neighbors.forEach((n, i) => {
        neighborAngles.set(n.id, baseAngle + i * angleStep);
      });
    }

    return nodes.map((node) => {
      const isSelected = node.id === selectedNodeId;
      const isNeighbor = connectedNodeIds.has(node.id);

      if (isSelected)
        return {
          ...node,
          style: { ...node.style, opacity: 1, zIndex: 1000 },
        };

      const dx = node.position.x - sPos.x;
      const dy = node.position.y - sPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      let displayPos = { ...node.position };

      if (isNeighbor) {
        const targetAngle = neighborAngles.get(node.id) || 0;
        displayPos = {
          x: sPos.x + Math.cos(targetAngle) * NEIGHBOR_RADIUS,
          y: sPos.y + Math.sin(targetAngle) * NEIGHBOR_RADIUS,
        };
      } else {
        if (dist < REPULSION_RADIUS) {
          const ratio = REPULSION_RADIUS / dist;
          displayPos = {
            x: sPos.x + dx * ratio,
            y: sPos.y + dy * ratio,
          };
        }
      }

      return {
        ...node,
        position: displayPos,
        style: {
          ...node.style,
          opacity: isNeighbor ? 1 : 0.25,
          transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
          pointerEvents: (isNeighbor
            ? "all"
            : "all") as React.CSSProperties["pointerEvents"], // Allow interaction but faded
        },
      };
    });
  }, [nodes, edges, selectedNodeId]);

  const displayEdges = useMemo(() => {
    return edges.map((edge) => {
      const isHighlighted =
        selectedNodeId &&
        (edge.source === selectedNodeId || edge.target === selectedNodeId);
      const isDimmed = selectedNodeId && !isHighlighted;

      return {
        ...edge,
        className: isHighlighted
          ? "edge-highlighted"
          : isDimmed
            ? "edge-dimmed"
            : "edge-normal",
        style: {
          ...edge.style,
          strokeWidth: isHighlighted ? 3 : 1.5,
          opacity: isHighlighted ? 1 : isDimmed ? 0.35 : 0.6,
          strokeDasharray: isHighlighted ? "6, 6" : undefined,
          transition: "all 0.3s ease",
        },
        labelStyle: {
          ...edge.labelStyle,
          opacity: isHighlighted ? 1 : 0,
          transition: "opacity 0.3s ease",
        },
        labelBgStyle: {
          fill: "var(--bg-card)",
          fillOpacity: isHighlighted ? 0.8 : 0,
          transition: "fill-opacity 0.3s ease",
        },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
      };
    });
  }, [edges, selectedNodeId]);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--error)",
          background: "var(--bg-dark)",
        }}
      >
        <div
          className="premium-card"
          style={{ padding: "2rem", textAlign: "center" }}
        >
          <h3 style={{ marginBottom: "1rem" }}>
            Neural Synchronization Failed
          </h3>
          <p style={{ fontSize: "0.8rem", opacity: 0.7 }}>{error.message}</p>
        </div>
      </div>
    );
  }

  // CRITICAL: We only show the graph if we have nodes OR if we're not loading anymore
  // But to avoid the "disappearing" blink, we stay in loading state until nodes are set
  const hasNodes = nodes.length > 0;
  const isInitializing = loading && !hasNodes;

  if (isInitializing && selectedWorkspaceId)
    return (
      <div
        className="animate-fade-in"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--text-dim)",
          gap: "1.5rem",
          background: "var(--bg-dark)",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "2px solid var(--border-bright)",
            borderTopColor: "var(--primary)",
            animation: "spin 1s infinite linear",
          }}
        />
        <div style={{ textAlign: "center" }}>
          <span
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--primary)",
              fontWeight: 700,
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            Synchronizing Neural Graph
          </span>
          <span style={{ fontSize: "0.6rem", opacity: 0.5 }}>
            ACCESSING KERNEL DATA...
          </span>
        </div>
      </div>
    );

  // Fallback for empty graph to avoid "disappeared" look
  if (!loading && !hasNodes && selectedWorkspaceId) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--text-dim)",
          gap: "1rem",
          background: "var(--bg-dark)",
        }}
      >
        <Activity size={40} opacity={0.3} />
        <p style={{ fontSize: "0.9rem" }}>
          Neural Graph is empty. Add a node to begin synthesis.
        </p>
        <button
          className="primary"
          onClick={() => alert("Initializing Neural Node...")}
          style={{
            padding: "0.75rem 1.5rem",
            marginTop: "1rem",
          }}
        >
          Add First Node
        </button>
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px", // Ensure minimum height
        backgroundColor: "var(--bg-dark)",
        backgroundImage: `
          radial-gradient(circle at 50% 50%, var(--primary-alpha) 0%, transparent 70%),
          linear-gradient(var(--border) 1px, transparent 1px),
          linear-gradient(90deg, var(--border) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 40px 40px, 40px 40px",
      }}
    >
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        defaultViewport={
          selectedWorkspaceId && viewports[selectedWorkspaceId]
            ? viewports[selectedWorkspaceId]
            : undefined
        }
        fitView
        proOptions={{ hideAttribution: true }}
        fitViewOptions={{
          padding: 0.3,
          duration: 800,
          includeHiddenNodes: false,
        }}
        snapToGrid
        snapGrid={[20, 20]}
        defaultEdgeOptions={{ animated: true, style: { strokeWidth: 2 } }}
      >
        <Background color="var(--border)" gap={40} size={1} />
        <Controls showInteractive={false} position="bottom-right" />

        <div
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            display: "flex",
            gap: "0.5rem",
            zIndex: 10,
          }}
        >
          <ToolbarButton
            icon={<Plus size={16} />}
            label="Add Node"
            onClick={() => alert("Initializing Neural Node...")}
          />
          <ToolbarButton
            icon={<Layout size={16} />}
            label="Auto Layout"
            onClick={() => alert("Organizing Neural Map...")}
          />
          <ToolbarButton
            icon={<Maximize size={16} />}
            label="Fit View"
            onClick={() => fitView({ duration: 800, padding: 0.3 })}
          />
          <ToolbarButton
            icon={<Target size={16} />}
            label="Center Selected"
            onClick={() => {
              if (selectedNodeId) {
                const node = nodes.find((n) => n.id === selectedNodeId);
                if (node) {
                  setCenter(node.position.x + 110, node.position.y + 75, {
                    zoom: 1,
                    duration: 800,
                  });
                }
              }
            }}
          />
          <ToolbarButton
            icon={<Activity size={16} />}
            label="Analyze"
            onClick={() => alert("Running Epistemic Analysis...")}
          />
        </div>
      </ReactFlow>
      <style>{`
        @keyframes flowDash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .edge-highlighted path {
          animation: flowDash 1s linear infinite !important;
          filter: drop-shadow(0 0 3px var(--primary));
        }
      `}</style>
    </div>
  );
};

const GraphCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner />
    </ReactFlowProvider>
  );
};

export default GraphCanvas;
