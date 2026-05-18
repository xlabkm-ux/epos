import { User, UserRole, Assignment, OrgUnit, OrgPosition, WorkPlaceRole } from "@epios/domain";
import { IdentityRepositoryPort, AssignmentRepositoryPort, OrgRepositoryPort } from "@epios/ports";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { identities, userAssignments, orgUnits, orgPositions } from "./schema.js";
import { eq } from "drizzle-orm";

export class PostgresIdentityRepository implements IdentityRepositoryPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<User | null> {
    const [record] = await this.db
      .select()
      .from(identities)
      .where(eq(identities.id, id));

    if (!record) return null;

    return {
      id: record.id,
      username: record.username,
      email: record.email,
      role: record.role as UserRole,
      isActive: record.isActive === 1,
      createdAt: record.createdAt,
      passwordHash: record.passwordHash || undefined,
    };
  }

  async findByUsername(username: string): Promise<User | null> {
    const [record] = await this.db
      .select()
      .from(identities)
      .where(eq(identities.username, username));

    if (!record) return null;

    return {
      id: record.id,
      username: record.username,
      email: record.email,
      role: record.role as UserRole,
      isActive: record.isActive === 1,
      createdAt: record.createdAt,
      passwordHash: record.passwordHash || undefined,
    };
  }

  async save(user: User): Promise<void> {
    await this.db
      .insert(identities)
      .values({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive ? 1 : 0,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
      })
      .onConflictDoUpdate({
        target: identities.id,
        set: {
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive ? 1 : 0,
          passwordHash: user.passwordHash,
        },
      });
  }

  async listAll(): Promise<User[]> {
    const records = await this.db.select().from(identities);
    return records.map((record) => ({
      id: record.id,
      username: record.username,
      email: record.email,
      role: record.role as UserRole,
      isActive: record.isActive === 1,
      createdAt: record.createdAt,
      passwordHash: record.passwordHash || undefined,
    }));
  }
}

export class PostgresAssignmentRepository implements AssignmentRepositoryPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  async findById(id: string): Promise<Assignment | null> {
    const [record] = await this.db
      .select()
      .from(userAssignments)
      .where(eq(userAssignments.id, id));

    if (!record) return null;

    return new Assignment({
      id: record.id,
      userId: record.userId,
      unitId: record.unitId || undefined,
      positionId: record.positionId || undefined,
      role: record.role as WorkPlaceRole,
      workspaceId: record.workspaceId || undefined,
      isActive: record.isActive,
      createdAt: record.createdAt,
    });
  }

  async findByUserId(userId: string): Promise<Assignment[]> {
    const records = await this.db
      .select()
      .from(userAssignments)
      .where(eq(userAssignments.userId, userId));

    return records.map(
      (record) =>
        new Assignment({
          id: record.id,
          userId: record.userId,
          unitId: record.unitId || undefined,
          positionId: record.positionId || undefined,
          role: record.role as WorkPlaceRole,
          workspaceId: record.workspaceId || undefined,
          isActive: record.isActive,
          createdAt: record.createdAt,
        })
    );
  }

  async save(assignment: Assignment): Promise<void> {
    await this.db
      .insert(userAssignments)
      .values({
        id: assignment.id,
        userId: assignment.userId,
        unitId: assignment.unitId,
        positionId: assignment.positionId,
        role: assignment.role,
        workspaceId: assignment.workspaceId,
        isActive: assignment.isActive,
        createdAt: assignment.createdAt,
      })
      .onConflictDoUpdate({
        target: userAssignments.id,
        set: {
          userId: assignment.userId,
          unitId: assignment.unitId,
          positionId: assignment.positionId,
          role: assignment.role,
          workspaceId: assignment.workspaceId,
          isActive: assignment.isActive,
        },
      });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(userAssignments).where(eq(userAssignments.id, id));
  }

  async listAll(): Promise<Assignment[]> {
    const records = await this.db.select().from(userAssignments);
    return records.map(
      (record) =>
        new Assignment({
          id: record.id,
          userId: record.userId,
          unitId: record.unitId || undefined,
          positionId: record.positionId || undefined,
          role: record.role as WorkPlaceRole,
          workspaceId: record.workspaceId || undefined,
          isActive: record.isActive,
          createdAt: record.createdAt,
        })
    );
  }
}

export class PostgresOrgRepository implements OrgRepositoryPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  async listUnits(): Promise<OrgUnit[]> {
    const records = await this.db.select().from(orgUnits);
    return records.map((r) => ({
      id: r.id,
      name: r.name,
      parentId: r.parentId || undefined,
    }));
  }

  async listPositions(): Promise<OrgPosition[]> {
    const records = await this.db.select().from(orgPositions);
    return records.map((r) => ({
      id: r.id,
      name: r.name,
      level: r.level,
    }));
  }

  async saveUnit(unit: OrgUnit): Promise<void> {
    await this.db
      .insert(orgUnits)
      .values({
        id: unit.id,
        name: unit.name,
        parentId: unit.parentId,
      })
      .onConflictDoUpdate({
        target: orgUnits.id,
        set: { name: unit.name, parentId: unit.parentId },
      });
  }

  async savePosition(position: OrgPosition): Promise<void> {
    await this.db
      .insert(orgPositions)
      .values({
        id: position.id,
        name: position.name,
        level: position.level,
      })
      .onConflictDoUpdate({
        target: orgPositions.id,
        set: { name: position.name, level: position.level },
      });
  }

  async deleteUnit(id: string): Promise<void> {
    await this.db.delete(orgUnits).where(eq(orgUnits.id, id));
  }

  async deletePosition(id: string): Promise<void> {
    await this.db.delete(orgPositions).where(eq(orgPositions.id, id));
  }
}
