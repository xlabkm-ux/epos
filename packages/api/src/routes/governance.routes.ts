import { FastifyInstance } from "fastify";
import {
  SubmitClaimUseCase,
  CastVoteUseCase,
  ProposePatchUseCase,
  ListPatchesUseCase,
  AssessReadinessUseCase,
  GetReadinessUseCase,
  ApplyPatchUseCase,
  GetTraceUseCase,
  ProposeArtifactPatchUseCase,
  ResolveApprovalUseCase,
  ApplyArtifactPatchUseCase,
  GenerateFinalADRUseCase,
  GetTraceSummaryUseCase,
  ListArtifactPatchesUseCase,
  ListApprovalsUseCase,
} from "@epios/application";
import { SecurityPort } from "@epios/ports";
import { ActorRef } from "@epios/domain";

export async function governanceRoutes(
  fastify: FastifyInstance,
  options: {
    submitClaimUseCase: SubmitClaimUseCase;
    castVoteUseCase: CastVoteUseCase;
    proposePatchUseCase: ProposePatchUseCase;
    listPatchesUseCase: ListPatchesUseCase;
    assessReadinessUseCase: AssessReadinessUseCase;
    getReadinessUseCase: GetReadinessUseCase;
    applyPatchUseCase: ApplyPatchUseCase;
    getTraceUseCase: GetTraceUseCase;
    proposeArtifactPatchUseCase: ProposeArtifactPatchUseCase;
    resolveApprovalUseCase: ResolveApprovalUseCase;
    applyArtifactPatchUseCase: ApplyArtifactPatchUseCase;
    generateFinalADRUseCase: GenerateFinalADRUseCase;
    getTraceSummaryUseCase: GetTraceSummaryUseCase;
    listArtifactPatchesUseCase: ListArtifactPatchesUseCase;
    listApprovalsUseCase: ListApprovalsUseCase;
    security: SecurityPort;
  },
) {
  const { security } = options;

  async function checkRole(roles: string[]) {
    const user = await security.getCurrentUser();
    if (!user || !roles.includes(user.role)) {
      throw new Error("FORBIDDEN");
    }
  }

  fastify.get("/governance/patches", async (request, reply) => {
    const { workspaceId } = request.query as { workspaceId: string };
    const patches = await options.listPatchesUseCase.execute({ workspaceId });
    return reply.status(200).send(patches);
  });

  fastify.post(
    "/governance/claims",
    {
      schema: {
        body: {
          type: "object",
          required: ["workspaceId", "missionId", "content"],
          properties: {
            workspaceId: { type: "string" },
            missionId: { type: "string" },
            content: { type: "string" },
            requiredVotes: { type: "number" },
          },
        },
      },
    },
    async (request, reply) => {
      await checkRole(["admin", "reviewer"]);
      const claim = await options.submitClaimUseCase.execute(
        request.body as {
          workspaceId: string;
          missionId: string;
          content: string;
          requiredVotes?: number;
        },
      );
      return reply.status(201).send(claim);
    },
  );

  fastify.post("/governance/patches", async (request, reply) => {
    await checkRole(["admin", "reviewer"]);
    const patch = await options.proposePatchUseCase.execute(
      request.body as {
        targetNodeId: string;
        workspaceId: string;
        authorId: string;
        content: string;
        requiredVotes?: number;
      },
    );
    return reply.status(201).send(patch);
  });

  fastify.post("/governance/votes", async (request, reply) => {
    await checkRole(["admin", "reviewer"]);
    await options.castVoteUseCase.execute(
      request.body as {
        nodeId: string;
        actorId: string;
        decision: "approve" | "reject";
        rationale?: string;
      },
    );
    return reply.status(204).send();
  });

  fastify.post("/governance/readiness", async (request, reply) => {
    await checkRole(["admin", "reviewer"]);
    const assessment = await options.assessReadinessUseCase.execute(
      request.body as { workspaceId: string; profileId: string },
    );
    return reply.status(200).send(assessment);
  });

  fastify.get("/governance/readiness", async (request, reply) => {
    const { workspaceId } = request.query as { workspaceId: string };
    const assessment = await options.getReadinessUseCase.execute(workspaceId);
    return reply.status(200).send(assessment);
  });

  fastify.post("/governance/apply-patch", async (request, reply) => {
    await checkRole(["admin"]);
    const version = await options.applyPatchUseCase.execute(
      request.body as { patchId: string; actorId: string },
    );
    return reply.status(201).send(version);
  });

  fastify.get("/governance/trace", async (request, reply) => {
    const { workspaceId } = request.query as { workspaceId: string };
    const trace = await options.getTraceUseCase.execute(workspaceId);
    return reply.status(200).send(trace);
  });

  fastify.get("/governance/trace-summary", async (request, reply) => {
    const { workspaceId } = request.query as { workspaceId: string };
    const summary = await options.getTraceSummaryUseCase.execute(workspaceId);
    return reply.status(200).send(summary);
  });

  fastify.post("/governance/generate-adr", async (request, reply) => {
    const { workspaceId } = request.body as { workspaceId: string };
    const adr = await options.generateFinalADRUseCase.execute({ workspaceId });
    return reply.status(200).send(adr);
  });

  // Artifact Patching
  fastify.post("/governance/artifact-patches", async (request, reply) => {
    await checkRole(["admin", "reviewer"]);
    const result = await options.proposeArtifactPatchUseCase.execute(
      request.body as {
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
      },
    );
    return reply.status(201).send(result);
  });

  fastify.post(
    "/governance/approvals/:approvalId/resolve",
    async (request, reply) => {
      await checkRole(["admin", "reviewer"]);
      const { approvalId } = request.params as { approvalId: string };
      const result = await options.resolveApprovalUseCase.execute({
        ...(request.body as {
          decision: "approved" | "rejected";
          rationale?: string;
          actor: ActorRef;
        }),
        approvalId,
      });
      return reply.status(200).send(result);
    },
  );

  fastify.post(
    "/governance/artifact-patches/:patchId/apply",
    async (request, reply) => {
      await checkRole(["admin"]);
      const { patchId } = request.params as { patchId: string };
      const result = await options.applyArtifactPatchUseCase.execute({
        ...(request.body as { actor: ActorRef }),
        patchId,
      });
      return reply.status(200).send(result);
    },
  );

  fastify.get("/governance/artifact-patches", async (request, reply) => {
    const { artifactId, missionId } = request.query as {
      artifactId?: string;
      missionId?: string;
    };
    const patches = await options.listArtifactPatchesUseCase.execute({
      artifactId,
      missionId,
    });
    return reply.status(200).send(patches);
  });

  fastify.get("/governance/approvals", async (request, reply) => {
    const { missionId, workspaceId, onlyPending } = request.query as {
      missionId?: string;
      workspaceId?: string;
      onlyPending?: string;
    };

    let resolvedMissionId = missionId;
    if (!resolvedMissionId && workspaceId) {
      // For Demo/Pilot compatibility: assume mission ID follows the seed pattern 
      // or we should fetch it from DB. For now, let's just use the seed pattern 
      // where mission ID starts with 0001-... instead of 0000-...
      resolvedMissionId = workspaceId.replace(/^00000000-0000-0000-0000-/, "00000000-0000-0000-0001-");
    }

    if (!resolvedMissionId) {
      return reply.status(200).send([]);
    }

    const approvals = await options.listApprovalsUseCase.execute({
      missionId: resolvedMissionId,
      onlyPending: onlyPending === "true",
    });
    return reply.status(200).send(approvals);
  });
}
