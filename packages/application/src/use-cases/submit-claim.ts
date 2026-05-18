import {
  GovernanceProcess,
  EpistemicNode,
  EpistemicNodeProps,
} from "@epios/domain";
import { UnitOfWorkPort, SecurityPort } from "@epios/ports";
import { randomUUID } from "node:crypto";

export interface SubmitClaimRequest {
  workspaceId: string;
  missionId: string;
  content: string;
  requiredVotes?: number;
}

export class SubmitClaimUseCase {
  constructor(
    private readonly uowProvider: UnitOfWorkPort,
    private readonly security: SecurityPort,
  ) {}

  async execute(request: SubmitClaimRequest): Promise<EpistemicNodeProps> {
    await this.security.authorize(
      "contributor",
      "submit_claim",
      request.workspaceId,
    );

    return await this.uowProvider.runInTransaction(async (uow) => {
      const claimId = randomUUID();
      const now = new Date();

      const claim = new EpistemicNode({
        id: claimId,
        workspaceId: request.workspaceId,
        missionId: request.missionId,
        type: "claim",
        content: request.content,
        strength: "none",
        metadata: {},
        version: 1,
        createdAt: now,
        updatedAt: now,
      });

      const governance = new GovernanceProcess({
        nodeId: claimId,
        workspaceId: request.workspaceId,
        status: "pending",
        votes: [],
        requiredVotes: request.requiredVotes || 3,
        version: 1,
        createdAt: now,
        updatedAt: now,
      });

      await uow.graphRepository.saveNode(claim);
      await uow.governanceRepository.saveProcess(governance);

      return claim.toProps();
    });
  }
}
