import { WorkspaceRepositoryPort } from "@epios/ports";
import { Workspace, WorkspaceStatus } from "@epios/domain";

export type PatchWorkspaceDto = {
  id: string;
  status?: WorkspaceStatus;
  isPinned?: boolean;
  archivedAt?: Date;
  archiveComment?: string;
};

export class PatchWorkspaceUseCase {
  constructor(private readonly workspaceRepository: WorkspaceRepositoryPort) {}

  async execute(dto: PatchWorkspaceDto): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findById(dto.id);
    if (!workspace) {
      throw new Error("WORKSPACE_NOT_FOUND");
    }

    if (dto.status === "archived") {
      workspace.archive(dto.archiveComment);
    } else if (dto.status === "running") {
      workspace.restore();
    } else if (dto.status !== undefined) {
      // For other status transitions, we might need a general method or specific ones
      // For now let's just allow it if it's not archived, or implement a transition method
    }


    if (dto.isPinned === true) workspace.pin();
    if (dto.isPinned === false) workspace.unpin();

    await this.workspaceRepository.save(workspace);

    return workspace;
  }
}
