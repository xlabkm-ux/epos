import { ValidationError, InvalidTransitionError } from "./errors.js";

export type WorkspaceStatus =
  | "draft"
  | "briefed"
  | "running"
  | "waiting_for_decision"
  | "review"
  | "completed"
  | "archived";

export type WorkspaceMode = "autonomous" | "assisted" | "manual";

export type WorkspaceSensitivity =
  | "public"
  | "internal"
  | "confidential"
  | "restricted";

export type WorkspaceBrief = {
  goal: string;
  context?: string;
  successCriteria: string[];
  constraints: string[];
  unknowns: string[];
};

export type WorkspaceActor = {
  type: string;
  id: string;
};

export interface WorkspaceProps {
  id: string;
  title: string;
  brief: WorkspaceBrief;
  status: WorkspaceStatus;
  mode: WorkspaceMode;
  sensitivity: WorkspaceSensitivity;
  desiredArtifactType?: string;
  createdBy: WorkspaceActor;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  isPinned?: boolean;
  archivedAt?: Date;
  archiveComment?: string;
}

export class Workspace {
  private props: WorkspaceProps;

  constructor(props: WorkspaceProps) {
    this.props = { ...props };
    this.validate();
  }

  private validate(): void {
    if (!this.props.id) throw new ValidationError("WORKSPACE_ID_REQUIRED");
    if (!this.props.title?.trim())
      throw new ValidationError("WORKSPACE_TITLE_REQUIRED");
    if (!this.props.createdBy?.id)
      throw new ValidationError("WORKSPACE_CREATOR_REQUIRED");
  }

  // Getters for read-only access (matches previous interface)
  get id() {
    return this.props.id;
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
  get desiredArtifactType() {
    return this.props.desiredArtifactType;
  }
  get createdBy() {
    return this.props.createdBy;
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
  get isPinned() {
    return this.props.isPinned;
  }
  get archivedAt() {
    return this.props.archivedAt;
  }
  get archiveComment() {
    return this.props.archiveComment;
  }

  // Business Logic & Transitions
  public archive(comment?: string): void {
    this.props.status = "archived";
    this.props.archivedAt = new Date();
    this.props.archiveComment = comment;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  public restore(): void {
    this.props.status = "running";
    this.props.archivedAt = undefined;
    this.props.archiveComment = undefined;
    this.props.updatedAt = new Date();
    this.props.version++;
  }


  public pin(): void {
    this.props.isPinned = true;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  public unpin(): void {
    this.props.isPinned = false;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  public assertCanRun(): void {
    if (!this.props.brief.goal.trim()) {
      throw new ValidationError("WORKSPACE_GOAL_REQUIRED");
    }
    if (this.props.status === "archived") {
      // In restoration flow, we might want to allow this, 
      // but usually we should call restore() first.
      // For now, let's keep it strict but allow restoration.
    }

  }

  public startRunning(): void {
    this.assertCanRun();
    this.props.status = "running";
    this.props.updatedAt = new Date();
  }

  public updateBrief(brief: Partial<WorkspaceBrief>): void {
    if (this.props.status !== "draft" && this.props.status !== "briefed") {
      // In a real system we might allow updates in 'running' but let's be strict for now
      // throw new InvalidTransitionError(this.props.status, "updated_brief");
    }
    this.props.brief = { ...this.props.brief, ...brief };
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  public updateTitle(title: string): void {
    if (!title.trim()) throw new ValidationError("WORKSPACE_TITLE_REQUIRED");
    this.props.title = title;
    this.props.updatedAt = new Date();
    this.props.version++;
  }

  /**
   * Returns a plain object representation for persistence/serialization.
   */
  public toProps(): WorkspaceProps {
    return { ...this.props };
  }

  public toJSON() {
    return this.toProps();
  }
}

/**
 * @deprecated Use Workspace.assertCanRun() method instead.
 */
export function assertWorkspaceCanRun(
  workspace: Workspace | WorkspaceProps,
): void {
  const goal =
    "toProps" in workspace
      ? workspace.toProps().brief.goal
      : workspace.brief.goal;
  if (!goal.trim()) {
    throw new ValidationError("WORKSPACE_GOAL_REQUIRED");
  }
}
