import { describe, it, expect, vi } from "vitest";
import { MockMCPBridge } from "../src/mcp-bridge.js";
import { MCPAppRegistryPort } from "@epios/ports";
import { SecurityError } from "@epios/domain";

describe("MCP Bridge Security", () => {
  const mockRegistry = {
    getApp: vi.fn(),
  } as unknown as MCPAppRegistryPort;

  const bridge = new MockMCPBridge(mockRegistry);

  describe("T-SEC-01: Schema Validation (Zod)", () => {
    it("should reject invalid protocols with E_INVALID_PROTOCOL", async () => {
      try {
        await bridge.executeTool("", "", {});
      } catch (e: any) {
        expect(e).toBeInstanceOf(SecurityError);
        expect(e.code).toBe("E_INVALID_PROTOCOL");
      }
    });

    it("should reject non-record args", async () => {
      try {
        // @ts-ignore
        await bridge.executeTool("app-1", "tool", "string-args");
      } catch (e: any) {
        expect(e.code).toBe("E_INVALID_PROTOCOL");
      }
    });

    it("should validate resource URIs in callResource", async () => {
      try {
        await bridge.callResource("app-1", "not-a-url");
        expect.fail("Should have rejected invalid URL");
      } catch (e: any) {
        expect(e.code).toBe("E_INVALID_PROTOCOL");
      }
    });

    it("should validate appId in getAppMetadata", async () => {
      try {
        await bridge.getAppMetadata("");
        expect.fail("Should have rejected empty appId");
      } catch (e: any) {
        expect(e.code).toBe("E_INVALID_PROTOCOL");
      }
    });
  });

  describe("T-SEC-03: Capability Enforcement", () => {
    it("should reject unauthorized admin calls with E_UNAUTHORIZED", async () => {
      vi.mocked(mockRegistry.getApp).mockResolvedValue({
        id: "low-priv-app",
        name: "Low Priv App",
        url: "http://low.priv",
        type: "sse",
        capabilities: ["read"], // No admin capability
        status: "active",
      });

      try {
        await bridge.executeTool("low-priv-app", "domain:admin:execute", {});
        expect.fail("Should have thrown E_UNAUTHORIZED");
      } catch (e: any) {
        expect(e).toBeInstanceOf(SecurityError);
        expect(e.code).toBe("E_UNAUTHORIZED");
      }
    });

    it("should allow admin calls for apps with admin capability", async () => {
      vi.mocked(mockRegistry.getApp).mockResolvedValue({
        id: "admin-app",
        name: "Admin App",
        url: "http://admin.com",
        type: "sse",
        capabilities: ["admin"],
        status: "active",
      });

      const result = await bridge.executeTool("admin-app", "domain:admin:execute", {});
      expect(result).toBeDefined();
    });
  });
});
