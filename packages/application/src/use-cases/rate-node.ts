import { Rating, EpistemicRatingValue } from "@epios/domain";
import { RatingRepositoryPort } from "@epios/ports";
import { randomUUID } from "crypto";

export interface RateNodeRequest {
  nodeId: string;
  actorId: string;
  value: EpistemicRatingValue;
  comment?: string;
}

export class RateNodeUseCase {
  constructor(private readonly ratingRepo: RatingRepositoryPort) {}

  async execute(request: RateNodeRequest): Promise<Rating> {
    const rating: Rating = {
      id: randomUUID(),
      subjectId: request.nodeId,
      subjectType: "node",
      actorId: request.actorId,
      value: request.value,
      comment: request.comment,
      createdAt: new Date(),
    };

    await this.ratingRepo.save(rating);
    return rating;
  }
}
