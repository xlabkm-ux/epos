import { GovernanceRepositoryPort } from "@epios/ports";

export interface TraceSummaryStage {
  stage: string;
  status: "completed" | "pending" | "skipped";
  eventCount: number;
  lastTimestamp?: Date;
}

export interface TraceSummary {
  workspaceId: string;
  totalEvents: number;
  stages: TraceSummaryStage[];
  chain: string;
}

export class GetTraceSummaryUseCase {
  constructor(private governanceRepo: GovernanceRepositoryPort) {}

  async execute(workspaceId: string): Promise<TraceSummary> {
    const events =
      await this.governanceRepo.findTraceByWorkspaceId(workspaceId);

    const stages: TraceSummaryStage[] = [
      {
        stage: "Source Ingestion",
        status: events.some((e) => e.type === "source_ingested")
          ? "completed"
          : "pending",
        eventCount: events.filter((e) => e.type === "source_ingested").length,
        lastTimestamp: events.filter((e) => e.type === "source_ingested").pop()
          ?.timestamp,
      },
      {
        stage: "Source Rating",
        status: events.some(
          (e) => e.type === "source_rated" || e.type === "node_rated",
        )
          ? "completed"
          : "pending",
        eventCount: events.filter(
          (e) => e.type === "source_rated" || e.type === "node_rated",
        ).length,
        lastTimestamp: events
          .filter((e) => e.type === "source_rated" || e.type === "node_rated")
          .pop()?.timestamp,
      },
      {
        stage: "Mapping Run",
        status: events.some((e) => e.type === "mapping_started")
          ? "completed"
          : "pending",
        eventCount: events.filter((e) => e.type.startsWith("mapping_")).length,
        lastTimestamp: events.filter((e) => e.type.startsWith("mapping_")).pop()
          ?.timestamp,
      },
      {
        stage: "Patch Proposal",
        status: events.some((e) => e.type === "patch_proposed")
          ? "completed"
          : "pending",
        eventCount: events.filter((e) => e.type === "patch_proposed").length,
        lastTimestamp: events.filter((e) => e.type === "patch_proposed").pop()
          ?.timestamp,
      },
      {
        stage: "Readiness Assessment",
        status: events.some((e) => e.type === "readiness_assessed")
          ? "completed"
          : "pending",
        eventCount: events.filter((e) => e.type === "readiness_assessed")
          .length,
        lastTimestamp: events
          .filter((e) => e.type === "readiness_assessed")
          .pop()?.timestamp,
      },
      {
        stage: "Final Approval",
        status: events.some((e) => e.type === "artifact_version_created")
          ? "completed"
          : "pending",
        eventCount: events.filter((e) => e.type === "artifact_version_created")
          .length,
        lastTimestamp: events
          .filter((e) => e.type === "artifact_version_created")
          .pop()?.timestamp,
      },
    ];

    const chain = stages
      .filter((s) => s.status === "completed")
      .map((s) => s.stage)
      .join(" → ");

    return {
      workspaceId,
      totalEvents: events.length,
      stages,
      chain: chain || "No events recorded",
    };
  }
}
