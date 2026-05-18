import React, { useState } from "react";
import { Zap, XCircle, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { GovernancePanel } from "./GovernancePanel";
import { SourcePanel } from "./SourcePanel";
import { MappingPanel } from "./MappingPanel";
import { Workspace } from "@epios/api";

export const MissionPanel: React.FC<{
  workspace: Workspace;
  onClose: () => void;
}> = ({ workspace, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    "strategy" | "governance" | "sources" | "mapping"
  >("strategy");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      className="premium-card"
      data-testid="workspace-card"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        bottom: "45px",
        left: "1.5rem",
        width: "min(1200px, calc(100vw - 320px))",
        height: "calc(100vh - 120px)",
        maxHeight: "800px",
        padding: "2.5rem",
        background: "var(--bg-card)",
        backdropFilter: "blur(40px)",
        zIndex: 110,
        boxShadow: "var(--modal-shadow)",
        border: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.65rem",
              color: "var(--primary)",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            Mission Control Center
          </div>
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--text-main)",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {workspace.title}
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "var(--success)",
                boxShadow: "0 0 8px var(--success)",
              }}
            />
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--success)",
                fontWeight: 700,
              }}
            >
              OPERATIONAL
            </span>
            <span style={{ color: "var(--border)", opacity: 0.3 }}>|</span>
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                fontFamily: "var(--font-mono)",
              }}
            >
              UUID: {workspace.id}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            color: "var(--text-dim)",
            background: "rgba(255,255,255,0.05)",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "8px",
          }}
        >
          <XCircle size={24} />
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          marginBottom: "2rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {(["strategy", "governance", "sources", "mapping"] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.75rem 0",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: activeTab === tab ? "var(--primary)" : "var(--text-dim)",
                borderBottom: `2px solid ${activeTab === tab ? "var(--primary)" : "transparent"}`,
                background: "none",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {tab}
            </button>
          ),
        )}
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "strategy" && (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}
          >
            <section>
              <label
                style={{
                  display: "block",
                  fontSize: "0.7rem",
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                }}
              >
                Strategic Goal
              </label>
              <div
                style={{
                  padding: "1.25rem",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)",
                  lineHeight: 1.6,
                  color: "var(--text-main)",
                }}
              >
                {workspace.brief.goal}
              </div>
            </section>
            {workspace.brief.successCriteria?.length > 0 && (
              <section>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.7rem",
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 700,
                    marginBottom: "0.75rem",
                  }}
                >
                  Tactical Success Criteria
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                  }}
                >
                  {workspace.brief.successCriteria.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.8rem",
                        color: "var(--text-main)",
                        opacity: 0.8,
                      }}
                    >
                      <div
                        style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          backgroundColor: "var(--primary)",
                        }}
                      />
                      {c}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === "governance" && (
          <GovernancePanel workspaceId={workspace.id} minimal={true} />
        )}

        {activeTab === "sources" && <SourcePanel missionId={workspace.id} />}

        {activeTab === "mapping" && <MappingPanel workspaceId={workspace.id} />}
      </div>

      {/* Action Hub */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "1.5rem",
          marginTop: "2rem",
          display: "flex",
          gap: "1rem",
        }}
      >
        <button
          className="glow-box"
          onClick={() => setActiveTab("mapping")}
          style={{
            flex: 2,
            padding: "1rem",
            borderRadius: "10px",
            backgroundColor: "var(--primary)",
            color: "white",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
          }}
        >
          <Zap size={18} fill="currentColor" />
          Run Epistemic Mapping
        </button>
        <button
          className="glass"
          onClick={() => alert("Ref Link Copied")}
          style={{
            padding: "1rem",
            borderRadius: "10px",
            color: "var(--text-main)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Share2 size={18} />
        </button>
      </div>
    </motion.div>
  );
};
