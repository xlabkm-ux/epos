import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "reactflow/dist/style.css";
import "./i18n";

import { WorkspaceProvider } from "./context/WorkspaceContext";
import { SecurityProvider } from "./context/SecurityContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SecurityProvider>
      <WorkspaceProvider>
        <App />
      </WorkspaceProvider>
    </SecurityProvider>
  </React.StrictMode>,
);
