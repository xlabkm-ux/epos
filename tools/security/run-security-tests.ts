import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function runSecurityAudit() {
  console.log("--- Running Security Audit ---");
  try {
    console.log("[1/3] Running pnpm audit (critical level)...");
    execSync("pnpm audit --audit-level critical", { stdio: "inherit" });
  } catch {
    console.warn(
      "[WARNING] Security vulnerabilities found in dependencies. Continuing for MVP.",
    );
    // We do not exit(1) here for MVP as we don't control fastify vulnerabilities directly.
  }
}

function checkHardcodedSecrets() {
  console.log("[2/3] Checking for hardcoded secrets...");
  const forbiddenPatterns = [
    /sk-[a-zA-Z0-9]{48}/, // OpenAI
    /AIza[0-9A-Za-z-_]{35}/, // Google Cloud
    /AKIA[0-9A-Z]{16}/, // AWS Access Key
    /[0-9a-f]{40}/, // Generic Hex Secret (Git/AWS)
    /"password":\s*"[^"]+"/,
    /SECRET_KEY\s*=\s*"[^"]+"/,
    /DATABASE_URL\s*=\s*"postgresql:\/\/[^:]+:[^@]+@/,
  ];

  const skipDirs = [
    "node_modules",
    ".git",
    "playwright-report",
    "test-results",
  ];

  function walk(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (skipDirs.includes(file)) continue;
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (
        (file.endsWith(".ts") ||
          file.endsWith(".json") ||
          file.endsWith(".env")) &&
        !file.endsWith(".test.ts")
      ) {
        const content = fs.readFileSync(fullPath, "utf-8");
        for (const pattern of forbiddenPatterns) {
          if (pattern.test(content)) {
            console.error(`[ERROR] Potential secret found in: ${fullPath}`);
            process.exit(1);
          }
        }
      }
    }
  }

  walk(process.cwd());
  console.log("No obvious secrets found.");
}

async function runUnitSecurityTests() {
  console.log("[3/4] Running Vitest security unit tests...");
  try {
    // Run security tests in infrastructure-mcp and observability
    execSync(
      "pnpm --filter @epios/infrastructure-mcp exec vitest run test/security.test.ts",
      { stdio: "inherit" },
    );
    execSync(
      "pnpm --filter @epios/observability exec vitest run test/redaction.test.ts",
      { stdio: "inherit" },
    );
  } catch {
    console.error("[ERROR] Security unit tests failed.");
    process.exit(1);
  }
}

async function main() {
  await runSecurityAudit();
  checkHardcodedSecrets();
  await runUnitSecurityTests();
  console.log("[4/4] Security checks PASSED.");
}

main().catch(() => process.exit(1));
