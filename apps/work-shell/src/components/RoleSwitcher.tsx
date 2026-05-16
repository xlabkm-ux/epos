import React from "react";
import { useSecurity } from "../context/SecurityContext";
import { Shield, Eye, Edit3, CheckCircle } from "lucide-react";

const roles = [
  {
    id: "viewer-1",
    label: "Viewer",
    role: "viewer",
    icon: Eye,
    color: "#94a3b8",
  },
  {
    id: "contributor-1",
    label: "Contributor",
    role: "contributor",
    icon: Edit3,
    color: "#38bdf8",
  },
  {
    id: "approver-1",
    label: "Approver",
    role: "approver",
    icon: CheckCircle,
    color: "#4ade80",
  },
  {
    id: "admin-1",
    label: "Admin (Approver)",
    role: "approver",
    icon: Shield,
    color: "#f472b6",
  },
];

export const RoleSwitcher: React.FC = () => {
  const { currentUser, setCurrentUserId } = useSecurity();

  return (
    <div
      style={{
        padding: "1rem",
        borderTop: "1px solid var(--border)",
        backgroundColor: "rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-dim)",
          marginBottom: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <Shield size={12} />
        Active Persona
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {roles.map((r) => {
          const isActive = currentUser?.id === r.id;
          const Icon = r.icon;

          return (
            <button
              key={r.id}
              onClick={() => setCurrentUserId(r.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.6rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: isActive ? r.color : "transparent",
                backgroundColor: isActive ? `${r.color}15` : "transparent",
                color: isActive ? r.color : "var(--text-dim)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left",
              }}
            >
              <Icon size={14} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                  {r.label}
                </div>
                <div style={{ fontSize: "0.6rem", opacity: 0.6 }}>{r.role}</div>
              </div>
              {isActive && (
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: r.color,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {currentUser && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.75rem",
            borderRadius: "8px",
            backgroundColor: "rgba(255,255,255,0.03)",
            fontSize: "0.7rem",
            color: "var(--text-dim)",
          }}
        >
          Logged in as <strong>{currentUser.username}</strong>
        </div>
      )}
    </div>
  );
};
