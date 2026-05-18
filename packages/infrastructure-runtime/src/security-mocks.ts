import { randomUUID } from "node:crypto";
import { User, UserRole, AuditRecord, WorkPlace } from "@epios/domain";
import { SecurityPort, IdentityRepositoryPort, AssignmentRepositoryPort } from "@epios/ports";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const { sign, verify } = jwt;

export class MockSecurityService implements SecurityPort {
  private currentUser: User | null = null;
  private currentWorkPlace: WorkPlace | null = null;
  private auditLogs: AuditRecord[] = [];
  private readonly jwtSecret: string;

  constructor(
    private identityRepo: IdentityRepositoryPort,
    private assignmentRepo?: AssignmentRepositoryPort,
  ) {
    this.jwtSecret = process.env.JWT_SECRET || "epios_default_secret_for_dev_only";
  }

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  async setCurrentWorkPlace(workplaceId: string | null) {
    if (!workplaceId || !this.assignmentRepo) {
      this.currentWorkPlace = null;
      return;
    }
    const assignment = await this.assignmentRepo.findById(workplaceId);
    this.currentWorkPlace = assignment ? new WorkPlace(assignment) : null;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }

  async getCurrentWorkPlace(): Promise<WorkPlace | null> {
    return this.currentWorkPlace;
  }

  async authorize(
    role: UserRole,
    _action: string,
    _resource: string,
  ): Promise<boolean> {
    if (!this.currentUser) return false;

    // S2: V2.3 Role Hierarchy
    const rolePower: Record<string, number> = {
      system: 6,
      admin: 5,
      owner: 4,
      reviewer: 3,
      approver: 3, // legacy
      contributor: 2,
      observer: 1,
      viewer: 1, // legacy
    };

    const userPower = rolePower[this.currentUser.role] || 0;
    const requiredPower = rolePower[role] || 0;

    return userPower >= requiredPower;
  }

  async logAudit(record: Omit<AuditRecord, "id" | "timestamp">): Promise<void> {
    const newRecord: AuditRecord = {
      ...record,
      id: randomUUID(),
      timestamp: new Date(),
    };
    this.auditLogs.push(newRecord);
    console.log(
      `[AUDIT] ${newRecord.timestamp.toISOString()} - ${newRecord.actorId} performed ${newRecord.action} on ${newRecord.resourceType}:${newRecord.resourceId}`,
    );
  }

  async listAuditLogs(filters: {
    actorId?: string;
    resourceType?: string;
  }): Promise<AuditRecord[]> {
    return this.auditLogs.filter((log) => {
      if (filters.actorId && log.actorId !== filters.actorId) return false;
      if (filters.resourceType && log.resourceType !== filters.resourceType)
        return false;
      return true;
    });
  }

  // Commercial Hardening implementation
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    if (hash === password) return true; // Legacy/Mock support
    if (hash.startsWith("hash:")) return hash === `hash:${password}`;
    return bcrypt.compare(password, hash);
  }

  async generateToken(user: User): Promise<string> {
    return sign({ id: user.id, username: user.username, role: user.role }, this.jwtSecret, {
      expiresIn: "24h",
    });
  }

  async verifyToken(token: string): Promise<unknown> {
    try {
      // Support legacy mock tokens for backward compatibility in dev
      if (token.startsWith("mock-token-")) {
        return { id: token.replace("mock-token-", "") };
      }
      return verify(token, this.jwtSecret);
    } catch (e: unknown) {
      throw new Error("INVALID_TOKEN", { cause: e });
    }
  }
}
