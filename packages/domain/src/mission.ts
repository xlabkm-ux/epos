import { ValidationError, InvalidTransitionError } from "./errors.js";
import { DomainEvent } from "./events.js";

export type MissionStatus =
  | "draft"
  | "briefed"
  | "running"
  | "waiting_for_decision"
  | "review"
  | "completed"
  | "archived";

export type MissionMode = "fast" | "studio" | "lab" | "forge";

export type ActorRef = {
  actorType: "user" | "system" | "policy" | "tool" | "role_pass";
  actorId: string;
  role?: string;
};

export type MissionBrief = {
  goal: string;
  context?: string;
  successCriteria: string[];
  constraints: string[];
  unknowns: string[];
  desiredArtifactType?: string;
};

export interface MissionProps {
  id: string;
  workspaceId: string;
  title: string;
  brief: MissionBrief;
  status: MissionStatus;
  mode: MissionMode;
  sensitivity: "low" | "medium" | "high";
  artifactIds: string[];
  runIds: string[];
  createdBy: ActorRef;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export class Mission {
  private props: MissionProps;
  private _domainEvents: DomainEvent[] = [];

  constructor(props: MissionProps) {
    this.props = { ...props };
    this.validate();
  }

  private validate(): void {
    if (!this.props.id) throw new ValidationError("MISSION_ID_REQUIRED");
    if (!this.props.workspaceId)
      throw new ValidationError("WORKSPACE_ID_REQUIRED");
    if (!this.props.brief.goal?.trim())
      throw new ValidationError("MISSION_GOAL_REQUIRED");
    if (!this.props.createdBy?.actorId)
      throw new ValidationError("MISSION_CREATOR_REQUIRED");
  }

  get id() {
    return this.props.id;
  }
  get workspaceId() {
    return this.props.workspaceId;
  }
  get title() {
    return this.props.title;
  }
  get brief() {
    return this.props.brief;
  }
  get status() {
    return this.props.status;
  }
  get mode() {
    return this.props.mode;
  }
  get sensitivity() {
    return this.props.sensitivity;
  }
  get artifactIds() {
    return [...this.props.artifactIds];
  }
  get runIds() {
    return [...this.props.runIds];
  }
  get createdBy() {
    return this.props.createdBy;
  }
  get version() {
    return this.props.version;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  // Business Logic & Transitions
  public updateBrief(brief: Partial<MissionBrief>): void {
    this.props.brief = { ...this.props.brief, ...brief };
    this.props.status = "briefed";
    this.props.updatedAt = new Date();
    this.props.version++;
    this.addEvent("mission.brief_updated", { missionId: this.id });
  }

  public startRunning(): void {
    if (this.props.status === "archived" || this.props.status === "completed") {
      throw new InvalidTransitionError(this.props.status, "running");
    }
    this.props.status = "running";
    this.props.updatedAt = new Date();
    this.props.version++;
    this.addEvent("mission.started", { missionId: this.id });
  }

  public complete(): void {
    if (this.props.status !== "running" && this.props.status !== "review") {
      throw new InvalidTransitionError(this.props.status, "completed");
    }
    this.props.status = "completed";
    this.props.updatedAt = new Date();
    this.props.version++;
    this.addEvent("mission.completed", { missionId: this.id });
  }

  public archive(): void {
    this.props.status = "archived";
    this.props.updatedAt = new Date();
    this.props.version++;
    this.addEvent("mission.archived", { missionId: this.id });
  }

  public delete(): void {
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
    this.props.version++;
    this.addEvent("mission.deleted", { missionId: this.id });
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  private addEvent(type: string, payload: Record<string, unknown>) {
    this._domainEvents.push({
      type,
      payload,
      occurredAt: new Date(),
    });
  }

  get domainEvents() {
    return [...this._domainEvents];
  }
  public clearDomainEvents() {
    this._domainEvents = [];
  }

  public toProps(): MissionProps {
    return { ...this.props };
  }
}

export type MissionRunStatus =
  | "queued"
  | "running"
  | "requires_action"
  | "waiting"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired";

export type MissionRunStage =
  | "intake"
  | "briefing"
  | "preflight"
  | "mapping"
  | "working"
  | "artifact_build"
  | "review"
  | "forge";

export interface MissionRunProps {
  id: string;
  missionId: string;
  status: MissionRunStatus;
  currentStage?: MissionRunStage;
  pendingApprovalIds: string[];
  idempotencyKey?: string;
  startedBy: ActorRef;
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failedReason?: string;
  version: number;
}

export class MissionRun {
  private props: MissionRunProps;

  constructor(props: MissionRunProps) {
    this.props = { ...props };
  }

  get id() {
    return this.props.id;
  }
  get missionId() {
    return this.props.missionId;
  }
  get status() {
    return this.props.status;
  }
  get currentStage() {
    return this.props.currentStage;
  }

  public transitionToStage(stage: MissionRunStage): void {
    if (this.isTerminal()) {
      throw new ValidationError("CANNOT_TRANSITION_TERMINAL_RUN");
    }
    this.props.currentStage = stage;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  public complete(): void {
    this.props.status = "completed";
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  public fail(reason: string): void {
    this.props.status = "failed";
    this.props.failedReason = reason;
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  private isTerminal(): boolean {
    return ["completed", "failed", "cancelled", "expired"].includes(
      this.props.status,
    );
  }

  public toProps(): MissionRunProps {
    return { ...this.props };
  }
}
