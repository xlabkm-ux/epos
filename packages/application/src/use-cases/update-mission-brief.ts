import { MissionBrief } from "@epios/domain";
import { UnitOfWorkPort, OutboxMessage } from "@epios/ports";
import { randomUUID } from "node:crypto";

export interface UpdateMissionBriefRequest {
  missionId: string;
  briefPatch: Partial<MissionBrief>;
  actorId: string;
}

export class UpdateMissionBriefUseCase {
  constructor(private readonly uowProvider: UnitOfWorkPort) {}

  async execute(request: UpdateMissionBriefRequest): Promise<void> {
    await this.uowProvider.runInTransaction(async (uow) => {
      const mission = await uow.missionRepository.findById(request.missionId);
      if (!mission) throw new Error("MISSION_NOT_FOUND");

      mission.updateBrief(request.briefPatch);

      await uow.missionRepository.save(mission);

      // Persist domain events
      for (const event of mission.domainEvents) {
        const message: OutboxMessage = {
          id: randomUUID(),
          aggregateType: "Mission",
          aggregateId: mission.id,
          type: event.type,
          payload: event.payload,
          status: "pending",
          createdAt: event.occurredAt,
        };
        await uow.outboxRepository.save(message);
      }
      mission.clearDomainEvents();

      // Log trace event
      await uow.governanceRepository.saveTraceEvent({
        id: randomUUID(),
        workspaceId: mission.workspaceId,
        type: "mission_brief_updated",
        actorId: request.actorId,
        targetId: mission.id,
        metadata: { briefPatch: request.briefPatch },
        timestamp: new Date(),
      });
    });
  }
}
