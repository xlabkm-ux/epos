import { ValidationError } from "./errors.js";

export type UserRole =
  | "admin"
  | "owner"
  | "contributor"
  | "reviewer"
  | "approver"
  | "observer"
  | "system";

/**
 * WorkPlaceRole is a subset of UserRole used within a specific context.
 */
export type WorkPlaceRole = Extract<
  UserRole,
  "owner" | "contributor" | "reviewer" | "observer"
>;

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  passwordHash?: string;
}

export interface OrgUnit {
  id: string;
  name: string;
  parentId?: string;
}

export interface OrgPosition {
  id: string;
  name: string;
  level: number;
}

export interface AssignmentProps {
  id: string; // workplace_id
  userId: string;
  unitId?: string;
  positionId?: string;
  role: WorkPlaceRole;
  workspaceId?: string;
  isActive: boolean;
  createdAt: Date;
}

export class Assignment {
  private props: AssignmentProps;

  constructor(props: AssignmentProps) {
    this.props = { ...props };
    this.validate();
  }

  private validate(): void {
    if (!this.props.id) throw new ValidationError("WORKPLACE_ID_REQUIRED");
    if (!this.props.userId) throw new ValidationError("USER_ID_REQUIRED");
    if (!this.props.role) throw new ValidationError("ROLE_REQUIRED");
  }

  get id() {
    return this.props.id;
  }
  get userId() {
    return this.props.userId;
  }
  get unitId() {
    return this.props.unitId;
  }
  get positionId() {
    return this.props.positionId;
  }
  get role() {
    return this.props.role;
  }
  get workspaceId() {
    return this.props.workspaceId;
  }
  get isActive() {
    return this.props.isActive;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  public deactivate(): void {
    this.props.isActive = false;
  }

  public activate(): void {
    this.props.isActive = true;
  }

  public toProps(): AssignmentProps {
    return { ...this.props };
  }

  public toJSON() {
    return this.toProps();
  }
}

/**
 * WorkPlace represents the active context for a user session.
 * In this implementation, it is synonymous with an active Assignment.
 */
export class WorkPlace {
  constructor(private assignment: Assignment) {}

  get id() {
    return this.assignment.id;
  }
  get role() {
    return this.assignment.role;
  }
  get workspaceId() {
    return this.assignment.workspaceId;
  }

  public toJSON() {
    return {
      workplaceId: this.id,
      role: this.role,
      workspaceId: this.workspaceId,
      details:
        typeof this.assignment.toJSON === "function"
          ? this.assignment.toJSON()
          : this.assignment,
    };
  }
}
