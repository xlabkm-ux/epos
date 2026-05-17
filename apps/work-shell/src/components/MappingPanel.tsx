import { API_BASE_URL } from "../api-config";
import React, { useState, useEffect, useRef } from "react";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Activity,
  Plus,
  Zap,
  Brain,
  Radio,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MappingRun } from "@epios/domain";

interface SseProgress {
  id?: string;
  status: string;
  progress: number;
  claimsFound: number;
  evidenceFound: number;
  completedAt?: string;
  error?: string;
}

export const MappingPanel: React.FC<{ workspaceId: string }> = ({
  workspaceId,
}) => {
  const [runs, setRuns] = useState<MappingRun[]>([]);
  const [loading, setLoading] = useState(false);
  // SSE state for the currently active run
  const [sseRunId, setSseRunId] = useState<string | null>(null);
  const [sseProgress, setSseProgress] = useState<SseProgress | null>(null);
  const [sseConnected, setSseConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchRuns = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/workspaces/${workspaceId}/mapping/runs`,
      );
      if (response.ok) {
        const data = await response.json();
        setRuns(
          data.sort(
            (a: MappingRun, b: MappingRun) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
      }
    } catch (err) {
      console.error("Failed to fetch mapping runs", err);
    }
  };

  const startMapping = async () => {
    setLoading(true);
    try {
      // POST to /missions/:missionId/mapping/runs (workspaceId doubles as missionId in demo)
      const res = await fetch(
        `${API_BASE_URL}/missions/${workspaceId}/mapping/runs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceIds: [] }),
        },
      );
      if (res.ok) {
        const { runId } = await res.json();
        // Open SSE stream immediately for the new run
        openSseStream(runId);
        await fetchRuns();
      }
    } catch (err) {
      console.error("Failed to start mapping", err);
    } finally {
      setLoading(false);
    }
  };

  const openSseStream = (runId: string) => {
    // Close any existing stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setSseRunId(runId);
    setSseProgress({
      status: "pending",
      progress: 0,
      claimsFound: 0,
      evidenceFound: 0,
    });
    setSseConnected(true);

    const es = new EventSource(
      `${API_BASE_URL}/workspaces/${workspaceId}/mapping/runs/${runId}/stream`,
    );
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data: SseProgress = JSON.parse(event.data);
        setSseProgress(data);

        if (
          data.status === "completed" ||
          data.status === "failed" ||
          data.error
        ) {
          es.close();
          eventSourceRef.current = null;
          setSseConnected(false);
          // Refresh the full list after completion
          setTimeout(fetchRuns, 500);
        }
      } catch (e) {
        console.error("[SSE] parse error:", e);
      }
    };

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
      setSseConnected(false);
      setSseRunId(null);
    };
  };

  // Poll for runs list every 2s (background sync)
  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 2000);
    return () => clearInterval(interval);
  }, [workspaceId]);

  // Auto-open SSE stream if there's an active run and no current stream
  useEffect(() => {
    const activeRun = runs.find(
      (r) => r.status === "running" || r.status === "pending",
    );
    if (activeRun && !sseRunId && !eventSourceRef.current) {
      openSseStream(activeRun.id);
    }
    if (!activeRun && sseRunId) {
      setSseRunId(null);
      setSseConnected(false);
      setSseProgress(null);
    }
  }, [runs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const hasActiveRun = runs.some(
    (r) => r.status === "running" || r.status === "pending",
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3
            style={{ margin: 0, fontSize: "1rem", color: "var(--text-main)" }}
          >
            Epistemic Mapping Runs
          </h3>
          <p
            style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-dim)" }}
          >
            Async source analysis — claims &amp; evidence extracted in
            background.
          </p>
        </div>
        <button
          id="mapping-new-run-btn"
          onClick={startMapping}
          disabled={loading || hasActiveRun}
          className="glow-box"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            background: "var(--primary)",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            opacity: loading || hasActiveRun ? 0.5 : 1,
          }}
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          New Run
        </button>
      </div>

      {/* Live SSE Progress Card */}
      <AnimatePresence>
        {sseRunId && sseProgress && (
          <motion.div
            key="sse-live"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              padding: "1.25rem",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.02) 100%)",
              border: "1px solid rgba(99,102,241,0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {/* Live header */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              {sseConnected ? (
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <Radio size={16} color="var(--primary)" />
                </motion.div>
              ) : (
                <CheckCircle size={16} color="var(--success)" />
              )}
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--primary)",
                }}
              >
                {sseConnected ? "LIVE · SSE Stream" : "Completed"}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-mono)",
                  marginLeft: "auto",
                }}
              >
                {sseRunId.slice(0, 8)}
              </span>
            </div>

            {/* Progress bar */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.4rem",
                }}
              >
                <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                  {sseProgress.status.toUpperCase()}
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "var(--text-main)",
                  }}
                >
                  {sseProgress.progress}%
                </span>
              </div>
              <div
                style={{
                  height: "6px",
                  width: "100%",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  animate={{ width: `${sseProgress.progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    background:
                      sseProgress.status === "completed"
                        ? "var(--success)"
                        : "linear-gradient(90deg, var(--primary), #a78bfa)",
                    boxShadow: "0 0 12px var(--primary)",
                  }}
                />
              </div>
            </div>

            {/* Extracted stats */}
            <div style={{ display: "flex", gap: "2rem" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Brain size={14} color="var(--primary)" />
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--text-main)",
                  }}
                >
                  {sseProgress.claimsFound}
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                  claims
                </span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <FileText size={14} color="var(--success)" />
                <span
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--text-main)",
                  }}
                >
                  {sseProgress.evidenceFound}
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                  evidence refs
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Run history list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {runs.length === 0 && !sseRunId && (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              border: "1px dashed var(--border)",
              borderRadius: "12px",
              color: "var(--text-dim)",
              fontSize: "0.85rem",
            }}
          >
            <Zap size={24} style={{ opacity: 0.3, marginBottom: "0.5rem" }} />
            <div>
              No mapping runs yet. Click <strong>New Run</strong> to start async
              extraction.
            </div>
          </div>
        )}

        {runs.map((run) => (
          <motion.div
            key={run.id}
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              padding: "1rem",
              borderRadius: "12px",
              background:
                run.id === sseRunId
                  ? "rgba(99,102,241,0.04)"
                  : "rgba(255,255,255,0.02)",
              border: `1px solid ${run.id === sseRunId ? "rgba(99,102,241,0.2)" : "var(--border)"}`,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                {run.status === "completed" && (
                  <CheckCircle size={18} color="var(--success)" />
                )}
                {run.status === "failed" && (
                  <AlertCircle size={18} color="var(--error)" />
                )}
                {(run.status === "running" || run.status === "pending") && (
                  <Loader2
                    size={18}
                    className="animate-spin"
                    color="var(--primary)"
                  />
                )}
                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--text-main)",
                    }}
                  >
                    Run {run.id.slice(0, 8)}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                    {new Date(run.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color:
                      run.status === "completed"
                        ? "var(--success)"
                        : run.status === "running"
                          ? "var(--primary)"
                          : "var(--text-dim)",
                  }}
                >
                  {run.status}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--text-main)",
                  }}
                >
                  {run.id === sseRunId && sseProgress
                    ? `${sseProgress.progress}%`
                    : `${run.progress}%`}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1.5rem" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <Activity size={14} color="var(--primary)" />
                <span
                  style={{ fontSize: "0.75rem", color: "var(--text-main)" }}
                >
                  {run.id === sseRunId && sseProgress
                    ? sseProgress.claimsFound
                    : run.claimsFound}{" "}
                  Claims
                </span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                <FileText size={14} color="var(--success)" />
                <span
                  style={{ fontSize: "0.75rem", color: "var(--text-main)" }}
                >
                  {run.id === sseRunId && sseProgress
                    ? sseProgress.evidenceFound
                    : run.evidenceFound}{" "}
                  Evidence
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
