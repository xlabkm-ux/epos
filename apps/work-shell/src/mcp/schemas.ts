import { z } from "zod";

export const McpRequestSchema = z.object({
  type: z.literal("MCP_REQUEST"),
  id: z.string().uuid(), // Используется как Nonce для защиты от replay
  method: z.string(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export const McpResponseSchema = z.object({
  type: z.literal("MCP_RESPONSE"),
  id: z.string().uuid(), // Должен совпадать с ID запроса
  status: z.enum(["success", "error"]),
  data: z.record(z.string(), z.unknown()).optional(),
  error: z.string().optional(),
});

export type McpRequest = z.infer<typeof McpRequestSchema>;
export type McpResponse = z.infer<typeof McpResponseSchema>;
