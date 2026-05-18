import { FastifyInstance } from "fastify";
import {
  AddNodeUseCase,
  AddEdgeUseCase,
  PatchNodeUseCase,
  GetWorkspaceGraphUseCase,
  RunMappingUseCase,
  GetMappingRunUseCase,
  ListMappingRunsUseCase,
} from "@epios/application";
import { AddNodeDto, AddEdgeDto, PatchNodeDto } from "../dto/index.js";

export async function mappingRoutes(
  fastify: FastifyInstance,
  options: {
    addNodeUseCase: AddNodeUseCase;
    addEdgeUseCase: AddEdgeUseCase;
    patchNodeUseCase: PatchNodeUseCase;
    getWorkspaceGraphUseCase: GetWorkspaceGraphUseCase;
    runMappingUseCase: RunMappingUseCase;
    getMappingRunUseCase: GetMappingRunUseCase;
    listMappingRunsUseCase: ListMappingRunsUseCase;
  },
) {
  fastify.get<{ Params: { workspaceId: string } }>(
    "/workspaces/:workspaceId/graph",
    async (request) => {
      return options.getWorkspaceGraphUseCase.execute(
        request.params.workspaceId,
      );
    },
  );

  fastify.post<{ Params: { workspaceId: string }; Body: AddNodeDto }>(
    "/workspaces/:workspaceId/nodes",
    async (request, reply) => {
      const createdById = (request.headers["x-user-id"] as string) || "admin-1";
      const node = await options.addNodeUseCase.execute({
        workspaceId: request.params.workspaceId,
        ...request.body,
        createdById: request.body.createdById || createdById,
      });
      return reply.status(201).send(node);
    },
  );

  fastify.post<{ Params: { workspaceId: string }; Body: AddEdgeDto }>(
    "/workspaces/:workspaceId/edges",
    async (request, reply) => {
      const edge = await options.addEdgeUseCase.execute({
        workspaceId: request.params.workspaceId,
        ...request.body,
      });
      return reply.status(201).send(edge);
    },
  );

  fastify.patch<{
    Params: { workspaceId: string; nodeId: string };
    Body: PatchNodeDto;
  }>("/workspaces/:workspaceId/nodes/:nodeId", async (request, reply) => {
    const node = await options.patchNodeUseCase.execute({
      id: request.params.nodeId,
      ...request.body,
    });
    return reply.send(node);
  });

  // POST /missions/:missionId/mapping/runs — start async mapping run (returns runId immediately)
  fastify.post<{
    Params: { missionId: string };
    Body: { sourceIds?: string[] };
  }>("/missions/:missionId/mapping/runs", async (request, reply) => {
    const user = (request.headers["x-user-id"] as string) || "user-1";
    const run = await options.runMappingUseCase.execute({
      missionId: request.params.missionId,
      sourceIds: request.body?.sourceIds || [],
      actorId: user,
    });
    // Return 202 Accepted — the actual work is async
    return reply.status(202).send({ runId: run.id, status: run.status });
  });

  // GET /workspaces/:workspaceId/mapping/runs — list all runs for workspace
  fastify.get<{ Params: { workspaceId: string } }>(
    "/workspaces/:workspaceId/mapping/runs",
    async (request) => {
      return options.listMappingRunsUseCase.execute(request.params.workspaceId);
    },
  );

  // GET /workspaces/:workspaceId/mapping/runs/:runId — get a single run
  fastify.get<{ Params: { workspaceId: string; runId: string } }>(
    "/workspaces/:workspaceId/mapping/runs/:runId",
    async (request, reply) => {
      const run = await options.getMappingRunUseCase.execute(
        request.params.runId,
      );
      if (!run) return reply.status(404).send({ error: "Run not found" });
      return reply.send(run);
    },
  );

  /**
   * GET /workspaces/:workspaceId/mapping/runs/:runId/stream
   *
   * Server-Sent Events endpoint — streams MappingRun progress updates
   * every 1 second until the run completes, fails, or 60s timeout.
   *
   * Event format:
   *   data: { id, status, progress, claimsFound, evidenceFound, completedAt? }\n\n
   */
  fastify.get<{ Params: { workspaceId: string; runId: string } }>(
    "/workspaces/:workspaceId/mapping/runs/:runId/stream",
    async (request, reply) => {
      const { runId } = request.params;

      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });

      let done = false;
      const maxDurationMs = 60_000; // 60s hard timeout
      const pollIntervalMs = 1_000;
      const startedAt = Date.now();

      const cleanup = () => {
        done = true;
        try {
          reply.raw.end();
        } catch {
          /* socket already closed */
        }
      };

      // Clean up if client disconnects
      request.raw.on("close", cleanup);

      const sendEvent = (data: unknown) => {
        if (done) return;
        try {
          reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch {
          cleanup();
        }
      };

      // Poll loop
      const tick = async () => {
        if (done) return;
        if (Date.now() - startedAt > maxDurationMs) {
          sendEvent({ error: "timeout" });
          cleanup();
          return;
        }

        try {
          const run = await options.getMappingRunUseCase.execute(runId);
          if (!run) {
            // Not yet created by background worker — send a heartbeat
            sendEvent({
              status: "pending",
              progress: 0,
              claimsFound: 0,
              evidenceFound: 0,
            });
          } else {
            sendEvent({
              id: run.id,
              status: run.status,
              progress: run.progress,
              claimsFound: run.claimsFound,
              evidenceFound: run.evidenceFound,
              completedAt: run.completedAt,
            });

            if (run.status === "completed" || run.status === "failed") {
              // Terminal state — close stream
              setTimeout(cleanup, 200);
              return;
            }
          }
        } catch (err) {
          fastify.log.error(`[SSE] mapping run poll error: ${String(err)}`);
          sendEvent({ error: "poll_error" });
          cleanup();
          return;
        }

        if (!done) setTimeout(tick, pollIntervalMs);
      };

      // Kick off without awaiting (Fastify reply stays open via raw stream)
      setTimeout(tick, 0);

      // Return a promise that resolves when the stream closes
      await new Promise<void>((resolve) => {
        request.raw.on("close", resolve);
      });
    },
  );
}
