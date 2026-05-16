import React from "react";
import { motion } from "framer-motion";
import { ArchiveRestore, Database } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWorkspace } from "../context/WorkspaceContext";

interface ArchiveViewProps {
  onRestore: (wsId: string) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ onRestore }) => {
  const { t } = useTranslation();
  const { workspaces } = useWorkspace();

  const archivedWorkspaces = workspaces.filter(
    (ws) => ws.status === "archived",
  );

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        flex: 1,
        padding: "2rem 2.5rem",
        overflowY: "auto",
        backgroundColor: "var(--bg-dark)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: "var(--surface-active)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-dim)",
          }}
        >
          <Database size={18} />
        </div>
        <div>
          <h1
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "var(--text-main)",
              letterSpacing: "-0.02em",
            }}
          >
            {t("archive_view.title")}
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
            {archivedWorkspaces.length} {t("archive_view.count")}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {archivedWorkspaces.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            color: "var(--text-muted)",
          }}
        >
          <Database size={48} style={{ opacity: 0.2, marginBottom: "1rem" }} />
          <p style={{ fontSize: "0.95rem" }}>{t("archive_view.empty")}</p>
        </div>
      )}

      {/* Table */}
      {archivedWorkspaces.length > 0 && (
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            borderRadius: 16,
            border: "1px solid var(--border)",
            overflow: "hidden",
            boxShadow: "var(--panel-shadow)",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 160px 1fr 120px",
              padding: "0.75rem 1.25rem",
              borderBottom: "1px solid var(--border)",
              backgroundColor: "var(--surface-hover)",
            }}
          >
            {[
              t("archive_view.col_name"),
              t("archive_view.col_date"),
              t("archive_view.col_comment"),
              "",
            ].map((col, i) => (
              <span
                key={i}
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {col}
              </span>
            ))}
          </div>

          {/* Table rows */}
          {archivedWorkspaces.map((ws, idx) => {
            return (
              <motion.div
                key={ws.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 160px 1fr 120px",
                  padding: "1rem 1.25rem",
                  alignItems: "center",
                  borderBottom:
                    idx < archivedWorkspaces.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {/* Name */}
                <div>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: "var(--text-main)",
                    }}
                  >
                    {ws.title}
                  </span>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    {ws.id.substring(0, 8)}…
                  </div>
                </div>

                {/* Date */}
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-dim)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {ws.archivedAt ? formatDate(ws.archivedAt) : "—"}
                </span>

                {/* Comment */}
                <span
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-dim)",
                    fontStyle: ws.archiveComment ? "normal" : "italic",
                    opacity: ws.archiveComment ? 1 : 0.5,
                    paddingRight: "1rem",
                  }}
                >
                  {ws.archiveComment || t("archive_view.no_comment")}
                </span>

                {/* Action */}
                <button
                  onClick={() => onRestore(ws.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    backgroundColor: "transparent",
                    color: "var(--primary)",
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--primary-alpha)";
                    e.currentTarget.style.borderColor = "var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  <ArchiveRestore size={14} />
                  {t("archive_view.restore")}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
