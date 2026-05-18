import { Rating, EpistemicRatingValue } from "@epios/domain";
import { UnitOfWorkPort, SecurityPort } from "@epios/ports";
import { randomUUID } from "node:crypto";

export interface RateSourceRequest {
  sourceId: string;
  actorId: string;
  value: EpistemicRatingValue;
  comment?: string;
}

export class RateSourceUseCase {
  constructor(private readonly uowProvider: UnitOfWorkPort) {}

  async execute(request: RateSourceRequest): Promise<Rating> {
    return await this.uowProvider.runInTransaction(async (uow) => {
      const source = await uow.sourceRepository.findById(request.sourceId);
      if (!source) throw new Error("SOURCE_NOT_FOUND");

      const rating: Rating = {
        id: randomUUID(),
        subjectId: request.sourceId,
        subjectType: "source",
        actorId: request.actorId,
        value: request.value,
        comment: request.comment,
        createdAt: new Date(),
      };

      await uow.ratingRepository.save(rating);

      // Log trace event
      await uow.governanceRepository.saveTraceEvent({
        id: randomUUID(),
        workspaceId: source.workspaceId,
        type: "source_rated",
        actorId: request.actorId,
        targetId: source.id,
        metadata: { value: request.value, title: source.title },
        timestamp: new Date(),
      });

      return rating;
    });
  }
}
