import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { useSecurity } from "../context/SecurityContext";
import { API_BASE_URL } from "../api-config";
import { useApi } from "../hooks/useApi";
import { Plus, Layout, Activity, Maximize, Target } from "lucide-react";
import CustomNode from "./CustomNode";

interface GraphData {
  nodes: Array<{ id: string; content: string; type: string; createdById?: string }>;
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

  const { currentUser } = useSecurity();
  const rf = useReactFlow();
  const { setCenter, fitView } = rf;

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

  const [zoomStage, setZoomStage] = useState<number>(0);
  const [lastDoubleClickedNodeId, setLastDoubleClickedNodeId] = useState<string | null>(null);

  // Load saved map state from server
  useEffect(() => {
    if (!selectedWorkspaceId || !currentUser?.id) return;

    let active = true;
    const loadState = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/v1/users/map-state?workspaceId=${selectedWorkspaceId}`,
          {
            headers: {
              "x-user-id": currentUser.id,
            },
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!active || !data || !data.state) return;

        const { selectedNodeId: savedNodeId, viewport, nodesState } = data.state;

        if (savedNodeId) {
          setSelectedNodeId(savedNodeId);
        }

        if (viewport && rf) {
          rf.setViewport(viewport);
        }

        if (Array.isArray(nodesState) && nodesState.length > 0) {
          setNodes((currentNodes) => {
            return currentNodes.map((node) => {
              const saved = nodesState.find((n: Node) => n.id === node.id);
              return saved ? { ...node, position: saved.position } : node;
            });
          });
        }
      } catch (err) {
        console.error("Failed to load map state from server:", err);
      }
    };

    loadState();
    return () => {
      active = false;
    };
  }, [selectedWorkspaceId, currentUser?.id, rf]);

  // Debounced save to server
  useEffect(() => {
    if (!selectedWorkspaceId || !currentUser?.id || nodes.length === 0) return;

    const timer = setTimeout(async () => {
      try {
        const viewport = rf ? rf.getViewport() : { x: 0, y: 0, zoom: 1 };
        const payload = {
          workspaceId: selectedWorkspaceId,
          selectedNodeId,
          viewport,
          nodes: nodes.map((n) => ({ id: n.id, position: n.position })),
        };

        await fetch(`${API_BASE_URL}/api/v1/users/map-state`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser.id,
          },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("Failed to save map state:", err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [nodes, selectedNodeId, selectedWorkspaceId, currentUser?.id, rf]);

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
                createdById: apiNode.createdById,
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

  // Helper to align nodes in concentric circle around a selected node
  const alignNodesAround = useCallback((targetNodeId: string) => {
    setNodes((currentNodes) => {
      const selectedNode = currentNodes.find((n) => n.id === targetNodeId);
      if (!selectedNode) return currentNodes;

      const sPos = selectedNode.position;

      // BFS to map distances up to 3 levels from selected node
      const distances = new Map<string, number>();
      distances.set(targetNodeId, 0);

      const queue: string[] = [targetNodeId];
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const currentDist = distances.get(currentId)!;

        if (currentDist < 3) {
          edges.forEach((edge) => {
            let neighborId: string | null = null;
            if (edge.source === currentId) neighborId = edge.target;
            if (edge.target === currentId) neighborId = edge.source;

            if (neighborId && !distances.has(neighborId)) {
              distances.set(neighborId, currentDist + 1);
              queue.push(neighborId);
            }
          });
        }
      }

      const R1 = 280;
      const R2 = 480;
      const R3 = 680;
      const REPULSION_RADIUS = 840;

      const levelNodesAt = (level: number) => currentNodes.filter((n) => distances.get(n.id) === level);
      
      const computeAnglesForLevel = (level: number, levelNodesList: Node[]) => {
        const sorted = levelNodesList
          .map((n) => ({
            id: n.id,
            angle: Math.atan2(n.position.y - sPos.y, n.position.x - sPos.x),
          }))
          .sort((a, b) => a.angle - b.angle);

        const angles = new Map<string, number>();
        if (sorted.length > 0) {
          const angleStep = (2 * Math.PI) / sorted.length;
          const offset = level === 2 ? angleStep / 2 : 0;
          sorted.forEach((n, i) => {
            angles.set(n.id, offset + i * angleStep);
          });
        }
        return angles;
      };

      const level1Angles = computeAnglesForLevel(1, levelNodesAt(1));
      const level2Angles = computeAnglesForLevel(2, levelNodesAt(2));
      const level3Angles = computeAnglesForLevel(3, levelNodesAt(3));

      return currentNodes.map((node) => {
        if (node.id === targetNodeId) return node;

        const distance = distances.get(node.id);
        let displayPos = { ...node.position };

        if (distance === 1) {
          const angle = level1Angles.get(node.id) ?? 0;
          displayPos = {
            x: sPos.x + Math.cos(angle) * R1,
            y: sPos.y + Math.sin(angle) * R1,
          };
        } else if (distance === 2) {
          const angle = level2Angles.get(node.id) ?? 0;
          displayPos = {
            x: sPos.x + Math.cos(angle) * R2,
            y: sPos.y + Math.sin(angle) * R2,
          };
        } else if (distance === 3) {
          const angle = level3Angles.get(node.id) ?? 0;
          displayPos = {
            x: sPos.x + Math.cos(angle) * R3,
            y: sPos.y + Math.sin(angle) * R3,
          };
        } else {
          const dx = node.position.x - sPos.x;
          const dy = node.position.y - sPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
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
        };
      });
    });
  }, [edges, setNodes]);

  // Camera zoom levels stage (0 = Level 1-3 bounds, 1 = Level 1 direct bounds, 2 = whole diagram centered)
  const applyZoomStage = useCallback((targetNodeId: string, stage: number) => {
    const selectedNode = nodes.find((n) => n.id === targetNodeId);
    if (!selectedNode) return;

    const sPos = selectedNode.position;

    // Breadth-First Search (BFS) to map node distances up to 3 connections away
    const distances = new Map<string, number>();
    distances.set(targetNodeId, 0);

    const queue: string[] = [targetNodeId];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentDist = distances.get(currentId)!;

      if (currentDist < 3) {
        edges.forEach((edge) => {
          let neighborId: string | null = null;
          if (edge.source === currentId) neighborId = edge.target;
          if (edge.target === currentId) neighborId = edge.source;

          if (neighborId && !distances.has(neighborId)) {
            distances.set(neighborId, currentDist + 1);
            queue.push(neighborId);
          }
        });
      }
    }

    const R1 = 280;
    const R2 = 480;
    const R3 = 680;

    const levelNodesAt = (level: number) => nodes.filter((n) => distances.get(n.id) === level);
    
    const computeAnglesForLevel = (level: number, levelNodesList: Node[]) => {
      const sorted = levelNodesList
        .map((n) => ({
          id: n.id,
          angle: Math.atan2(n.position.y - sPos.y, n.position.x - sPos.x),
        }))
        .sort((a, b) => a.angle - b.angle);

      const angles = new Map<string, number>();
      if (sorted.length > 0) {
        const angleStep = (2 * Math.PI) / sorted.length;
        const offset = level === 2 ? angleStep / 2 : 0;
        sorted.forEach((n, i) => {
          angles.set(n.id, offset + i * angleStep);
        });
      }
      return angles;
    };

    const level1Angles = computeAnglesForLevel(1, levelNodesAt(1));
    const level2Angles = computeAnglesForLevel(2, levelNodesAt(2));
    const level3Angles = computeAnglesForLevel(3, levelNodesAt(3));

    const cardCenterX = 110;
    const cardCenterY = 75;
    const sCenterX = selectedNode.position.x + cardCenterX;
    const sCenterY = selectedNode.position.y + cardCenterY;

    const viewportWidth = window.innerWidth - 384; // subtract sidebar/panel width
    const viewportHeight = window.innerHeight;

    const getBoundingBox = (nodeIds: Set<string>) => {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      nodes.forEach((n) => {
        if (nodeIds.has(n.id)) {
          const distance = distances.get(n.id);
          let px = n.position.x;
          let py = n.position.y;

          if (n.id !== targetNodeId) {
            if (distance === 1) {
              const angle = level1Angles.get(n.id) ?? 0;
              px = sPos.x + Math.cos(angle) * R1;
              py = sPos.y + Math.sin(angle) * R1;
            } else if (distance === 2) {
              const angle = level2Angles.get(n.id) ?? 0;
              px = sPos.x + Math.cos(angle) * R2;
              py = sPos.y + Math.sin(angle) * R2;
            } else if (distance === 3) {
              const angle = level3Angles.get(n.id) ?? 0;
              px = sPos.x + Math.cos(angle) * R3;
              py = sPos.y + Math.sin(angle) * R3;
            }
          }

          const w = n.width || 220;
          const h = n.height || 150;

          if (px < minX) minX = px;
          if (px + w > maxX) maxX = px + w;
          if (py < minY) minY = py;
          if (py + h > maxY) maxY = py + h;
        }
      });

      if (minX === Infinity) return null;
      return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };
    };

    if (stage === 0) {
      // Stage 0: fit ALL selected/highlighted nodes up to Level 3 connections
      const level3Ids = new Set<string>();
      nodes.forEach((n) => {
        const dist = distances.get(n.id);
        if (dist !== undefined && dist <= 3) {
          level3Ids.add(n.id);
        }
      });

      const box = getBoundingBox(level3Ids);
      if (box) {
        const zoomX = viewportWidth / (box.width + 120);
        const zoomY = viewportHeight / (box.height + 120);
        const zoom = Math.min(zoomX, zoomY, 1.0);
        setCenter(box.x + box.width / 2 + 100, box.y + box.height / 2, {
          zoom: Math.max(zoom, 0.25),
          duration: 800,
        });
      }
    } else if (stage === 1) {
      // Stage 1: fit selected node + Level 1 direct neighbors only
      const level1Ids = new Set<string>();
      nodes.forEach((n) => {
        const dist = distances.get(n.id);
        if (dist !== undefined && dist <= 1) {
          level1Ids.add(n.id);
        }
      });

      const box = getBoundingBox(level1Ids);
      if (box) {
        const zoomX = viewportWidth / (box.width + 100);
        const zoomY = viewportHeight / (box.height + 100);
        const zoom = Math.min(zoomX, zoomY, 1.0);
        setCenter(box.x + box.width / 2 + 100, box.y + box.height / 2, {
          zoom: Math.max(zoom, 0.4),
          duration: 800,
        });
      }
    } else if (stage === 2) {
      // Stage 2: entire diagram centered on the selected node
      const allIds = new Set(nodes.map((n) => n.id));
      const box = getBoundingBox(allIds);
      if (box) {
        const maxDistX = Math.max(Math.abs(box.x - sCenterX), Math.abs(box.x + box.width - sCenterX));
        const maxDistY = Math.max(Math.abs(box.y - sCenterY), Math.abs(box.y + box.height - sCenterY));

        const zoomX = viewportWidth / (maxDistX * 2 + 120);
        const zoomY = viewportHeight / (maxDistY * 2 + 120);
        const zoom = Math.min(zoomX, zoomY, 1.0);

        setCenter(sCenterX + 100, sCenterY, {
          zoom: Math.max(zoom, 0.15),
          duration: 800,
        });
      }
    }
  }, [nodes, edges, setCenter]);

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);

      // 1. Concentric Radial Alignment of nodes (written to positions once)
      alignNodesAround(node.id);

      // 2. Next zoom stage calculation (0 -> 1 -> 2 -> 0 -> ...)
      let nextStage = 0;
      if (lastDoubleClickedNodeId === node.id) {
        nextStage = (zoomStage + 1) % 3;
      }
      setZoomStage(nextStage);
      setLastDoubleClickedNodeId(node.id);

      // 3. Apply custom zoom according to nextStage
      applyZoomStage(node.id, nextStage);
    },
    [setSelectedNodeId, alignNodesAround, lastDoubleClickedNodeId, zoomStage, applyZoomStage],
  );

  // Auto-center camera when selection changes (but only if not in double-click looping zoom)
  useEffect(() => {
    if (selectedNodeId && selectedNodeId !== lastDoubleClickedNodeId) {
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
  }, [selectedNodeId, setCenter, nodes, lastDoubleClickedNodeId]);

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

    // Breadth-First Search (BFS) to map node distances up to 3 connections away
    const distances = new Map<string, number>();
    distances.set(selectedNodeId, 0);

    const queue: string[] = [selectedNodeId];
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentDist = distances.get(currentId)!;

      if (currentDist < 3) {
        edges.forEach((edge) => {
          let neighborId: string | null = null;
          if (edge.source === currentId) neighborId = edge.target;
          if (edge.target === currentId) neighborId = edge.source;

          if (neighborId && !distances.has(neighborId)) {
            distances.set(neighborId, currentDist + 1);
            queue.push(neighborId);
          }
        });
      }
    }

    return nodes.map((node) => {
      const isSelected = node.id === selectedNodeId;
      const distance = distances.get(node.id);
      const connectedEdges = edges.filter(
        (e) => e.source === node.id || e.target === node.id
      ).length;

      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          dependencyCount: connectedEdges,
        },
      };

      if (isSelected) {
        return {
          ...updatedNode,
          style: { ...node.style, opacity: 1, zIndex: 1000 },
        };
      }

      let opacity = 0.35; // Dimmed default for further/unconnected nodes

      if (distance === 1) {
        opacity = 1.0; // Level 1 is fully highlighted
      } else if (distance === 2) {
        opacity = 0.85; // Level 2 is highly visible
      } else if (distance === 3) {
        opacity = 0.70; // Level 3 is clearly visible
      }

      return {
        ...updatedNode,
        style: {
          ...node.style,
          opacity,
          pointerEvents: "all" as React.CSSProperties["pointerEvents"],
          transition: "opacity 0.3s ease",
        },
      };
    });
  }, [nodes, edges, selectedNodeId]);

  const displayEdges = useMemo(() => {
    // Reuse BFS distance map for edge visibility levels if a node is selected
    const distances = new Map<string, number>();
    if (selectedNodeId) {
      distances.set(selectedNodeId, 0);

      const queue: string[] = [selectedNodeId];
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const currentDist = distances.get(currentId)!;

        if (currentDist < 3) {
          edges.forEach((edge) => {
            let neighborId: string | null = null;
            if (edge.source === currentId) neighborId = edge.target;
            if (edge.target === currentId) neighborId = edge.source;

            if (neighborId && !distances.has(neighborId)) {
              distances.set(neighborId, currentDist + 1);
              queue.push(neighborId);
            }
          });
        }
      }
    }

    return edges.map((edge) => {
      const dSource = selectedNodeId ? distances.get(edge.source) : undefined;
      const dTarget = selectedNodeId ? distances.get(edge.target) : undefined;

      const isLevel1 = selectedNodeId && (dSource === 0 || dTarget === 0);
      const isWithinLevel3 = selectedNodeId && (dSource !== undefined && dTarget !== undefined);

      let opacity = 0.5; // default opacity when no node is selected
      let strokeWidth = 2;
      let strokeDasharray = undefined;
      let labelOpacity = 0.85;

      if (selectedNodeId) {
        if (isLevel1) {
          opacity = 1.0;
          strokeWidth = 3;
          strokeDasharray = "6, 6";
          labelOpacity = 1.0;
        } else if (isWithinLevel3) {
          opacity = 0.70;
          strokeWidth = 2;
          labelOpacity = 0.6;
        } else {
          opacity = 0.25;
          strokeWidth = 1.5;
          labelOpacity = 0.2;
        }
      }

      return {
        ...edge,
        className: selectedNodeId
          ? isLevel1
            ? "edge-highlighted"
            : isWithinLevel3
              ? "edge-normal"
              : "edge-dimmed"
          : "edge-normal",
        style: {
          ...edge.style,
          strokeWidth,
          opacity,
          strokeDasharray,
          transition: "all 0.3s ease",
        },
        labelStyle: {
          ...edge.labelStyle,
          fill: selectedNodeId
            ? isLevel1
              ? "#ffffff"
              : isWithinLevel3
                ? "var(--text-dim)"
                : "rgba(169, 177, 214, 0.4)"
            : "var(--text-dim)",
          opacity: labelOpacity,
          transition: "opacity 0.3s ease, fill 0.3s ease",
        },
        labelBgStyle: {
          fill: "#131316",
          fillOpacity: selectedNodeId
            ? isLevel1
              ? 0.95
              : isWithinLevel3
                ? 0.8
                : 0.3
            : 0.85,
          transition: "fill-opacity 0.3s ease",
        },
        labelBgPadding: [6, 4] as [number, number],
        labelBgBorderRadius: 6,
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
            onClick={() => {
              if (selectedNodeId) {
                alignNodesAround(selectedNodeId);
              } else {
                alert("Please select a node to organize the neural map radially.");
              }
            }}
          />
          <ToolbarButton
            icon={<Maximize size={16} />}
            label="Fit View"
            onClick={() => {
              if (selectedNodeId) {
                alignNodesAround(selectedNodeId);
                applyZoomStage(selectedNodeId, 0); // stage 0 fits all Level 1-3 highlighted connected nodes
              } else {
                fitView({ duration: 800, padding: 0.3 });
              }
            }}
          />
          <ToolbarButton
            icon={<Target size={16} />}
            label="Center Selected"
            onClick={() => {
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
                    { zoom, duration: 800 }
                  );
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
