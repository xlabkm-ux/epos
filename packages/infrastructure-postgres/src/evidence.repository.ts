import { EvidenceRef, EvidenceSet } from "@epios/domain";
import { EvidenceRepositoryPort } from "@epios/ports";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { evidenceRefs, evidenceSets } from "./schema.js";
import { eq, sql, and } from "drizzle-orm";

export class PostgresEvidenceRepository implements EvidenceRepositoryPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  // ── EvidenceRef ────────────────────────────────────────────────────────────

  async saveRef(ref: EvidenceRef): Promise<void> {
    const props = ref.toProps();
    await this.db
      .insert(evidenceRefs)
      .values({
        id: props.id,
        workspaceId: props.workspaceId,
        missionId: props.missionId,
        sourceId: props.sourceId,
        chunkId: props.span?.chunkId ?? null,
        quote: props.quote ?? null,
        startOffset: props.span?.startOffset ?? null,
        endOffset: props.span?.endOffset ?? null,
        locator: props.span?.locator ?? null,
        relevanceScore: props.relevanceScore ?? null,
        citationStatus: props.citationStatus,
        boundaryNote: props.boundaryNote ?? null,
        createdAt: props.createdAt,
      })
      .onConflictDoUpdate({
        target: evidenceRefs.id,
        set: {
          citationStatus: props.citationStatus,
          relevanceScore: props.relevanceScore ?? null,
          boundaryNote: props.boundaryNote ?? null,
        },
      });
  }

  async findRefById(id: string): Promise<EvidenceRef | null> {
    const [record] = await this.db
      .select()
      .from(evidenceRefs)
      .where(eq(evidenceRefs.id, id));

    if (!record) return null;
    return this.mapRefToDomain(record);
  }

  async findRefsByMissionId(missionId: string): Promise<EvidenceRef[]> {
    const records = await this.db
      .select()
      .from(evidenceRefs)
      .where(eq(evidenceRefs.missionId, missionId));

    return records.map((r) => this.mapRefToDomain(r));
  }

  private mapRefToDomain(
    record: typeof evidenceRefs.$inferSelect,
  ): EvidenceRef {
    return new EvidenceRef({
      id: record.id,
      workspaceId: record.workspaceId,
      missionId: record.missionId,
      sourceId: record.sourceId,
      span: record.chunkId
        ? {
            sourceId: record.sourceId,
            chunkId: record.chunkId,
            startOffset: record.startOffset ?? undefined,
            endOffset: record.endOffset ?? undefined,
            locator: record.locator ?? undefined,
          }
        : undefined,
      quote: record.quote ?? undefined,
      relevanceScore: record.relevanceScore ?? undefined,
      supportsNodeIds: [], // join table not queried here — acceptable for MVP
      citationStatus:
        (record.citationStatus as EvidenceRef["citationStatus"]) ??
        "unverified",
      boundaryNote: record.boundaryNote ?? undefined,
      createdAt: record.createdAt,
    });
  }

  // ── EvidenceSet ────────────────────────────────────────────────────────────

  async saveSet(set: EvidenceSet): Promise<void> {
    const props = set.toProps();
    const [existing] = await this.db
      .select()
      .from(evidenceSets)
      .where(eq(evidenceSets.id, props.id));

    if (!existing) {
      await this.db.insert(evidenceSets).values({
        id: props.id,
        workspaceId: props.workspaceId,
        missionId: props.missionId,
        evidenceIds: props.evidenceIds,
        version: 1,
        updatedAt: props.updatedAt,
      });
    } else {
      await this.db
        .update(evidenceSets)
        .set({
          evidenceIds: props.evidenceIds,
          updatedAt: props.updatedAt,
          version: sql`${evidenceSets.version} + 1`,
        })
        .where(
          and(
            eq(evidenceSets.id, props.id),
            eq(evidenceSets.version, props.version),
          ),
        );
    }
  }

  async findSetById(id: string): Promise<EvidenceSet | null> {
    const [record] = await this.db
      .select()
      .from(evidenceSets)
      .where(eq(evidenceSets.id, id));

    if (!record) return null;
    return this.mapSetToDomain(record);
  }

  async findSetByMissionId(missionId: string): Promise<EvidenceSet | null> {
    const [record] = await this.db
      .select()
      .from(evidenceSets)
      .where(eq(evidenceSets.missionId, missionId));

    if (!record) return null;
    return this.mapSetToDomain(record);
  }

  private mapSetToDomain(
    record: typeof evidenceSets.$inferSelect,
  ): EvidenceSet {
    return new EvidenceSet({
      id: record.id,
      workspaceId: record.workspaceId,
      missionId: record.missionId,
      evidenceIds: record.evidenceIds as string[],
      version: record.version,
      updatedAt: record.updatedAt,
    });
  }
}
