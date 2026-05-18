Owner: @architect
Status: archived

# Implementation Plan: Week 4 - Demo Shell & Mission Room

This plan covers the development of the frontend interface for Epistemic OS, focusing on the Demo Shell and the Mission Room UI.

## Goals
- [x] **Design System**: Establish a premium, dark-themed design system with CSS variables.
- [x] **Shell Layout**: Create a responsive sidebar-based layout for navigation and mission selection.
- [x] **Mission Room UI**: Implement the core workspace for interacting with epistemic graphs.
- [x] **Graph Visualization**: Develop an interactive visualization for nodes (EpistemicNodes) and edges/patches.
- [x] **API Integration**: Connect the UI to the existing backend services.

## Architecture
- **Framework**: React 18 with Vite.
- **Styling**: Vanilla CSS with modern features (Flexbox, Grid, Variables).
- **Visualization**: React Flow (if possible to install) or Custom SVG Visualization.
- **State Management**: React Context / Hooks.

## Tasks

### 1. Foundation & Styling
- [x] Define `:root` CSS variables in `index.css`.
- [x] Implement global reset and typography (Inter).
- [x] Create reusable UI components (Button, Card, Input, Modal).

### 2. Demo Shell Layout
- [x] `Sidebar`: Lists active missions and system status.
- [x] `Topbar`: User profile (mock), search, and global actions.
- [x] `MainContainer`: Content area for the current route.

### 3. Mission Room Implementation
- [x] `MissionHeader`: Title, status, and mission metadata.
- [x] `GraphCanvas`: The interactive area for node visualization.
- [x] `NodeProperties`: A drawer or panel for editing node details (Label, Content, Evidence).
- [x] `CommandPalette`: Shortcut-driven interface for adding nodes/edges.

### 4. Integration
- [x] Implement `useApi` hook for backend communication.
- [x] Fetch missions on load.
- [x] Implement real-time updates (mocked or polled for now).

## Visual Style
- **Background**: `#0a0a0f` (Deep Black/Blue)
- **Primary**: `#00f2ff` (Neon Cyan)
- **Secondary**: `#7000ff` (Electric Purple)
- **Accents**: Glassmorphism effects, subtle glow on active nodes.

