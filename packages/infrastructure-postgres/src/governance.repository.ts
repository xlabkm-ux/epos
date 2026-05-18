/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  GovernanceProcess,
  GovernanceStatus,
  NodePatch,
  ReadinessAssessment,
  ArtifactVersion,
  TraceEvent,
  ApprovalStatus,
  ReadinessStatus,
  ConcurrencyError,
} from "@epios/domain";
import { GovernanceRepositoryPort } from "@epios/ports";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  governanceProcesses,
  nodePatches,
  readinessAssessments,
  artifactVersions,
  traceEvents,
} from "./schema.js";
import { eq, sql, and, desc } from "drizzle-orm";
import { redact } from "@epios/observability";

export class PostgresGovernanceRepository implements GovernanceRepositoryPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  async saveProcess(process: GovernanceProcess): Promise<void> {
    const props = process.toProps();
    const existing = await this.findProcessByNodeId(props.nodeId);

    if (!existing) {
      await this.db.insert(governanceProcesses).values({
        nodeId: props.nodeId,
        workspaceId: props.workspaceId,
        status: props.status,
        votes: props.votes,
        requiredVotes: props.requiredVotes,
        patchId: (props as any).patchId,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        version: 1,
      });
    } else {
      const result = await this.db
        .update(governanceProcesses)
        .set({
          status: props.status,
          votes: props.votes,
          updatedAt: props.updatedAt,
          version: sql`${governanceProcesses.version} + 1`,
        })
        .where(
          and(
            eq(governanceProcesses.nodeId, props.nodeId),
            eq(governanceProcesses.version, props.version),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new ConcurrencyError(
          `Governance process for node ${props.nodeId} was modified by another process (expected version ${props.version})`,
        );
      }
    }
  }

  async findProcessByNodeId(nodeId: string): Promise<GovernanceProcess | null> {
    const [record] = await this.db
      .select()
      .from(governanceProcesses)
      .where(eq(governanceProcesses.nodeId, nodeId));

    if (!record) return null;

    return new GovernanceProcess({
      nodeId: record.nodeId,
      workspaceId: record.workspaceId,
      status: record.status as GovernanceStatus,
      votes: record.votes as any[],
      requiredVotes: record.requiredVotes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      version: record.version,
    });
  }

  async findProcessesByWorkspaceId(
    workspaceId: string,
  ): Promise<GovernanceProcess[]> {
    const records = await this.db
      .select()
      .from(governanceProcesses)
      .where(eq(governanceProcesses.workspaceId, workspaceId));

    return records.map(
      (record) =>
        new GovernanceProcess({
          nodeId: record.nodeId,
          workspaceId: record.workspaceId,
          status: record.status as GovernanceStatus,
          votes: record.votes as any[],
          requiredVotes: record.requiredVotes,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          version: record.version,
        }),
    );
  }

  async listPendingProcesses(): Promise<GovernanceProcess[]> {
    const records = await this.db
      .select()
      .from(governanceProcesses)
      .where(eq(governanceProcesses.status, "pending"));

    return records.map(
      (record) =>
        new GovernanceProcess({
          nodeId: record.nodeId,
          workspaceId: record.workspaceId,
          status: record.status as GovernanceStatus,
          votes: record.votes as any[],
          requiredVotes: record.requiredVotes,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          version: record.version,
        }),
    );
  }

