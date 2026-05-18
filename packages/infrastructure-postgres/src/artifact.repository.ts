/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LivingArtifact,
  ArtifactPatch,
  ArtifactVersion,
  ConcurrencyError,
} from "@epios/domain";
import { ArtifactRepositoryPort } from "@epios/ports";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  livingArtifacts,
  artifactVersions,
  artifactPatches,
  artifactPatchNodeRefs,
} from "./schema.js";
import { eq, sql, and, desc } from "drizzle-orm";

export class PostgresArtifactRepository implements ArtifactRepositoryPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  async saveArtifact(artifact: LivingArtifact): Promise<void> {
    const props = artifact.toProps();
    const existing = await this.findArtifactById(artifact.id);

    if (!existing) {
      await this.db.insert(livingArtifacts).values({
        id: props.id,
        missionId: props.missionId,
        artifactType: props.artifactType,
        title: props.title,
        currentVersion: props.currentVersion,
        status: props.status,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        version: 1,
      });
    } else {
      const result = await this.db
        .update(livingArtifacts)
        .set({
          title: props.title,
          currentVersion: props.currentVersion,
          status: props.status,
          updatedAt: props.updatedAt,
          version: sql`${livingArtifacts.version} + 1`,
        })
        .where(
          and(
            eq(livingArtifacts.id, props.id),
            eq(livingArtifacts.version, (artifact as any).props.version || 1), // Assuming version is in props or handled elsewhere
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new ConcurrencyError(
          `Artifact ${props.id} was modified by another process`,
        );
      }
    }
  }

