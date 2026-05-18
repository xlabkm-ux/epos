import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      include: ["src/**/*.ts"],
    },
  },
  resolve: {
    alias: {
      "@epios/domain": path.resolve(__dirname, "../domain/src"),
      "@epios/ports": path.resolve(__dirname, "../ports/src"),
      "@epios/observability": path.resolve(__dirname, "../observability/src"),
      "@epios/infrastructure-runtime": path.resolve(
        __dirname,
        "../infrastructure-runtime/src",
      ),
    },
  },
});
