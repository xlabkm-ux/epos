import { API_BASE_URL } from "../api-config";
import React, { useState, useEffect } from "react";
import { ShieldCheck, History, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface ReadinessAssessment {
  id: string;
  status: "ready" | "needs_review" | "blocked";
  indicators: {
    evidenceCoverage: "high" | "medium" | "low";
    traceability: "complete" | "partial" | "missing";
    riskHandling: "explicit" | "weak" | "missing";
  };
  numericScore: number;
  explanation: string;
  createdAt: string;
}

interface TraceEvent {
  id: string;
  type: string;
  actorId: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

export const ReadinessPanel: React.FC<{ workspaceId: string }> = ({
  workspaceId,
}) => {
  const [assessment, setAssessment] = useState<ReadinessAssessment | null>(
    null,
  );
  const [trace, setTrace] = useState<TraceEvent[]>([]);
  const [isAssessing, setIsAssessing] = useState(false);

  useEffect(() => {
    fetchReadiness();
    fetchTrace();
  }, [workspaceId]);

  const fetchReadiness = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/governance/readiness?workspaceId=${workspaceId}`,
      );
      if (res.ok) {
        const data = await res.json();
        setAssessment(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTrace = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/governance/trace?workspaceId=${workspaceId}`,
      );
      if (res.ok) {
        const data = await res.json();
        setTrace(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const runAssessment = async () => {
    setIsAssessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/governance/readiness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, profileId: "eng-adr-v0.1" }),
      });
      if (res.ok) {
        const data = await res.json();
        setAssessment(data);
        fetchTrace();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAssessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "var(--success)";
      case "blocked":
        return "var(--error)";
      default:
        return "var(--warning)";
    }
  };

  const getIndicatorColor = (val: string) => {
    if (["high", "complete", "explicit"].includes(val)) return "var(--success)";
    if (["medium", "partial", "weak"].includes(val)) return "var(--warning)";
    return "var(--error)";
  };

  return (
    <div
      className="premium-card animate-slide-in"
      style={{ padding: "1.5rem", height: "100%", overflowY: "auto" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <ShieldCheck size={20} color="var(--primary)" />
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "var(--text-main)",
            }}
          >
            Readiness Assessment
          </h2>
        </div>
        <button
          onClick={runAssessment}
          disabled={isAssessing}
          style={{
            padding: "6px 12px",
            fontSize: "0.75rem",
            backgroundColor: "var(--primary-alpha)",
            border: "1px solid var(--primary)",
            color: "var(--primary)",
            borderRadius: "6px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {isAssessing ? "Assessing..." : "Refresh"}
        </button>
      </div>

      {!assessment ? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "var(--text-dim)",
            fontSize: "0.9rem",
          }}
        >
          <AlertTriangle
            size={32}
            style={{ marginBottom: "1rem", opacity: 0.5 }}
          />
          <p>No readiness assessment found for this workspace.</p>
          <button
            onClick={runAssessment}
            className="button-primary"
            style={{ marginTop: "1rem" }}
          >
            Run Initial Assessment
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginBottom: "2rem" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "1.25rem",
              backgroundColor: "rgba(255,255,255,0.03)",
              borderRadius: "var(--radius-lg)",
              border: `1px solid ${getStatusColor(assessment.status)}33`,
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: `${getStatusColor(assessment.status)}22`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${getStatusColor(assessment.status)}`,
              }}
            >
              <ShieldCheck
                size={24}
                color={getStatusColor(assessment.status)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Maturity Status
              </div>
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: getStatusColor(assessment.status),
                }}
              >
                {assessment.status.replace("_", " ").toUpperCase()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                }}
              >
                {assessment.numericScore}%
              </div>
              <div
                style={{
                  fontSize: "0.55rem",
                  color: "var(--text-dim)",
                  textTransform: "uppercase",
                }}
              >
                Experimental Score
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            {Object.entries(assessment.indicators).map(([key, val]) => (
              <div
                key={key}
                style={{
                  padding: "1rem",
                  backgroundColor: "var(--bg-dark)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.6rem",
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                    fontWeight: 700,
                  }}
                >
                  {key.replace(/([A-Z])/g, " $1")}
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: getIndicatorColor(val),
                  }}
                >
                  {val.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: "1rem",
              backgroundColor: "rgba(0,0,0,0.2)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
              lineHeight: 1.5,
              color: "var(--text-main)",
              borderLeft: `4px solid ${getStatusColor(assessment.status)}`,
            }}
          >
            {assessment.explanation}
          </div>
        </motion.div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <h3
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--text-main)",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <History size={16} color="var(--primary)" /> Trace Timeline
        </h3>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {trace.length === 0 && (
            <p style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
              Waiting for governance events...
            </p>
          )}
          {trace.map((event, i) => (
            <div key={event.id} style={{ display: "flex", gap: "1.25rem" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor:
                      i === trace.length - 1
                        ? "var(--primary)"
                        : "var(--border)",
                    border: `2px solid ${i === trace.length - 1 ? "var(--primary-alpha)" : "transparent"}`,
                    zIndex: 2,
                  }}
                />
                {i < trace.length - 1 && (
                  <div
                    style={{
                      width: "2px",
                      flex: 1,
                      backgroundColor: "var(--border)",
                      opacity: 0.3,
                    }}
                  />
                )}
              </div>
              <div style={{ paddingBottom: "1.5rem", flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "var(--text-main)",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{event.type.replace(/_/g, " ").toUpperCase()}</span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 400,
                      color: "var(--text-dim)",
                    }}
                  >
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-dim)",
                    marginTop: "2px",
                  }}
                >
                  Actor: {event.actorId}
                </div>
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div
                    style={{
                      fontSize: "0.7rem",
                      padding: "4px 8px",
                      backgroundColor: "rgba(255,255,255,0.02)",
                      borderRadius: "4px",
                      marginTop: "6px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {JSON.stringify(event.metadata)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
