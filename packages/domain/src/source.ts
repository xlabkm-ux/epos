import { ValidationError } from "./errors.js";

export type SourceType =
  | "user_input"
  | "document"
  | "repo_file"
  | "web"
  | "connector"
  | "tool_output";

export type SourceQuality = "high" | "medium" | "low" | "unknown";

export interface SourceProps {
  id: string;
  workspaceId: string;
  missionId: string;
  sourceType: SourceType;
  title: string;
  uri?: string;
  contentHash?: string;
  freshness?: Date;
  sourceQuality: SourceQuality;
  content: string;
  metadata: Record<string, unknown>;
  deletedAt?: Date;
  createdAt: Date;
}

export class Source {
  private props: SourceProps;

  constructor(props: SourceProps) {
    this.props = { ...props };
    this.validate();
  }

  private validate(): void {
    if (!this.props.id) throw new ValidationError("SOURCE_ID_REQUIRED");
    if (!this.props.workspaceId)
      throw new ValidationError("WORKSPACE_ID_REQUIRED");
    if (!this.props.missionId) throw new ValidationError("MISSION_ID_REQUIRED");
    if (!this.props.title?.trim())
      throw new ValidationError("SOURCE_TITLE_REQUIRED");
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
  get sourceType() {
    return this.props.sourceType;
  }
  get title() {
    return this.props.title;
  }
  get sourceQuality() {
    return this.props.sourceQuality;
  }
  get content() {
    return this.props.content;
  }
  get metadata() {
    return { ...this.props.metadata };
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get deletedAt() {
    return this.props.deletedAt;
  }

  public delete(): void {
    this.props.deletedAt = new Date();
  }

  public toProps(): SourceProps {
    return { ...this.props };
  }
}
