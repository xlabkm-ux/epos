import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Search,
  History,
  ShieldCheck,
  Zap,
  Check,
  Loader2,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../hooks/useApi";
import { ReadinessPanel } from "./ReadinessPanel";
import { GovernancePanel } from "./GovernancePanel";
import { FinalADRPanel } from "./FinalADRPanel";
import { SecureMcpIframe } from "./SecureMcpIframe";
import { ArtifactPatchPanel } from "./ArtifactPatchPanel";
import { ApprovalPanel } from "./ApprovalPanel";

import { API_BASE_URL } from "../api-config";
import { useSecurity } from "../context/SecurityContext";

interface ADR {
  id: string;
  title: string;
  status: "Proposed" | "Accepted" | "Superseded" | "Rejected" | "Deprecated";
  priority: "P0" | "P1" | "P2";
  date: string;
  author: string;
  context?: string;
  decision?: string;
  consequences?: {
    positive: string[];
    negative: string[];
  };
}

type FlowStep = "idle" | "analyzing" | "reviewing" | "finalizing" | "completed";

const ADRReviewWorkspace: React.FC = () => {
  const { data: adrs, loading } = useApi<ADR[]>("/adrs");
  const [selectedAdrId, setSelectedAdrId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [flowStep, setFlowStep] = useState<FlowStep>("idle");
  const [localStatus, setLocalStatus] = useState<ADR["status"] | null>(null);
  const [showGovernance, setShowGovernance] = useState(false);
  const [showFinalADR, setShowFinalADR] = useState(false);
  const [showExternalApproval, setShowExternalApproval] = useState(false);
  const { currentUser } = useSecurity();

  useEffect(() => {
    if (adrs && adrs.length > 0 && !selectedAdrId) {
      setSelectedAdrId(adrs[0].id);
    }
  }, [adrs]);

  const selectedAdr = adrs?.find((a) => a.id === selectedAdrId);

  const startAnalysis = async () => {
    if (!selectedAdrId) return;
    setFlowStep("analyzing");
    try {
      const res = await fetch(`${API_BASE_URL}/governance/readiness`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.id || "admin-1",
        },
        body: JSON.stringify({
          workspaceId: selectedAdrId,
          profileId: "epistemic-profile-1",
        }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      setFlowStep("reviewing");
    } catch (err) {
      console.error(err);
      setFlowStep("idle");
    }
  };

  const approveDecision = async () => {
    if (!selectedAdrId) return;
    setFlowStep("finalizing");
    try {
      const res = await fetch(`${API_BASE_URL}/governance/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.id || "admin-1",
        },
        body: JSON.stringify({
          nodeId: selectedAdrId,
          actorId: currentUser?.id || "admin-1",
          decision: "approve",
          rationale: "Approved via ADR Workspace",
        }),
      });
      if (!res.ok) throw new Error("Approval failed");
      setFlowStep("completed");
      setLocalStatus("Accepted");
    } catch (err) {
      console.error(err);
      setFlowStep("reviewing");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-dark)",
        }}
      >
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        flex: 1,
        display: "flex",
        height: "100vh",
        backgroundColor: "var(--bg-dark)",
        overflow: "hidden",
      }}
    >
      {/* List Panel */}
      <div
        style={{
          width: "400px",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "var(--primary-alpha)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <h1
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              ADR Index
            </h1>
          </div>

          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-dim)",
              }}
            />
            <input
              type="text"
              placeholder="Search decisions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                fontSize: "0.85rem",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                backgroundColor: "rgba(255,255,255,0.02)",
                color: "var(--text-main)",
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {adrs
              ?.filter((a) =>
                a.title.toLowerCase().includes(searchQuery.toLowerCase()),
              )
              .map((adr) => (
                <button
                  key={adr.id}
                  data-testid={`adr-item-${adr.id}`}
                  onClick={() => {
                    setSelectedAdrId(adr.id);
                    setFlowStep("idle");
                    setLocalStatus(null);
                    setShowFinalADR(false);
                    setShowGovernance(false);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    padding: "1rem",
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor:
                      selectedAdrId === adr.id
                        ? "var(--primary-alpha)"
                        : "transparent",
                    backgroundColor:
                      selectedAdrId === adr.id
                        ? "var(--primary-alpha)"
                        : "transparent",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAdrId !== adr.id)
                      e.currentTarget.style.backgroundColor =
                        "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAdrId !== adr.id)
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-dim)",
                      }}
                    >
                      {adr.id}
                    </span>
                    <StatusBadge
                      status={
                        selectedAdrId === adr.id && localStatus
                          ? localStatus
                          : adr.status
                      }
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color:
                        selectedAdrId === adr.id
                          ? "var(--primary)"
                          : "var(--text-main)",
                      lineHeight: 1.4,
                    }}
                  >
                    {adr.title}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Content Panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {selectedAdr ? (
          <>
            <div
              style={{
                padding: "2rem 3rem",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--primary)",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                    }}
                  >
                    {selectedAdr.id}
                  </span>
                  <span style={{ color: "var(--border)" }}>•</span>
                  <span
                    style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}
                  >
                    Created: {selectedAdr.date}
                  </span>
                </div>
                <h2
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    color: "var(--text-main)",
                    margin: 0,
                  }}
                >
                  {selectedAdr.title}
                </h2>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                {flowStep === "idle" && selectedAdr.status === "Proposed" && (
                  <button
                    className="glow-box"
                    onClick={startAnalysis}
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "10px",
                      backgroundColor: "var(--primary)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    <Zap size={16} />
                    Run Epistemic Analysis
                  </button>
                )}

                {flowStep === "reviewing" && (
                  <button
                    className="glow-box"
                    onClick={approveDecision}
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "10px",
                      backgroundColor: "var(--success)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    Approve Decision
                  </button>
                )}

                {(flowStep === "completed" ||
                  selectedAdr.status === "Accepted") && (
                  <div
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "10px",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid var(--success)",
                      color: "var(--success)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                    }}
                  >
                    <Check size={16} />
                    Finalized
                  </div>
                )}

                <button
                  className="glass"
                  style={{
                    padding: "0.75rem 1.25rem",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  <History size={16} />
                  History
                </button>

                <button
                  className="glass"
                  onClick={() => setShowGovernance(!showGovernance)}
                  style={{
                    padding: "0.75rem 1.25rem",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    backgroundColor: showGovernance
                      ? "var(--primary-alpha)"
                      : "transparent",
                    color: showGovernance
                      ? "var(--primary)"
                      : "var(--text-main)",
                    border: showGovernance
                      ? "1px solid var(--primary)"
                      : "1px solid var(--border)",
                  }}
                >
                  <ShieldCheck size={16} />
                  {showGovernance ? "View ADR" : "Governance"}
                </button>

                <button
                  className="glass"
                  onClick={() => {
                    setShowFinalADR(!showFinalADR);
                    setShowGovernance(false);
                  }}
                  style={{
                    padding: "0.75rem 1.25rem",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    backgroundColor: showFinalADR
                      ? "var(--primary-alpha)"
                      : "transparent",
                    color: showFinalADR ? "var(--primary)" : "var(--text-main)",
                    border: showFinalADR
                      ? "1px solid var(--primary)"
                      : "1px solid var(--border)",
                  }}
                >
                  <FileText size={16} />
                  Artifact
                </button>

                <button
                  className="glass"
                  onClick={() => setShowExternalApproval(!showExternalApproval)}
                  style={{
                    padding: "0.75rem 1.25rem",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    backgroundColor: showExternalApproval
                      ? "var(--primary-alpha)"
                      : "transparent",
                    color: showExternalApproval
                      ? "var(--primary)"
                      : "var(--text-main)",
                    border: showExternalApproval
                      ? "1px solid var(--primary)"
                      : "1px solid var(--border)",
                  }}
                >
                  <Zap size={16} />
                  {showExternalApproval ? "Close Bridge" : "External Approval"}
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
              <div
                style={{
                  maxWidth: showGovernance ? "1400px" : "800px",
                  margin: "0 auto",
                  height: "100%",
                }}
              >
                <AnimatePresence mode="wait">
                  {showGovernance ? (
                    <motion.div
                      key="governance"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 400px",
                        gap: "2rem",
                        height: "calc(100vh - 250px)",
                      }}
                    >
                      <ReadinessPanel workspaceId={selectedAdr.id} />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "1.5rem",
                          overflowY: "auto",
                        }}
                      >
                        <ApprovalPanel missionId={selectedAdr.id} minimal />
                        <ArtifactPatchPanel
                          missionId={selectedAdr.id}
                          artifactId={selectedAdr.id}
                          minimal
                        />
                        <GovernancePanel workspaceId={selectedAdr.id} minimal />
                      </div>
                    </motion.div>
                  ) : showFinalADR ? (
                    <motion.div
                      key="final-adr"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      style={{
                        height: "calc(100vh - 250px)",
                      }}
                    >
                      <FinalADRPanel workspaceId={selectedAdr.id} />
                    </motion.div>
                  ) : showExternalApproval ? (
                    <motion.div
                      key="external-approval"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      style={{
                        height: "calc(100vh - 250px)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem",
                      }}
                    >
                      <div
                        className="premium-card"
                        style={{ padding: "1.5rem", flex: 1 }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "1rem",
                          }}
                        >
                          <ShieldCheck size={20} color="var(--primary)" />
                          <h3 style={{ margin: 0, fontSize: "1rem" }}>
                            Secure MCP Bridge: Approval App
                          </h3>
                        </div>
                        <SecureMcpIframe
                          appUrl="/approval-app.html"
                          allowedOrigin={window.location.origin}
                          onCommand={async (method, payload: unknown) => {
                            console.log(
                              `[Host] Received MCP command: ${method}`,
                              payload,
                            );

                            if (method === "cast_vote") {
                              const res = await fetch(
                                `${API_BASE_URL}/governance/votes`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    "x-user-id":
                                      currentUser?.id || "observer-1",
                                  },
                                  body: JSON.stringify({
                                    nodeId: selectedAdr.id,
                                    actorId: currentUser?.id || "observer-1",
                                    decision: (payload as { decision: string })
                                      .decision,
                                    rationale: (
                                      payload as { rationale: string }
                                    ).rationale,
                                  }),
                                },
                              );

                              if (!res.ok) throw new Error("API_REJECTION");

                              // Trigger UI update if needed
                              if (
                                (payload as { decision?: string }).decision ===
                                "approve"
                              ) {
                                setLocalStatus("Accepted");
                              }

                              return { success: true };
                            }

                            throw new Error("METHOD_NOT_SUPPORTED");
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-dim)",
                          textAlign: "center",
                          opacity: 0.5,
                        }}
                      >
                        PROTOCOL: MCP v1.0 // SECURITY: SANDBOXED_IFRAME //
                        ORIGIN: {window.location.origin}
                      </div>
                    </motion.div>
                  ) : flowStep === "analyzing" ? (
                    <motion.div
                      key="analyzing"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      style={{
                        height: "400px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "2rem",
                        textAlign: "center",
                      }}
                    >
                      <Loader2
                        className="animate-spin"
                        size={64}
                        color="var(--primary)"
                      />
                      <div>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                          Analyzing Architectural Impact
                        </h3>
                        <p style={{ color: "var(--text-dim)" }}>
                          Running epistemic simulations across domain
                          boundaries...
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Section title="Status Context">
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "2rem",
                          }}
                        >
                          <InfoItem
                            label="Current Status"
                            value={
                              <StatusBadge
                                status={localStatus || selectedAdr.status}
                                large
                              />
                            }
                          />
                          <InfoItem
                            label="Priority"
                            value={
                              <PriorityBadge priority={selectedAdr.priority} />
                            }
                          />
                          <InfoItem label="Owner" value={selectedAdr.author} />
                        </div>
                      </Section>

                      <Section title="Context">
                        <p
                          style={{
                            lineHeight: 1.7,
                            color: "var(--text-dim)",
                            fontSize: "1rem",
                          }}
                        >
                          {selectedAdr.context ||
                            "This decision was triggered by the need to establish a clear architectural boundary for the Epistemic OS project. Previous implementations in ChatAVG showed that tight coupling between domain logic and infrastructure led to significant technical debt and testing challenges."}
                        </p>
                      </Section>

                      <Section title="Decision">
                        <div
                          style={{
                            padding: "1.5rem",
                            borderRadius: "12px",
                            backgroundColor: "rgba(255,255,255,0.02)",
                            border: "1px solid var(--border)",
                            lineHeight: 1.7,
                            color: "var(--text-main)",
                          }}
                        >
                          {selectedAdr.decision ||
                            "We will implement a layered hexagonal architecture where the core domain is completely isolated from external dependencies. All infrastructure concerns will be handled through well-defined ports and adapters."}
                        </div>
                      </Section>

                      {selectedAdr.consequences && (
                        <Section title="Consequences">
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "1rem",
                            }}
                          >
                            {selectedAdr.consequences.positive.map((p, i) => (
                              <Consequence key={i} type="positive" text={p} />
                            ))}
                            {selectedAdr.consequences.negative.map((n, i) => (
                              <Consequence key={i} type="negative" text={n} />
                            ))}
                          </div>
                        </Section>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-dim)",
            }}
          >
            Select an ADR to view details
          </div>
        )}
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div style={{ marginBottom: "3rem" }}>
    <h3
      style={{
        fontSize: "0.75rem",
        color: "var(--primary)",
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        fontWeight: 700,
        marginBottom: "1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      {title}
      <div
        style={{
          flex: 1,
          height: "1px",
          backgroundColor: "var(--border)",
          opacity: 0.3,
        }}
      />
    </h3>
    {children}
  </div>
);

const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div>
    <label
      style={{
        display: "block",
        fontSize: "0.7rem",
        color: "var(--text-dim)",
        marginBottom: "0.5rem",
        fontWeight: 600,
      }}
    >
      {label}
    </label>
    <div
      style={{
        color: "var(--text-main)",
        fontSize: "0.95rem",
        fontWeight: 500,
      }}
    >
      {value}
    </div>
  </div>
);

const StatusBadge: React.FC<{ status: ADR["status"]; large?: boolean }> = ({
  status,
  large,
}) => {
  const colors = {
    Proposed: "var(--warning)",
    Accepted: "var(--success)",
    Superseded: "var(--primary)",
    Rejected: "var(--error)",
    Deprecated: "var(--text-dim)",
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: large ? "6px 12px" : "2px 8px",
        borderRadius: "6px",
        backgroundColor: `${colors[status]}15`,
        border: `1px solid ${colors[status]}33`,
        fontSize: large ? "0.85rem" : "0.65rem",
        fontWeight: 700,
        color: colors[status],
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
      {status.toUpperCase()}
    </div>
  );
};

const PriorityBadge: React.FC<{ priority: ADR["priority"] }> = ({
  priority,
}) => (
  <div
    style={{
      display: "inline-flex",
      padding: "2px 8px",
      borderRadius: "6px",
      backgroundColor:
        priority === "P0"
          ? "rgba(239, 68, 68, 0.1)"
          : "rgba(255, 255, 255, 0.05)",
      border: `1px solid ${priority === "P0" ? "rgba(239, 68, 68, 0.2)" : "var(--border)"}`,
      fontSize: "0.75rem",
      fontWeight: 600,
      color: priority === "P0" ? "var(--error)" : "var(--text-dim)",
    }}
  >
    {priority}
  </div>
);

const Consequence: React.FC<{
  type: "positive" | "negative";
  text: string;
}> = ({ type, text }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "0.75rem",
      padding: "1rem",
      borderRadius: "10px",
      backgroundColor:
        type === "positive"
          ? "rgba(16, 185, 129, 0.03)"
          : "rgba(239, 68, 68, 0.03)",
      border: `1px solid ${type === "positive" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)"}`,
    }}
  >
    <div style={{ marginTop: "2px" }}>
      {type === "positive" ? (
        <CheckCircle2 size={16} color="var(--success)" />
      ) : (
        <AlertCircle size={16} color="var(--error)" />
      )}
    </div>
    <span
      style={{ fontSize: "0.9rem", color: "var(--text-main)", lineHeight: 1.5 }}
    >
      {text}
    </span>
  </div>
);

export default ADRReviewWorkspace;
