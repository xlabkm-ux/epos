import {
  WorkspaceBrief,
  WorkspaceActor,
  NodeType,
  NodeStrength,
  EvidenceRef,
  EpistemicEdgeType,
  ADR,
  ADRFlow,
} from "@epios/domain";

export interface CreateWorkspaceDto {
  title: string;
  brief: WorkspaceBrief;
  createdBy: WorkspaceActor;
  mode?: "autonomous" | "assisted" | "manual";
  sensitivity?: "public" | "internal" | "confidential" | "restricted";
}

export interface AddNodeDto {
  missionId: string;
  type: NodeType;
  content: string;
  strength?: NodeStrength;
  evidence?: EvidenceRef[];
  metadata?: Record<string, unknown>;
  createdById?: string;
}

export interface AddEdgeDto {
  sourceNodeId: string;
  targetNodeId: string;
  type: EpistemicEdgeType;
  metadata?: Record<string, unknown>;
}

export interface PatchNodeDto {
  type?: NodeType;
  content?: string;
  strength?: NodeStrength;
  evidence?: EvidenceRef[];
  metadata?: Record<string, unknown>;
}

export type ADRDto = ADR;
export type ADRFlowDto = ADRFlow;

export interface AddSourceDto {
  type: "text" | "url" | "file";
  content: string;
  metadata?: Record<string, unknown>;
}

export interface RateNodeDto {
  actorId: string;
  value: number;
  comment?: string;
}