  async savePatch(patch: NodePatch): Promise<void> {
    const props = patch.toProps();
    const existing = await this.findPatchById(props.id);

    if (!existing) {
      await this.db.insert(nodePatches).values({
        id: props.id,
        targetNodeId: props.targetNodeId,
        workspaceId: props.workspaceId,
        authorId: props.authorId,
        content: props.content,
        status: props.status,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        version: 1,
      });
    } else {
      const result = await this.db
        .update(nodePatches)
        .set({
          status: props.status,
          updatedAt: props.updatedAt,
          version: sql`${nodePatches.version} + 1`,
        })
        .where(
          and(
            eq(nodePatches.id, props.id),
            eq(nodePatches.version, props.version),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new ConcurrencyError(
          `Patch ${props.id} was modified by another process (expected version ${props.version})`,
        );
      }
    }
  }

  async findPatchById(id: string): Promise<NodePatch | null> {
    const [record] = await this.db
      .select()
      .from(nodePatches)
      .where(eq(nodePatches.id, id));

    if (!record) return null;

    return new NodePatch({
      id: record.id,
      targetNodeId: record.targetNodeId,
      workspaceId: record.workspaceId,
      authorId: record.authorId,
      content: record.content,
      status: record.status as any,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      version: record.version,
    });
  }

  async findPatchesByTargetNodeId(nodeId: string): Promise<NodePatch[]> {
    const records = await this.db
      .select()
      .from(nodePatches)
      .where(eq(nodePatches.targetNodeId, nodeId));

    return records.map(
      (record) =>
        new NodePatch({
          id: record.id,
          targetNodeId: record.targetNodeId,
          workspaceId: record.workspaceId,
          authorId: record.authorId,
          content: record.content,
          status: record.status as any,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          version: record.version,
        }),
    );
  }

  async findPatchesByWorkspaceId(workspaceId: string): Promise<NodePatch[]> {
    const records = await this.db
      .select()
      .from(nodePatches)
      .where(eq(nodePatches.workspaceId, workspaceId));

    return records.map(
      (record) =>
        new NodePatch({
          id: record.id,
          targetNodeId: record.targetNodeId,
          workspaceId: record.workspaceId,
          authorId: record.authorId,
          content: record.content,
          status: record.status as any,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          version: record.version,
        }),
    );
  }

  async saveReadiness(assessment: ReadinessAssessment): Promise<void> {
    await this.db
      .insert(readinessAssessments)
      .values({
        id: assessment.id,
        workspaceId: assessment.workspaceId,
        profileId: assessment.profileId,
        methodVersion: assessment.methodVersion,
        status: assessment.status,
        indicators: assessment.indicators,
        numericScore: assessment.numericScore,
        explanation: assessment.explanation,
        createdAt: assessment.createdAt,
      })
      .onConflictDoUpdate({
        target: readinessAssessments.id,
        set: {
          status: assessment.status,
          indicators: assessment.indicators,
          numericScore: assessment.numericScore,
          explanation: assessment.explanation,
        },
      });
  }

  async findReadinessByWorkspaceId(
    workspaceId: string,
  ): Promise<ReadinessAssessment | null> {
    const [record] = await this.db
      .select()
      .from(readinessAssessments)
      .where(eq(readinessAssessments.workspaceId, workspaceId));

    if (!record) return null;

    return {
      id: record.id,
      workspaceId: record.workspaceId,
      profileId: record.profileId,
      methodVersion: record.methodVersion,
      status: record.status as ReadinessStatus,
      indicators: record.indicators as any,
      numericScore: record.numericScore ?? undefined,
      explanation: record.explanation,
      createdAt: record.createdAt,
    };
  }

  async saveArtifactVersion(version: ArtifactVersion): Promise<void> {
    await this.db.insert(artifactVersions).values({
      id: version.id,
      artifactId: version.artifactId,
      workspaceId: version.workspaceId,
      version: version.version,
      content: version.content,
      contentHash: "",
      patchId: version.patchId,
      authorId: version.authorId,
      createdByType: "user",
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
      .where(eq(artifactVersions.artifactId, artifactId));

    return records.map((record) => ({
      id: record.id,
      artifactId: record.artifactId,
      workspaceId: record.workspaceId,
      version: record.version,
      content: record.content,
      authorId: record.authorId,
      patchId: record.patchId || undefined,
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
      patchId: record.patchId || undefined,
      createdAt: record.createdAt,
    };
  }

  async saveTraceEvent(event: TraceEvent): Promise<void> {
    const redactedMetadata = redact(event.metadata);
    await this.db.insert(traceEvents).values({
      id: event.id,
      workspaceId: event.workspaceId,
      type: event.type,
      actorId: event.actorId,
      targetId: event.targetId,
      metadata: redactedMetadata,
      timestamp: event.timestamp,
    });
  }

  async findTraceByWorkspaceId(workspaceId: string): Promise<TraceEvent[]> {
    const records = await this.db
      .select()
      .from(traceEvents)
      .where(eq(traceEvents.workspaceId, workspaceId));

    return records.map((record) => ({
      id: record.id,
      workspaceId: record.workspaceId,
      type: record.type,
      actorId: record.actorId,
      targetId: record.targetId,
      metadata: record.metadata as any,
      timestamp: record.timestamp,
    }));
  }
}
