import { Rating } from "@epios/domain";
import { RatingRepositoryPort } from "@epios/ports";

export class GetNodeRatingsUseCase {
  constructor(private readonly ratingRepo: RatingRepositoryPort) {}

  async execute(nodeId: string): Promise<Rating[]> {
    return this.ratingRepo.findBySubjectId(nodeId);
  }
}
