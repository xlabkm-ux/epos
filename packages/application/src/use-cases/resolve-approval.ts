import { randomUUID } from "node:crypto";
import { UnitOfWorkPort, SecurityPort } from "@epios/ports";
import { DecisionRecord, ActorRef } from "@epios/domain";

export interface ResolveApprovalRequest {
  approvalId: string;
  decision: "approved" | "rejected";
  rationale?: string;
  actor: ActorRef;
}

export class ResolveApprovalUseCase {
  constructor(
    private readonly uowProvider: UnitOfWorkPort,
    private readonly security: SecurityPort,
  ) {}

  async execute(request: ResolveApprovalRequest) {
    const isAuthorized = await this.security.authorize(
      "approver",
      "resolve",
      "approval",
    );
    if (!isAuthorized) {
      throw new Error("FORBIDDEN: Only approvers can resolve approvals");
    }

    return await this.uowProvider.runInTransaction(async (uow) => {
      const approval = await uow.approvalRepository.findById(
        request.approvalId,
      );
      if (!approval) throw new Error("APPROVAL_REQUEST_NOT_FOUND");

      if (approval.status !== "pending") {
        throw new Error(`APPROVAL_ALREADY_RESOLVED: ${approval.status}`);
      }

      const decisionId = randomUUID();
      const decisionRecord = new DecisionRecord({
        id: decisionId,
        missionId: approval.missionId,
        runId: approval.runId,
        decisionType:
          request.decision === "approved" ? "approval" : "rejection",
        subjectType: "artifact", // Subject is the artifact being patched
        subjectRef: approval.subjectRef, // Usually the patchId
        options: [
          { optionId: "approved", label: "Approve" },
          { optionId: "rejected", label: "Reject" },
        ],
        selectedOptionId: request.decision,
        rationale: request.rationale,
        actor: request.actor,
        createdAt: new Date(),
      });

      await uow.decisionRepository.save(decisionRecord);

      if (request.decision === "approved") {
        approval.approve(decisionId, request.actor);
      } else {
        approval.reject(decisionId, request.actor);
      }

      await uow.approvalRepository.save(approval);

      // If it's an artifact patch, update the patch status
      if (approval.subjectType === "artifact_patch") {
        const patch = await uow.artifactRepository.findPatchById(
          approval.subjectRef,
        );
        if (patch) {
          if (request.decision === "approved") {
            patch.accept();
          } else {
            patch.reject(request.rationale);
          }
          await uow.artifactRepository.savePatch(patch);
        }
      }

      return {
        approvalId: approval.id,
        status: approval.status,
        decisionId,
      };
    });
  }
}
