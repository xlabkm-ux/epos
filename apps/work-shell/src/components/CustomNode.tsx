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
        return (
          <Lightbulb
            size={14}
            color="#7aa2f7"
            style={{ filter: "drop-shadow(0 0 4px rgba(122, 162, 247, 0.6))" }}
          />
        );
      case "EVIDENCE":
        return (
          <Database
            size={14}
            color="#73daca"
            style={{ filter: "drop-shadow(0 0 4px rgba(115, 218, 202, 0.6))" }}
          />
        );
      case "CLAIM":
        return (
          <FileText
            size={14}
            color="#bb9af7"
            style={{ filter: "drop-shadow(0 0 4px rgba(187, 154, 247, 0.6))" }}
          />
        );
      default:
        return <AlertCircle size={14} color="#a9b1d6" />;
    }
  };

  const getThemeColor = (type: string) => {
    switch (type) {
      case "HYPOTHESIS":
        return "#7aa2f7"; // Radiant Tokyo Night Blue
      case "EVIDENCE":
        return "#73daca"; // Radiant Tokyo Night Green/Teal
      case "CLAIM":
        return "#bb9af7"; // Radiant Tokyo Night Purple
      default:
        return "#a9b1d6";
    }
  };

  const themeColor = getThemeColor(data.type);

  return (
    <div
      style={{
        borderRadius: "16px",
        width: "250px",
        background:
          "linear-gradient(135deg, rgba(30, 34, 51, 0.8) 0%, rgba(15, 17, 26, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        borderLeft: `4px solid ${themeColor}`,
        borderTop: `1px solid ${selected ? themeColor : "rgba(255, 255, 255, 0.08)"}`,
        borderRight: `1px solid ${selected ? themeColor : "rgba(255, 255, 255, 0.08)"}`,
        borderBottom: `1px solid ${selected ? themeColor : "rgba(255, 255, 255, 0.08)"}`,
        boxShadow: selected
          ? `0 0 25px ${themeColor}50, 0 12px 30px rgba(0, 0, 0, 0.6)`
          : "0 8px 20px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
      }}
      className={`custom-node-${data.type.toLowerCase()}`}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: themeColor,
            border: "2px solid #0f111a",
            width: "10px",
            height: "10px",
            top: "-5px",
            boxShadow: `0 0 8px ${themeColor}`,
          }}
        />

        {/* Node Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: `linear-gradient(90deg, ${themeColor}12, transparent)`,
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              color: themeColor,
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {getTypeIcon(data.type)}
            <span>{data.type}</span>
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "rgba(255, 255, 255, 0.4)",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
            }}
          >
            {data.hierarchicalId || "0.0"}
          </div>
        </div>

        {/* Node Body */}
        <div
          style={{
            padding: "14px",
            fontSize: "13px",
            fontWeight: 500,
            color: "#c0caf5",
            lineHeight: 1.5,
            wordBreak: "break-word",
            minHeight: "44px",
          }}
        >
          {data.label}
          {data.metadata?.redacted && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "10px",
                color: "#ff966c",
                marginTop: "6px",
                fontStyle: "italic",
                background: "rgba(255, 150, 108, 0.08)",
                padding: "4px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 150, 108, 0.15)",
              }}
            >
              <ShieldAlert size={12} />
              Redacted for pilot safety
            </div>
          )}
        </div>

        {/* Node Footer / Metadata (Optional badge indicator) */}
        {data.metadata && (
          <div
            style={{
              padding: "6px 14px",
              borderTop: "1px solid rgba(255, 255, 255, 0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "8px",
              background: "rgba(0, 0, 0, 0.1)",
            }}
          >
            <span
              style={{
                fontSize: "9px",
                color: "rgba(255, 255, 255, 0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Verified Node
            </span>
          </div>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: themeColor,
            border: "2px solid #0f111a",
            width: "10px",
            height: "10px",
            bottom: "-5px",
            boxShadow: `0 0 8px ${themeColor}`,
          }}
        />
      </div>
    </div>
  );
};

export default memo(CustomNode);
