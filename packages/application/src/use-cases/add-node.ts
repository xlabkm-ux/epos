import {
  EpistemicNode,
  NodeType,
  NodeStrength,
  EvidenceRef,
} from "@epios/domain";
import { GraphRepositoryPort, WorkspaceRepositoryPort } from "@epios/ports";
import { tracer } from "@epios/observability";
import { randomUUID } from "crypto";

export type AddNodeRequest = {
  workspaceId: string;
  missionId: string;
  type: NodeType;
  content: string;
  strength?: NodeStrength;
  // evidence?: EvidenceRef[]; // TODO: Evidence is now handled via EvidenceSet
  metadata?: Record<string, unknown>;
  createdById?: string;
};

export class AddNodeUseCase {
  constructor(
    private readonly workspaceRepo: WorkspaceRepositoryPort,
    private readonly graphRepo: GraphRepositoryPort,
  ) {}

  async execute(request: AddNodeRequest): Promise<EpistemicNode> {
    const workspace = await this.workspaceRepo.findById(request.workspaceId);
    if (!workspace) {
      throw new Error("WORKSPACE_NOT_FOUND");
    }

    const node = new EpistemicNode({
      id: randomUUID(),
      workspaceId: request.workspaceId,
      missionId: request.missionId,
      type: request.type,
      content: request.content,
      strength: request.strength ?? "none",
      metadata: request.metadata ?? {},
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdById: request.createdById ?? "admin-1",
    });

    await this.graphRepo.saveNode(node);

    tracer.emit({
      type: "NODE_ADDED",
      workspaceId: node.workspaceId,
      payload: { nodeId: node.id, nodeType: node.type },
    });

    return node;
  }
}
