import { Source, SourceType } from "@epios/domain";
import { UnitOfWorkPort, SecurityPort } from "@epios/ports";
import { randomUUID } from "node:crypto";

export interface IngestSourceRequest {
  missionId: string;
  type: SourceType;
  title: string;
  uri?: string;
  content: string;
  actorId: string;
  metadata?: Record<string, unknown>;
}

export class IngestSourceUseCase {
  constructor(
    private readonly uowProvider: UnitOfWorkPort,
    private readonly security: SecurityPort,
  ) {}

  async execute(request: IngestSourceRequest): Promise<Source> {
    const isAuthorized = await this.security.authorize(
      "contributor",
      "create",
      "source",
    );
    if (!isAuthorized) {
      throw new Error("FORBIDDEN: Only contributors can ingest sources");
    }

    return await this.uowProvider.runInTransaction(async (uow) => {
      const mission = await uow.missionRepository.findById(request.missionId);
      if (!mission) throw new Error("MISSION_NOT_FOUND");

      const source = new Source({
        id: randomUUID(),
        workspaceId: mission.workspaceId,
        missionId: request.missionId,
        sourceType: request.type,
        title: request.title,
        uri: request.uri,
        content: request.content,
        metadata: request.metadata || {},
        sourceQuality: "unknown",
        createdAt: new Date(),
      });

      await uow.sourceRepository.save(source);

      // Log trace event
      await uow.governanceRepository.saveTraceEvent({
        id: randomUUID(),
        workspaceId: mission.workspaceId,
        type: "source_ingested",
        actorId: request.actorId,
        targetId: source.id,
        metadata: { title: source.title, type: source.sourceType },
        timestamp: new Date(),
      });

      return source;
    });
  }
}
