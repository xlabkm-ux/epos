/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Mission,
  MissionStatus,
  MissionMode,
  MissionRun,
  MissionRunStatus,
  MissionRunStage,
  ConcurrencyError,
} from "@epios/domain";
import { MissionRepositoryPort, MissionRunRepositoryPort } from "@epios/ports";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { missions, missionRuns } from "./schema.js";
import { eq, sql, and } from "drizzle-orm";

export class PostgresMissionRepository implements MissionRepositoryPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  async save(mission: Mission): Promise<void> {
    const existing = await this.findById(mission.id);

    if (!existing) {
      await this.db.insert(missions).values({
        id: mission.id,
        workspaceId: mission.workspaceId,
        title: mission.title,
        status: mission.status,
        mode: mission.mode,
        sensitivity: mission.sensitivity,
        goal: mission.brief.goal,
        context: mission.brief.context,
        successCriteria: mission.brief.successCriteria,
        constraints: mission.brief.constraints,
        unknowns: mission.brief.unknowns,
        desiredArtifactType: mission.brief.desiredArtifactType,
        createdByType: mission.createdBy.actorType,
        createdById: mission.createdBy.actorId,
        deletedAt: mission.deletedAt,
        createdAt: mission.createdAt,
        updatedAt: mission.updatedAt,
        version: 1,
      });
    } else {
      const result = await this.db
        .update(missions)
        .set({
          title: mission.title,
          status: mission.status,
          mode: mission.mode,
          sensitivity: mission.sensitivity,
          goal: mission.brief.goal,
          context: mission.brief.context,
          successCriteria: mission.brief.successCriteria,
          constraints: mission.brief.constraints,
          unknowns: mission.brief.unknowns,
          desiredArtifactType: mission.brief.desiredArtifactType,
          deletedAt: mission.deletedAt,
          updatedAt: mission.updatedAt,
          version: sql`${missions.version} + 1`,
        })
        .where(
          and(
            eq(missions.id, mission.id),
            eq(missions.version, mission.version),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new ConcurrencyError(
          `Mission ${mission.id} was modified by another process (expected version ${mission.version})`,
        );
      }
    }
  }

  async findById(id: string): Promise<Mission | null> {
    const [record] = await this.db
      .select()
      .from(missions)
      .where(eq(missions.id, id));

    if (!record) return null;

    return this.mapToDomain(record);
  }

  async findAll(): Promise<Mission[]> {
    const records = await this.db.select().from(missions);
    return records.map((record) => this.mapToDomain(record));
  }

  async findActiveByWorkspaceId(workspaceId: string): Promise<Mission[]> {
    const records = await this.db
      .select()
      .from(missions)
      .where(
        and(
          eq(missions.workspaceId, workspaceId),
          sql`${missions.deletedAt} IS NULL`,
        ),
      );
    return records.map((record) => this.mapToDomain(record));
  }

  private mapToDomain(record: typeof missions.$inferSelect): Mission {
    return new Mission({
      id: record.id,
      workspaceId: record.workspaceId,
      title: record.title,
      status: record.status as MissionStatus,
      mode: record.mode as MissionMode,
      sensitivity: record.sensitivity as "low" | "medium" | "high",
      brief: {
        goal: record.goal,
        context: record.context ?? undefined,
        successCriteria: record.successCriteria as string[],
        constraints: record.constraints as string[],
        unknowns: record.unknowns as string[],
        desiredArtifactType: record.desiredArtifactType ?? undefined,
      },
      artifactIds: [], // Loaded separately if needed
      runIds: [], // Loaded separately if needed
      createdBy: {
        actorType: record.createdByType as any,
        actorId: record.createdById,
      },
      deletedAt: record.deletedAt ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      version: record.version,
    });
  }
}

export class PostgresMissionRunRepository implements MissionRunRepositoryPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  async save(run: MissionRun): Promise<void> {
    const props = run.toProps();
    const existing = await this.findById(run.id);

    if (!existing) {
      await this.db.insert(missionRuns).values({
        id: props.id,
        missionId: props.missionId,
        status: props.status,
        currentStage: props.currentStage,
        idempotencyKey: props.idempotencyKey,
        startedByType: props.startedBy.actorType,
        startedById: props.startedBy.actorId,
        startedAt: props.startedAt,
        updatedAt: props.updatedAt,
        completedAt: props.completedAt,
        failureMessage: props.failedReason,
        pendingApprovalIds: props.pendingApprovalIds,
        version: 1,
      });
    } else {
      const result = await this.db
        .update(missionRuns)
        .set({
          status: props.status,
          currentStage: props.currentStage,
          updatedAt: props.updatedAt,
          completedAt: props.completedAt,
          failureMessage: props.failedReason,
          pendingApprovalIds: props.pendingApprovalIds,
          version: sql`${missionRuns.version} + 1`,
        })
        .where(
          and(
            eq(missionRuns.id, props.id),
            eq(missionRuns.version, props.version),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new ConcurrencyError(
          `MissionRun ${props.id} was modified by another process (expected version ${props.version})`,
        );
      }
    }
  }

  async findById(id: string): Promise<MissionRun | null> {
    const [record] = await this.db
      .select()
      .from(missionRuns)
      .where(eq(missionRuns.id, id));

    if (!record) return null;

    return this.mapToDomain(record);
  }

  async findByMissionId(missionId: string): Promise<MissionRun[]> {
    const records = await this.db
      .select()
      .from(missionRuns)
      .where(eq(missionRuns.missionId, missionId));

    return records.map((record) => this.mapToDomain(record));
  }

  private mapToDomain(record: typeof missionRuns.$inferSelect): MissionRun {
    return new MissionRun({
      id: record.id,
      missionId: record.missionId,
      status: record.status as MissionRunStatus,
      currentStage: (record.currentStage as MissionRunStage) || undefined,
      pendingApprovalIds: record.pendingApprovalIds as string[],
      idempotencyKey: record.idempotencyKey ?? undefined,
      startedBy: {
        actorType: record.startedByType as any,
        actorId: record.startedById,
      },
      startedAt: record.startedAt,
      updatedAt: record.updatedAt,
      completedAt: record.completedAt ?? undefined,
      failedReason: record.failureMessage ?? undefined,
      version: record.version,
    });
  }
}
