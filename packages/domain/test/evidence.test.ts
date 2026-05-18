import { describe, it, expect } from "vitest";
import { EvidenceRef, EvidenceSet } from "../src/evidence.js";

describe("Evidence Domain Entities", () => {
  it("should create a valid evidence ref", () => {
    const ref = new EvidenceRef({
      id: "ev-1",
      workspaceId: "w1",
      missionId: "mission-1",
      sourceId: "source-1",
      quote: "Direct evidence content",
      supportsNodeIds: ["node-1"],
      citationStatus: "valid",
      createdAt: new Date(),
    });
    expect(ref.id).toBe("ev-1");
    expect(ref.citationStatus).toBe("valid");
  });

  it("should create and update evidence set", () => {
    const set = new EvidenceSet({
      id: "set-1",
      workspaceId: "w1",
      missionId: "mission-1",
      evidenceIds: [],
      version: 1,
      updatedAt: new Date(),
    });
    set.addEvidence("ev-1");
    expect(set.evidenceIds).toContain("ev-1");
    expect(set.version).toBe(2);
  });
});
