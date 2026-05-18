import {
  GovernanceRepositoryPort,
  GraphRepositoryPort,
  WorkspaceRepositoryPort,
  EvidenceRepositoryPort,
} from "@epios/ports";
import { ReadinessStatus } from "@epios/domain";

export interface GenerateFinalADRRequest {
  workspaceId: string;
}

export interface FinalADROutput {
  markdown: string;
  readinessStatus: ReadinessStatus;
  traceEventCount: number;
}

export class GenerateFinalADRUseCase {
  constructor(
    private governanceRepo: GovernanceRepositoryPort,
    private graphRepo: GraphRepositoryPort,
    private workspaceRepo: WorkspaceRepositoryPort,
    private evidenceRepo: EvidenceRepositoryPort,
  ) {}

  async execute(request: GenerateFinalADRRequest): Promise<FinalADROutput> {
    const workspace = await this.workspaceRepo.findById(request.workspaceId);
    if (!workspace) throw new Error("WORKSPACE_ID_NOT_FOUND");

    const nodes = await this.graphRepo.findNodesByWorkspaceId(
      request.workspaceId,
    );
    const assessment = await this.governanceRepo.findReadinessByWorkspaceId(
      request.workspaceId,
    );
    const trace = await this.governanceRepo.findTraceByWorkspaceId(
      request.workspaceId,
    );

    const title = workspace.title || "Architecture Decision Record";
    const date = new Date().toISOString().split("T")[0];
    const status = assessment?.status === "ready" ? "Approved" : "Proposed";

    const contextNodes = nodes.filter(
      (n) => n.type === "claim" || n.type === "observation",
    );
    const decisionNodes = nodes.filter((n) => n.type === "decision");
    const riskNodes = nodes.filter((n) => n.type === "risk");

    let markdown = `# ADR: ${title}\n\n`;
    markdown += `## Status\n${status}\n\n`;
    markdown += `## Date\n${date}\n\n`;

    markdown += `## Context\n`;
    if (contextNodes.length > 0) {
      contextNodes.forEach((n) => {
        markdown += `- ${n.content}\n`;
      });
    } else {
      markdown += `No context claims provided.\n`;
    }
    markdown += `\n`;

    markdown += `## Decision\n`;
    if (decisionNodes.length > 0) {
      decisionNodes.forEach((n) => {
        markdown += `${n.content}\n`;
      });
    } else {
      markdown += `Decision pending.\n`;
    }
    markdown += `\n`;

    markdown += `## Consequences\n`;
    if (riskNodes.length > 0) {
      markdown += `### Risks & Mitigations\n`;
      riskNodes.forEach((n) => {
        markdown += `- ${n.content}\n`;
      });
    } else {
      markdown += `No significant risks identified.\n`;
    }
    markdown += `\n`;

    markdown += `## Traceability\n`;
    markdown += `- **Readiness:** ${assessment?.status || "not_assessed"} (${assessment?.numericScore || 0}%)\n`;
    markdown += `- **Indicators:**\n`;
    if (assessment) {
      markdown += `  - Evidence Coverage: ${assessment.indicators.evidenceCoverage}\n`;
      markdown += `  - Traceability: ${assessment.indicators.traceability}\n`;
      markdown += `  - Risk Handling: ${assessment.indicators.riskHandling}\n`;
    }
    markdown += `- **Trace Events:** ${trace.length} events recorded\n`;
    markdown += `- **Generated At:** ${new Date().toISOString()}\n`;

    return {
      markdown,
      readinessStatus: assessment?.status || "needs_review",
      traceEventCount: trace.length,
    };
  }
}
