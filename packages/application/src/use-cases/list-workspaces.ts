import { Workspace } from "@epios/domain";
import { WorkspaceRepositoryPort, SecurityPort } from "@epios/ports";

export class ListWorkspacesUseCase {
  constructor(
    private readonly workspaceRepo: WorkspaceRepositoryPort,
    private readonly security: SecurityPort,
  ) {}

  async execute(): Promise<Workspace[]> {
    const wp = await this.security.getCurrentWorkPlace();
    const all = await this.workspaceRepo.findAll();

    if (!wp) return all;

    // Filter by workplace's linked workspace if specified
    if (wp.workspaceId) {
      return all.filter((ws) => ws.id === wp.workspaceId);
    }

    return all;
  }
}
