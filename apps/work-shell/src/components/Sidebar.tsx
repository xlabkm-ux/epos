import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Layout,
  Database,
  Activity,
  Settings,
  Plus,
  Terminal,
  Zap,
  FileText,
  Copy,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { useSecurity } from "../context/SecurityContext";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Workspace } from "@epios/api";
import { API_BASE_URL } from "../api-config";

// Refactored Components
import { Modal } from "./Modal";
import { SidebarItem } from "./SidebarItem";
import SettingsModal from "./SettingsModal";

const Sidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [shareModalWs, setShareModalWs] = useState<Workspace | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const {
    workspaces,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    activeView,
    setActiveView,
    refreshWorkspaces,
  } = useWorkspace();

  const { currentUser } = useSecurity();

  // Theme Logic
  const [theme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Resize Logic
  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth > 180 && newWidth < 600) {
          setSidebarWidth(newWidth);
          if (isCollapsed) setIsCollapsed(false);
        }
      }
    },
    [isResizing, isCollapsed],
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const handleAction = async (ws: Workspace, action: string) => {
    if (action === "share") {
      setShareModalWs(ws);
    } else if (action === "archive") {
      const archivedAt = new Date();
      const archiveComment =
        i18n.language === "ru"
          ? "Архивировано пользователем"
          : "Archived by user";

      // Persist to DB
      await fetch(`${API_BASE_URL}/workspaces/${ws.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "archived",
          archivedAt,
          archiveComment,
          isPinned: false, // Unpin when archiving
        }),
      });

      refreshWorkspaces();
    } else if (action === "restore") {
      await fetch(`${API_BASE_URL}/workspaces/${ws.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "running" }),
      });
      refreshWorkspaces();
    } else if (action === "pin") {
      const isCurrentlyPinned = !!ws.isPinned;
      await fetch(`${API_BASE_URL}/workspaces/${ws.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !isCurrentlyPinned }),
      });
      refreshWorkspaces();
    } else if (action === "rename") {
      const newTitle = prompt("Enter new title:", ws.title);
      if (newTitle && newTitle !== ws.title) {
        await fetch(`${API_BASE_URL}/workspaces/${ws.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });
        refreshWorkspaces();
      }
    } else {
      alert(`Action: ${action} for ${ws.title}`);
    }
  };

  return (
    <>
      <motion.div
        ref={sidebarRef}
        initial={false}
        animate={{ width: isCollapsed ? 80 : sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          height: "100vh",
          backgroundColor: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: isCollapsed ? "2rem 0.75rem" : "2rem 1.25rem",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Resize Handle */}
        {!isCollapsed && (
          <div
            onMouseDown={startResizing}
            style={{
              position: "absolute",
              right: -3,
              top: 0,
              bottom: 0,
              width: "6px",
              cursor: "col-resize",
              zIndex: 1000,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(100, 108, 255, 0.3)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          />
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "3rem",
            padding: isCollapsed ? "0" : "0 0.5rem",
            justifyContent: isCollapsed ? "center" : "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "36px",
                minWidth: "36px",
                height: "36px",
                backgroundColor: "var(--primary)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "var(--panel-shadow)",
              }}
            >
              <Terminal size={22} strokeWidth={2.5} />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    color: "var(--text-main)",
                    whiteSpace: "nowrap",
                  }}
                >
                  EpiOS
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "3px",
              padding: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              opacity: 0.6,
              transition: "opacity 0.2s",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  backgroundColor: "var(--text-dim)",
                }}
              />
            ))}
          </button>
        </div>

        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            overflowY: "auto",
            paddingRight: isCollapsed ? "0" : "4px",
          }}
          className="sidebar-nav"
        >
          <SidebarItem
            icon={<Layout size={18} />}
            label={t("sidebar.workplace")}
            active={activeView === "ROOM"}
            isCollapsed={isCollapsed}
            onClick={() => setActiveView("ROOM")}
          />
          <SidebarItem
            icon={<FileText size={18} />}
            label={t("sidebar.adr_review")}
            active={activeView === "ADR"}
            isCollapsed={isCollapsed}
            onClick={() => setActiveView("ADR")}
          />
          <SidebarItem
            icon={<Database size={18} />}
            label={`${t("sidebar.archive")} (${workspaces.filter((ws) => ws.status === "archived").length})`}
            active={activeView === "ARCHIVE"}
            isCollapsed={isCollapsed}
            onClick={() => setActiveView("ARCHIVE")}
          />
          <SidebarItem
            icon={<Activity size={18} />}
            label={t("sidebar.telemetry")}
            isCollapsed={isCollapsed}
            onClick={() =>
              alert("Real-time workspace metrics synchronization...")
            }
          />

          {/* ── Workspaces List (Pinned first, no headers) ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              marginTop: isCollapsed ? "0" : "1rem",
            }}
          >
            {workspaces
              .filter((ws) => ws.status !== "archived")
              .sort((a, b) => {
                // Pin logic: pinned first
                if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
                // Then by update date
                return (
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
                );
              })
              .map((ws) => (
                <SidebarItem
                  key={ws.id}
                  active={selectedWorkspaceId === ws.id}
                  isCollapsed={isCollapsed}
                  isPinned={!!ws.isPinned}
                  onClick={() => {
                    setSelectedWorkspaceId(ws.id);
                    setActiveView("ROOM"); // Switch back to ROOM when selecting a WS
                  }}
                  onAction={(action) => handleAction(ws, action)}
                  isWorkspace
                  status={ws.status}
                  icon={<WsDot active={selectedWorkspaceId === ws.id} />}
                  label={ws.title}
                />
              ))}
          </div>

          <SidebarItem
            icon={<Plus size={18} />}
            label={t("sidebar.new_workspace")}
            isAction
            isCollapsed={isCollapsed}
            onClick={() =>
              alert("Initializing Neural Core for new workspace...")
            }
          />
        </nav>

        <div
          style={{
            marginTop: "auto",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {/* User Status Line (Position > RM > Role) */}
          {!isCollapsed && currentUser && (
            <div
              style={{
                padding: "0.85rem 1rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "16px",
                marginBottom: "0.75rem",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#9ece6a",
                  }}
                />
                {currentUser.username}
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "var(--text-dim)",
                  marginTop: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {currentUser.username.toLowerCase().includes("admin")
                  ? "Администратор"
                  : "Ведущий архитектор"}
              </div>

              <div
                style={{
                  margin: "8px 0",
                  height: "1px",
                  background: "rgba(255,255,255,0.05)",
                }}
              />

              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--primary)",
                  fontWeight: 600,
                }}
              >
                {workspaces.find((ws) => ws.id === selectedWorkspaceId)
                  ?.title || "Demo Workspace"}
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "var(--text-dim)",
                  opacity: 0.8,
                }}
              >
                {currentUser.role === "approver" ? "Владелец РМ" : "Рецензент"}
              </div>
            </div>
          )}

          <SidebarItem
            icon={<Settings size={18} />}
            label={t("sidebar.settings")}
            isCollapsed={isCollapsed}
            onClick={() => setShowSettings(true)}
          />
        </div>
      </motion.div>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalWs && (
          <Modal
            onClose={() => setShareModalWs(null)}
            title={t("share_modal.title")}
          >
            <div
              style={{
                backgroundColor: "var(--surface-active)",
                borderRadius: "15px",
                padding: "0.5rem 0.5rem 0.5rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "2rem",
                border: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: "0.9rem",
                  color: "var(--text-dim)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                gemini.google.com/share/{shareModalWs.id.substring(0, 8)}...
              </span>
              <button
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--text-inverse)",
                  border: "none",
                  borderRadius: "30px",
                  padding: "0.6rem 1.25rem",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <Copy size={16} />
                {t("share_modal.copy")}
              </button>
            </div>
            <div
              style={{ display: "flex", gap: "12px", color: "var(--text-dim)" }}
            >
              <Activity
                size={16}
                style={{ marginTop: "3px", minWidth: "16px" }}
              />
              <p style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
                {t("share_modal.warning")}
              </p>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

// ── Helper components ───────────────────────────────────────────────────────

const WsDot: React.FC<{ active: boolean }> = ({ active }) =>
  active ? (
    <Zap
      size={14}
      fill="var(--primary)"
      style={{
        filter: "drop-shadow(0 0 5px var(--primary))",
        color: "var(--primary)",
      }}
    />
  ) : (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: "var(--text-dim)",
        opacity: 0.6,
      }}
    />
  );

export default Sidebar;
