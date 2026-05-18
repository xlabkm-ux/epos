import { NodePatch, GovernanceProcess } from "@epios/domain";
import {
  GovernanceRepositoryPort,
  GraphRepositoryPort,
  SecurityPort,
} from "@epios/ports";
import { randomUUID } from "crypto";

export interface ProposePatchRequest {
  targetNodeId: string;
  workspaceId: string;
  authorId: string;
  content: string;
  requiredVotes?: number;
}

export class ProposePatchUseCase {
  constructor(
    private governanceRepo: GovernanceRepositoryPort,
    private graphRepo: GraphRepositoryPort,
    private security: SecurityPort,
  ) {}

  async execute(request: ProposePatchRequest): Promise<NodePatch> {
    await this.security.authorize(
      "contributor",
      "propose_patch",
      request.targetNodeId,
    );

    const node = await this.graphRepo.findNodeById(request.targetNodeId);
    if (!node) {
      throw new Error("TARGET_NODE_NOT_FOUND");
    }

    const patchId = randomUUID();
    const now = new Date();

    const patch = new NodePatch({
      id: patchId,
      targetNodeId: request.targetNodeId,
      workspaceId: request.workspaceId,
      authorId: request.authorId,
      content: request.content,
      status: "pending",
      version: 1,
      createdAt: now,
      updatedAt: now,
    });

    const governance = new GovernanceProcess({
      nodeId: patchId, // Use patchId as nodeId for governance
      workspaceId: request.workspaceId,
      status: "pending",
      votes: [],
      requiredVotes: request.requiredVotes || 2,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });

    await this.governanceRepo.savePatch(patch);
    await this.governanceRepo.saveProcess(governance);

    return patch;
  }
}
