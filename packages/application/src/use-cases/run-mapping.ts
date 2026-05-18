import { MissionRun, ActorRef } from "@epios/domain";
import { UnitOfWorkPort, OutboxMessage, SecurityPort } from "@epios/ports";
import { randomUUID } from "node:crypto";

export interface RunMappingRequest {
  missionId: string;
  sourceIds: string[];
  actorId: string;
}

export class RunMappingUseCase {
  constructor(
    private readonly uowProvider: UnitOfWorkPort,
    private readonly security: SecurityPort,
  ) {}

  async execute(request: RunMappingRequest): Promise<MissionRun> {
    const isAuthorized = await this.security.authorize(
      "contributor",
      "run",
      "mapping",
    );
    if (!isAuthorized) {
      throw new Error("FORBIDDEN: Only contributors can start mapping runs");
    }

    return await this.uowProvider.runInTransaction(async (uow) => {
      const mission = await uow.missionRepository.findById(request.missionId);
      if (!mission) throw new Error("MISSION_NOT_FOUND");

      const existingRuns = await uow.missionRunRepository.findByMissionId(
        request.missionId,
      );
      const activeRun = existingRuns.find((r) => r.status === "running");
      if (activeRun) return activeRun;

      const run = new MissionRun({
        id: randomUUID(),
        missionId: request.missionId,
        status: "running",
        currentStage: "mapping",
        pendingApprovalIds: [],
        startedBy: { actorType: "user", actorId: request.actorId },
        startedAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      });

      await uow.missionRunRepository.save(run);

      // Log trace event
      await uow.governanceRepository.saveTraceEvent({
        id: randomUUID(),
        workspaceId: mission.workspaceId,
        type: "run_started",
        actorId: request.actorId,
        targetId: run.id,
        metadata: { missionId: mission.id, stage: "mapping" },
        timestamp: new Date(),
      });

      // Emit outbox event for the background worker to actually perform mapping.
      // workspaceId is required by the processor to create EpistemicNodes + EvidenceRefs.
      const message: OutboxMessage = {
        id: randomUUID(),
        aggregateType: "MissionRun",
        aggregateId: run.id,
        type: "mapping_started",
        payload: {
          runId: run.id,
          missionId: mission.id,
          workspaceId: mission.workspaceId,
          stage: "mapping",
          sourceIds: request.sourceIds,
        },
        status: "pending",
        createdAt: new Date(),
      };
      await uow.outboxRepository.save(message);

      return run;
    });
  }
}
