import { OutboxMessage, OutboxRepositoryPort } from "@epios/ports";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { outboxEvents } from "./schema.js";
import { eq } from "drizzle-orm";

export class PostgresOutboxRepository implements OutboxRepositoryPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  async save(message: OutboxMessage): Promise<void> {
    await this.db
      .insert(outboxEvents)
      .values({
        id: message.id,
        aggregateType: message.aggregateType,
        aggregateId: message.aggregateId,
        eventType: message.type,
        payload: message.payload,
        status: message.status,
        createdAt: message.createdAt,
      })
      .onConflictDoUpdate({
        target: outboxEvents.id,
        set: {
          status: message.status,
          payload: message.payload,
        },
      });
  }

  async findPending(): Promise<OutboxMessage[]> {
    const records = await this.db
      .select()
      .from(outboxEvents)
      .where(eq(outboxEvents.status, "pending"));

    return records.map((record) => ({
      id: record.id,
      aggregateType: record.aggregateType,
      aggregateId: record.aggregateId,
      type: record.eventType,
      payload: record.payload as Record<string, unknown>,
      status: record.status as "pending" | "processed" | "failed",
      createdAt: record.createdAt,
    }));
  }

  async markProcessed(id: string): Promise<void> {
    await this.db
      .update(outboxEvents)
      .set({
        status: "processed",
        processedAt: new Date(),
      })
      .where(eq(outboxEvents.id, id));
  }
}
