/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DecisionRecord,
  ApprovalRequest,
  ConcurrencyError,
} from "@epios/domain";
import { DecisionRepositoryPort, ApprovalRepositoryPort } from "@epios/ports";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { decisionRecords, approvalRequests } from "./schema.js";
import { eq, sql, and } from "drizzle-orm";

export class PostgresDecisionRepository implements DecisionRepositoryPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  async save(decision: DecisionRecord): Promise<void> {
    const props = decision.toProps();
    const existing = await this.findById(decision.id);

    if (!existing) {
      await this.db.insert(decisionRecords).values({
        id: props.id,
        missionId: props.missionId,
        runId: props.runId,
        decisionType: props.decisionType,
        subjectType: props.subjectType,
        subjectRef: props.subjectRef,
        options: props.options as any,
        selectedOptionId: props.selectedOptionId,
        rationale: props.rationale,
        actorType: props.actor.actorType,
        actorId: props.actor.actorId,
        createdAt: props.createdAt,
      });
    } else {
      // Decision records are typically immutable, but if we need to update:
      await this.db
        .update(decisionRecords)
        .set({
          selectedOptionId: props.selectedOptionId,
          rationale: props.rationale,
        })
        .where(eq(decisionRecords.id, props.id));
    }
  }

  async findById(id: string): Promise<DecisionRecord | null> {
    const [record] = await this.db
      .select()
      .from(decisionRecords)
      .where(eq(decisionRecords.id, id));

    if (!record) return null;

    return new DecisionRecord({
      id: record.id,
      missionId: record.missionId,
      runId: record.runId ?? undefined,
      decisionType: record.decisionType as any,
      subjectType: record.subjectType as any,
      subjectRef: record.subjectRef,
      options: record.options as any,
      selectedOptionId: record.selectedOptionId ?? undefined,
      rationale: record.rationale ?? undefined,
      actor: {
        actorType: record.actorType as any,
        actorId: record.actorId,
      },
      createdAt: record.createdAt,
    });
  }

  async findByMissionId(missionId: string): Promise<DecisionRecord[]> {
    const records = await this.db
      .select()
      .from(decisionRecords)
      .where(eq(decisionRecords.missionId, missionId));

    return records.map(
      (record) =>
        new DecisionRecord({
          id: record.id,
          missionId: record.missionId,
          runId: record.runId ?? undefined,
          decisionType: record.decisionType as any,
          subjectType: record.subjectType as any,
          subjectRef: record.subjectRef,
          options: record.options as any,
          selectedOptionId: record.selectedOptionId ?? undefined,
          rationale: record.rationale ?? undefined,
          actor: {
            actorType: record.actorType as any,
            actorId: record.actorId,
          },
          createdAt: record.createdAt,
        }),
    );
  }
}

export class PostgresApprovalRepository implements ApprovalRepositoryPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  async save(approval: ApprovalRequest): Promise<void> {
    const props = approval.toProps();
    const existing = await this.findById(approval.id);

    if (!existing) {
      await this.db.insert(approvalRequests).values({
        id: props.id,
        missionId: props.missionId,
        runId: props.runId,
        subjectType: props.subjectType,
        subjectRef: props.subjectRef,
        preview: props.preview as any,
        riskClass: props.riskClass,
        status: props.status,
        idempotencyKey: props.idempotencyKey,
        decisionId: props.decisionId,
        createdAt: props.createdAt,
        expiresAt: props.expiresAt,
        resolvedAt: props.resolvedAt,
        resolvedByType: props.resolvedBy?.actorType,
        resolvedById: props.resolvedBy?.actorId,
        version: 1,
      });
    } else {
      const result = await this.db
        .update(approvalRequests)
        .set({
          status: props.status,
          decisionId: props.decisionId,
          resolvedAt: props.resolvedAt,
          resolvedByType: props.resolvedBy?.actorType,
          resolvedById: props.resolvedBy?.actorId,
          version: sql`${approvalRequests.version} + 1`,
        })
        .where(
          and(
            eq(approvalRequests.id, props.id),
            eq(approvalRequests.version, props.version),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new ConcurrencyError(
          `ApprovalRequest ${props.id} was modified by another process`,
        );
      }
    }
  }

  async findById(id: string): Promise<ApprovalRequest | null> {
    const [record] = await this.db
      .select()
      .from(approvalRequests)
      .where(eq(approvalRequests.id, id));

    if (!record) return null;

    return this.mapToDomain(record);
  }

  async findByRunId(runId: string): Promise<ApprovalRequest[]> {
    const records = await this.db
      .select()
      .from(approvalRequests)
      .where(eq(approvalRequests.runId, runId));

    return records.map((r) => this.mapToDomain(r));
  }

  async findBySubjectRef(ref: string): Promise<ApprovalRequest | null> {
    const [record] = await this.db
      .select()
      .from(approvalRequests)
      .where(eq(approvalRequests.subjectRef, ref));

    if (!record) return null;

    return this.mapToDomain(record);
  }

  async findPendingByMissionId(missionId: string): Promise<ApprovalRequest[]> {
    const records = await this.db
      .select()
      .from(approvalRequests)
      .where(
        and(
          eq(approvalRequests.missionId, missionId),
          eq(approvalRequests.status, "pending"),
        ),
      );

    return records.map((r) => this.mapToDomain(r));
  }

  private mapToDomain(record: any): ApprovalRequest {
    return new ApprovalRequest({
      id: record.id,
      missionId: record.missionId,
      runId: record.runId,
      subjectType: record.subjectType as any,
      subjectRef: record.subjectRef,
      preview: record.preview as any,
      riskClass: record.riskClass as any,
      status: record.status as any,
      idempotencyKey: record.idempotencyKey,
      decisionId: record.decisionId ?? undefined,
      createdAt: record.createdAt,
      expiresAt: record.expiresAt ?? undefined,
      resolvedAt: record.resolvedAt ?? undefined,
      resolvedBy:
        record.resolvedByType && record.resolvedById
          ? {
              actorType: record.resolvedByType as any,
              actorId: record.resolvedById,
            }
          : undefined,
      version: record.version,
    });
  }
}
