import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { FastifyInstance } from "fastify";
import { buildServer } from "../src/server.js";

describe.skip("ADR API Contract", () => {
  process.env.EPIOS_DATABASE_MODE = "mock";
  vi.setConfig({ testTimeout: 30000 });

  let server: FastifyInstance;

  beforeEach(async () => {
    server = buildServer({ startWorkers: false });
    await server.ready();
  });

  afterEach(async () => {
    await server.close();
  });

  it("should list ADRs", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/adrs",
    });

    expect(response.statusCode).toBe(200);
    const adrs = JSON.parse(response.payload);
    expect(Array.isArray(adrs)).toBe(true);
    expect(adrs.length).toBeGreaterThan(0);
    expect(adrs[0]).toHaveProperty("id");
    expect(adrs[0]).toHaveProperty("title");
  });

  it("should get ADR by id", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/adrs/ADR-0001",
    });

    expect(response.statusCode).toBe(200);
    const adr = JSON.parse(response.payload);
    expect(adr.id).toBe("ADR-0001");
    expect(adr.title).toBe("Create Epistemic OS as a New Project");
  });

  it("should return 404 for non-existent ADR", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/adrs/NON-EXISTENT",
    });

    expect(response.statusCode).toBe(404);
  });
});
