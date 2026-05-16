import { API_BASE_URL } from "../api-config";
import React, { useState, useEffect } from "react";
import { FileText, Globe, Link2, Send } from "lucide-react";
import { motion } from "framer-motion";

interface Source {
  id: string;
  missionId: string;
  type: "text" | "url" | "file";
  content: string;
  createdAt: string;
}

export const SourcePanel: React.FC<{ missionId: string }> = ({ missionId }) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [newContent, setNewContent] = useState("");
  const [newType, setNewType] = useState<Source["type"]>("text");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSources();
  }, [missionId]);

  const fetchSources = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/missions/${missionId}/sources`);
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addSource = async () => {
    if (!newContent) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/missions/${missionId}/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newType, content: newContent }),
      });
      if (res.ok) {
        const source = await res.json();
        setSources([...sources, source]);
        setNewContent("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h3
          style={{
            fontSize: "0.7rem",
            color: "var(--text-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          Ingest New Intelligence
        </h3>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {(["text", "url", "file"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setNewType(t)}
                style={{
                  flex: 1,
                  padding: "6px",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  backgroundColor:
                    newType === t ? "var(--primary-alpha)" : "transparent",
                  color: newType === t ? "var(--primary)" : "var(--text-dim)",
                  border: `1px solid ${newType === t ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                {t === "text" && <FileText size={12} />}
                {t === "url" && <Globe size={12} />}
                {t === "file" && <Link2 size={12} />}
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ position: "relative" }}>
            <textarea
              style={{
                width: "100%",
                minHeight: "80px",
                fontSize: "0.85rem",
                backgroundColor: "rgba(0,0,0,0.2)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "0.75rem",
                color: "var(--text-main)",
                paddingRight: "40px",
              }}
              placeholder={
                newType === "url" ? "Enter URL..." : "Enter source content..."
              }
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <button
              onClick={addSource}
              disabled={!newContent || isLoading}
              style={{
                position: "absolute",
                bottom: "12px",
                right: "8px",
                padding: "6px",
                borderRadius: "6px",
                backgroundColor: newContent
                  ? "var(--primary)"
                  : "var(--border)",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3
          style={{
            fontSize: "0.7rem",
            color: "var(--text-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          Source Inventory
        </h3>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {sources.length === 0 && (
            <div
              style={{
                padding: "1.5rem",
                textAlign: "center",
                border: "1px dashed var(--border)",
                borderRadius: "12px",
                color: "var(--text-dim)",
                fontSize: "0.8rem",
              }}
            >
              No intelligence sources ingested.
            </div>
          )}
          {sources.map((s) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={s.id}
              style={{
                padding: "0.75rem",
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div style={{ color: "var(--primary)" }}>
                {s.type === "text" && <FileText size={16} />}
                {s.type === "url" && <Globe size={16} />}
                {s.type === "file" && <Link2 size={16} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-main)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.content}
                </div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--text-dim)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  INGESTED: {new Date(s.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
