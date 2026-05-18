import { AssignmentRepositoryPort } from "@epios/ports";
import { Assignment, WorkPlaceRole } from "@epios/domain";

export interface CreateAssignmentCommand {
  userId: string;
  role: WorkPlaceRole;
  unitId?: string;
  positionId?: string;
  workspaceId?: string;
}

export class ManageAssignmentUseCase {
  constructor(private assignmentRepo: AssignmentRepositoryPort) {}

  async create(command: CreateAssignmentCommand): Promise<Assignment> {
    // Basic ID generation for in-memory/demo purposes
    const id = `wp_${Math.random().toString(36).substring(2, 9)}`;

    const assignment = new Assignment({
      id,
      userId: command.userId,
      role: command.role,
      unitId: command.unitId,
      positionId: command.positionId,
      workspaceId: command.workspaceId,
      isActive: true,
      createdAt: new Date(),
    });

    await this.assignmentRepo.save(assignment);
    return assignment;
  }

  async deactivate(workplaceId: string): Promise<void> {
    const assignment = await this.assignmentRepo.findById(workplaceId);
    if (!assignment) throw new Error("ASSIGNMENT_NOT_FOUND");

    assignment.deactivate();
    await this.assignmentRepo.save(assignment);
  }

  async delete(workplaceId: string): Promise<void> {
    await this.assignmentRepo.delete(workplaceId);
  }
}
