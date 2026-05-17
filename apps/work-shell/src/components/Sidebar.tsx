import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Layout,
  Database,
  Activity,
  Plus,
  Terminal,
  Zap,
  FileText,
  Copy,
} from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext";
import { useSecurity } from "../context/SecurityContext";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Workspace } from "@epios/domain";
import { API_BASE_URL } from "../api-config";

// Refactored Components
import { Modal } from "./Modal";
import { SidebarItem } from "./SidebarItem";
import SettingsModal from "./SettingsModal";
import { RoleSwitcher } from "./RoleSwitcher";

const Sidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isResizing, setIsResizing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [shareModalWs, setShareModalWs] = useState<Workspace | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const {
    workspaces,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    activeView,
    setActiveView,
    refreshWorkspaces,
  } = useWorkspace();

  // Theme Logic
  const [theme] = useState(() => {
    return localStorage.getItem("theme") || "system";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Resize Logic
  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth > 180 && newWidth < 600) {
          setSidebarWidth(newWidth);
          if (isCollapsed) setIsCollapsed(false);
        }
      }
    },
    [isResizing, isCollapsed],
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const handleAction = async (ws: Workspace, action: string) => {
    if (action === "share") {
      setShareModalWs(ws);
    } else if (action === "archive") {
      const archivedAt = new Date();
      const archiveComment =
        i18n.language === "ru"
          ? "Архивировано пользователем"
          : "Archived by user";

      // Persist to DB
      await fetch(`${API_BASE_URL}/workspaces/${ws.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "archived",
          archivedAt,
          archiveComment,
          isPinned: false, // Unpin when archiving
        }),
      });

      refreshWorkspaces();
    } else if (action === "restore") {
      await fetch(`${API_BASE_URL}/workspaces/${ws.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "running" }),
      });
      refreshWorkspaces();
    } else if (action === "pin") {
      const isCurrentlyPinned = !!ws.isPinned;
      await fetch(`${API_BASE_URL}/workspaces/${ws.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !isCurrentlyPinned }),
      });
      refreshWorkspaces();
    } else if (action === "rename") {
      const newTitle = prompt("Enter new title:", ws.title);
      if (newTitle && newTitle !== ws.title) {
        await fetch(`${API_BASE_URL}/workspaces/${ws.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });
        refreshWorkspaces();
      }
    } else {
      alert(`Action: ${action} for ${ws.title}`);
    }
  };

  return (
    <>
      <motion.div
        ref={sidebarRef}
        initial={false}
        animate={{ width: isCollapsed ? 80 : sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          height: "100vh",
          backgroundColor: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: isCollapsed ? "2rem 0.75rem" : "2rem 1.25rem",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Resize Handle */}
        {!isCollapsed && (
          <div
            onMouseDown={startResizing}
            style={{
              position: "absolute",
              right: -3,
              top: 0,
              bottom: 0,
              width: "6px",
              cursor: "col-resize",
              zIndex: 1000,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(100, 108, 255, 0.3)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          />
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "3rem",
            padding: isCollapsed ? "0" : "0 0.5rem",
            justifyContent: isCollapsed ? "center" : "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: "36px",
                minWidth: "36px",
                height: "36px",
                backgroundColor: "var(--primary)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "var(--panel-shadow)",
              }}
            >
              <Terminal size={22} strokeWidth={2.5} />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    color: "var(--text-main)",
                    whiteSpace: "nowrap",
                  }}
                >
                  EpiOS
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "3px",
              padding: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              opacity: 0.6,
              transition: "opacity 0.2s",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  backgroundColor: "var(--text-dim)",
                }}
              />
            ))}
          </button>
        </div>

        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            overflowY: "auto",
            paddingRight: isCollapsed ? "0" : "4px",
          }}
          className="sidebar-nav"
        >
          <SidebarItem
            icon={<Layout size={18} />}
            label={t("sidebar.workplace")}
            active={activeView === "ROOM"}
            isCollapsed={isCollapsed}
            onClick={() => setActiveView("ROOM")}
          />
          <SidebarItem
            icon={<FileText size={18} />}
            label={t("sidebar.adr_review")}
            active={activeView === "ADR"}
            isCollapsed={isCollapsed}
            onClick={() => setActiveView("ADR")}
          />
          <SidebarItem
            icon={<Database size={18} />}
            label={`${t("sidebar.archive")} (${workspaces.filter((ws) => ws.status === "archived").length})`}
            active={activeView === "ARCHIVE"}
            isCollapsed={isCollapsed}
            onClick={() => setActiveView("ARCHIVE")}
          />
          <SidebarItem
            icon={<Activity size={18} />}
            label={t("sidebar.telemetry")}
            isCollapsed={isCollapsed}
            onClick={() =>
              alert("Real-time workspace metrics synchronization...")
            }
          />

          {/* ── Workspaces List (Pinned first, no headers) ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              marginTop: isCollapsed ? "0" : "1rem",
            }}
          >
            {workspaces
              .filter((ws) => ws.status !== "archived")
              .sort((a, b) => {
                // Pin logic: pinned first
                if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
                // Then by update date
                return (
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
                );
              })
              .map((ws) => (
                <SidebarItem
                  key={ws.id}
                  active={selectedWorkspaceId === ws.id}
                  isCollapsed={isCollapsed}
                  isPinned={!!ws.isPinned}
                  onClick={() => {
                    setSelectedWorkspaceId(ws.id);
                    setActiveView("ROOM"); // Switch back to ROOM when selecting a WS
                  }}
                  onAction={(action) => handleAction(ws, action)}
                  isWorkspace
                  status={ws.status}
                  icon={<WsDot active={selectedWorkspaceId === ws.id} />}
                  label={ws.title}
                />
              ))}
          </div>

          <SidebarItem
            icon={<Plus size={18} />}
            label={t("sidebar.new_workspace")}
            isAction
            isCollapsed={isCollapsed}
            onClick={() =>
              alert("Initializing Neural Core for new workspace...")
            }
          />
        </nav>

        <div
          style={{
            marginTop: "auto",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {/* Role Switcher (Identity Context Management & User Menu Dropdown) */}
          <div style={{ marginBottom: "0.5rem" }}>
            <RoleSwitcher
              isCollapsed={isCollapsed}
              onOpenSettings={() => setShowSettings(true)}
              onOpenHelp={() => setShowHelp(true)}
            />
          </div>
        </div>
      </motion.div>

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalWs && (
          <Modal
            onClose={() => setShareModalWs(null)}
            title={t("share_modal.title")}
          >
            <div
              style={{
                backgroundColor: "var(--surface-active)",
                borderRadius: "15px",
                padding: "0.5rem 0.5rem 0.5rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "2rem",
                border: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: "0.9rem",
                  color: "var(--text-dim)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                gemini.google.com/share/{shareModalWs.id.substring(0, 8)}...
              </span>
              <button
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--text-inverse)",
                  border: "none",
                  borderRadius: "30px",
                  padding: "0.6rem 1.25rem",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <Copy size={16} />
                {t("share_modal.copy")}
              </button>
            </div>
            <div
              style={{ display: "flex", gap: "12px", color: "var(--text-dim)" }}
            >
              <Activity
                size={16}
                style={{ marginTop: "3px", minWidth: "16px" }}
              />
              <p style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
                {t("share_modal.warning")}
              </p>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Help Modal explaining visible UI components in detail */}
      <AnimatePresence>
        {showHelp && (
          <Modal
            onClose={() => setShowHelp(false)}
            title={
              i18n.language === "ru"
                ? "Справка по интерфейсу EpiOS"
                : "EpiOS Interface Help"
            }
            width="850px"
          >
            <HelpContent language={i18n.language} />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

// ── Helper components ───────────────────────────────────────────────────────

const WsDot: React.FC<{ active: boolean }> = ({ active }) =>
  active ? (
    <Zap
      size={14}
      fill="var(--primary)"
      style={{
        filter: "drop-shadow(0 0 5px var(--primary))",
        color: "var(--primary)",
      }}
    />
  ) : (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: "var(--text-dim)",
        opacity: 0.6,
      }}
    />
  );

const HelpContent: React.FC<{ language: string }> = ({ language }) => {
  const [activeTab, setActiveTab] = useState<
    "sidebar" | "workplace" | "adr" | "footer_archive"
  >("sidebar");

  const tabs = {
    ru: [
      { id: "sidebar", label: "Боковая панель" },
      { id: "workplace", label: "Рабочее место & Граф" },
      { id: "adr", label: "Обзор ADR" },
      { id: "footer_archive", label: "Статус-бар & Архив" },
    ],
    en: [
      { id: "sidebar", label: "Sidebar" },
      { id: "workplace", label: "Workplace & Graph" },
      { id: "adr", label: "ADR Review" },
      { id: "footer_archive", label: "Status Bar & Archive" },
    ],
  };

  const currentTabs = language === "ru" ? tabs.ru : tabs.en;

  const renderContent = () => {
    if (language === "ru") {
      switch (activeTab) {
        case "sidebar":
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  color: "var(--primary)",
                  margin: "0 0 0.5rem 0",
                  fontWeight: 700,
                }}
              >
                📁 Левая боковая панель (Sidebar)
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-dim)",
                  lineHeight: 1.6,
                }}
              >
                Боковая панель обеспечивает глобальную навигацию, управление
                контекстом сессии и переключение ролей.
              </p>
              <ul
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  lineHeight: 1.7,
                  paddingLeft: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <li>
                  <strong>Логотип & Свертывание:</strong> Кнопка «...» (три
                  вертикальные точки) позволяет свернуть панель в компактный
                  режим (только иконки).
                </li>
                <li>
                  <strong>Разделы навигации:</strong> Переходы между экранами{" "}
                  <em>«Рабочее место»</em> (холст графа), <em>«Обзор ADR»</em>{" "}
                  (симуляции и ревью), <em>«Архив»</em> (восстановление
                  пространств) и <em>«Телеметрия»</em>.
                </li>
                <li>
                  <strong>Индикатор активности воркспейса:</strong> Светящаяся
                  фиолетовая молния (<code>Zap</code>) отмечает текущий активный
                  воркспейс.
                </li>
                <li>
                  <strong>Селектор личностей (Role Switcher):</strong> Включает
                  роли <em>Viewer</em>, <em>Contributor</em>, <em>Approver</em>{" "}
                  и <em>Admin</em>.
                </li>
                <li>
                  <strong>Блок сессии:</strong> Показывает имя пользователя.{" "}
                  <strong>
                    Клик по нему открывает меню с Настройками, Справкой и
                    Выходом.
                  </strong>
                </li>
              </ul>
            </div>
          );
        case "workplace":
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  color: "var(--primary)",
                  margin: "0 0 0.5rem 0",
                  fontWeight: 700,
                }}
              >
                🎨 Рабочее место & Интерактивный граф
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-dim)",
                  lineHeight: 1.6,
                }}
              >
                Основной холст для интерактивного анализа связей и свойств
                элементов.
              </p>
              <ul
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  lineHeight: 1.7,
                  paddingLeft: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <li>
                  <strong>Холст графа (Graph Canvas):</strong> Визуализирует
                  узлы рассуждений через React Flow. Синий узел —{" "}
                  <em>Hypothesis</em> (Гипотеза), зеленый узел —{" "}
                  <em>Evidence</em> (Свидетельство).
                </li>
                <li>
                  <strong>Панель свойств (Properties Panel):</strong> Выдвижная
                  правая панель с описанием выбранного узла, его типом и
                  криптографической прослеживаемостью.
                </li>
                <li>
                  <strong>Редактирование (Edit / Propose Patch):</strong>{" "}
                  Доступно ролям <em>Contributor</em> и <em>Approver</em> для
                  предложения изменений в граф.
                </li>
                <li>
                  <strong>Оценка источника (Rating Panel):</strong> Шкала оценки
                  уровня доверия к источнику с расчетом среднего рейтинга.
                </li>
                <li>
                  <strong>Действия Purge / Redact:</strong> Роли{" "}
                  <em>Approver</em> и <em>Admin</em> могут полностью удалять
                  узлы графа или маскировать чувствительные PII данные.
                </li>
              </ul>
            </div>
          );
        case "adr":
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  color: "var(--primary)",
                  margin: "0 0 0.5rem 0",
                  fontWeight: 700,
                }}
              >
                📊 Экран обзора ADR (ADR Review)
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-dim)",
                  lineHeight: 1.6,
                }}
              >
                Специализированное рабочее пространство для оценки Architectural
                Decision Records.
              </p>
              <ul
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  lineHeight: 1.7,
                  paddingLeft: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <li>
                  <strong>Индекс ADR (Левая панель):</strong> Поиск и список
                  всех решений со статусами <em>Proposed</em> или{" "}
                  <em>Accepted</em>.
                </li>
                <li>
                  <strong>Анализ (Run Epistemic Analysis):</strong> Запуск
                  симуляции рисков и архитектурных связей.
                </li>
                <li>
                  <strong>Вкладка «Governance»:</strong> Включает сплит-панели
                  оценки готовности (<em>Readiness Assessment</em>), управления
                  патчами изменений (<em>Artifact Patch</em>) и голосования
                  ревьюеров (<em>Governance Panel</em>).
                </li>
                <li>
                  <strong>Вкладка «Artifact»:</strong> Просмотр итогового
                  сгенерированного markdown-документа ADR.
                </li>
                <li>
                  <strong>Внешнее согласование (External Approval):</strong>{" "}
                  Демонстрирует работу защищенного MCP-моста (Secure MCP Bridge)
                  в песочнице iframe для обмена сообщениями.
                </li>
              </ul>
            </div>
          );
        case "footer_archive":
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  color: "var(--primary)",
                  margin: "0 0 0.5rem 0",
                  fontWeight: 700,
                }}
              >
                ⚡ Статус-бар & Архив рабочих пространств
              </h3>
              <ul
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  lineHeight: 1.7,
                  paddingLeft: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <li>
                  <strong>Нижний статус-бар:</strong> Левая кнопка открывает{" "}
                  <em>Mission Panel</em> с описанием цели текущей миссии. Правый
                  элемент показывает статус соединения{" "}
                  <code>EPIOS_SHELL_CONNECTED</code> и при наведении отображает
                  состояние PostgreSQL, версии API и сетевой задержки.
                </li>
                <li>
                  <strong>Архив (Archive View):</strong> Просмотр списка
                  неактивных воркспейсов. Кнопка{" "}
                  <em>«Восстановить» (Restore)</em> возвращает их в список
                  активных пространств на левой панели.
                </li>
              </ul>
            </div>
          );
      }
    } else {
      switch (activeTab) {
        case "sidebar":
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  color: "var(--primary)",
                  margin: "0 0 0.5rem 0",
                  fontWeight: 700,
                }}
              >
                📁 Left Sidebar
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-dim)",
                  lineHeight: 1.6,
                }}
              >
                Provides global navigation, session context management, and
                identity role switcher.
              </p>
              <ul
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  lineHeight: 1.7,
                  paddingLeft: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <li>
                  <strong>Logo & Collapse:</strong> The collapse button
                  collapses the sidebar into a compact icon-only view.
                </li>
                <li>
                  <strong>Navigation items:</strong> Easily switch between{" "}
                  <em>Workplace</em> (graph canvas), <em>ADR Review</em>{" "}
                  (simulations and voting), <em>Archive</em> (neural storage),
                  and <em>Telemetry</em>.
                </li>
                <li>
                  <strong>Active Workspace indicator:</strong> A glowing purple
                  lightning bolt (<code>Zap</code>) marks the current active
                  workspace.
                </li>
                <li>
                  <strong>Role Switcher (Identity Context):</strong> Simulates
                  roles: <em>Viewer</em>, <em>Contributor</em>,{" "}
                  <em>Approver</em>, and <em>Admin</em>.
                </li>
                <li>
                  <strong>Session Pill:</strong> Shows current active username.{" "}
                  <strong>
                    Click to open the user menu for Settings, Help, and Exit.
                  </strong>
                </li>
              </ul>
            </div>
          );
        case "workplace":
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  color: "var(--primary)",
                  margin: "0 0 0.5rem 0",
                  fontWeight: 700,
                }}
              >
                🎨 Workplace & Graph Canvas
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-dim)",
                  lineHeight: 1.6,
                }}
              >
                Interactive workspace for analysis of reasoning traces and
                evidence.
              </p>
              <ul
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  lineHeight: 1.7,
                  paddingLeft: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <li>
                  <strong>Graph Canvas:</strong> Renders visual reasoning
                  structures using React Flow. Blue nodes are{" "}
                  <em>Hypotheses</em>, green nodes are <em>Evidence</em>.
                </li>
                <li>
                  <strong>Properties Panel:</strong> Slide-out side panel
                  containing selected node type, content details, and
                  cryptographic traceability metadata.
                </li>
                <li>
                  <strong>Editing (Edit / Propose Patch):</strong> Allowed for{" "}
                  <em>Contributor</em> and <em>Approver</em> roles to suggest
                  changes or make edits.
                </li>
                <li>
                  <strong>Source Evaluation (Rating Panel):</strong> Interactive
                  trust rating scale displaying the averaged source score.
                </li>
                <li>
                  <strong>Purge & Redact Actions:</strong> Specialized tools for{" "}
                  <em>Approver</em> and <em>Admin</em> roles to delete nodes or
                  redact PII emails.
                </li>
              </ul>
            </div>
          );
        case "adr":
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  color: "var(--primary)",
                  margin: "0 0 0.5rem 0",
                  fontWeight: 700,
                }}
              >
                📊 ADR Review Workspace
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-dim)",
                  lineHeight: 1.6,
                }}
              >
                Dedicated environment for managing Architectural Decision
                Records.
              </p>
              <ul
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  lineHeight: 1.7,
                  paddingLeft: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <li>
                  <strong>ADR Index:</strong> Search bar and quick-view list of
                  proposed and accepted architecture decisions.
                </li>
                <li>
                  <strong>Epistemic Analysis:</strong> Zap-based risk simulation
                  showing an advanced active spinner loading animation.
                </li>
                <li>
                  <strong>Governance Tab:</strong> Split pane featuring{" "}
                  <em>Readiness Assessment</em> with blocking rules,{" "}
                  <em>Artifact Patch</em> history, and reviewer vote forms.
                </li>
                <li>
                  <strong>Artifact Tab:</strong> Renders the compiled, clean
                  markdown version of the current ADR document.
                </li>
                <li>
                  <strong>External Approval:</strong> Integrates a secure
                  sandboxed iframe communicating over a Secure MCP Bridge
                  protocol.
                </li>
              </ul>
            </div>
          );
        case "footer_archive":
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                animation: "fadeIn 0.2s ease-out",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  color: "var(--primary)",
                  margin: "0 0 0.5rem 0",
                  fontWeight: 700,
                }}
              >
                ⚡ Status Bar & Workspace Archive
              </h3>
              <ul
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  lineHeight: 1.7,
                  paddingLeft: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <li>
                  <strong>Footer Status Bar:</strong> Left side contains
                  workspace mission description popup trigger, and right side
                  has a live hover popover detailing PostgreSQL connection,
                  latency, and enclave status.
                </li>
                <li>
                  <strong>Archive View:</strong> Lists all archived workspaces
                  in neural storage with comments and a quick-action{" "}
                  <em>«Restore»</em> button.
                </li>
              </ul>
            </div>
          );
      }
    }
  };

  return (
    <div style={{ display: "flex", height: "450px", gap: "30px" }}>
      {/* Sidebar Tabs */}
      <div
        style={{
          width: "220px",
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          paddingRight: "15px",
        }}
      >
        {currentTabs.map((t) => (
          <button
            key={t.id}
            onClick={() =>
              setActiveTab(
                t.id as "sidebar" | "workplace" | "adr" | "footer_archive",
              )
            }
            style={{
              display: "flex",
              alignItems: "center",
              padding: "12px 15px",
              borderRadius: "10px",
              border: "none",
              backgroundColor:
                activeTab === t.id ? "var(--surface-active)" : "transparent",
              color:
                activeTab === t.id ? "var(--text-main)" : "var(--text-dim)",
              cursor: "pointer",
              transition: "all 0.2s",
              textAlign: "left",
              width: "100%",
              fontSize: "0.85rem",
              fontWeight: activeTab === t.id ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingRight: "10px" }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Sidebar;
