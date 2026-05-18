import { User, UserRole, AuditRecord, WorkPlace } from "@epios/domain";

export interface SecurityPort {
  getCurrentUser(): Promise<User | null>;
  getCurrentWorkPlace(): Promise<WorkPlace | null>;
  authorize(role: UserRole, action: string, resource: string): Promise<boolean>;
  logAudit(record: Omit<AuditRecord, "id" | "timestamp">): Promise<void>;
  listAuditLogs(filters: {
    actorId?: string;
    resourceType?: string;
  }): Promise<AuditRecord[]>;
  
  // Commercial Hardening methods
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  generateToken(user: User): Promise<string>;
  verifyToken(token: string): Promise<unknown>;
}
