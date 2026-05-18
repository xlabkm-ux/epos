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

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.dataset.theme = newTheme;
  };

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
              gap: "24px",
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            {/* Language Selection */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--text-main)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Globe size={14} style={{ color: "var(--primary)" }} />
                {i18n.language === "ru" ? "Язык интерфейса" : "Interface Language"}
              </label>
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="ru" style={{ backgroundColor: "var(--bg-card)" }}>
                  Русский
                </option>
                <option value="en" style={{ backgroundColor: "var(--bg-card)" }}>
                  English
                </option>
              </select>
            </div>

            {/* Theme Selection */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--text-main)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Palette size={14} style={{ color: "var(--primary)" }} />
                {i18n.language === "ru" ? "Тема оформления" : "Theme Settings"}
              </label>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="dark" style={{ backgroundColor: "var(--bg-card)" }}>
                  {i18n.language === "ru" ? "Тёмная" : "Dark"}
                </option>
                <option value="light" style={{ backgroundColor: "var(--bg-card)" }}>
                  {i18n.language === "ru" ? "Светлая" : "Light"}
                </option>
                <option value="system" style={{ backgroundColor: "var(--bg-card)" }}>
                  {i18n.language === "ru" ? "Системная" : "System"}
                </option>
              </select>
            </div>

            {/* Active Workplace Selection */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--text-main)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Settings size={14} style={{ color: "var(--primary)" }} />
                {i18n.language === "ru"
                  ? "Активное рабочее место (WP)"
                  : "Active WorkPlace (WP)"}
              </label>
              <select
                value={activeWorkplace?.id || ""}
                onChange={(e) => switchWorkplace(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {availableAssignments.map((wp) => (
                  <option
                    key={wp.id}
                    value={wp.id}
                    style={{ backgroundColor: "var(--bg-card)" }}
                  >
                    {wp.id} ({wp.role}) — Unit: {wp.unitId || "N/A"}, Pos:{" "}
                    {wp.positionId || "N/A"}
                  </option>
                ))}
                {availableAssignments.length === 0 && (
                  <option value="" style={{ backgroundColor: "var(--bg-card)" }}>
                    {i18n.language === "ru"
                      ? "Назначения отсутствуют"
                      : "No assignments found"}
                  </option>
                )}
              </select>
            </div>
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
              <User size={14} style={{ color: "var(--primary)" }} />
              {i18n.language === "ru" ? "Должность и Роль" : "Position & Role"}
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "20px",
                borderRadius: "10px",
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border)",
                marginBottom: "24px",
              }}
            >
              {[
                {
                  label: i18n.language === "ru" ? "Подразделение (Unit)" : "Unit",
                  value: activeWorkplace?.toJSON().details.unitId || "—",
                },
                {
                  label: i18n.language === "ru" ? "Должность (Position)" : "Position",
                  value: activeWorkplace?.toJSON().details.positionId || "—",
                },
                {
                  label: i18n.language === "ru" ? "Роль в РМ (WP Role)" : "WP Role",
                  value: activeWorkplace?.role || "—",
                  isPrimary: true,
                },
                {
                  label: i18n.language === "ru" ? "Активное РП (Workspace)" : "Workspace",
                  value: activeWorkplace?.workspaceId || "—",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingBottom: "10px",
                    borderBottom:
                      idx < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    fontSize: "0.85rem",
                  }}
                >
                  <span style={{ color: "var(--text-dim)" }}>{item.label}</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: item.isPrimary ? "var(--primary)" : "var(--text-main)",
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
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
