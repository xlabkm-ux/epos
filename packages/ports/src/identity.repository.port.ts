import { User, Assignment, OrgUnit, OrgPosition } from "@epios/domain";

export interface IdentityRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  save(user: User): Promise<void>;
  listAll(): Promise<User[]>;
}

export interface AssignmentRepositoryPort {
  findById(workplaceId: string): Promise<Assignment | null>;
  findByUserId(userId: string): Promise<Assignment[]>;
  save(assignment: Assignment): Promise<void>;
  delete(workplaceId: string): Promise<void>;
  listAll(): Promise<Assignment[]>;
}

export interface OrgRepositoryPort {
  listUnits(): Promise<OrgUnit[]>;
  listPositions(): Promise<OrgPosition[]>;
  saveUnit(unit: OrgUnit): Promise<void>;
  savePosition(position: OrgPosition): Promise<void>;
  deleteUnit(id: string): Promise<void>;
  deletePosition(id: string): Promise<void>;
}
