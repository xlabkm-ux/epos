import React, { useState } from "react";
import { useSecurity } from "../context/SecurityContext";
import {
  Shield,
  Eye,
  Edit3,
  CheckCircle,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useTranslation } from "react-i18next";

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

export const RoleSwitcher: React.FC<{
  isCollapsed?: boolean;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
}> = ({ isCollapsed, onOpenSettings, onOpenHelp }) => {
  const { currentUser, setCurrentUserId, logout } = useSecurity();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (isCollapsed) {
    const activeRole = roles.find((r) => currentUser?.id === r.id) || roles[0];
    const Icon = activeRole.icon;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "0.5rem",
          cursor: "pointer",
        }}
        title={`Active Persona: ${activeRole.label}`}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: `${activeRole.color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: activeRole.color,
            border: `1px solid ${activeRole.color}40`,
          }}
        >
          <Icon size={16} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "0.75rem",
        borderRadius: "12px",
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div
        style={{
          fontSize: "0.65rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--text-dim)",
          marginBottom: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          paddingLeft: "0.25rem",
        }}
      >
        <Shield size={10} />
        Identity Context
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
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
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                border: "1px solid",
                borderColor: isActive ? `${r.color}50` : "transparent",
                backgroundColor: isActive ? `${r.color}15` : "transparent",
                color: isActive ? r.color : "var(--text-dim)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left",
                width: "100%",
              }}
            >
              <Icon size={14} />
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {r.label}
                </div>
                <div style={{ fontSize: "0.6rem", opacity: 0.6 }}>{r.role}</div>
              </div>
              {isActive && (
                <div
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: r.color,
                    boxShadow: `0 0 8px ${r.color}`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {currentUser && (
        <div style={{ position: "relative", marginTop: "0.75rem" }}>
          {/* Backdrop for closing dropdown */}
          {menuOpen && (
            <div
              onClick={() => setMenuOpen(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
                backgroundColor: "transparent",
                cursor: "default",
              }}
            />
          )}

          {/* User Dropdown Menu */}
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                bottom: "100%",
                left: 0,
                right: 0,
                marginBottom: "8px",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "6px",
                boxShadow: "var(--modal-shadow)",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                zIndex: 1000,
                backdropFilter: "blur(20px)",
              }}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSettings?.();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "var(--text-main)",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  transition: "background 0.2s",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Settings size={14} />
                {t("user_menu.settings")}
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onOpenHelp?.();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "var(--text-main)",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  transition: "background 0.2s",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--surface-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <HelpCircle size={14} />
                {t("user_menu.help")}
              </button>

              <div
                style={{
                  height: "1px",
                  backgroundColor: "var(--border)",
                  margin: "4px 0",
                }}
              />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "transparent",
                  color: "var(--error)",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  transition: "background 0.2s",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "rgba(239, 68, 68, 0.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <LogOut size={14} />
                {t("user_menu.exit")}
              </button>
            </div>
          )}

          {/* Clickable Username Pill */}
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "6px",
              backgroundColor: menuOpen
                ? "var(--surface-active)"
                : "rgba(255,255,255,0.03)",
              fontSize: "0.65rem",
              color: "var(--text-dim)",
              border: "1px solid rgba(255,255,255,0.05)",
              cursor: "pointer",
              userSelect: "none",
              transition: "all 0.2s ease",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onMouseEnter={(e) => {
              if (!menuOpen)
                e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.07)";
            }}
            onMouseLeave={(e) => {
              if (!menuOpen)
                e.currentTarget.style.backgroundColor =
                  "rgba(255,255,255,0.03)";
            }}
          >
            <span>
              Session: <strong>{currentUser.username}</strong>
            </span>
            <span
              style={{
                opacity: 0.5,
                fontSize: "0.65rem",
                transition: "transform 0.2s",
              }}
            >
              {menuOpen ? "▲" : "▼"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
