import { z } from "zod";

/**
 * MCP Bridge Message Schemas
 * These schemas define the strict protocol for postMessage communication
 * and API-level tool execution.
 */

export const McpRequestSchema = z.object({
  type: z.literal("MCP_REQUEST"),
  id: z.string().uuid(), // Used as Nonce for replay protection
  method: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export const McpResponseSchema = z.object({
  type: z.literal("MCP_RESPONSE"),
  id: z.string().uuid(), // Must match request ID
  status: z.enum(["success", "error"]),
  data: z.record(z.string(), z.unknown()).optional(),
  error: z.string().optional(),
});

export const ExecuteToolSchema = z.object({
  appId: z.string().min(1),
  toolName: z.string().min(1),
  args: z.record(z.string(), z.unknown()),
});

export const CallResourceSchema = z.object({
  appId: z.string().min(1),
  resourceUri: z.string().url(),
});

export const GetAppMetadataSchema = z.object({
  appId: z.string().min(1),
});

export type McpRequest = z.infer<typeof McpRequestSchema>;
export type McpResponse = z.infer<typeof McpResponseSchema>;
export type ExecuteTool = z.infer<typeof ExecuteToolSchema>;
export type CallResource = z.infer<typeof CallResourceSchema>;
export type GetAppMetadata = z.infer<typeof GetAppMetadataSchema>;
