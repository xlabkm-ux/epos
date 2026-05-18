import { describe, it, expect } from "vitest";
import { Mission } from "../src/mission.js";

describe("Mission Domain Entity", () => {
  const baseProps = {
    id: "mission-1",
    workspaceId: "ws-1",
    title: "Test Mission",
    brief: {
      goal: "Verify the core domain logic",
      successCriteria: ["logic verified"],
      constraints: [],
      unknowns: [],
    },
    status: "draft" as const,
    mode: "studio" as const,
    sensitivity: "low" as const,
    artifactIds: [],
    runIds: [],
    createdBy: {
      actorType: "user" as const,
      actorId: "user-1",
    },
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should create a valid mission", () => {
    const mission = new Mission(baseProps);
    expect(mission.id).toBe("mission-1");
    expect(mission.status).toBe("draft");
  });

  it("should transition status from draft to running", () => {
    const mission = new Mission(baseProps);
    mission.startRunning();
    expect(mission.status).toBe("running");
    expect(mission.version).toBe(2);
    expect(mission.domainEvents).toHaveLength(1);
    expect(mission.domainEvents[0].type).toBe("mission.started");
  });

  it("should throw error on invalid transition", () => {
    const mission = new Mission({ ...baseProps, status: "completed" });
    expect(() => mission.startRunning()).toThrow();
  });
});
