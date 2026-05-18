import { randomUUID } from "node:crypto";
import { UnitOfWorkPort, SecurityPort } from "@epios/ports";
import {
  ArtifactPatch,
  ApprovalRequest,
  PatchPolicyService,
  ActorRef,
} from "@epios/domain";

export interface ProposeArtifactPatchRequest {
  artifactId: string;
  missionId: string;
  runId: string;
  diff: string;
  reason: string;
  nodeRefs: string[];
  evidenceRefs: string[];
  decisionRefs: string[];
  riskClass: "low" | "medium" | "high" | "critical";
  author: ActorRef;
  idempotencyKey?: string;
}

export class ProposeArtifactPatchUseCase {
  private readonly policyService = new PatchPolicyService();

  constructor(
    private readonly uowProvider: UnitOfWorkPort,
    private readonly security: SecurityPort,
  ) {}

  async execute(request: ProposeArtifactPatchRequest) {
    if (!request.idempotencyKey) {
      throw new Error("MISSING_IDEMPOTENCY_KEY");
    }

    const isAuthorized = await this.security.authorize(
      "contributor",
      "propose",
      "patch",
    );
    if (!isAuthorized) {
      throw new Error("FORBIDDEN: Only contributors can propose patches");
    }

    return await this.uowProvider.runInTransaction(async (uow) => {
      const artifact = await uow.artifactRepository.findArtifactById(
        request.artifactId,
      );
      if (!artifact) throw new Error("ARTIFACT_NOT_FOUND");

      const latestVersion = await uow.artifactRepository.getLatestVersion(
        request.artifactId,
      );
      const baseVersion = latestVersion ? latestVersion.version : 0;

      const patchId = randomUUID();
      const patch = new ArtifactPatch({
        id: patchId,
        artifactId: request.artifactId,
        missionId: request.missionId,
        baseVersion,
        diff: request.diff,
        reason: request.reason,
        nodeRefs: request.nodeRefs,
        evidenceRefs: request.evidenceRefs,
        decisionRefs: request.decisionRefs,
        riskClass: request.riskClass,
        author: request.author,
        status: "proposed",
        createdAt: new Date(),
      });

      const verdict = this.policyService.evaluate(patch);

      let approval: ApprovalRequest | undefined;

      if (verdict.requiresApproval) {
        approval = new ApprovalRequest({
          id: randomUUID(),
          missionId: request.missionId,
          runId: request.runId,
          subjectType: "artifact_patch",
          subjectRef: patchId,
          preview: {
            title: `Patch for ${artifact.title}`,
            summary: request.reason,
            whatWillHappen: [
              "Artifact content will be updated",
              "A new version will be created",
            ],
          },
          riskClass: request.riskClass,
          status: "pending",
          idempotencyKey: request.idempotencyKey || randomUUID(),
          createdAt: new Date(),
          version: 1,
        });
        await uow.approvalRepository.save(approval);
      }

      await uow.artifactRepository.savePatch(patch);

      return {
        patchId: patch.id,
        approvalId: approval?.id,
        requiresApproval: verdict.requiresApproval,
      };
    });
  }
}
