import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PostgresGraphRepository } from "../src/graph.repository.js";
import { EpistemicNode, ConcurrencyError } from "@epios/domain";
import { setupTestContainer } from "./container-setup.js";
import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import postgres from "postgres";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

describe("Graph Concurrency Integration Tests (Testcontainers)", () => {
  let container: StartedPostgreSqlContainer;
  let db: PostgresJsDatabase;
  let sql: postgres.Sql;
  let graphRepo: PostgresGraphRepository;

  beforeAll(async () => {
    const setup = await setupTestContainer();
    container = setup.container;
    db = setup.db;
    sql = setup.sql;
    graphRepo = new PostgresGraphRepository(db);
  }, 120000); // 2 minutes timeout for container start and migrations

  afterAll(async () => {
    if (sql) await sql.end();
    if (container) await container.stop();
  });

  it("should detect concurrent modifications on Node update", async () => {
    const nodeId = "node-" + Date.now();
    const node = new EpistemicNode({
      id: nodeId,
      workspaceId: "ws-1",
      missionId: "mission-1",
      type: "claim",
      content: "Initial content",
      strength: "moderate",
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    });

    // Save initial
    await graphRepo.saveNode(node);

    // Fetch two instances
    const instance1 = await graphRepo.findNodeById(nodeId);
    const instance2 = await graphRepo.findNodeById(nodeId);

    expect(instance1).not.toBeNull();
    expect(instance2).not.toBeNull();
    if (!instance1 || !instance2) return;

    // Process 1 updates successfully
    instance1.updateContent("Updated by P1");
    await graphRepo.saveNode(instance1);

    // Process 2 tries to update with old version
    instance2.updateContent("Updated by P2");
    await expect(graphRepo.saveNode(instance2)).rejects.toThrow(
      ConcurrencyError,
    );

    // Verify final state is P1's update
    const finalNode = await graphRepo.findNodeById(nodeId);
    expect(finalNode?.content).toBe("Updated by P1");
    expect(finalNode?.version).toBe(2);
  });
});
