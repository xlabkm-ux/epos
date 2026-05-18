import { AssignmentRepositoryPort } from "@epios/ports";
import { Assignment } from "@epios/domain";

export class ListUserAssignmentsUseCase {
  constructor(private assignmentRepo: AssignmentRepositoryPort) {}

  async execute(userId: string): Promise<Assignment[]> {
    return this.assignmentRepo.findByUserId(userId);
  }
}
