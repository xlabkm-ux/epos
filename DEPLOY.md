# 🚀 DEPLOYMENT GUIDE: Epistemic OS (epios)

This guide describes how to set up and run the Epistemic OS environment for development and demonstration.

## 📋 Prerequisites

Ensure you have the following installed:
- **Node.js**: >= 22.0.0
- **pnpm**: >= 9.12.0
- **Docker & Docker Compose**: For running PostgreSQL.

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd epios
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:
   Copy the example environment file and adjust if necessary:
   ```bash
   cp .env.example .env
   ```
   *Note: The default `.env` is configured to work with the local Docker PostgreSQL.*

## 🗄️ Database Setup

1. **Start PostgreSQL**:
   ```bash
   pnpm db:up
   ```

2. **Initialize the database** (Run migrations and seed initial data):
   ```bash
   pnpm db:init
   ```
   *If you need to reset the database entirely:*
   ```bash
   pnpm db:reset
   ```

## 🏃 Running the Application

1. **Start the development servers**:
   ```bash
   pnpm dev
   ```
   This will start the API server and the Demo Shell in parallel.

2. **Access the UI**:
   - **Demo Shell**: [http://localhost:5173](http://localhost:5173) (default Vite port)
   - **API Server**: [http://localhost:3000](http://localhost:3000)

## 🧪 Testing and Quality Assurance

To ensure the system is working correctly, run the verification suite:

- **Run all checks** (lint, typecheck, tests, architecture):
  ```bash
  pnpm verify
  ```

- **Run ADR Review QA** (Full E2E and Trace validation):
  ```bash
  pnpm qa:adr-review
  ```

- **Individual test layers**:
  - `pnpm test:domain`: Domain invariants.
  - `pnpm test:contracts`: API schema validation.
  - `pnpm test:postgres`: Database integration.
  - `pnpm test:security`: MCP and authorization checks.
  - `pnpm test:e2e`: Playwright browser tests.

## 📦 Production Build

To build the project for production:
```bash
pnpm build
```

---
*Last Updated: 2026-05-15*
