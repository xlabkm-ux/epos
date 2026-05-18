import { Source, SourceType, SourceQuality } from "@epios/domain";
import { SourceRepositoryPort } from "@epios/ports";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { sources, sourceChunks } from "./schema.js";
import { eq, and, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export class PostgresSourceRepository implements SourceRepositoryPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  async save(source: Source): Promise<void> {
    const props = source.toProps();
    const existing = await this.findById(source.id);

    if (!existing) {
      await this.db.insert(sources).values({
        id: props.id,
        workspaceId: props.workspaceId,
        missionId: props.missionId,
        sourceType: props.sourceType,
        title: props.title,
        uri: props.uri,
        contentHash: props.contentHash,
        freshness: props.freshness,
        sourceQuality: props.sourceQuality,
        deletedAt: props.deletedAt,
        createdAt: props.createdAt,
      });
    } else {
      await this.db
        .update(sources)
        .set({
          workspaceId: props.workspaceId,
          sourceType: props.sourceType,
          title: props.title,
          uri: props.uri,
          contentHash: props.contentHash,
          freshness: props.freshness,
          sourceQuality: props.sourceQuality,
          deletedAt: props.deletedAt,
        })
        .where(eq(sources.id, props.id));
    }

    // Handle content as a single chunk for now (MVP)
    // Delete old chunks first
    await this.db
      .delete(sourceChunks)
      .where(eq(sourceChunks.sourceId, props.id));

    await this.db.insert(sourceChunks).values({
      id: randomUUID(),
      sourceId: props.id,
      missionId: props.missionId,
      ordinal: 0,
      content: props.content,
      contentHash: props.contentHash || "unknown",
      metadata: props.metadata,
      createdAt: new Date(),
    });
  }

  async findByMissionId(missionId: string): Promise<Source[]> {
    const records = await this.db
      .select()
      .from(sources)
      .where(eq(sources.missionId, missionId));

    const results: Source[] = [];
    for (const record of records) {
      const source = await this.mapToDomain(record);
      results.push(source);
    }
    return results;
  }

  async findByWorkspaceId(workspaceId: string): Promise<Source[]> {
    const records = await this.db
      .select()
      .from(sources)
      .where(eq(sources.workspaceId, workspaceId));

    const results: Source[] = [];
    for (const record of records) {
      const source = await this.mapToDomain(record);
      results.push(source);
    }
    return results;
  }

  async findActiveByMissionId(missionId: string): Promise<Source[]> {
    const records = await this.db
      .select()
      .from(sources)
      .where(
        and(
          eq(sources.missionId, missionId),
          sql`${sources.deletedAt} IS NULL`,
        ),
      );

    const results: Source[] = [];
    for (const record of records) {
      const source = await this.mapToDomain(record);
      results.push(source);
    }
    return results;
  }

  async findActiveByWorkspaceId(workspaceId: string): Promise<Source[]> {
    const records = await this.db
      .select()
      .from(sources)
      .where(
        and(
          eq(sources.workspaceId, workspaceId),
          sql`${sources.deletedAt} IS NULL`,
        ),
      );

    const results: Source[] = [];
    for (const record of records) {
      const source = await this.mapToDomain(record);
      results.push(source);
    }
    return results;
  }

  async findById(id: string): Promise<Source | null> {
    const [record] = await this.db
      .select()
      .from(sources)
      .where(eq(sources.id, id));

    if (!record) return null;
    return this.mapToDomain(record);
  }

  private async mapToDomain(
    record: typeof sources.$inferSelect,
  ): Promise<Source> {
    // Fetch content from chunks
    const chunks = await this.db
      .select()
      .from(sourceChunks)
      .where(eq(sourceChunks.sourceId, record.id))
      .orderBy(sourceChunks.ordinal);

    const content = chunks.map((c) => c.content).join("");
    const metadata = (chunks[0]?.metadata as Record<string, unknown>) || {};

    return new Source({
      id: record.id,
      workspaceId: record.workspaceId,
      missionId: record.missionId,
      sourceType: record.sourceType as SourceType,
      title: record.title,
      uri: record.uri ?? undefined,
      contentHash: record.contentHash ?? undefined,
      freshness: record.freshness ?? undefined,
      sourceQuality: record.sourceQuality as SourceQuality,
      content,
      metadata,
      deletedAt: record.deletedAt ?? undefined,
      createdAt: record.createdAt,
    });
  }
}
