import { MappingRun, MappingRunStatus } from "@epios/domain";
import { MappingRepositoryPort } from "@epios/ports";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { mappingRuns } from "./schema.js";
import { eq } from "drizzle-orm";

export class PostgresMappingRepository implements MappingRepositoryPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  async save(run: MappingRun): Promise<void> {
    const existing = await this.findById(run.id);

    if (!existing) {
      await this.db.insert(mappingRuns).values({
        id: run.id,
        workspaceId: run.workspaceId,
        missionId: run.missionId,
        status: run.status,
        progress: run.progress,
        claimsFound: run.claimsFound,
        evidenceFound: run.evidenceFound,
        error: run.error,
        createdAt: run.createdAt,
        updatedAt: run.updatedAt,
        completedAt: run.completedAt,
      });
    } else {
      await this.db
        .update(mappingRuns)
        .set({
          status: run.status,
          progress: run.progress,
          claimsFound: run.claimsFound,
          evidenceFound: run.evidenceFound,
          error: run.error,
          updatedAt: run.updatedAt,
          completedAt: run.completedAt,
        })
        .where(eq(mappingRuns.id, run.id));
    }
  }

  async findById(id: string): Promise<MappingRun | null> {
    const [record] = await this.db
      .select()
      .from(mappingRuns)
      .where(eq(mappingRuns.id, id));

    if (!record) return null;

    return this.mapToDomain(record);
  }

  async findByWorkspaceId(workspaceId: string): Promise<MappingRun[]> {
    const records = await this.db
      .select()
      .from(mappingRuns)
      .where(eq(mappingRuns.workspaceId, workspaceId));

    return records.map(this.mapToDomain.bind(this));
  }

  async findAll(): Promise<MappingRun[]> {
    const records = await this.db.select().from(mappingRuns);
    return records.map(this.mapToDomain.bind(this));
  }

  private mapToDomain(record: typeof mappingRuns.$inferSelect): MappingRun {
    return {
      id: record.id,
      workspaceId: record.workspaceId,
      missionId: record.missionId,
      status: record.status as MappingRunStatus,
      progress: record.progress,
      claimsFound: record.claimsFound,
      evidenceFound: record.evidenceFound,
      error: record.error ?? undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      completedAt: record.completedAt ?? undefined,
    };
  }
}
