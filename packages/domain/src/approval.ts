import { ValidationError, InvalidTransitionError } from "./errors.js";
import { DomainEvent } from "./events.js";
import { ActorRef } from "./mission.js";

export type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "edited"
  | "expired"
  | "cancelled";

export type ApprovalPreview = {
  title: string;
  summary: string;
  whatWillHappen: string[];
  dataLeavingSystem?: string[];
  rollback?: string;
};

export interface ApprovalRequestProps {
  id: string;
  missionId: string;
  runId: string;
  subjectType:
    | "tool_call"
    | "artifact_patch"
    | "forge_action"
    | "external_write";
  subjectRef: string;
  preview: ApprovalPreview;
  riskClass: "low" | "medium" | "high" | "critical";
  status: ApprovalStatus;
  idempotencyKey: string;
  createdAt: Date;
  expiresAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: ActorRef;
  decisionId?: string;
  version: number;
}

export class ApprovalRequest {
  private props: ApprovalRequestProps;
  private _domainEvents: DomainEvent[] = [];

  constructor(props: ApprovalRequestProps) {
    this.props = { ...props };
    if (!this.props.id) throw new ValidationError("APPROVAL_ID_REQUIRED");
    if (!this.props.missionId) throw new ValidationError("MISSION_ID_REQUIRED");
    if (!this.props.subjectRef)
      throw new ValidationError("SUBJECT_REF_REQUIRED");
    if (!this.props.idempotencyKey)
      throw new ValidationError("IDEMPOTENCY_KEY_REQUIRED");
  }

  get id() {
    return this.props.id;
  }
  get missionId() {
    return this.props.missionId;
  }
  get runId() {
    return this.props.runId;
  }
  get subjectType() {
    return this.props.subjectType;
  }
  get subjectRef() {
    return this.props.subjectRef;
  }
  get preview() {
    return this.props.preview;
  }
  get riskClass() {
    return this.props.riskClass;
  }
  get status() {
    return this.props.status;
  }
  get idempotencyKey() {
    return this.props.idempotencyKey;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get expiresAt() {
    return this.props.expiresAt;
  }
  get resolvedAt() {
    return this.props.resolvedAt;
  }
  get resolvedBy() {
    return this.props.resolvedBy;
  }
  get decisionId() {
    return this.props.decisionId;
  }
  get version() {
    return this.props.version;
  }

  get domainEvents() {
    return [...this._domainEvents];
  }
  public clearDomainEvents() {
    this._domainEvents = [];
  }

  private addEvent(type: string, payload: Record<string, unknown>) {
    this._domainEvents.push({ type, payload, occurredAt: new Date() });
  }

  /** Check if this approval has expired */
  get isExpired(): boolean {
    return !!this.props.expiresAt && new Date() > this.props.expiresAt;
  }

  private guardPending(): void {
    if (this.props.status !== "pending") {
      throw new InvalidTransitionError(this.props.status, "resolved");
    }
    if (this.isExpired) {
      throw new InvalidTransitionError("expired", "resolved");
    }
  }

  /** pending → approved */
  public approve(decisionId: string, actor: ActorRef): void {
    this.guardPending();
    this.props.status = "approved";
    this.props.decisionId = decisionId;
    this.props.resolvedAt = new Date();
    this.props.resolvedBy = actor;
    this.props.version++;
    this.addEvent("approval.approved", {
      approvalId: this.id,
      subjectRef: this.subjectRef,
      decisionId,
    });
  }

  /** pending → rejected */
  public reject(decisionId: string, actor: ActorRef): void {
    this.guardPending();
    this.props.status = "rejected";
    this.props.decisionId = decisionId;
    this.props.resolvedAt = new Date();
    this.props.resolvedBy = actor;
    this.props.version++;
    this.addEvent("approval.rejected", {
      approvalId: this.id,
      subjectRef: this.subjectRef,
      decisionId,
    });
  }

  /** pending → expired (system-initiated) */
  public expire(): void {
    if (this.props.status !== "pending") {
      throw new InvalidTransitionError(this.props.status, "expired");
    }
    this.props.status = "expired";
    this.props.resolvedAt = new Date();
    this.props.version++;
    this.addEvent("approval.expired", { approvalId: this.id });
  }

  /** pending → cancelled (user-initiated) */
  public cancel(actor: ActorRef): void {
    if (this.props.status !== "pending") {
      throw new InvalidTransitionError(this.props.status, "cancelled");
    }
    this.props.status = "cancelled";
    this.props.resolvedAt = new Date();
    this.props.resolvedBy = actor;
    this.props.version++;
    this.addEvent("approval.cancelled", { approvalId: this.id });
  }

  public toProps(): ApprovalRequestProps {
    return { ...this.props };
  }
  public toJSON() {
    return this.toProps();
  }
}
