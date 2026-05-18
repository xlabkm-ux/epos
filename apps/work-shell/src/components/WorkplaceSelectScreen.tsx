import React, { useEffect, useState } from "react";
import {
  Shield,
  Briefcase,
  MapPin,
  ArrowRight,
  LogOut,
  Loader2,
} from "lucide-react";
import { useSecurity } from "../context/SecurityContext";
import { API_BASE_URL } from "../api-config";

interface OrgUnit {
  id: string;
  name: string;
}

interface OrgPosition {
  id: string;
  name: string;
}

export const WorkplaceSelectScreen: React.FC = () => {
  const { currentUser, availableAssignments, switchWorkplace, logout } =
    useSecurity();
  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [positions, setPositions] = useState<OrgPosition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/identity/org-structure`,
        );
        if (response.ok) {
          const data = await response.json();
          setUnits(data.units || []);
          setPositions(data.positions || []);
        }
      } catch (err) {
        console.error(
          "Failed to load org structure for Workplace Selector:",
          err,
        );
      } finally {
        setLoading(false);
      }
    };
    fetchOrgData();
  }, []);

  const getUnitName = (unitId?: string) => {
    return units.find((u) => u.id === unitId)?.name || unitId || "—";
  };

  const getPositionName = (posId?: string) => {
    return positions.find((p) => p.id === posId)?.name || posId || "—";
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top right, #1e2233 0%, #0f111a 100%)",
        color: "white",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background decorations */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "15%",
          width: "450px",
          height: "450px",
          background: "rgba(187, 154, 247, 0.05)",
          borderRadius: "50%",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "15%",
          width: "350px",
          height: "350px",
          background: "rgba(122, 162, 247, 0.04)",
          borderRadius: "50%",
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          padding: "2.5rem",
          background: "rgba(255, 255, 255, 0.02)",
          backdropFilter: "blur(25px)",
          borderRadius: "32px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          boxSizing: "border-box",
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              padding: "12px",
              background: "linear-gradient(135deg, #7aa2f7 0%, #bb9af7 100%)",
              borderRadius: "16px",
              marginBottom: "1rem",
              boxShadow: "0 0 20px rgba(122, 162, 247, 0.3)",
            }}
          >
            <Shield size={28} color="white" />
          </div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Выбор Рабочего Места
          </h2>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "0.85rem",
              marginTop: "0.5rem",
            }}
          >
            Рады видеть вас, <strong>{currentUser?.username}</strong>! Для
            доступа к холсту и списку пространств выберите ваше активное Рабочее
            Место (WP):
          </p>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "3rem",
              color: "var(--text-dim)",
            }}
          >
            <Loader2
              style={{ animation: "spin 1s linear infinite" }}
              size={32}
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxHeight: "350px",
              overflowY: "auto",
              paddingRight: "6px",
            }}
          >
            {availableAssignments.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#ff966c",
                  background: "rgba(255, 150, 108, 0.08)",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 150, 108, 0.15)",
                  fontSize: "0.85rem",
                }}
              >
                Для вашего аккаунта не настроено ни одного Рабочего Места.
                Пожалуйста, обратитесь к Администратору для заполнения Таблицы
                назначений.
              </div>
            ) : (
              availableAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  onClick={() => switchWorkplace(assignment.id)}
                  style={{
                    padding: "16px 20px",
                    borderRadius: "16px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(122, 162, 247, 0.08)";
                    e.currentTarget.style.borderColor =
                      "rgba(122, 162, 247, 0.4)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.03)";
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          color:
                            assignment.role.toLowerCase() === "owner"
                              ? "#bb9af7"
                              : "#7aa2f7",
                          background:
                            assignment.role.toLowerCase() === "owner"
                              ? "rgba(187, 154, 247, 0.12)"
                              : "rgba(122, 162, 247, 0.12)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          border:
                            assignment.role.toLowerCase() === "owner"
                              ? "1px solid rgba(187, 154, 247, 0.2)"
                              : "1px solid rgba(122, 162, 247, 0.2)",
                        }}
                      >
                        {assignment.role}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "#c0caf5",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <MapPin
                        size={13}
                        style={{ color: "#7aa2f7", flexShrink: 0 }}
                      />
                      <span
                        style={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {getUnitName(assignment.unitId)}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "rgba(255, 255, 255, 0.65)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginTop: "2px",
                      }}
                    >
                      <Briefcase
                        size={13}
                        style={{ color: "#bb9af7", flexShrink: 0 }}
                      />
                      <span
                        style={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {getPositionName(assignment.positionId)}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: "9px",
                        color: "rgba(255, 255, 255, 0.25)",
                        fontFamily: "var(--font-mono)",
                        marginTop: "6px",
                        letterSpacing: "0.02em",
                      }}
                    >
                      ID: {assignment.id.toUpperCase()}
                    </span>
                  </div>

                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "rgba(255,255,255,0.4)",
                      transition: "all 0.2s",
                    }}
                    className="arrow-badge"
                  >
                    <ArrowRight size={16} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bottom actions */}
        <div
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "1rem",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            onClick={logout}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255, 255, 255, 0.4)",
              cursor: "pointer",
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 600,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ff966c")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)")
            }
          >
            <LogOut size={14} />
            Вернуться на экран входа (Выйти)
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
