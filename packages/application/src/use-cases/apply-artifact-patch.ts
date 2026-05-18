import { randomUUID } from "node:crypto";
import { UnitOfWorkPort, SecurityPort } from "@epios/ports";
import { PatchPolicyService, ActorRef } from "@epios/domain";

export interface ApplyArtifactPatchRequest {
  patchId: string;
  actor: ActorRef;
}

export class ApplyArtifactPatchUseCase {
  private readonly policyService = new PatchPolicyService();

  constructor(
    private readonly uowProvider: UnitOfWorkPort,
    private readonly security: SecurityPort,
  ) {}

  async execute(request: ApplyArtifactPatchRequest) {
    const isAuthorized = await this.security.authorize(
      "contributor",
      "apply",
      "patch",
    );
    if (!isAuthorized) {
      throw new Error("FORBIDDEN: Only contributors can apply patches");
    }

    return await this.uowProvider.runInTransaction(async (uow) => {
      const patch = await uow.artifactRepository.findPatchById(request.patchId);
      if (!patch) throw new Error("PATCH_NOT_FOUND");

      if (patch.status === "applied") {
        throw new Error("PATCH_ALREADY_APPLIED");
      }

      const artifact = await uow.artifactRepository.findArtifactById(
        patch.artifactId,
      );
      if (!artifact) throw new Error("ARTIFACT_NOT_FOUND");

      const verdict = this.policyService.evaluate(patch);

      // Check if it's already accepted OR if it's low risk and can be auto-applied
      if (patch.status !== "accepted") {
        if (verdict.autoApplyAllowed && patch.status === "proposed") {
          // Auto-accept if allowed
          patch.accept();
        } else {
          throw new Error(
            `PATCH_NOT_READY: ${patch.status}. Policy requires ${verdict.requiresApproval ? "approval" : "manual action"}.`,
          );
        }
      }

      // Apply the patch
      patch.apply();
      await uow.artifactRepository.savePatch(patch);

      // In a real system, we would apply the diff here.
      // For MVP, we'll assume the diff IS the new content or we have a way to apply it.
      // Let's assume for now we just create a new version with the 'diff' as content
      // if it's the first version, or we have a mechanism to apply it.
      // Since 'LivingArtifact' doesn't store content directly (versions do),
      // we just create the version.

      const latestVersion = await uow.artifactRepository.getLatestVersion(
        patch.artifactId,
      );
      const newVersionNumber = latestVersion ? latestVersion.version + 1 : 1;

      const version = {
        id: randomUUID(),
        artifactId: patch.artifactId,
        workspaceId: artifact.missionId, // Using missionId as workspace context for now or similar
        version: newVersionNumber,
        content: patch.diff, // In a real scenario, this would be the RESULT of applying the diff
        authorId: patch.author.actorId,
        createdAt: new Date(),
      };

      await uow.artifactRepository.saveVersion(version);

      // Update artifact version
      artifact.bumpVersion();
      await uow.artifactRepository.saveArtifact(artifact);

      // Log trace event
      await uow.governanceRepository.saveTraceEvent({
        id: randomUUID(),
        workspaceId: artifact.missionId, // Simplified
        type: "artifact_patch_applied",
        actorId: request.actor.actorId,
        targetId: patch.id,
        metadata: { version: newVersionNumber, artifactId: artifact.id },
        timestamp: new Date(),
      });

      return {
        patchId: patch.id,
        versionId: version.id,
        versionNumber: newVersionNumber,
      };
    });
  }
}
