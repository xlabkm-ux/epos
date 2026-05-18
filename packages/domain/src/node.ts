import { ValidationError } from "./errors.js";
import { DomainEvent } from "./events.js";

export type NodeType =
  | "claim"
  | "observation"
  | "hypothesis"
  | "risk"
  | "decision"
  | "question";

export type NodeStrength =
  | "none"
  | "weak"
  | "moderate"
  | "strong"
  | "indisputable";

// Evidence is now handled by EvidenceSet entity

export interface EpistemicNodeProps {
  id: string;
  workspaceId: string;
  missionId: string;
  type: NodeType;
  content: string;
  strength: NodeStrength;
  evidenceSetId?: string;
  metadata: Record<string, unknown>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
}

export class EpistemicNode {
  private props: EpistemicNodeProps;
  private _domainEvents: DomainEvent[] = [];

  constructor(props: EpistemicNodeProps) {
    this.props = { ...props };
    this.validate();
  }

  private validate(): void {
    if (!this.props.id) throw new ValidationError("NODE_ID_REQUIRED");
    if (!this.props.workspaceId)
      throw new ValidationError("WORKSPACE_ID_REQUIRED");
    if (!this.props.missionId)
      throw new ValidationError("MISSION_ID_REQUIRED");
    if (!this.props.content?.trim())
      throw new ValidationError("NODE_CONTENT_REQUIRED");
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
  get type() {
    return this.props.type;
  }
  get content() {
    return this.props.content;
  }
  get strength() {
    return this.props.strength;
  }
  get evidenceSetId() {
    return this.props.evidenceSetId;
  }
  get metadata() {
    return this.props.metadata;
  }
  get version() {
    return this.props.version;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get createdById() {
    return this.props.createdById;
  }

  public toJSON() {
    return this.toProps();
  }

  get domainEvents() {
    return [...this._domainEvents];
  }

  public clearDomainEvents() {
    this._domainEvents = [];
  }

  protected addEvent(type: string, payload: Record<string, unknown>) {
    this._domainEvents.push({
      type,
      payload,
      occurredAt: new Date(),
    });
  }

  public updateContent(content: string): void {
    if (!content.trim()) throw new ValidationError("NODE_CONTENT_REQUIRED");
    const oldContent = this.props.content;
    this.props.content = content;
    this.props.updatedAt = new Date();
    this.props.version++;

    this.addEvent("node.content_updated", {
      nodeId: this.id,
      oldContent,
      newContent: content,
    });
  }

  public setStrength(strength: NodeStrength): void {
    const oldStrength = this.props.strength;
    this.props.strength = strength;
    this.props.updatedAt = new Date();
    this.props.version++;

    this.addEvent("node.strength_updated", {
      nodeId: this.id,
      oldStrength,
      newStrength: strength,
    });
  }

  public linkEvidenceSet(evidenceSetId: string): void {
    this.props.evidenceSetId = evidenceSetId;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  public updateMetadata(metadata: Record<string, unknown>): void {
    this.props.metadata = { ...this.props.metadata, ...metadata };
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  // Evidence replacement is now handled at the EvidenceSet level

  public toProps(): EpistemicNodeProps {
    return { ...this.props };
  }
}

export type EpistemicEdgeType =
  | "supports"
  | "contradicts"
  | "refines"
  | "addresses"
  | "triggers";

export type EpistemicEdge = {
  id: string;
  workspaceId: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: EpistemicEdgeType;
  metadata: Record<string, unknown>;
  createdAt: Date;
};
