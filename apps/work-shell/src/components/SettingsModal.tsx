import React, { useState } from "react";
import { Modal } from "./Modal";
import { useTranslation } from "react-i18next";
import { Settings, User, Lock, Globe, Palette, Terminal } from "lucide-react";
import SecurityDashboard from "./SecurityDashboard";
import { RoleSwitcher } from "./RoleSwitcher";
import AssignmentManager from "./AssignmentManager";
import { useSecurity } from "../context/SecurityContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const {
    currentUser,
    activeWorkplace,
    availableAssignments,
    switchWorkplace,
  } = useSecurity();
  const [activeTab, setActiveTab] = useState<
    "general" | "security" | "identity" | "admin"
  >("general");

  if (!isOpen) return null;

  const isAdmin =
    currentUser?.username?.toLowerCase().includes("admin") ||
    currentUser?.id === "admin-1";

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            <section>
              <h3
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-dim)",
                  marginBottom: "1rem",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Globe size={14} />{" "}
                {i18n.language === "ru"
                  ? "Выбор Рабочего места (РМ / WP)"
                  : "WorkPlace Selection"}
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {availableAssignments.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => switchWorkplace(wp.id)}
                    style={{
                      width: "100%",
                      padding: "16px",
                      borderRadius: "12px",
                      textAlign: "left",
                      background:
                        activeWorkplace?.id === wp.id
                          ? "rgba(122, 162, 247, 0.1)"
                          : "rgba(255,255,255,0.03)",
                      border: "1px solid",
                      borderColor:
                        activeWorkplace?.id === wp.id
                          ? "var(--primary)"
                          : "var(--border)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div
                          style={{ fontWeight: 700, color: "var(--text-main)" }}
                        >
                          Assignment: {wp.id}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-dim)",
                            marginTop: "4px",
                          }}
                        >
                          Unit ID: {wp.unitId || "N/A"} — Position ID:{" "}
                          {wp.positionId || "N/A"} —{" "}
                          <span style={{ color: "var(--primary)" }}>
                            {wp.role}
                          </span>
                        </div>
                        {wp.workspaceId && (
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: "var(--text-dim)",
                              marginTop: "4px",
                              fontStyle: "italic",
                            }}
                          >
                            Linked to Workspace: {wp.workspaceId}
                          </div>
                        )}
                      </div>
                      {activeWorkplace?.id === wp.id && (
                        <div
                          style={{
                            background: "var(--primary)",
                            color: "white",
                            fontSize: "0.6rem",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontWeight: 800,
                          }}
                        >
                          ACTIVE WP
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                {availableAssignments.length === 0 && (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "var(--text-dim)",
                      border: "1px dashed var(--border)",
                      borderRadius: "12px",
                    }}
                  >
                    No assignments found for your account.
                  </div>
                )}
              </div>
            </section>

            <section style={{ marginTop: "1rem", opacity: 0.5 }}>
              <h3
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-dim)",
                  marginBottom: "1rem",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Palette size={14} />{" "}
                {i18n.language === "ru" ? "Тема оформления" : "Theme Settings"}
              </h3>
              <div style={{ fontSize: "0.8rem" }}>
                System settings are managed by your administrator.
              </div>
            </section>
          </div>
        );
      case "security":
        return (
          <div style={{ animation: "fadeIn 0.2s ease-out" }}>
            <SecurityDashboard />
          </div>
        );
      case "identity":
        return (
          <div style={{ animation: "fadeIn 0.2s ease-out" }}>
            <h3
              style={{
                fontSize: "0.9rem",
                color: "var(--text-dim)",
                marginBottom: "1.5rem",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <User size={14} />{" "}
              {i18n.language === "ru" ? "Должность и Роль" : "Position & Role"}
            </h3>

            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                padding: "24px",
                borderRadius: "16px",
                marginBottom: "2rem",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-dim)",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    ПОДРАЗДЕЛЕНИЕ / UNIT
                  </label>
                  <div style={{ fontWeight: 600 }}>
                    {activeWorkplace?.toJSON().details.unitId || "Not assigned"}
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-dim)",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    ДОЛЖНОСТЬ / POSITION
                  </label>
                  <div style={{ fontWeight: 600 }}>
                    {activeWorkplace?.toJSON().details.positionId ||
                      "Not assigned"}
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-dim)",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    РОЛЬ В РМ / WP ROLE
                  </label>
                  <div style={{ fontWeight: 600, color: "var(--primary)" }}>
                    {activeWorkplace?.role || "Observer"}
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-dim)",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    АКТИВНОЕ РП / WORKSPACE
                  </label>
                  <div style={{ fontWeight: 600 }}>
                    {activeWorkplace?.workspaceId || "All accessible"}
                  </div>
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-dim)",
                marginBottom: "1.5rem",
              }}
            >
              {i18n.language === "ru"
                ? "Симуляция выбора личности (для разработки):"
                : "Persona simulation (for dev only):"}
            </p>
            <RoleSwitcher />
          </div>
        );
      case "admin":
        return (
          <div style={{ animation: "fadeIn 0.2s ease-out" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                marginBottom: "20px",
                color: "#f7768e",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Terminal size={24} /> Таблица назначений (WP Management)
            </h2>
            <AssignmentManager />
          </div>
        );
    }
  };

  return (
    <Modal onClose={onClose} title={t("sidebar.settings")} width="1100px">
      <div style={{ display: "flex", height: "650px", gap: "30px" }}>
        {/* Tabs Sidebar */}
        <div
          style={{
            width: "240px",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            paddingRight: "15px",
          }}
        >
          <TabButton
            active={activeTab === "general"}
            onClick={() => setActiveTab("general")}
            icon={<Settings size={18} />}
            label={
              i18n.language === "ru" ? "Рабочие места (WP)" : "WorkPlaces (WP)"
            }
          />
          <TabButton
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
            icon={<Lock size={18} />}
            label={i18n.language === "ru" ? "Безопасность" : "Security"}
          />
          <TabButton
            active={activeTab === "identity"}
            onClick={() => setActiveTab("identity")}
            icon={<User size={18} />}
            label={i18n.language === "ru" ? "Личность" : "Identity"}
          />
          {isAdmin && (
            <TabButton
              active={activeTab === "admin"}
              onClick={() => setActiveTab("admin")}
              icon={<Terminal size={18} />}
              label={
                i18n.language === "ru" ? "Администрирование" : "Administration"
              }
              danger
            />
          )}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: "auto", paddingRight: "10px" }}>
          {renderTabContent()}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </Modal>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}> = ({ active, onClick, icon, label, danger }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 15px",
      borderRadius: "10px",
      border: "none",
      backgroundColor: active
        ? danger
          ? "rgba(247, 118, 142, 0.15)"
          : "var(--surface-active)"
        : "transparent",
      color: active
        ? danger
          ? "#f7768e"
          : "var(--text-main)"
        : "var(--text-dim)",
      cursor: "pointer",
      transition: "all 0.2s",
      textAlign: "left",
      width: "100%",
      fontSize: "0.9rem",
      fontWeight: active ? 600 : 400,
    }}
  >
    {icon}
    {label}
  </button>
);

export default SettingsModal;
