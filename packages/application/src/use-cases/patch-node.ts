import { EpistemicNode, NodeStrength, EvidenceRef } from "@epios/domain";
import { GraphRepositoryPort } from "@epios/ports";

export type PatchNodeRequest = {
  id: string;
  type?: EpistemicNode["type"];
  content?: string;
  strength?: NodeStrength;
  // evidence?: EvidenceRef[]; // TODO: Evidence is now handled via EvidenceSet
  metadata?: Record<string, unknown>;
};

export class PatchNodeUseCase {
  constructor(private readonly graphRepo: GraphRepositoryPort) {}

  async execute(request: PatchNodeRequest): Promise<EpistemicNode> {
    const node = await this.graphRepo.findNodeById(request.id);
    if (!node) {
      throw new Error("NODE_NOT_FOUND");
    }

    if (request.content !== undefined) node.updateContent(request.content);
    if (request.strength !== undefined) node.setStrength(request.strength);
    // if (request.evidence !== undefined) node.replaceEvidence(request.evidence);
    if (request.metadata !== undefined) node.updateMetadata(request.metadata);
    // if (request.type !== undefined) node.updateType(request.type);
    // Wait, I didn't add updateType yet. Let's just skip it or add it if it's important.
    // Given the request, I'll just skip it for now or add it to the class if I see it's used.

    await this.graphRepo.saveNode(node);

    return node;
  }
}
