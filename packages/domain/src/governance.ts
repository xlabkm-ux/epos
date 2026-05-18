import { ValidationError, InvalidTransitionError } from "./errors.js";
import { DomainEvent } from "./events.js";
import { EpistemicNode } from "./node.js";

export type GovernanceStatus = "pending" | "approved" | "rejected";

export interface Vote {
  actorId: string;
  decision: "approve" | "reject";
  rationale?: string;
  timestamp: Date;
}

export interface GovernanceProcessProps {
  nodeId: string;
  workspaceId: string;
  status: GovernanceStatus;
  votes: Vote[];
  requiredVotes: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class GovernanceProcess {
  protected props: GovernanceProcessProps;
  private _status: GovernanceStatus;
  private _domainEvents: DomainEvent[] = [];

  constructor(props: GovernanceProcessProps) {
    this.props = { ...props, votes: [...props.votes] };
    this._status = props.status;
    this.validate();
  }

  private validate(): void {
    if (!this.props.nodeId) throw new ValidationError("NODE_ID_REQUIRED");
    if (!this.props.workspaceId)
      throw new ValidationError("WORKSPACE_ID_REQUIRED");
    if (this.props.requiredVotes <= 0)
      throw new ValidationError("REQUIRED_VOTES_POSITIVE");
  }

  get nodeId() {
    return this.props.nodeId;
  }
  get workspaceId() {
    return this.props.workspaceId;
  }
  get status() {
    return this._status;
  }
  get votes() {
    return this.props.votes;
  }
  get requiredVotes() {
    return this.props.requiredVotes;
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

  public castVote(vote: Vote): void {
    if (this._status !== "pending") {
      throw new InvalidTransitionError(this._status, "finalized");
    }

    const oldStatus = this._status;

    // Business rule: one vote per actor
    const existingVoteIdx = this.props.votes.findIndex(
      (v) => v.actorId === vote.actorId,
    );
    if (existingVoteIdx >= 0) {
      this.props.votes[existingVoteIdx] = vote;
    } else {
      this.props.votes.push(vote);
    }

    this.updateStatus();
    this.props.updatedAt = new Date();
    this.props.version++;

    this.addEvent("governance.vote_cast", {
      nodeId: this.nodeId,
      actorId: vote.actorId,
      decision: vote.decision,
    });

    if (this._status !== oldStatus) {
      this.addEvent("governance.status_changed", {
        nodeId: this.nodeId,
        oldStatus,
        newStatus: this._status,
      });
    }
  }

  private updateStatus(): void {
    const approvals = this.props.votes.filter(
      (v) => v.decision === "approve",
    ).length;
    const rejections = this.props.votes.filter(
      (v) => v.decision === "reject",
    ).length;

    if (approvals >= this.props.requiredVotes) {
      this._status = "approved";
    } else if (rejections >= this.props.requiredVotes) {
      this._status = "rejected";
    }
  }

  public toProps(): GovernanceProcessProps {
    return {
      ...this.props,
      status: this._status,
      votes: [...this.props.votes],
    };
  }
}

/**
 * A Claim in EPIOS is a node that undergoes a formal governance process.
 */
export interface Claim extends EpistemicNode {
  governanceId?: string; // Reference to GovernanceProcess
}

export interface NodePatchProps {
  id: string;
  targetNodeId: string;
  workspaceId: string;
  authorId: string;
  content: string;
  status: "pending" | "applied" | "rejected";
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class NodePatch {
  private props: NodePatchProps;

  constructor(props: NodePatchProps) {
    this.props = { ...props };
  }

  get id() {
    return this.props.id;
  }
  get targetNodeId() {
    return this.props.targetNodeId;
  }
  get workspaceId() {
    return this.props.workspaceId;
  }
  get authorId() {
    return this.props.authorId;
  }
  get content() {
    return this.props.content;
  }
  get status() {
    return this.props.status;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get version() {
    return this.props.version;
  }

  public apply(): void {
    this.props.status = "applied";
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  public reject(): void {
    this.props.status = "rejected";
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  public toProps(): NodePatchProps {
    return { ...this.props };
  }

  public toJSON() {
    return this.toProps();
  }
}

export interface PatchGovernanceProps extends GovernanceProcessProps {
  patchId: string;
}

export class PatchGovernance extends GovernanceProcess {
  private patchProps: PatchGovernanceProps;

  constructor(props: PatchGovernanceProps) {
    super(props);
    this.patchProps = { ...props };
  }

  get patchId() {
    return this.patchProps.patchId;
  }

  public toProps(): PatchGovernanceProps {
    return { ...super.toProps(), patchId: this.patchProps.patchId };
  }
}

export type ReadinessStatus = "ready" | "needs_review" | "blocked";

export interface ReadinessAssessment {
  id: string;
  workspaceId: string;
  profileId: string;
  methodVersion: string;
  status: ReadinessStatus;
  indicators: {
    evidenceCoverage: "low" | "medium" | "high";
    traceability: "missing" | "partial" | "full";
    riskHandling: "absent" | "implicit" | "explicit";
  };
  numericScore?: number;
  explanation: string;
  createdAt: Date;
}

export interface ArtifactVersion {
  id: string;
  artifactId: string;
  workspaceId: string;
  version: number;
  content: string;
  authorId: string;
  patchId?: string;
  createdAt: Date;
}

export interface TraceEvent {
  id: string;
  workspaceId: string;
  type: string;
  actorId: string;
  targetId: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}
