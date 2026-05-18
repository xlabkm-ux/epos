import { ValidationError } from "./errors.js";

export type CitationStatus = "valid" | "invalid" | "stale" | "unverified";

export type SourceSpan = {
  sourceId: string;
  chunkId?: string;
  startOffset?: number;
  endOffset?: number;
  locator?: string;
};

export interface EvidenceRefProps {
  id: string;
  workspaceId: string;
  missionId: string;
  sourceId: string;
  span?: SourceSpan;
  quote?: string;
  relevanceScore?: number;
  supportsNodeIds: string[];
  citationStatus: CitationStatus;
  boundaryNote?: string;
  createdAt: Date;
}

export class EvidenceRef {
  private props: EvidenceRefProps;

  constructor(props: EvidenceRefProps) {
    this.props = { ...props };
    this.validate();
  }

  private validate(): void {
    if (!this.props.id) throw new ValidationError("EVIDENCE_REF_ID_REQUIRED");
    if (!this.props.workspaceId)
      throw new ValidationError("WORKSPACE_ID_REQUIRED");
    if (!this.props.missionId) throw new ValidationError("MISSION_ID_REQUIRED");
    if (!this.props.sourceId) throw new ValidationError("SOURCE_ID_REQUIRED");
  }

  get id() {
    return this.props.id;
  }
  get workspaceId() {
    return this.props.workspaceId;
  }
  get missionId() {
    return this.props.missionId;
  }
  get sourceId() {
    return this.props.sourceId;
  }
  get citationStatus() {
    return this.props.citationStatus;
  }
  get supportsNodeIds() {
    return [...this.props.supportsNodeIds];
  }

  public toProps(): EvidenceRefProps {
    return { ...this.props };
  }
}

export interface EvidenceSetProps {
  id: string;
  workspaceId: string;
  missionId: string;
  evidenceIds: string[];
  version: number;
  updatedAt: Date;
}

export class EvidenceSet {
  private props: EvidenceSetProps;

  constructor(props: EvidenceSetProps) {
    this.props = { ...props };
    if (!this.props.id) throw new ValidationError("EVIDENCE_SET_ID_REQUIRED");
    if (!this.props.workspaceId)
      throw new ValidationError("WORKSPACE_ID_REQUIRED");
    if (!this.props.missionId) throw new ValidationError("MISSION_ID_REQUIRED");
  }

  get id() {
    return this.props.id;
  }
  get workspaceId() {
    return this.props.workspaceId;
  }
  get missionId() {
    return this.props.missionId;
  }
  get evidenceIds() {
    return [...this.props.evidenceIds];
  }
  get version() {
    return this.props.version;
  }

  public addEvidence(evidenceId: string): void {
    if (this.props.evidenceIds.includes(evidenceId)) return;
    this.props.evidenceIds.push(evidenceId);
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  public toProps(): EvidenceSetProps {
    return { ...this.props };
  }
}
