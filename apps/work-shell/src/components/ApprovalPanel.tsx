import { API_BASE_URL } from "../api-config";
import React, { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle, XCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSecurity } from "../context/SecurityContext";

interface ApprovalRequest {
  id: string;
  subjectType: string;
  subjectRef: string;
  preview: {
    title: string;
    summary: string;
    whatWillHappen: string[];
  };
  riskClass: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "rejected" | "expired" | "cancelled";
  createdAt: string;
}

export const ApprovalPanel: React.FC<{
  missionId: string;
  minimal?: boolean;
}> = ({ missionId, minimal = false }) => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useSecurity();

  const canResolve = currentUser?.role === "approver";

  useEffect(() => {
    fetchApprovals();
  }, [missionId]);

  const fetchApprovals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/governance/approvals?missionId=${missionId}&onlyPending=true`,
        {
          headers: {
            "x-user-id": currentUser?.id || "observer-1",
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setApprovals(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveApproval = async (
    approvalId: string,
    decision: "approved" | "rejected",
  ) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/governance/approvals/${approvalId}/resolve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": currentUser?.id || "observer-1",
          },
          body: JSON.stringify({
            decision,
            rationale: "Resolved via Approval Panel",
            actor: { id: currentUser?.id, type: "user" },
          }),
        },
      );
      if (res.ok) {
        setApprovals(approvals.filter((a) => a.id !== approvalId));
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
        <ShieldCheck size={20} color="var(--primary)" />
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--text-main)",
          }}
        >
          Pending Approvals
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <AnimatePresence>
          {approvals.length === 0 && !isLoading && (
            <p
              style={{
                color: "var(--text-dim)",
                fontStyle: "italic",
                fontSize: "0.8rem",
                textAlign: "center",
                padding: "1rem",
              }}
            >
              No pending approvals.
            </p>
          )}
          {approvals.map((req) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={req.id}
              style={{
                padding: "1rem",
                backgroundColor: "rgba(255,255,255,0.02)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      backgroundColor: `${getRiskColor(req.riskClass)}22`,
                      color: getRiskColor(req.riskClass),
                      textTransform: "uppercase",
                    }}
                  >
                    {req.riskClass} Risk
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--text-dim)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {req.subjectType}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "var(--text-main)",
                    marginBottom: "4px",
                  }}
                >
                  {req.preview.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-dim)",
                    lineHeight: 1.4,
                  }}
                >
                  {req.preview.summary}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: "rgba(0,0,0,0.15)",
                  padding: "0.75rem",
                  borderRadius: "8px",
                }}
              >
                <h4
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Info size={10} /> Impact Analysis
                </h4>
                <ul style={{ paddingLeft: "1.2rem", margin: 0 }}>
                  {req.preview.whatWillHappen.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-main)",
                        marginBottom: "2px",
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {canResolve ? (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => resolveApproval(req.id, "approved")}
                    style={{
                      flex: 1,
                      padding: "8px",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      color: "var(--success)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => resolveApproval(req.id, "rejected")}
                    style={{
                      flex: 1,
                      padding: "8px",
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                      color: "var(--error)",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              ) : (
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-dim)",
                    textAlign: "center",
                    padding: "4px",
                  }}
                >
                  Read-only: Approval required by Admin/Reviewer
                </p>
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