  async findArtifactById(id: string): Promise<LivingArtifact | null> {
    const [record] = await this.db
      .select()
      .from(livingArtifacts)
      .where(eq(livingArtifacts.id, id));

    if (!record) return null;

    return new LivingArtifact({
      id: record.id,
      missionId: record.missionId,
      artifactType: record.artifactType as any,
      title: record.title,
      currentVersion: record.currentVersion,
      status: record.status as any,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async findArtifactsByMissionId(missionId: string): Promise<LivingArtifact[]> {
    const records = await this.db
      .select()
      .from(livingArtifacts)
      .where(eq(livingArtifacts.missionId, missionId));

    return records.map(
      (record) =>
        new LivingArtifact({
          id: record.id,
          missionId: record.missionId,
          artifactType: record.artifactType as any,
          title: record.title,
          currentVersion: record.currentVersion,
          status: record.status as any,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        }),
    );
  }

  async savePatch(patch: ArtifactPatch): Promise<void> {
    const props = patch.toProps();
    const existing = await this.findPatchById(patch.id);

    if (!existing) {
      await this.db.insert(artifactPatches).values({
        id: props.id,
        artifactId: props.artifactId,
        missionId: props.missionId,
        baseVersion: props.baseVersion,
        targetVersion: (props as any).targetVersion || null,
        diff: props.diff,
        reason: props.reason,
        riskClass: props.riskClass,
        status: props.status,
        authorType: props.author.actorType,
        authorId: props.author.actorId,
        createdAt: props.createdAt,
        appliedAt: props.appliedAt,
        version: 1,
      });

      if (props.nodeRefs.length > 0) {
        await this.db.insert(artifactPatchNodeRefs).values(
          props.nodeRefs.map((nodeId) => ({
            patchId: props.id,
            nodeId,
          })),
        );
      }
    } else {
      const result = await this.db
        .update(artifactPatches)
        .set({
          status: props.status,
          appliedAt: props.appliedAt,
          version: sql`${artifactPatches.version} + 1`,
        })
        .where(
          and(
            eq(artifactPatches.id, props.id),
            eq(artifactPatches.version, (patch as any).props.version || 1),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new ConcurrencyError(
          `ArtifactPatch ${props.id} was modified by another process`,
        );
      }

      // Update node refs if needed (for simplicity, we clear and re-insert)
      await this.db
        .delete(artifactPatchNodeRefs)
        .where(eq(artifactPatchNodeRefs.patchId, props.id));
      if (props.nodeRefs.length > 0) {
        await this.db.insert(artifactPatchNodeRefs).values(
          props.nodeRefs.map((nodeId) => ({
            patchId: props.id,
            nodeId,
          })),
        );
      }
    }
  }

  async findPatchById(id: string): Promise<ArtifactPatch | null> {
    const [record] = await this.db
      .select()
      .from(artifactPatches)
      .where(eq(artifactPatches.id, id));

    if (!record) return null;

    const nodeRefs = await this.db
      .select()
      .from(artifactPatchNodeRefs)
      .where(eq(artifactPatchNodeRefs.patchId, id));

    return new ArtifactPatch({
      id: record.id,
      artifactId: record.artifactId,
      missionId: record.missionId,
      baseVersion: record.baseVersion,
      diff: record.diff,
      reason: record.reason,
      nodeRefs: nodeRefs.map((r) => r.nodeId),
      evidenceRefs: [], // Not currently stored in a separate table, maybe in metadata?
      decisionRefs: [], // Same as above
      riskClass: record.riskClass as any,
      author: {
        actorType: record.authorType as any,
        actorId: record.authorId,
      },
      status: record.status as any,
      createdAt: record.createdAt,
      appliedAt: record.appliedAt ?? undefined,
    });
  }

  async findPatchesByArtifactId(artifactId: string): Promise<ArtifactPatch[]> {
    const records = await this.db
      .select()
      .from(artifactPatches)
      .where(eq(artifactPatches.artifactId, artifactId));

    const patches: ArtifactPatch[] = [];
    for (const record of records) {
      const nodeRefs = await this.db
        .select()
        .from(artifactPatchNodeRefs)
        .where(eq(artifactPatchNodeRefs.patchId, record.id));

      patches.push(
        new ArtifactPatch({
          id: record.id,
          artifactId: record.artifactId,
          missionId: record.missionId,
          baseVersion: record.baseVersion,
          diff: record.diff,
          reason: record.reason,
          nodeRefs: nodeRefs.map((r) => r.nodeId),
          evidenceRefs: [],
          decisionRefs: [],
          riskClass: record.riskClass as any,
          author: {
            actorType: record.authorType as any,
            actorId: record.authorId,
          },
          status: record.status as any,
          createdAt: record.createdAt,
          appliedAt: record.appliedAt ?? undefined,
        }),
      );
    }
    return patches;
  }

  async saveVersion(version: ArtifactVersion): Promise<void> {
    await this.db.insert(artifactVersions).values({
      id: version.id,
      artifactId: version.artifactId,
      workspaceId: version.workspaceId,
      version: version.version,
      content: version.content,
      contentHash: sql`md5(${version.content})`,
      authorId: version.authorId,
      createdByType: "user", // Defaulting
      createdById: version.authorId,
      createdAt: version.createdAt,
    });
  }

  async findVersionsByArtifactId(
    artifactId: string,
  ): Promise<ArtifactVersion[]> {
    const records = await this.db
      .select()
      .from(artifactVersions)
      .where(eq(artifactVersions.artifactId, artifactId))
      .orderBy(desc(artifactVersions.version));

    return records.map((record) => ({
      id: record.id,
      artifactId: record.artifactId,
      workspaceId: record.workspaceId,
      version: record.version,
      content: record.content,
      authorId: record.authorId,
      createdAt: record.createdAt,
    }));
  }

  async getLatestVersion(artifactId: string): Promise<ArtifactVersion | null> {
    const [record] = await this.db
      .select()
      .from(artifactVersions)
      .where(eq(artifactVersions.artifactId, artifactId))
      .orderBy(desc(artifactVersions.version))
      .limit(1);

    if (!record) return null;

    return {
      id: record.id,
      artifactId: record.artifactId,
      workspaceId: record.workspaceId,
      version: record.version,
      content: record.content,
      authorId: record.authorId,
      createdAt: record.createdAt,
    };
  }
}
