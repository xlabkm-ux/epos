import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Zap,
  MessageSquare,
  Shield,
  Terminal,
  Command,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const { selectedNodeId, selectedWorkspaceId } = useWorkspace();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const allCommands = useMemo(
    () => [
      {
        group: "Workspaces",
        items: [
          {
            icon: <Plus size={16} />,
            label: "Create New Workspace",
            shortcut: "N",
          },
          {
            icon: <Zap size={16} />,
            label: "Jump to Active Workspace",
            shortcut: "J",
          },
        ],
      },
      {
        group: "Graph Operations",
        items: [
          {
            icon: <MessageSquare size={16} />,
            label: "Add Epistemic Node",
            shortcut: "A",
          },
          {
            icon: <Shield size={16} />,
            label: "Add Evidence Node",
            shortcut: "E",
          },
        ],
      },
      ...(selectedNodeId
        ? [
            {
              group: "Node Context",
              items: [
                {
                  icon: <Terminal size={16} />,
                  label: "Analyze with AI",
                  shortcut: "L",
                },
                {
                  icon: <Plus size={16} />,
                  label: "Connect to Node",
                  shortcut: "C",
                },
              ],
            },
          ]
        : []),
      {
        group: "System",
        items: [
          {
            icon: <Command size={16} />,
            label: "View Audit Log",
            shortcut: "G",
          },
        ],
      },
    ],
    [selectedNodeId],
  );

  const filteredCommands = useMemo(() => {
    if (!query) return allCommands;
    return allCommands
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.label.toLowerCase().includes(query.toLowerCase()),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [query, allCommands]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        data-testid="command-palette-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(8px)",
          zIndex: 100,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "15vh",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.98 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="premium-card"
          style={{
            width: "100%",
            maxWidth: "640px",
            overflow: "hidden",
            border: "1px solid var(--border-bright)",
          }}
        >
          <div
            style={{
              padding: "1.5rem",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
            }}
          >
            <Search size={22} color="var(--primary)" />
            <input
              autoFocus
              data-testid="command-palette-input"
              placeholder="What do you want to do?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                fontSize: "1.25rem",
                color: "var(--text-main)",
                outline: "none",
                padding: 0,
                boxShadow: "none",
                fontFamily: "var(--font-display)",
              }}
            />
            <div
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                backgroundColor: "var(--border)",
                fontSize: "0.7rem",
                color: "var(--text-dim)",
                fontWeight: 600,
              }}
            >
              ESC
            </div>
          </div>

          <div
            style={{
              padding: "0.75rem",
              maxHeight: "450px",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "var(--primary) transparent",
            }}
          >
            {filteredCommands.length > 0 ? (
              filteredCommands.map((group, idx) => (
                <CommandGroup key={idx} label={group.group}>
                  {group.items.map((item, i) => (
                    <CommandItem
                      key={i}
                      icon={item.icon}
                      label={item.label}
                      shortcut={item.shortcut}
                      onClick={() => {
                        alert(`Executing Command: ${item.label}`);
                        onClose();
                      }}
                    />
                  ))}
                </CommandGroup>
              ))
            ) : (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--text-dim)",
                }}
              >
                No commands matching "{query}"
              </div>
            )}
          </div>

          <div
            style={{
              padding: "1rem 1.5rem",
              backgroundColor: "rgba(0,0,0,0.3)",
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-dim)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span style={{ color: "var(--primary)" }}>EPIOS</span>
              <span>v0.1.0-rc.1</span>
              {selectedWorkspaceId && (
                <>
                  <span style={{ color: "var(--border)" }}>|</span>
                  <span style={{ color: "var(--success)" }}>
                    Workspace Active
                  </span>
                </>
              )}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
              <kbd
                style={{
                  backgroundColor: "var(--border)",
                  padding: "2px 4px",
                  borderRadius: "3px",
                  marginRight: "4px",
                }}
              >
                ↑↓
              </kbd>
              to navigate
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const CommandGroup: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div style={{ marginBottom: "0.75rem" }}>
    <div
      style={{
        padding: "0.5rem 0.75rem",
        fontSize: "0.65rem",
        color: "var(--primary)",
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        fontWeight: 700,
      }}
    >
      {label}
    </div>
    {children}
  </div>
);

const CommandItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick?: () => void;
}> = ({ icon, label, shortcut, onClick }) => (
  <motion.button
    whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    data-testid={`command-item-${label.toLowerCase().replace(/\s+/g, "-")}`}
    style={{
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "0.85rem 1rem",
      borderRadius: "10px",
      textAlign: "left",
      color: "var(--text-main)",
      fontSize: "0.95rem",
    }}
  >
    <div style={{ color: "var(--primary)", display: "flex" }}>{icon}</div>
    <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
    {shortcut && (
      <div
        style={{
          fontSize: "0.7rem",
          color: "var(--text-dim)",
          backgroundColor: "rgba(255,255,255,0.05)",
          padding: "2px 6px",
          borderRadius: "4px",
          fontFamily: "var(--font-mono)",
        }}
      >
        {shortcut}
      </div>
    )}
  </motion.button>
);

export default CommandPalette;
