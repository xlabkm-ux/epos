import { API_BASE_URL } from "../api-config";
import React, { useState } from "react";
import GraphCanvas from "./GraphCanvas";
import { ShieldCheck, Zap } from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { useSecurity } from "../context/SecurityContext";
import { AnimatePresence } from "framer-motion";
import { MissionPanel } from "./MissionPanel";
import { RatingPanel } from "./RatingPanel";
import { ShieldAlert } from "lucide-react";
import { Workspace } from "@epios/domain";

const WorkspaceRoom: React.FC = () => {
  const {
    workspaces,
    selectedWorkspaceId,
    selectedNodeId,
    setSelectedNodeId,
    graphStates,
  } = useWorkspace();
  const [showWorkspaceCard, setShowWorkspaceCard] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const { currentUser } = useSecurity();

  const isAdmin = currentUser?.role === "approver";
  const canEdit =
    currentUser?.role === "contributor" || currentUser?.role === "approver";

  const selectedWorkspace = workspaces.find(
    (m) => m.id === selectedWorkspaceId,
  );

  const selectedNode =
    selectedWorkspaceId && selectedNodeId
      ? graphStates[selectedWorkspaceId]?.nodes.find(
          (n: { id: string }) => n.id === selectedNodeId,
        )
      : null;

  const proposePatch = async () => {
    if (!selectedNode || !selectedWorkspaceId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/governance/patches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.id || "observer-1",
        },
        body: JSON.stringify({
          targetNodeId: selectedNode.id,
          workspaceId: selectedWorkspaceId,
          authorId: currentUser?.id,
          content: editContent,
        }),
      });
      if (res.ok) {
        setIsEditing(false);
        alert("Patch proposed successfully!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const redactNode = async () => {
    if (!selectedNode) return;
    const rules = [
      {
        id: "pii-redaction",
        pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
        replacement: "[EMAIL_REDACTED]",
        description: "Redact email addresses",
      },
    ];
    try {
      const res = await fetch(`${API_BASE_URL}/security/redact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.id || "observer-1",
        },
        body: JSON.stringify({
          nodeId: selectedNode.id,
          rules,
        }),
      });
      if (res.ok) {
        alert("Content redacted successfully!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!selectedWorkspace) {
    return (
      <div
        data-testid="workspace-room-empty"
        className="animate-fade-in"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-dim)",
          background:
            "radial-gradient(circle at 50% 50%, var(--primary-alpha) 0%, transparent 80%)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            className="glow-box"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "24px",
              border: "2px solid var(--border)",
              margin: "0 auto 2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--bg-card)",
            }}
          >
            <ShieldCheck size={32} color="var(--border)" />
          </div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
              color: "var(--text-main)",
              letterSpacing: "-0.02em",
            }}
          >
            Awaiting Workspace Assignment
          </h2>
          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--text-dim)",
              maxWidth: "300px",
              margin: "0 auto",
              lineHeight: 1.5,
            }}
          >
            Select a neural workspace from the synchronized repository to begin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="workspace-room-active"
      className="animate-fade-in"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "relative",
      }}
    >
      {/* Main Area (Now full height since header is gone) */}
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          overflow: "hidden",
          background: "var(--bg-dark)",
        }}
      >
        <GraphCanvas />

        {/* Right Panel (Node Details) */}
        <div
          className="premium-card"
          style={{
            width: "360px",
            height: "calc(100vh - 120px)",
            margin: "24px",
            position: "absolute",
            right: 0,
            zIndex: 5,
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.75rem",
            transform: selectedNode ? "translateX(0)" : "translateX(420px)",
            transition: "transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)",
            backgroundColor: "var(--bg-card)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h3
                style={{
                  fontSize: "0.75rem",
                  color: "var(--primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  fontWeight: 700,
                }}
              >
                Intelligence properties
              </h3>
              {selectedNode && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-dim)",
                    fontFamily: "var(--font-mono)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  #{selectedNode.data.hierarchicalId}
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedNodeId(null)}
              style={{
                color: "var(--text-dim)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <ShieldCheck size={18} />
            </button>
          </div>

          {selectedNode ? (
            <>
              <div style={{ flex: 1, overflowY: "auto", paddingRight: "10px" }}>
                <div style={{ marginBottom: "2rem" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(255,255,255,0.03)",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color:
                        selectedNode.data.type === "HYPOTHESIS"
                          ? "var(--primary)"
                          : "var(--success)",
                      marginBottom: "1.25rem",
                      border: `1px solid ${selectedNode.data.type === "HYPOTHESIS" ? "var(--primary)44" : "var(--success)44"}`,
                    }}
                  >
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "currentColor",
                      }}
                    />
                    {selectedNode.data.type}
                  </div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Core Content
                  </label>
                  {isEditing ? (
                    <textarea
                      style={{
                        width: "100%",
                        minHeight: "120px",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        border: "1px solid var(--primary)",
                        borderRadius: "12px",
                        padding: "1.25rem",
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                        color: "var(--text-main)",
                        fontFamily: "var(--font-sans)",
                        outline: "none",
                        resize: "vertical",
                      }}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        minHeight: "120px",
                        backgroundColor: "rgba(0,0,0,0.3)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        padding: "1.25rem",
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                        color: "var(--text-main)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {selectedNode.data.label}
                    </div>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Epistemic Traceability
                  </label>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      padding: "1rem",
                      border: "1px dashed var(--border)",
                      borderRadius: "10px",
                      color: "var(--text-dim)",
                      backgroundColor: "rgba(255,255,255,0.01)",
                      lineHeight: 1.5,
                    }}
                  >
                    {selectedNode.data.type === "EVIDENCE"
                      ? "Cryptographic proof of source origin verified via MCP adapter. Trace ID: EP-4492-X."
                      : "Hypothetical construct awaiting empirical validation. Linked dependencies: 3."}
                  </div>
                </div>

                {/* Epistemic Evaluation Section */}
                <div style={{ marginTop: "1rem" }}>
                  <RatingPanel nodeId={selectedNodeId!} />
                </div>
              </div>

              <div
                style={{ display: "flex", gap: "0.75rem", marginTop: "auto" }}
              >
                {isEditing ? (
                  <>
                    <button
                      className="glass"
                      onClick={() => setIsEditing(false)}
                      style={{
                        flex: 1,
                        padding: "0.85rem",
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "var(--text-dim)",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={proposePatch}
                      style={{
                        flex: 2,
                        padding: "0.85rem",
                        borderRadius: "10px",
                        backgroundColor: "var(--primary)",
                        border: "none",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Propose Patch
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="glass"
                      disabled={!canEdit}
                      onClick={() => {
                        setEditContent(selectedNode.data.label);
                        setIsEditing(true);
                      }}
                      style={{
                        flex: 1,
                        padding: "0.85rem",
                        borderRadius: "10px",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: canEdit ? "var(--text-main)" : "var(--text-dim)",
                        opacity: canEdit ? 1 : 0.5,
                        cursor: canEdit ? "pointer" : "not-allowed",
                      }}
                    >
                      Edit
                    </button>
                    {isAdmin && (
                      <button
                        onClick={redactNode}
                        style={{
                          padding: "0.85rem",
                          borderRadius: "10px",
                          border: "1px solid var(--warning)",
                          backgroundColor: "rgba(255, 152, 0, 0.05)",
                          color: "var(--warning)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Redact Sensitive Data"
                      >
                        <ShieldAlert size={18} />
                      </button>
                    )}
                    <button
                      disabled={!isAdmin}
                      onClick={() =>
                        alert(
                          `Purging node ${selectedNode.id} from neural graph...`,
                        )
                      }
                      style={{
                        flex: 1,
                        padding: "0.85rem",
                        borderRadius: "10px",
                        border: `1px solid ${isAdmin ? "var(--error)" : "var(--border)"}`,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: isAdmin ? "var(--error)" : "var(--text-dim)",
                        backgroundColor: isAdmin
                          ? "rgba(239, 68, 68, 0.05)"
                          : "transparent",
                        opacity: isAdmin ? 1 : 0.5,
                        cursor: isAdmin ? "pointer" : "not-allowed",
                      }}
                    >
                      Purge
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-dim)",
                gap: "1rem",
              }}
            >
              <div style={{ opacity: 0.3 }}>
                <ShieldCheck size={48} />
              </div>
              <p
                style={{
                  fontSize: "0.9rem",
                  textAlign: "center",
                  maxWidth: "200px",
                  lineHeight: 1.5,
                }}
              >
                Select a node to analyze its epistemic properties.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <footer
        className="desktop-only"
        style={{
          height: "36px",
          backgroundColor: "var(--bg-sidebar)",
          borderTop: "1px solid var(--border)",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.65rem",
          color: "var(--text-dim)",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.02em",
          position: "relative",
        }}
      >
        {/* Left Side: Mission Title Trigger */}
        <div
          onClick={() => setShowWorkspaceCard(!showWorkspaceCard)}
          data-testid="workspace-command-trigger"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            color: "var(--primary)",
            fontWeight: 600,
            transition: "all 0.3s ease",
          }}
        >
          <Zap size={12} fill="currentColor" />
          <span data-testid="workspace-title-footer">
            {selectedWorkspace.title}
          </span>

          <AnimatePresence>
            {showWorkspaceCard && (
              <MissionPanel
                workspace={selectedWorkspace as Workspace}
                onClose={() => setShowWorkspaceCard(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Connection Status (Existing) */}
        <div
          className="status-trigger"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            padding: "8px 0",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              backgroundColor: "var(--primary)",
              boxShadow: "0 0 8px var(--primary)",
            }}
          />
          <span style={{ color: "var(--primary)", fontWeight: 600 }}>
            EPIOS_SHELL_CONNECTED
          </span>

          {/* Hover Panel */}
          <div className="status-popup premium-card">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "2rem",
                }}
              >
                <span style={{ opacity: 0.5 }}>DATABASE</span>
                <span style={{ color: "var(--success)" }}>
                  POSTGRESQL_READY
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "2rem",
                }}
              >
                <span style={{ opacity: 0.5 }}>KERNEL_API</span>
                <span>v1.0.0-PROD</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "2rem",
                }}
              >
                <span style={{ opacity: 0.5 }}>LATENCY</span>
                <span style={{ color: "var(--primary)" }}>12ms</span>
              </div>
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.5rem",
                  marginTop: "0.5rem",
                  fontSize: "0.6rem",
                  opacity: 0.4,
                }}
              >
                SECURE_ENCLAVE_ACTIVE // TRACE_LEVEL: DEBUG
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .status-trigger {
            position: relative;
          }
          .status-popup {
            position: absolute;
            bottom: 45px;
            right: 0;
            width: 240px;
            padding: 1.25rem;
            background: var(--bg-card) !important;
            backdrop-filter: blur(20px) !important;
            border: 1px solid var(--border) !important;
            box-shadow: var(--modal-shadow) !important;
            border-radius: var(--radius-lg);
            opacity: 0;
            transform: translateY(10px);
            pointer-events: none;
            transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
            z-index: 100;
          }
          .status-trigger:hover .status-popup {
            opacity: 1;
            transform: translateY(0);
            pointer-events: all;
          }

          /* Smooth Node Movement for Gravity Effect */
          .react-flow__node {
            transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          }
          
          /* Ensure dragging is still responsive (disable transition during drag if possible, 
             but for now let's keep it simple) */
        `}</style>
      </footer>
    </div>
  );
};

export default WorkspaceRoom;
