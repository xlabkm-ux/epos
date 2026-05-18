import { Workspace, Source, Rating, MappingRun } from "@epios/domain";

export interface WorkspaceRepositoryPort {
  save(workspace: Workspace): Promise<void>;
  findById(id: string): Promise<Workspace | null>;
  findAll(): Promise<Workspace[]>;
}

export interface SourceRepositoryPort {
  save(source: Source): Promise<void>;
  findByMissionId(missionId: string): Promise<Source[]>;
  findByWorkspaceId(workspaceId: string): Promise<Source[]>;
  findActiveByMissionId(missionId: string): Promise<Source[]>;
  findActiveByWorkspaceId(workspaceId: string): Promise<Source[]>;
  findById(id: string): Promise<Source | null>;
}

export interface RatingRepositoryPort {
  save(rating: Rating): Promise<void>;
  findBySubjectId(subjectId: string): Promise<Rating[]>;
}

export interface MappingRepositoryPort {
  save(run: MappingRun): Promise<void>;
  findById(id: string): Promise<MappingRun | null>;
  findByWorkspaceId(workspaceId: string): Promise<MappingRun[]>;
  findAll(): Promise<MappingRun[]>;
}
