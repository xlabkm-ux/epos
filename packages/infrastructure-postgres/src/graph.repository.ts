import {
  EpistemicNode,
  EpistemicEdge,
  NodeType,
  NodeStrength,
  EpistemicEdgeType,
  ConcurrencyError,
} from "@epios/domain";
import { GraphRepositoryPort } from "@epios/ports";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { epistemicNodes, epistemicEdges } from "./schema.js";
import { eq, sql, and } from "drizzle-orm";

export class PostgresGraphRepository implements GraphRepositoryPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  async saveNode(node: EpistemicNode): Promise<void> {
    const existing = await this.findNodeById(node.id);

    if (!existing) {
      await this.db.insert(epistemicNodes).values({
        id: node.id,
        workspaceId: node.workspaceId,
        missionId: node.missionId,
        type: node.type,
        content: node.content,
        strength: node.strength,
        evidenceSetId: node.evidenceSetId,
        metadata: node.metadata,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        version: 1,
        createdById: node.createdById ?? "system",
      });
    } else {
      const result = await this.db
        .update(epistemicNodes)
        .set({
          type: node.type,
          content: node.content,
          strength: node.strength,
          evidenceSetId: node.evidenceSetId,
          metadata: node.metadata,
          updatedAt: node.updatedAt,
          version: sql`${epistemicNodes.version} + 1`,
        })
        .where(
          and(
            eq(epistemicNodes.id, node.id),
            eq(epistemicNodes.version, node.version),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new ConcurrencyError(
          `Node ${node.id} was modified by another process (expected version ${node.version})`,
        );
      }
    }
  }

  async saveEdge(edge: EpistemicEdge): Promise<void> {
    await this.db
      .insert(epistemicEdges)
      .values({
        id: edge.id,
        workspaceId: edge.workspaceId,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        type: edge.type,
        metadata: edge.metadata,
        createdAt: edge.createdAt,
      })
      .onConflictDoUpdate({
        target: epistemicEdges.id,
        set: {
          type: edge.type,
          metadata: edge.metadata,
        },
      });
  }

  async deleteNode(id: string): Promise<boolean> {
    const result = await this.db
      .delete(epistemicNodes)
      .where(eq(epistemicNodes.id, id))
      .returning();
    return result.length > 0;
  }

  async deleteEdge(id: string): Promise<boolean> {
    const result = await this.db
      .delete(epistemicEdges)
      .where(eq(epistemicEdges.id, id))
      .returning();
    return result.length > 0;
  }

  async findNodesByWorkspaceId(workspaceId: string): Promise<EpistemicNode[]> {
    const records = await this.db
      .select()
      .from(epistemicNodes)
      .where(eq(epistemicNodes.workspaceId, workspaceId));

    return records.map(
      (record) =>
        new EpistemicNode({
          id: record.id,
          workspaceId: record.workspaceId,
          missionId: record.missionId,
          type: record.type as NodeType,
          content: record.content,
          strength: record.strength as NodeStrength,
          evidenceSetId: record.evidenceSetId ?? undefined,
          metadata: record.metadata as Record<string, unknown>,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          version: record.version,
          createdById: record.createdById,
        }),
    );
  }

  async findEdgesByWorkspaceId(workspaceId: string): Promise<EpistemicEdge[]> {
    const records = await this.db
      .select()
      .from(epistemicEdges)
      .where(eq(epistemicEdges.workspaceId, workspaceId));

    return records.map((record) => ({
      id: record.id,
      workspaceId: record.workspaceId,
      sourceNodeId: record.sourceNodeId,
      targetNodeId: record.targetNodeId,
      type: record.type as EpistemicEdgeType,
      metadata: record.metadata as Record<string, unknown>,
      createdAt: record.createdAt,
    }));
  }

  async findNodeById(id: string): Promise<EpistemicNode | null> {
    const [record] = await this.db
      .select()
      .from(epistemicNodes)
      .where(eq(epistemicNodes.id, id));

    if (!record) return null;

    return new EpistemicNode({
      id: record.id,
      workspaceId: record.workspaceId,
      missionId: record.missionId,
      type: record.type as NodeType,
      content: record.content,
      strength: record.strength as NodeStrength,
      evidenceSetId: record.evidenceSetId ?? undefined,
      metadata: record.metadata as Record<string, unknown>,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      version: record.version,
      createdById: record.createdById,
    });
  }

  async findEdgeById(id: string): Promise<EpistemicEdge | null> {
    const [record] = await this.db
      .select()
      .from(epistemicEdges)
      .where(eq(epistemicEdges.id, id));

    if (!record) return null;

    return {
      id: record.id,
      workspaceId: record.workspaceId,
      sourceNodeId: record.sourceNodeId,
      targetNodeId: record.targetNodeId,
      type: record.type as EpistemicEdgeType,
      metadata: record.metadata as Record<string, unknown>,
      createdAt: record.createdAt,
    };
  }

  async findAllNodes(): Promise<EpistemicNode[]> {
    const records = await this.db.select().from(epistemicNodes);

    return records.map(
      (record) =>
        new EpistemicNode({
          id: record.id,
          workspaceId: record.workspaceId,
          missionId: record.missionId,
          type: record.type as NodeType,
          content: record.content,
          strength: record.strength as NodeStrength,
          evidenceSetId: record.evidenceSetId ?? undefined,
          metadata: record.metadata as Record<string, unknown>,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          version: record.version,
          createdById: record.createdById,
        }),
    );
  }
}
