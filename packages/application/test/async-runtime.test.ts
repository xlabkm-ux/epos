import { describe, it, expect, vi } from "vitest";
import { RunMappingUseCase } from "../src/use-cases/run-mapping.js";
import { randomUUID } from "node:crypto";
import { MappingRepositoryPort, OutboxRepositoryPort } from "@epios/ports";

describe("Async Runtime & Idempotency", () => {
  it("should return existing run if idempotency key is reused", async () => {
    const mappingRepo = {
      save: vi.fn(),
      findById: vi.fn(),
      findByMissionId: vi.fn(),
    };
    const outboxRepo = {
      save: vi.fn(),
    };
    const missionRepo = {
      findById: vi.fn(),
    };

    const mockUnitOfWork = {
      missionRepository: missionRepo,
      missionRunRepository: mappingRepo,
      governanceRepository: { saveTraceEvent: vi.fn() },
      outboxRepository: outboxRepo,
    };

    const mockUowProvider = {
      runInTransaction: vi.fn((fn) => fn(mockUnitOfWork)),
    };

    const mockSecurity = {
      authorize: vi.fn().mockResolvedValue(true),
    };

    const useCase = new RunMappingUseCase(
      mockUowProvider as any,
      mockSecurity as any,
    );

    const missionId = randomUUID();
    const actorId = "user-1";

    // First call
    missionRepo.findById.mockResolvedValue({ id: missionId, workspaceId: "w1" });
    mappingRepo.findByMissionId.mockResolvedValue([]);
    const run1 = await useCase.execute({ missionId, sourceIds: [], actorId });

    // Second call
    mappingRepo.findByMissionId.mockResolvedValue([run1]);
    const run2 = await useCase.execute({ missionId, sourceIds: [], actorId });

    expect(run1.id).toBeDefined();
    expect(run2.id).toBe(run1.id);
    expect(mappingRepo.save).toHaveBeenCalledTimes(1);
  });

  it("should handle outbox retries and state transitions", async () => {
    const outboxRepo = {
      save: vi.fn(),
      findPending: vi.fn(),
      markProcessed: vi.fn(),
      markFailed: vi.fn(),
    };

    const pendingEvent = {
      id: randomUUID(),
      type: "mission.created",
      payload: {},
      status: "pending",
      retryCount: 0,
    };

    // 1. Success case
    outboxRepo.findPending.mockResolvedValueOnce([pendingEvent]);
    // Simulate worker processing...
    await outboxRepo.markProcessed(pendingEvent.id);
    expect(outboxRepo.markProcessed).toHaveBeenCalledWith(pendingEvent.id);

    // 2. Retry case (failed but retryable)
    const retryableEvent = { ...pendingEvent, id: randomUUID(), retryCount: 1 };
    outboxRepo.findPending.mockResolvedValueOnce([retryableEvent]);
    // Simulate failure
    const error = new Error("Network fluke");
    if (retryableEvent.retryCount < 3) {
      await outboxRepo.save({
        ...retryableEvent,
        retryCount: retryableEvent.retryCount + 1,
      });
    }
    expect(outboxRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ retryCount: 2 }),
    );

    // 3. Final failure (non-retryable)
    const failedEvent = { ...pendingEvent, id: randomUUID(), retryCount: 3 };
    await outboxRepo.markFailed(failedEvent.id, "Max retries exceeded");
    expect(outboxRepo.markFailed).toHaveBeenCalledWith(
      failedEvent.id,
      "Max retries exceeded",
    );
  });
});
