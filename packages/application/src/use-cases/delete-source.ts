import { UnitOfWorkPort, SecurityPort } from "@epios/ports";
import { randomUUID } from "node:crypto";

export class DeleteSourceUseCase {
  constructor(
    private readonly uowProvider: UnitOfWorkPort,
    private readonly security: SecurityPort,
  ) {}

  async execute(sourceId: string, actorId: string): Promise<void> {
    const currentUser = await this.security.getCurrentUser();
    if (
      !currentUser ||
      (currentUser.role !== "approver" && currentUser.role !== "contributor")
    ) {
      throw new Error("FORBIDDEN");
    }

    await this.uowProvider.runInTransaction(async (uow) => {
      const source = await uow.sourceRepository.findById(sourceId);
      if (!source) throw new Error("SOURCE_NOT_FOUND");

      source.delete();
      await uow.sourceRepository.save(source);

      // Log trace event
      await uow.governanceRepository.saveTraceEvent({
        id: randomUUID(),
        workspaceId: source.workspaceId,
        type: "source_deleted",
        actorId: actorId,
        targetId: source.id,
        metadata: { title: source.title },
        timestamp: new Date(),
      });
    });
  }
}
