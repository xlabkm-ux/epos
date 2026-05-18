import React, { ReactNode, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  title: string;
  width?: string;
}

export const Modal: React.FC<ModalProps> = ({
  children,
  onClose,
  title,
  width = "480px",
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "var(--surface-overlay)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: width,
          maxWidth: "95vw",
          backgroundColor: "var(--bg-card)",
          borderRadius: "24px",
          padding: "2.5rem",
          boxShadow: "var(--modal-shadow)",
          position: "relative",
          border: "1px solid var(--border)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            right: "1.5rem",
            top: "1.5rem",
            background: "var(--surface-hover)",
            border: "none",
            color: "var(--text-dim)",
            cursor: "pointer",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface-active)";
            e.currentTarget.style.color = "var(--text-main)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--surface-hover)";
            e.currentTarget.style.color = "var(--text-dim)";
          }}
        >
          <X size={18} />
        </button>

        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "2rem",
            color: "var(--text-main)",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>

        {children}
      </motion.div>
    </div>
  );
};
