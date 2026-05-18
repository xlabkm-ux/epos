import { FastifyInstance } from "fastify";
import { IngestSourceUseCase, ListSourcesUseCase } from "@epios/application";
import { SourceType } from "@epios/domain";

export async function sourceRoutes(
  fastify: FastifyInstance,
  options: {
    ingestSourceUseCase: IngestSourceUseCase;
    listSourcesUseCase: ListSourcesUseCase;
  },
) {
  fastify.get<{ Params: { missionId: string } }>(
    "/missions/:missionId/sources",
    async (request) => {
      return options.listSourcesUseCase.execute(request.params.missionId);
    },
  );

  fastify.post<{
    Params: { missionId: string };
    Body: {
      type: SourceType;
      title: string;
      uri?: string;
      content: string;
      metadata?: Record<string, unknown>;
    };
  }>("/missions/:missionId/sources", async (request, reply) => {
    const user = (request.headers["x-user-id"] as string) || "user-1";
    const source = await options.ingestSourceUseCase.execute({
      missionId: request.params.missionId,
      actorId: user,
      ...request.body,
    });
    return reply.status(201).send(source);
  });
}
