import { FastifyInstance } from "fastify";
import { IdentityContext } from "../identity-context.js";

export async function identityRoutes(
  fastify: FastifyInstance,
  options: {
    context: IdentityContext;
  },
) {
  const { context } = options;
  
  fastify.post("/auth/login", async (request, reply) => {
    const { username, password } = request.body as {
      username: string;
      password?: string;
    };
    try {
      const { user, token } = await context.login.execute({
        username,
        password,
      });
      return { user, token };
    } catch (e: any) {
      if (e.message === "USER_NOT_FOUND" || e.message === "INVALID_PASSWORD") {
        return reply.status(401).send({ error: "INVALID_CREDENTIALS" });
      }
      throw e;
    }
  });

  fastify.get("/identity/assignments", async () => {
    const user = await context.security.getCurrentUser();
    if (!user) return { assignments: [] };

    const assignments = await context.listUserAssignments.execute(user.id);
    return { assignments };
  });

  fastify.get(
    "/identity/assignments/:userId",
    async (request, reply) => {
      const currentUser = await context.security.getCurrentUser();
      if (!currentUser || currentUser.role !== "admin") {
        return reply.status(403).send({ error: "FORBIDDEN" });
      }
      const { userId } = request.params as { userId: string };
      const assignments = await context.listUserAssignments.execute(userId);
      return { assignments };
    },
  );

  fastify.post("/identity/assignments", async (request, reply) => {
    const user = await context.security.getCurrentUser();
    if (!user || user.role !== "admin") {
      return reply.status(403).send({ error: "FORBIDDEN" });
    }
    const command = request.body as any;
    const assignment = await context.manageAssignment.create(command);
    return { assignment };
  });

  fastify.delete("/identity/assignments/:id", async (request, reply) => {
    const user = await context.security.getCurrentUser();
    if (!user || user.role !== "admin") {
      return reply.status(403).send({ error: "FORBIDDEN" });
    }
    const { id } = request.params as { id: string };
    await context.manageAssignment.delete(id);
    return { success: true };
  });

  fastify.get("/identity/admin/assignments", async (request, reply) => {
    const user = await context.security.getCurrentUser();
    if (!user || user.role !== "admin") {
      return reply.status(403).send({ error: "FORBIDDEN" });
    }
    const assignments = await context.listAllAssignments.execute();
    return { assignments };
  });

  fastify.get("/identity/admin/users", async (request, reply) => {
    const user = await context.security.getCurrentUser();
    if (!user || user.role !== "admin") {
      return reply.status(403).send({ error: "FORBIDDEN" });
    }
    const users = await context.identityRepo.listAll();
    return { users };
  });

  fastify.get("/identity/org-structure", async () => {
    const units = await context.orgRepo.listUnits();
    const positions = await context.orgRepo.listPositions();
    return { units, positions };
  });
}
