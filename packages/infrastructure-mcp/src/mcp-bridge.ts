import { MCPBridgePort, MCPAppRegistryPort } from "@epios/ports";
import { SecurityError } from "@epios/domain";
import { ExecuteToolSchema, CallResourceSchema, GetAppMetadataSchema } from "./schemas.js";

/**
 * Hardened MCP Bridge implementation.
 * Ensures all tool executions are validated against strict schemas.
 */
export class MockMCPBridge implements MCPBridgePort {
  constructor(private registry: MCPAppRegistryPort) {}

  async executeTool(
    appId: string,
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<unknown> {
    // Directive 5.2: Strict validation of tool execution arguments
    const validation = ExecuteToolSchema.safeParse({ appId, toolName, args });
    if (!validation.success) {
      throw new SecurityError(
        `Invalid MCP execution request: ${validation.error.message}`,
        "E_INVALID_PROTOCOL",
      );
    }

    const app = await this.registry.getApp(appId);
    if (!app) {
      throw new Error(`MCP Application ${appId} not found`);
    }

    // T-SEC-03: Capability Enforcement
    if (toolName.startsWith("domain:admin") && !app.capabilities.includes("admin")) {
      throw new SecurityError(
        `App ${appId} lacks required capability for ${toolName}`,
        "E_UNAUTHORIZED",
      );
    }

    // Mock execution logic
    console.log(
      `Executing tool ${toolName} on app ${app.name} with args:`,
      args,
    );

    if (toolName === "submit_claim") {
      return {
        success: true,
        claimId: `claim-${Math.random().toString(36).substr(2, 9)}`,
        status: "pending",
      };
    }

    return { success: true, result: "Mock result" };
  }

  async callResource(appId: string, resourceUri: string): Promise<unknown> {
    const validation = CallResourceSchema.safeParse({ appId, resourceUri });
    if (!validation.success) {
      throw new SecurityError(
        `Invalid CallResource request: ${validation.error.message}`,
        "E_INVALID_PROTOCOL",
      );
    }

    const app = await this.registry.getApp(appId);
    if (!app) {
      throw new Error(`MCP Application ${appId} not found`);
    }

    return { uri: resourceUri, content: "Mock resource content" };
  }

  async getAppMetadata(appId: string): Promise<unknown> {
    const validation = GetAppMetadataSchema.safeParse({ appId });
    if (!validation.success) {
      throw new SecurityError(
        `Invalid GetAppMetadata request: ${validation.error.message}`,
        "E_INVALID_PROTOCOL",
      );
    }

    const app = await this.registry.getApp(appId);
    if (!app) {
      throw new Error(`MCP Application ${appId} not found`);
    }

    return {
      version: "1.0.0",
      capabilities: app.capabilities,
      tools: [
        {
          name: "submit_claim",
          description: "Submit a new claim to the workspace",
        },
        {
          name: "add_evidence",
          description: "Add evidence to an existing node",
        },
      ],
    };
  }
}
