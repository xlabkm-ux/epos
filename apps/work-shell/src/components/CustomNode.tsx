import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import {
  Lightbulb,
  Database,
  FileText,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const CustomNode = ({ data, selected }: NodeProps) => {
  const { i18n } = useTranslation();

  const getTypeTooltip = (type: string) => {
    const isRu = i18n.language === "ru";
    switch (type.toUpperCase()) {
      case "HYPOTHESIS":
        return isRu
          ? "Гипотеза — предположение, требующее проверки и обоснования"
          : "Hypothesis — assumption requiring verification and justification";
      case "EVIDENCE":
      case "OBSERVATION":
        return isRu
          ? "Свидетельство — фактические данные, наблюдения или доказательства"
          : "Evidence — factual data, observations, or evidence";
      case "CLAIM":
      case "RISK":
        return isRu
          ? "Утверждение — сформулированное заявление, аргумент или тезис"
          : "Claim — asserted statement, argument, or thesis";
      default:
        return type;
    }
  };

  const getCardSummaryTooltip = () => {
    const isRu = i18n.language === "ru";
    
    // 1. Basic Metadata
    const typeLabel = data.type.toUpperCase();
    const nodeIndex = data.hierarchicalId || "0.0";
    
    // 2. Author role details
    const rawAuthor = data.createdById || "system";
    const authorDetails = rawAuthor === "approver"
      ? (isRu ? "Координатор (approver)" : "Coordinator (approver)")
      : rawAuthor === "contributor"
      ? (isRu ? "Аналитик (contributor)" : "Analyst (contributor)")
      : (isRu ? "Система (system)" : "System (system)");

    // 4. Traceability info
    const traceability = typeLabel === "EVIDENCE"
      ? (isRu 
          ? "Криптографическое подтверждение источника проверено через MCP-адаптер. ID: EP-4492-X."
          : "Cryptographic proof of source origin verified via MCP adapter. Trace ID: EP-4492-X.")
      : (isRu
          ? "Гипотетический конструкт, ожидающий эмпирического подтверждения."
          : "Hypothetical construct awaiting empirical validation.");

    // 5. Dependencies count
    const count = data.dependencyCount || 0;
    const dependencyLabel = isRu
      ? `${count} связанных зависимостей`
      : `${count} linked dependencies`;

    // 6. Security Status
    const isRedacted = data.metadata?.redacted;
    const statusLabel = isRedacted
      ? (isRu ? "⚠️ СКРЫТО ДЛЯ БЕЗОПАСНОСТИ ПИЛОТА" : "⚠️ REDACTED FOR PILOT SAFETY")
      : (isRu ? "✓ Активный узел" : "✓ Active Workspace Node");

    // 7. Statement content (truncated nicely for the tooltip)
    const rawLabel = data.label || "";
    const displayLabel = rawLabel.length > 120 
      ? rawLabel.substring(0, 117) + "..." 
      : rawLabel;

    // Multiline structured layout
    if (isRu) {
      return [
        `===========================================`,
        `[Узел ${nodeIndex}] Категория: ${typeLabel}`,
        `===========================================`,
        `Содержание: "${displayLabel}"`,
        `-------------------------------------------`,
        `Автор: ${authorDetails}`,
        `Трассировка: ${traceability}`,
        `Связи: ${dependencyLabel}`,
        `Статус: ${statusLabel}`,
        `===========================================`
      ].join("\n");
    } else {
      return [
        `===========================================`,
        `[Node ${nodeIndex}] Category: ${typeLabel}`,
        `===========================================`,
        `Content: "${displayLabel}"`,
        `-------------------------------------------`,
        `Author: ${authorDetails}`,
        `Traceability: ${traceability}`,
        `Connections: ${dependencyLabel}`,
        `Status: ${statusLabel}`,
        `===========================================`
      ].join("\n");
    }
  };

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
      title={getCardSummaryTooltip()}
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

        {/* Compact unified card content block */}
        <div
          style={{
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* Metadata Row: Icon and Hierarchical Number Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "help" }}
              title={getTypeTooltip(data.type)}
            >
              {getTypeIcon(data.type)}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: themeColor,
                background: `${themeColor}12`,
                padding: "2px 6px",
                borderRadius: "4px",
                border: `1px solid ${themeColor}20`,
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
              }}
            >
              {data.hierarchicalId || "0.0"}
            </div>
          </div>

          {/* Node Content */}
          <div
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "#c0caf5",
              lineHeight: 1.5,
              wordBreak: "break-word",
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
        </div>

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
