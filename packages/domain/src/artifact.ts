import { ValidationError, InvalidTransitionError } from "./errors.js";
import { DomainEvent } from "./events.js";
import { ActorRef } from "./mission.js";

export type ArtifactType =
  | "markdown_document"
  | "project_plan"
  | "architecture_document"
  | "research_review"
  | "decision_memo"
  | "code"
  | "export_package";

export type ArtifactStatus =
  | "draft"
  | "review"
  | "approved"
  | "exported"
  | "archived";

export interface LivingArtifactProps {
  id: string;
  missionId: string;
  artifactType: ArtifactType;
  title: string;
  currentVersion: number;
  status: ArtifactStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class LivingArtifact {
  private props: LivingArtifactProps;
  private _domainEvents: DomainEvent[] = [];

  constructor(props: LivingArtifactProps) {
    this.props = { ...props };
    if (!this.props.id) throw new ValidationError("ARTIFACT_ID_REQUIRED");
    if (!this.props.missionId) throw new ValidationError("MISSION_ID_REQUIRED");
    if (!this.props.title?.trim())
      throw new ValidationError("ARTIFACT_TITLE_REQUIRED");
  }

  get id() {
    return this.props.id;
  }
  get missionId() {
    return this.props.missionId;
  }
  get artifactType() {
    return this.props.artifactType;
  }
  get title() {
    return this.props.title;
  }
  get currentVersion() {
    return this.props.currentVersion;
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

  get domainEvents() {
    return [...this._domainEvents];
  }
  public clearDomainEvents() {
    this._domainEvents = [];
  }

  private addEvent(type: string, payload: Record<string, unknown>) {
    this._domainEvents.push({ type, payload, occurredAt: new Date() });
  }

  /** draft → review */
  public submitForReview(): void {
    if (this.props.status !== "draft") {
      throw new InvalidTransitionError(this.props.status, "review");
    }
    this.props.status = "review";
    this.props.updatedAt = new Date();
    this.addEvent("artifact.submitted_for_review", { artifactId: this.id });
  }

  /** review → approved */
  public approve(): void {
    if (this.props.status !== "review") {
      throw new InvalidTransitionError(this.props.status, "approved");
    }
    this.props.status = "approved";
    this.props.updatedAt = new Date();
    this.addEvent("artifact.approved", { artifactId: this.id });
  }

  /** Increment currentVersion after a patch is applied */
  public bumpVersion(): void {
    this.props.currentVersion++;
    this.props.updatedAt = new Date();
    this.addEvent("artifact.version_bumped", {
      artifactId: this.id,
      newVersion: this.props.currentVersion,
    });
  }

  /** Any non-archived status → archived */
  public archive(): void {
    if (this.props.status === "archived") {
      throw new InvalidTransitionError(this.props.status, "archived");
    }
    this.props.status = "archived";
    this.props.updatedAt = new Date();
    this.addEvent("artifact.archived", { artifactId: this.id });
  }

  public toProps(): LivingArtifactProps {
    return { ...this.props };
  }
  public toJSON() {
    return this.toProps();
  }
}

// ── ArtifactPatch ───────────────────────────────────────────────

export type ArtifactPatchStatus =
  | "proposed"
  | "accepted"
  | "rejected"
  | "edited"
  | "applied";

export interface ArtifactPatchProps {
  id: string;
  artifactId: string;
  missionId: string;
  baseVersion: number;
  diff: string;
  reason: string;
  nodeRefs: string[];
  evidenceRefs: string[];
  decisionRefs: string[];
  riskClass: "low" | "medium" | "high" | "critical";
  author: ActorRef;
  status: ArtifactPatchStatus;
  createdAt: Date;
  appliedAt?: Date;
}

export class ArtifactPatch {
  private props: ArtifactPatchProps;
  private _domainEvents: DomainEvent[] = [];

  constructor(props: ArtifactPatchProps) {
    this.props = { ...props };
    if (!this.props.id) throw new ValidationError("PATCH_ID_REQUIRED");
    if (!this.props.artifactId)
      throw new ValidationError("PATCH_ARTIFACT_ID_REQUIRED");
    if (!this.props.missionId)
      throw new ValidationError("PATCH_MISSION_ID_REQUIRED");
    if (!this.props.reason?.trim())
      throw new ValidationError("PATCH_REASON_REQUIRED");
    if (!this.props.diff?.trim())
      throw new ValidationError("PATCH_DIFF_REQUIRED");
  }

  get id() {
    return this.props.id;
  }
  get artifactId() {
    return this.props.artifactId;
  }
  get missionId() {
    return this.props.missionId;
  }
  get baseVersion() {
    return this.props.baseVersion;
  }
  get diff() {
    return this.props.diff;
  }
  get reason() {
    return this.props.reason;
  }
  get nodeRefs() {
    return [...this.props.nodeRefs];
  }
  get evidenceRefs() {
    return [...this.props.evidenceRefs];
  }
  get decisionRefs() {
    return [...this.props.decisionRefs];
  }
  get riskClass() {
    return this.props.riskClass;
  }
  get author() {
    return this.props.author;
  }
  get status() {
    return this.props.status;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get appliedAt() {
    return this.props.appliedAt;
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

  /** Is this patch high-risk and requires explicit approval? */
  get requiresApproval(): boolean {
    return (
      this.props.riskClass === "high" || this.props.riskClass === "critical"
    );
  }

  /** Has at least one contextual reference (node, evidence, or decision)? */
  get hasContextRefs(): boolean {
    return (
      this.props.nodeRefs.length > 0 ||
      this.props.evidenceRefs.length > 0 ||
      this.props.decisionRefs.length > 0
    );
  }

  /** proposed → accepted */
  public accept(): void {
    if (this.props.status !== "proposed") {
      throw new InvalidTransitionError(this.props.status, "accepted");
    }
    this.props.status = "accepted";
    this.addEvent("patch.accepted", {
      patchId: this.id,
      artifactId: this.artifactId,
    });
  }

  /** proposed → rejected */
  public reject(rejectionReason?: string): void {
    if (this.props.status !== "proposed") {
      throw new InvalidTransitionError(this.props.status, "rejected");
    }
    this.props.status = "rejected";
    this.addEvent("patch.rejected", {
      patchId: this.id,
      artifactId: this.artifactId,
      rejectionReason,
    });
  }

  /** accepted → applied (or proposed → applied for auto-apply low-risk) */
  public apply(): void {
    if (this.props.status !== "accepted" && this.props.status !== "proposed") {
      throw new InvalidTransitionError(this.props.status, "applied");
    }
    this.props.status = "applied";
    this.props.appliedAt = new Date();
    this.addEvent("patch.applied", {
      patchId: this.id,
      artifactId: this.artifactId,
      appliedAt: this.props.appliedAt.toISOString(),
    });
  }

  public toProps(): ArtifactPatchProps {
    return { ...this.props };
  }
  public toJSON() {
    return this.toProps();
  }
}
