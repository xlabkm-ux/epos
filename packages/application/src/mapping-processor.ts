import { UnitOfWorkPort } from "@epios/ports";
import { EpistemicNode, EvidenceRef, MappingRun } from "@epios/domain";
import { randomUUID } from "node:crypto";

/**
 * MappingProcessor — background worker that polls the outbox for "mapping_started"
 * events and performs async claims + evidence extraction.
 *
 * Flow:
 *   1. Finds pending outbox messages of type "mapping_started"
 *   2. Creates/updates the MappingRun progress record
 *   3. Simulates extraction: creates EpistemicNode (claim) + EvidenceRef per step
 *   4. Links EvidenceRef to the claim node (supportsNodeIds)
 *   5. Marks the outbox message processed on completion
 */
export class MappingProcessor {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly uowProvider: UnitOfWorkPort) {}

  async processNext(): Promise<boolean> {
    // Step 1: find a pending mapping_started message (outside transaction — read only)
    let pending: Array<{ id: string; payload: Record<string, unknown> }> = [];
    await this.uowProvider.runInTransaction(async (uow) => {
      const msgs = await uow.outboxRepository.findPending();
      pending = msgs.filter((m) => m.type === "mapping_started");
    });

    const message = pending[0];
    if (!message) return false;

    const { runId, missionId, workspaceId, sourceIds } = message.payload as {
      runId: string;
      missionId: string;
      workspaceId: string;
      sourceIds: string[];
    };

    if (!runId || !missionId || !workspaceId) {
      console.warn(
        "[MappingProcessor] Invalid payload, skipping:",
        message.payload,
      );
      await this.uowProvider.runInTransaction(async (uow) => {
        await uow.outboxRepository.markProcessed(message.id);
      });
      return false;
    }

    // Step 2: Create/initialise MappingRun progress record
    await this.uowProvider.runInTransaction(async (uow) => {
      const existing = await uow.mappingRepository.findById(runId);
      if (!existing) {
        const run: MappingRun = {
          id: runId,
          workspaceId,
          missionId,
          status: "running",
          progress: 0,
          claimsFound: 0,
          evidenceFound: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await uow.mappingRepository.save(run);
      }
    });

    // Step 3: Simulate extraction steps with 500ms latency each (total ~2.5s)
    const totalSteps = 5;
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      await this.uowProvider.runInTransaction(async (uow) => {
        // Update progress
        const run = await uow.mappingRepository.findById(runId);
        if (!run || run.status === "failed") return;

        run.progress = Math.round((step / totalSteps) * 100);
        run.claimsFound = step;
        run.evidenceFound = step * 2;
        run.updatedAt = new Date();
        await uow.mappingRepository.save(run);

        // Create one EpistemicNode (claim) per step
        const claimId = randomUUID();
        const node = new EpistemicNode({
          id: claimId,
          workspaceId,
          missionId,
          type: "claim",
          content: `Claim ${step}: Extracted from source analysis (run ${runId.slice(0, 8)})`,
          strength: step <= 2 ? "strong" : step === 3 ? "moderate" : "weak",
          metadata: { runId, step, extractedBy: "mapping_processor" },
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await uow.graphRepository.saveNode(node);

        // Create two EvidenceRef objects per step, linked to the claim node
        const evidenceSourceId =
          (sourceIds && sourceIds[0]) || `source-${missionId.slice(0, 8)}`;

        for (let e = 1; e <= 2; e++) {
          const evidenceRef = new EvidenceRef({
            id: randomUUID(),
            workspaceId,
            missionId,
            sourceId: evidenceSourceId,
            quote: `Evidence quote ${step}.${e} supporting claim ${step}`,
            relevanceScore: 0.7 + Math.random() * 0.3,
            supportsNodeIds: [claimId],
            citationStatus: "unverified",
            createdAt: new Date(),
          });
          await uow.evidenceRepository.saveRef(evidenceRef);
        }
      });
    }

    // Step 4: Finalise the MappingRun and mark outbox processed
    await this.uowProvider.runInTransaction(async (uow) => {
      const run = await uow.mappingRepository.findById(runId);
      if (run) {
        run.status = "completed";
        run.progress = 100;
        run.completedAt = new Date();
        run.updatedAt = new Date();
        await uow.mappingRepository.save(run);
      }
      await uow.outboxRepository.markProcessed(message.id);
    });

    console.log(
      `[MappingProcessor] Completed run ${runId}: ${totalSteps} claims, ${totalSteps * 2} evidence refs`,
    );
    return true;
  }

  start(intervalMs: number = 2000): void {
    if (this.intervalId !== null) return; // Prevent duplicate starts
    console.log(`[MappingProcessor] Starting with interval ${intervalMs}ms`);
    this.intervalId = setInterval(async () => {
      try {
        await this.processNext();
      } catch (e) {
        console.error("[MappingProcessor] error:", e);
      }
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
