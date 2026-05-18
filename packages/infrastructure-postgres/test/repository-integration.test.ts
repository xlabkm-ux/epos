import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PostgresWorkspaceRepository } from "../src/workspace.repository.js";
import { Workspace, ConcurrencyError } from "@epios/domain";
import { setupTestContainer } from "./container-setup.js";
import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import postgres from "postgres";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

describe("Workspace Repository Integration Tests (Testcontainers)", () => {
  let container: StartedPostgreSqlContainer;
  let db: PostgresJsDatabase;
  let sql: postgres.Sql;
  let workspaceRepo: PostgresWorkspaceRepository;

  beforeAll(async () => {
    const setup = await setupTestContainer();
    container = setup.container;
    db = setup.db;
    sql = setup.sql;
    workspaceRepo = new PostgresWorkspaceRepository(db);
  }, 120000);

  afterAll(async () => {
    if (sql) await sql.end();
    if (container) await container.stop();
  });

  it("should handle optimistic concurrency on Workspace updates", async () => {
    const workspaceId = "test-workspace-concurrency-" + Date.now();
    const workspace = new Workspace({
      id: workspaceId,
      title: "Concurrency Test",
      status: "running",
      mode: "assisted",
      sensitivity: "internal",
      brief: {
        goal: "Test concurrency",
        successCriteria: [],
        constraints: [],
        unknowns: [],
      },
      createdBy: { type: "user", id: "user-1" },
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    });

    await workspaceRepo.save(workspace);

    const instance1 = await workspaceRepo.findById(workspaceId);
    const instance2 = await workspaceRepo.findById(workspaceId);

    expect(instance1).not.toBeNull();
    expect(instance2).not.toBeNull();

    if (!instance1 || !instance2) return;

    instance1.updateTitle("Updated by Process 1");
    await workspaceRepo.save(instance1);

    instance2.updateTitle("Updated by Process 2");
    await expect(workspaceRepo.save(instance2)).rejects.toThrowError(
      ConcurrencyError,
    );
  });

  it("should handle idempotency (saving same state multiple times without failing)", async () => {
    const workspaceId = "test-workspace-idempotency-" + Date.now();
    const workspace = new Workspace({
      id: workspaceId,
      title: "Idempotency Test",
      status: "running",
      mode: "assisted",
      sensitivity: "internal",
      brief: {
        goal: "Test idempotency",
        successCriteria: [],
        constraints: [],
        unknowns: [],
      },
      createdBy: { type: "user", id: "user-1" },
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    });

    await workspaceRepo.save(workspace);

    const freshWorkspace = await workspaceRepo.findById(workspaceId);
    expect(freshWorkspace).not.toBeNull();

    if (freshWorkspace) {
      freshWorkspace.updateTitle("New Title");
      await workspaceRepo.save(freshWorkspace);
      const finalWorkspace = await workspaceRepo.findById(workspaceId);
      expect(finalWorkspace?.title).toBe("New Title");
    }
  });
});
