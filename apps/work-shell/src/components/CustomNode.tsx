import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import {
  Lightbulb,
  Database,
  FileText,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

const CustomNode = ({ data, selected }: NodeProps) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "HYPOTHESIS":
        return <Lightbulb size={14} color="var(--primary)" />;
      case "EVIDENCE":
        return <Database size={14} color="var(--success)" />;
      case "CLAIM":
        return <FileText size={14} color="var(--secondary)" />;
      default:
        return <AlertCircle size={14} color="var(--text-dim)" />;
    }
  };

  const getThemeColor = (type: string) => {
    switch (type) {
      case "HYPOTHESIS":
        return "var(--primary)";
      case "EVIDENCE":
        return "var(--success)";
      case "CLAIM":
        return "var(--secondary)";
      default:
        return "var(--border)";
    }
  };

  const themeColor = getThemeColor(data.type);

  return (
    <div
      style={{
        borderRadius: "var(--radius-lg)",
        width: "240px",
        background: "var(--bg-card)",
        transition: "all 0.2s ease",
        border: `1px solid ${selected ? "var(--primary)" : "var(--border)"}`,
        boxShadow: selected
          ? "0 0 0 1px var(--primary), var(--panel-shadow)"
          : "var(--panel-shadow)",
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: themeColor,
            border: "2px solid var(--bg-card)",
            width: "10px",
            height: "10px",
            top: "-5px",
          }}
        />

        {/* Node Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            background: "rgba(255, 255, 255, 0.03)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              color: themeColor,
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            {getTypeIcon(data.type)}
            <span style={{ opacity: 0.8 }}>{data.type}</span>
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {data.hierarchicalId || "0.0"}
          </div>
        </div>

        {/* Node Body */}
        <div
          style={{
            padding: "12px",
            fontSize: "13px",
            fontWeight: 400,
            color: "var(--text-main)",
            lineHeight: 1.5,
            wordBreak: "break-word",
            minHeight: "48px",
          }}
        >
          {data.label}
          {data.metadata?.redacted && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "10px",
                color: "var(--warning)",
                marginTop: "4px",
                fontStyle: "italic",
              }}
            >
              <ShieldAlert size={12} />
              Redacted for pilot safety
            </div>
          )}
        </div>

        {/* Node Footer / Metadata */}
        {data.metadata && (
          <div
            style={{
              padding: "8px 12px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", gap: "4px" }}>
              {/* Optional status dots or mini-tags could go here */}
            </div>
          </div>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: themeColor,
            border: "2px solid var(--bg-card)",
            width: "10px",
            height: "10px",
            bottom: "-5px",
          }}
        />
      </div>
    </div>
  );
};

export default memo(CustomNode);
