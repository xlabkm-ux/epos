import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PostgresUnitOfWorkProvider } from "../src/unit-of-work.js";
import { Mission, Workspace } from "@epios/domain";
import { setupTestContainer } from "./container-setup.js";
import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import postgres from "postgres";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { PostgresMissionRepository } from "../src/mission.repository.js";
import { PostgresWorkspaceRepository } from "../src/workspace.repository.js";

describe("Transactional Integrity Tests (Testcontainers)", () => {
  let container: StartedPostgreSqlContainer;
  let db: PostgresJsDatabase;
  let sql: postgres.Sql;
  let uowProvider: PostgresUnitOfWorkProvider;

  beforeAll(async () => {
    const setup = await setupTestContainer();
    container = setup.container;
    db = setup.db;
    sql = setup.sql;
    uowProvider = new PostgresUnitOfWorkProvider(db);
  }, 120000);

  afterAll(async () => {
    if (sql) await sql.end();
    if (container) await container.stop();
  });

  it("should rollback all changes if one operation fails in a transaction", async () => {
    const workspaceId = "ws-tx-test";
    const missionId = "mission-tx-test";

    // 1. Try to save both workspace and mission in a transaction that fails
    try {
      await uowProvider.runInTransaction(async (uow) => {
        const workspace = new Workspace({
          id: workspaceId,
          title: "TX Workspace",
          status: "running",
          mode: "assisted",
          sensitivity: "internal",
          brief: {
            goal: "test",
            successCriteria: [],
            constraints: [],
            unknowns: [],
          },
          createdBy: { type: "user", id: "user-1" },
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        });
        await uow.workspaceRepository.save(workspace);

        const mission = new Mission({
          id: missionId,
          workspaceId: workspaceId,
          title: "TX Mission",
          status: "draft",
          mode: "autonomous",
          sensitivity: "medium",
          brief: {
            goal: "test",
            successCriteria: [],
            constraints: [],
            unknowns: [],
          },
          createdBy: { actorType: "user", actorId: "user-1" },
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        });
        await uow.missionRepository.save(mission);

        // Force failure
        throw new Error("Simulated Failure");
      });
    } catch (e) {
      expect((e as Error).message).toBe("Simulated Failure");
    }

    // 2. Verify neither workspace nor mission was saved
    const wsRepo = new PostgresWorkspaceRepository(db);
    const missionRepo = new PostgresMissionRepository(db);

    const savedWs = await wsRepo.findById(workspaceId);
    const savedMission = await missionRepo.findById(missionId);

    expect(savedWs).toBeNull();
    expect(savedMission).toBeNull();
  });

  it("should commit all changes if all operations succeed", async () => {
    const workspaceId = "ws-tx-ok";
    const missionId = "mission-tx-ok";

    await uowProvider.runInTransaction(async (uow) => {
      const workspace = new Workspace({
        id: workspaceId,
        title: "OK Workspace",
        status: "running",
        mode: "assisted",
        sensitivity: "internal",
        brief: {
          goal: "test",
          successCriteria: [],
          constraints: [],
          unknowns: [],
        },
        createdBy: { type: "user", id: "user-1" },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      });
      await uow.workspaceRepository.save(workspace);

      const mission = new Mission({
        id: missionId,
        workspaceId: workspaceId,
        title: "OK Mission",
        status: "draft",
        mode: "autonomous",
        sensitivity: "medium",
        brief: {
          goal: "test",
          successCriteria: [],
          constraints: [],
          unknowns: [],
        },
        createdBy: { actorType: "user", actorId: "user-1" },
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      });
      await uow.missionRepository.save(mission);
    });

    const wsRepo = new PostgresWorkspaceRepository(db);
    const missionRepo = new PostgresMissionRepository(db);

    const savedWs = await wsRepo.findById(workspaceId);
    const savedMission = await missionRepo.findById(missionId);

    expect(savedWs).not.toBeNull();
    expect(savedMission).not.toBeNull();
    expect(savedWs?.title).toBe("OK Workspace");
    expect(savedMission?.title).toBe("OK Mission");
  });
});
