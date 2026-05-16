import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreVertical,
  Share2,
  Pin,
  Edit2,
  Archive,
  RefreshCcw,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isAction?: boolean;
  isCollapsed?: boolean;
  isWorkspace?: boolean;
  isPinned?: boolean;
  status?: string;
  onClick?: () => void;
  onAction?: (action: string) => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active,
  isAction,
  isCollapsed,
  isWorkspace,
  isPinned,
  status,
  onClick,
  onAction,
}) => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <div style={{ position: "relative" }}>
      <motion.button
        whileHover={{
          x: isCollapsed ? 0 : 4,
          backgroundColor: "var(--surface-hover)",
        }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        title={isCollapsed ? label : ""}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "flex-start",
          gap: isCollapsed ? "0" : "0.85rem",
          padding: isCollapsed ? "0.75rem 0" : "0.75rem 1rem",
          borderRadius: "10px",
          width: "100%",
          textAlign: "left",
          color: active
            ? "var(--primary)"
            : isAction
              ? "var(--text-dim)"
              : "var(--text-main)",
          backgroundColor: active ? "var(--primary-alpha)" : "transparent",
          fontSize: "0.9rem",
          fontWeight: active ? 600 : 500,
          transition: "background-color 0.2s, color 0.2s",
          border: "none",
          cursor: "pointer",
        }}
        className="sidebar-item"
      >
        <div
          style={{
            width: isCollapsed ? "100%" : "24px", // Slightly wider to accommodate pin icon comfortably
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {isWorkspace && isPinned && !isCollapsed ? (
            <Pin size={14} style={{ color: "var(--primary)" }} />
          ) : (
            icon
          )}
        </div>
        {!isCollapsed && (
          <span
            style={{
              flex: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              paddingRight: "4px",
            }}
          >
            {label}
          </span>
        )}

        {isWorkspace && !isCollapsed && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className={`workspace-menu-trigger ${showMenu ? "active" : ""}`}
            style={{
              color: "var(--text-dim)",
              width: "16px", // Narrower
              height: "24px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.2s, background-color 0.2s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <MoreVertical size={14} />
          </div>
        )}
        <style>{`
          .workspace-menu-trigger { opacity: 0; }
          .workspace-menu-trigger.active { opacity: 1 !important; }
          .sidebar-item:hover .workspace-menu-trigger { opacity: 1; }
        `}</style>
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            style={{
              position: "absolute",
              top: "100%",
              right: "1rem",
              zIndex: 100,
              backgroundColor: "var(--bg-card)",
              borderRadius: "12px",
              padding: "0.5rem",
              boxShadow: "var(--modal-shadow)",
              border: "1px solid var(--border)",
              minWidth: "180px",
            }}
          >
            <div ref={menuRef} style={{ width: "100%", height: "100%" }}>
              <MenuItem
                icon={<Share2 size={14} />}
                label={t("workspace_menu.share")}
                onClick={() => {
                  setShowMenu(false);
                  onAction?.("share");
                }}
              />
              <MenuItem
                icon={<Pin size={14} />}
                label={
                  isPinned ? t("workspace_menu.unpin") : t("workspace_menu.pin")
                }
                onClick={() => {
                  setShowMenu(false);
                  onAction?.("pin");
                }}
              />
              <MenuItem
                icon={<Edit2 size={14} />}
                label={t("workspace_menu.rename")}
                onClick={() => {
                  setShowMenu(false);
                  onAction?.("rename");
                }}
              />
              <div
                style={{
                  height: "1px",
                  backgroundColor: "var(--border)",
                  margin: "4px 0",
                }}
              />
              <MenuItem
                icon={
                  status === "archived" ? (
                    <RefreshCcw size={14} />
                  ) : (
                    <Archive size={14} />
                  )
                }
                label={
                  status === "archived"
                    ? t("workspace_menu.restore")
                    : t("workspace_menu.archive")
                }
                onClick={() => {
                  setShowMenu(false);
                  onAction?.(status === "archived" ? "restore" : "archive");
                }}
                danger={status !== "archived"}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon, label, onClick, danger }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      width: "100%",
      padding: "8px 12px",
      borderRadius: "8px",
      border: "none",
      background: "none",
      color: danger ? "var(--error)" : "var(--text-main)",
      fontSize: "0.85rem",
      cursor: "pointer",
      transition: "background-color 0.2s",
      textAlign: "left",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.backgroundColor = "var(--surface-hover)")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.backgroundColor = "transparent")
    }
  >
    <div
      style={{
        width: "16px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <span style={{ flex: 1 }}>{label}</span>
  </button>
);
