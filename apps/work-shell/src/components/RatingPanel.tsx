import { API_BASE_URL } from "../api-config";
import React, { useState, useEffect } from "react";
import { Star, Shield } from "lucide-react";

interface Rating {
  id: string;
  nodeId: string;
  actorId: string;
  value: number;
  comment?: string;
  createdAt: string;
}

export const RatingPanel: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [value, setValue] = useState(3);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchRatings();
  }, [nodeId]);

  const fetchRatings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/nodes/${nodeId}/ratings`);
      if (res.ok) {
        const data = await res.json();
        setRatings(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitRating = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/nodes/${nodeId}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actorId: "user-1", value, comment }),
      });
      if (res.ok) {
        const rating = await res.json();
        setRatings([rating, ...ratings]);
        setComment("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const averageRating =
    ratings.length > 0
      ? (ratings.reduce((acc, r) => acc + r.value, 0) / ratings.length).toFixed(
          1,
        )
      : "N/A";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h3
          style={{
            fontSize: "0.7rem",
            color: "var(--text-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
          }}
        >
          Epistemic Evaluation
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            backgroundColor: "var(--primary-alpha)",
            padding: "2px 8px",
            borderRadius: "12px",
            border: "1px solid var(--primary)",
          }}
        >
          <Star size={12} fill="var(--primary)" color="var(--primary)" />
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--primary)",
            }}
          >
            {averageRating}
          </span>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "1.25rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.75rem",
            marginBottom: "1.25rem",
          }}
        >
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              onClick={() => setValue(v)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: v <= value ? "var(--primary)" : "var(--text-dim)",
                transition: "transform 0.2s ease",
                transform: v === value ? "scale(1.2)" : "scale(1)",
              }}
            >
              <Star size={24} fill={v <= value ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
        <textarea
          style={{
            width: "100%",
            minHeight: "60px",
            fontSize: "0.85rem",
            backgroundColor: "rgba(0,0,0,0.2)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "0.75rem",
            color: "var(--text-main)",
            marginBottom: "0.75rem",
          }}
          placeholder="Optional rationale..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          onClick={submitRating}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "0.75rem",
            borderRadius: "8px",
            backgroundColor: "var(--primary)",
            color: "white",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
          }}
        >
          Submit Evaluation
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {ratings.map((r) => (
          <div
            key={r.id}
            style={{
              padding: "0.75rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Shield size={12} color="var(--text-dim)" />
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-dim)",
                    fontWeight: 600,
                  }}
                >
                  {r.actorId}
                </span>
              </div>
              <div style={{ display: "flex", gap: "2px" }}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <Star
                    key={v}
                    size={10}
                    fill={v <= r.value ? "var(--primary)" : "none"}
                    color={v <= r.value ? "var(--primary)" : "var(--text-dim)"}
                  />
                ))}
              </div>
            </div>
            {r.comment && (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-main)",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {r.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
