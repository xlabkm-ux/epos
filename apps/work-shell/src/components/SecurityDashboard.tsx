import React, { useState } from "react";

const SecurityDashboard: React.FC = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Mock Assignment Data
  const user = {
    uid: "u-9923-x42-beta",
    name: "Alexey Architect",
    email: "a.architect@epios.corp",
    assignments: [
      {
        unit: "Governance Group",
        position: "Principal Architect",
        role: "Owner",
        workspace: "Main ADR Node",
        status: "Active",
      },
      {
        unit: "Product Squad S7",
        position: "Technical Lead",
        role: "Reviewer",
        workspace: "Sprint S7 Graph",
        status: "Active",
      },
      {
        unit: "Security Committee",
        position: "Observer",
        role: "Observer",
        workspace: "Audit Log RP",
        status: "Audit Only",
      },
    ],
  };

  return (
    <div
      className="security-dashboard-container"
      style={{
        padding: "40px",
        height: "100%",
        overflowY: "auto",
        background: "linear-gradient(135deg, var(--bg-dark) 0%, #1a1b26 100%)",
        color: "var(--text-main)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(to right, #7aa2f7, #bb9af7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Identity & Security
          </h1>
          <p style={{ opacity: 0.7, marginTop: "10px" }}>
            Управление профилем, назначениями и безопасностью доступа.
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          {/* User Profile Card */}
          <section
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "24px",
              padding: "32px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
            }}
          >
            <h2
              style={{
                fontSize: "1.2rem",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ color: "#7aa2f7" }}>👤</span> Профиль пользователя
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div>
                <label
                  style={{
                    fontSize: "0.8rem",
                    opacity: 0.5,
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  UID
                </label>
                <code
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                  }}
                >
                  {user.uid}
                </code>
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.8rem",
                    opacity: 0.5,
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  Полное имя
                </label>
                <div style={{ fontSize: "1.1rem", fontWeight: 500 }}>
                  {user.name}
                </div>
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.8rem",
                    opacity: 0.5,
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  Email
                </label>
                <div style={{ fontSize: "1.1rem" }}>{user.email}</div>
              </div>
            </div>
          </section>

          {/* 2FA Card */}
          <section
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "24px",
              padding: "32px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
            }}
          >
            <h2
              style={{
                fontSize: "1.2rem",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ color: "#f7768e" }}>🛡️</span> Безопасность (2FA)
            </h2>
            <div style={{ marginBottom: "30px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    Двухфакторная аутентификация
                  </div>
                  <div style={{ fontSize: "0.85rem", opacity: 0.6 }}>
                    Google Authenticator / Authy
                  </div>
                </div>
                <div
                  onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                  style={{
                    width: "50px",
                    height: "26px",
                    background: is2FAEnabled ? "#9ece6a" : "#414868",
                    borderRadius: "13px",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.3s",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      background: "white",
                      borderRadius: "50%",
                      position: "absolute",
                      top: "3px",
                      left: is2FAEnabled ? "27px" : "3px",
                      transition: "left 0.3s",
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Table of Assignments Card */}
          <section
            style={{
              gridColumn: "1 / -1",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "24px",
              padding: "32px",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
            }}
          >
            <h2
              style={{
                fontSize: "1.2rem",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ color: "#bb9af7" }}>🏢</span> Таблица назначений
              (Рабочие места / WP)
            </h2>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <th
                    style={{
                      padding: "12px",
                      opacity: 0.5,
                      fontWeight: 400,
                      fontSize: "0.8rem",
                    }}
                  >
                    ПОДРАЗДЕЛЕНИЕ
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      opacity: 0.5,
                      fontWeight: 400,
                      fontSize: "0.8rem",
                    }}
                  >
                    ДОЛЖНОСТЬ
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      opacity: 0.5,
                      fontWeight: 400,
                      fontSize: "0.8rem",
                    }}
                  >
                    РОЛЬ
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      opacity: 0.5,
                      fontWeight: 400,
                      fontSize: "0.8rem",
                    }}
                  >
                    РАБОЧЕЕ ПРОСТРАНСТВО (РП)
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      opacity: 0.5,
                      fontWeight: 400,
                      fontSize: "0.8rem",
                    }}
                  >
                    СТАТУС
                  </th>
                  <th
                    style={{
                      padding: "12px",
                      opacity: 0.5,
                      fontWeight: 400,
                      fontSize: "0.8rem",
                    }}
                  >
                    ДЕЙСТВИЯ
                  </th>
                </tr>
              </thead>
              <tbody>
                {user.assignments.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <td style={{ padding: "16px 12px", fontWeight: 500 }}>
                      {item.unit}
                    </td>
                    <td style={{ padding: "16px 12px" }}>{item.position}</td>
                    <td style={{ padding: "16px 12px" }}>
                      <span
                        style={{
                          background: "rgba(187, 154, 247, 0.15)",
                          color: "#bb9af7",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                        }}
                      >
                        {item.role}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "16px 12px",
                        color: "var(--primary)",
                        fontWeight: 500,
                      }}
                    >
                      {item.workspace}
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.85rem",
                        }}
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background:
                              item.status === "Active" ? "#9ece6a" : "#f7768e",
                          }}
                        ></span>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <button
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#7aa2f7",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                        }}
                      >
                        Выбрать WP
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SecurityDashboard;
