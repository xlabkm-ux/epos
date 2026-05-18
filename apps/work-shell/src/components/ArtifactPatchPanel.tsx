import { API_BASE_URL } from "../api-config";
import React, { useState, useEffect } from "react";
import {
  GitPullRequest,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSecurity } from "../context/SecurityContext";

interface ArtifactPatch {
  id: string;
  artifactId: string;
  missionId: string;
  reason: string;
  diff: string;
  riskClass: "low" | "medium" | "high" | "critical";
  status: "proposed" | "accepted" | "rejected" | "applied";
  createdAt: string;
}

export const ArtifactPatchPanel: React.FC<{
  missionId: string;
  artifactId?: string;
  minimal?: boolean;
}> = ({ missionId, artifactId, minimal = false }) => {
  const [patches, setPatches] = useState<ArtifactPatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useSecurity();

  const isAdmin = currentUser?.role === "approver";

  useEffect(() => {
    fetchPatches();
  }, [missionId, artifactId]);

  const fetchPatches = async () => {
    setIsLoading(true);
    try {
      const url = new URL(`${API_BASE_URL}/governance/artifact-patches`);
      if (artifactId) url.searchParams.append("artifactId", artifactId);
      if (missionId) url.searchParams.append("missionId", missionId);

      const res = await fetch(url.toString(), {
        headers: {
          "x-user-id": currentUser?.id || "observer-1",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPatches(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const applyPatch = async (patchId: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/governance/artifact-patches/${patchId}/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser?.id || "observer-1",
          },
          body: JSON.stringify({
            actor: { id: currentUser?.id, type: "user" },
          }),
        },
      );
      if (res.ok) {
        setPatches(
          patches.map((p) =>
            p.id === patchId ? { ...p, status: "applied" } : p,
          ),
        );
      } else {
        const err = await res.json();
        alert(`Failed to apply patch: ${err.error || "Unknown error"}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "var(--error)";
      case "high":
        return "var(--warning)";
      case "medium":
        return "var(--primary)";
      default:
        return "var(--success)";
    }
  };

  const content = (
    <div style={{ padding: minimal ? "0" : "1.25rem", width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.25rem",
        }}
      >
        <GitPullRequest size={20} color="var(--primary)" />
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--text-main)",
          }}
        >
          Artifact Patches
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <AnimatePresence>
          {patches.length === 0 && !isLoading && (
            <p
              style={{
                color: "var(--text-dim)",
                fontStyle: "italic",
                fontSize: "0.8rem",
                textAlign: "center",
                padding: "1rem",
              }}
            >
              No artifact patches found.
            </p>
          )}
          {patches.map((patch) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={patch.id}
              style={{
                padding: "1rem",
                backgroundColor: "rgba(255,255,255,0.02)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: `${getRiskColor(patch.riskClass)}22`,
                        color: getRiskColor(patch.riskClass),
                        textTransform: "uppercase",
                      }}
                    >
                      {patch.riskClass} Risk
                    </span>
                    <span
                      style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}
                    >
                      #{patch.id.slice(0, 8)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-main)",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    {patch.reason}
                  </p>
                  <pre
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-dim)",
                      backgroundColor: "rgba(0,0,0,0.2)",
                      padding: "8px",
                      borderRadius: "4px",
                      maxHeight: "100px",
                      overflowY: "auto",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {patch.diff}
                  </pre>
                </div>
                <div style={{ marginLeft: "10px" }}>
                  {patch.status === "proposed" && (
                    <Clock size={16} color="var(--warning)" />
                  )}
                  {patch.status === "accepted" && (
                    <CheckCircle size={16} color="var(--success)" />
                  )}
                  {patch.status === "applied" && (
                    <Zap size={16} color="var(--primary)" />
                  )}
                  {patch.status === "rejected" && (
                    <XCircle size={16} color="var(--error)" />
                  )}
                </div>
              </div>

              {patch.status === "accepted" && isAdmin && (
                <button
                  onClick={() => applyPatch(patch.id)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "var(--primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Send size={14} /> Apply Patch to Artifact
                </button>
              )}

              {patch.status === "proposed" && patch.riskClass !== "low" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.7rem",
                    color: "var(--warning)",
                    backgroundColor: "rgba(255, 152, 0, 0.05)",
                    padding: "6px",
                    borderRadius: "4px",
                  }}
                >
                  <AlertTriangle size={12} />
                  Requires explicit approval due to risk level.
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  if (minimal) return content;
  return <div className="premium-card">{content}</div>;
};
