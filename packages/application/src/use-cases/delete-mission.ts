import { UnitOfWorkPort, SecurityPort } from "@epios/ports";
import { randomUUID } from "node:crypto";

export class DeleteMissionUseCase {
  constructor(
    private readonly uowProvider: UnitOfWorkPort,
    private readonly security: SecurityPort,
  ) {}

  async execute(missionId: string, actorId: string): Promise<void> {
    const currentUser = await this.security.getCurrentUser();
    if (
      !currentUser ||
      (currentUser.role !== "approver" && currentUser.role !== "contributor")
    ) {
      throw new Error("FORBIDDEN");
    }

    await this.uowProvider.runInTransaction(async (uow) => {
      const mission = await uow.missionRepository.findById(missionId);
      if (!mission) throw new Error("MISSION_NOT_FOUND");

      mission.delete();
      await uow.missionRepository.save(mission);

      // Log trace event
      await uow.governanceRepository.saveTraceEvent({
        id: randomUUID(),
        workspaceId: mission.workspaceId,
        type: "mission_deleted",
        actorId: actorId,
        targetId: mission.id,
        metadata: { title: mission.title },
        timestamp: new Date(),
      });
    });
  }
}
