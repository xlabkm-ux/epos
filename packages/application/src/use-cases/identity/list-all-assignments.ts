import { AssignmentRepositoryPort } from "@epios/ports";
import { Assignment } from "@epios/domain";

export class ListAllAssignmentsUseCase {
  constructor(private assignmentRepo: AssignmentRepositoryPort) {}

  async execute(): Promise<Assignment[]> {
    return this.assignmentRepo.listAll();
  }
}
