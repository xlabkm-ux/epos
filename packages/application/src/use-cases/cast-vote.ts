/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from "node:crypto";
import { UnitOfWorkPort, OutboxMessage, SecurityPort } from "@epios/ports";
import { auditLogger } from "@epios/observability";
import { DomainEvent } from "@epios/domain";

export interface CastVoteRequest {
  nodeId: string;
  actorId: string;
  decision: "approve" | "reject";
  rationale?: string;
}

export class CastVoteUseCase {
  constructor(
    private readonly uowProvider: UnitOfWorkPort,
    private readonly security: SecurityPort,
  ) {}

  async execute(request: CastVoteRequest): Promise<void> {
    await this.security.authorize("approver", "cast_vote", request.nodeId);

    await this.uowProvider.runInTransaction(async (uow) => {
      const governanceProcess =
        await uow.governanceRepository.findProcessByNodeId(request.nodeId);
      if (!governanceProcess) {
        throw new Error("GOVERNANCE_PROCESS_NOT_FOUND");
      }

      governanceProcess.castVote({
        actorId: request.actorId,
        decision: request.decision,
        rationale: request.rationale,
        timestamp: new Date(),
      });

      auditLogger.log({
        actorId: request.actorId,
        action: "cast_vote",
        targetId: request.nodeId,
        metadata: { decision: request.decision, rationale: request.rationale },
      });

      // Log trace event for the vote
      await uow.governanceRepository.saveTraceEvent({
        id: randomUUID(),
        workspaceId: governanceProcess.workspaceId,
        type: "vote_cast",
        actorId: request.actorId,
        targetId: request.nodeId,
        metadata: { decision: request.decision, rationale: request.rationale },
        timestamp: new Date(),
      });

      // Check if governanceProcess was finalized
      if (governanceProcess.status === "approved") {
        const patch = await uow.governanceRepository.findPatchById(
          request.nodeId,
        );
        if (patch && patch.status === "pending") {
          // Apply patch logic directly here to keep it within the same transaction
          patch.apply();
          await uow.governanceRepository.savePatch(patch);

          const node = await uow.graphRepository.findNodeById(
            patch.targetNodeId,
          );
          if (node) {
            node.updateContent(patch.content);
            await uow.graphRepository.saveNode(node);

            // Collect events from node
            await this.persistEvents(
              uow,
              node.domainEvents,
              "EpistemicNode",
              node.id,
            );
            node.clearDomainEvents();
          }
        } else if (!patch) {
          // Regular node (Claim) - strengthen on approval
          const node = await uow.graphRepository.findNodeById(request.nodeId);
          if (node) {
            node.setStrength("strong");
            await uow.graphRepository.saveNode(node);

            // Collect events from node
            await this.persistEvents(
              uow,
              node.domainEvents,
              "EpistemicNode",
              node.id,
            );
            node.clearDomainEvents();
          }
        }

        // Log governance approved event
        await uow.governanceRepository.saveTraceEvent({
          id: randomUUID(),
          workspaceId: governanceProcess.workspaceId,
          type: "governance_approved",
          actorId: "system",
          targetId: request.nodeId,
          metadata: {
            approvals: governanceProcess.votes.filter(
              (v) => v.decision === "approve",
            ).length,
          },
          timestamp: new Date(),
        });
      } else if (governanceProcess.status === "rejected") {
        const patch = await uow.governanceRepository.findPatchById(
          request.nodeId,
        );
        if (patch) {
          patch.reject();
          await uow.governanceRepository.savePatch(patch);
        }

        // Log governance rejected event
        await uow.governanceRepository.saveTraceEvent({
          id: randomUUID(),
          workspaceId: governanceProcess.workspaceId,
          type: "governance_rejected",
          actorId: "system",
          targetId: request.nodeId,
          metadata: {
            rejections: governanceProcess.votes.filter(
              (v) => v.decision === "reject",
            ).length,
          },
          timestamp: new Date(),
        });
      }

      await uow.governanceRepository.saveProcess(governanceProcess);

      // Collect and persist events from governance process
      await this.persistEvents(
        uow,
        governanceProcess.domainEvents,
        "GovernanceProcess",
        governanceProcess.nodeId,
      );
      governanceProcess.clearDomainEvents();
    });
  }

  private async persistEvents(
    uow: any,
    events: DomainEvent[],
    aggregateType: string,
    aggregateId: string,
  ): Promise<void> {
    for (const event of events) {
      const message: OutboxMessage = {
        id: randomUUID(),
        aggregateType,
        aggregateId,
        type: event.type,
        payload: event.payload,
        status: "pending",
        createdAt: event.occurredAt,
      };
      await uow.outboxRepository.save(message);
    }
  }
}
