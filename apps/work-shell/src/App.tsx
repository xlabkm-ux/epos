import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import WorkspaceRoom from "./components/WorkspaceRoom";
import CommandPalette from "./components/CommandPalette";
import ADRReviewWorkspace from "./components/ADRReviewWorkspace";
import { ArchiveView } from "./components/ArchiveView";
import SecurityDashboard from "./components/SecurityDashboard";
import { useWorkspace } from "./context/WorkspaceContext";
import { useSecurity } from "./context/SecurityContext";
import AuthScreen from "./components/AuthScreen";

function App() {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const { activeView, restoreWorkspace } = useWorkspace();
  const { currentUser, login } = useSecurity();

  if (!currentUser) {
    return <AuthScreen onLogin={login} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case "ROOM":
        return <WorkspaceRoom />;
      case "ADR":
        return <ADRReviewWorkspace />;
      case "ARCHIVE":
        return <ArchiveView onRestore={restoreWorkspace} />;
      case "SECURITY":
        return <SecurityDashboard />;
      default:
        return <WorkspaceRoom />;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "nowrap",
        width: "100vw",
        height: "100vh",
        backgroundColor: "var(--bg-dark)",
        color: "var(--text-main)",
        overflow: "hidden",
      }}
    >
      <div className="desktop-only" style={{ height: "100%" }}>
        <Sidebar />
      </div>
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          position: "relative",
        }}
      >
        {renderContent()}
      </main>

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />
    </div>
  );
}

export default App;
