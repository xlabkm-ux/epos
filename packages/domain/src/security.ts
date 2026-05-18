import { User, UserRole } from "./identity.js";

export type { User, UserRole };

export interface Permission {
  action: string;
  resource: string;
}

export interface RetentionPolicy {
  id: string;
  resourceType: string;
  retentionDays: number;
  action: "delete" | "archive" | "redact";
}

export interface RedactionRule {
  id: string;
  pattern: string; // Regex pattern for PII/Sensitive data
  replacement: string; // Usually "[REDACTED]"
  description: string;
}

export interface AuditRecord {
  id: string;
  timestamp: Date;
  actorId: string;
  action: string;
  resourceId: string;
  resourceType: string;
  details: Record<string, unknown>;
}
