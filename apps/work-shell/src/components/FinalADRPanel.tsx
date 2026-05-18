import { API_BASE_URL } from "../api-config";
import React, { useState, useEffect } from "react";
import { FileText, Copy, Download, History } from "lucide-react";
import { motion } from "framer-motion";

interface FinalADROutput {
  markdown: string;
  readinessStatus: string;
  traceEventCount: number;
}

interface TraceSummaryStage {
  stage: string;
  status: "completed" | "pending" | "skipped";
  eventCount: number;
  lastTimestamp?: string;
}

interface TraceSummary {
  workspaceId: string;
  totalEvents: number;
  stages: TraceSummaryStage[];
  chain: string;
}

export const FinalADRPanel: React.FC<{ workspaceId: string }> = ({
  workspaceId,
}) => {
  const [adr, setAdr] = useState<FinalADROutput | null>(null);
  const [summary, setSummary] = useState<TraceSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [workspaceId]);

  const fetchSummary = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/governance/trace-summary?workspaceId=${workspaceId}`,
      );
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const generateADR = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/governance/generate-adr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdr(data);
        fetchSummary();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (adr?.markdown) {
      navigator.clipboard.writeText(adr.markdown);
      alert("ADR Markdown copied to clipboard!");
    }
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
          <FileText size={20} color="var(--primary)" />
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "var(--text-main)",
            }}
          >
            Final ADR Artifact
          </h2>
        </div>
        <button
          onClick={generateADR}
          disabled={isGenerating}
          className="button-primary"
          style={{ fontSize: "0.75rem", padding: "6px 12px" }}
        >
          {isGenerating ? "Generating..." : adr ? "Regenerate" : "Generate ADR"}
        </button>
      </div>

      {!adr ? (
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            color: "var(--text-dim)",
          }}
        >
          <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
            The final ADR can be generated once the review loop is complete.
          </p>
          {summary && (
            <div style={{ textAlign: "left", marginTop: "1rem" }}>
              <h4
                style={{
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  marginBottom: "0.5rem",
                }}
              >
                Review Progress
              </h4>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--primary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {summary.chain}
              </div>
            </div>
          )}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <button
              onClick={copyToClipboard}
              className="button-secondary"
              style={{
                flex: 1,
                fontSize: "0.7rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <Copy size={12} /> Copy Markdown
            </button>
            <button
              className="button-secondary"
              style={{
                flex: 1,
                fontSize: "0.7rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <Download size={12} /> Download .md
            </button>
          </div>

          <pre
            style={{
              backgroundColor: "rgba(0,0,0,0.3)",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              fontSize: "0.75rem",
              color: "var(--text-main)",
              whiteSpace: "pre-wrap",
              fontFamily: "var(--font-mono)",
              border: "1px solid var(--border)",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {adr.markdown}
          </pre>

          <div style={{ marginTop: "1.5rem" }}>
            <h3
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--text-dim)",
                textTransform: "uppercase",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <History size={14} /> Trace Summary
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {summary?.stages.map((stage, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem",
                    backgroundColor: "rgba(255,255,255,0.02)",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor:
                          stage.status === "completed"
                            ? "var(--success)"
                            : "var(--border)",
                      }}
                    />
                    <span
                      style={{
                        color:
                          stage.status === "completed"
                            ? "var(--text-main)"
                            : "var(--text-dim)",
                      }}
                    >
                      {stage.stage}
                    </span>
                  </div>
                  <div
                    style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}
                  >
                    {stage.eventCount} events
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
