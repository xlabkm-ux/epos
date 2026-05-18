import {
  Workspace,
  WorkspaceStatus,
  WorkspaceMode,
  WorkspaceSensitivity,
  ConcurrencyError,
} from "@epios/domain";
import { WorkspaceRepositoryPort } from "@epios/ports";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { workspaces } from "./schema.js";
import { eq, sql, and } from "drizzle-orm";

export class PostgresWorkspaceRepository implements WorkspaceRepositoryPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  async save(workspace: Workspace): Promise<void> {
    const existing = await this.findById(workspace.id);

    if (!existing) {
      await this.db.insert(workspaces).values({
        id: workspace.id,
        title: workspace.title,
        status: workspace.status,
        mode: workspace.mode,
        sensitivity: workspace.sensitivity,
        goal: workspace.brief.goal,
        context: workspace.brief.context,
        successCriteria: workspace.brief.successCriteria,
        constraints: workspace.brief.constraints,
        unknowns: workspace.brief.unknowns,
        desiredArtifactType: workspace.desiredArtifactType,
        createdByType: workspace.createdBy.type,
        createdById: workspace.createdBy.id,
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
        version: 1,
        isPinned: workspace.isPinned ?? false,
        archivedAt: workspace.archivedAt,
        archiveComment: workspace.archiveComment,
      });
    } else {
      const result = await this.db
        .update(workspaces)
        .set({
          title: workspace.title,
          status: workspace.status,
          mode: workspace.mode,
          sensitivity: workspace.sensitivity,
          goal: workspace.brief.goal,
          context: workspace.brief.context,
          successCriteria: workspace.brief.successCriteria,
          constraints: workspace.brief.constraints,
          unknowns: workspace.brief.unknowns,
          desiredArtifactType: workspace.desiredArtifactType,
          updatedAt: workspace.updatedAt,
          version: workspace.version,
          isPinned: workspace.isPinned ?? false,
          archivedAt: workspace.archivedAt ?? null,
          archiveComment: workspace.archiveComment ?? null,
        })

        .where(
          and(
            eq(workspaces.id, workspace.id),
            eq(workspaces.version, existing.version),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new ConcurrencyError(
          `Workspace ${workspace.id} was modified by another process (expected version ${workspace.version})`,
        );
      }
    }
  }

  async findById(id: string): Promise<Workspace | null> {
    const [record] = await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, id));

    if (!record) return null;

    return this.mapToDomain(record);
  }

  async findAll(): Promise<Workspace[]> {
    try {
      const records = await this.db.select().from(workspaces);
      return records.map((record) => this.mapToDomain(record));
    } catch (error) {
      console.error("PostgresWorkspaceRepository.findAll error:", error);
      throw error;
    }
  }

  private mapToDomain(record: typeof workspaces.$inferSelect): Workspace {
    return new Workspace({
      id: record.id,
      title: record.title,
      status: record.status as WorkspaceStatus,
      mode: record.mode as WorkspaceMode,
      sensitivity: record.sensitivity as WorkspaceSensitivity,
      brief: {
        goal: record.goal,
        context: record.context ?? undefined,
        successCriteria: record.successCriteria as string[],
        constraints: record.constraints as string[],
        unknowns: record.unknowns as string[],
      },
      desiredArtifactType: record.desiredArtifactType ?? undefined,
      createdBy: {
        type: record.createdByType,
        id: record.createdById,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      version: record.version,
      isPinned: record.isPinned,
      archivedAt: record.archivedAt ?? undefined,
      archiveComment: record.archiveComment ?? undefined,
    });
  }
}
