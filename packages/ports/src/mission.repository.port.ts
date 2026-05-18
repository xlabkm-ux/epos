import { Mission, MissionRun } from "@epios/domain";

export interface MissionRepositoryPort {
  save(mission: Mission): Promise<void>;
  findById(id: string): Promise<Mission | null>;
  findAll(): Promise<Mission[]>;
  findActiveByWorkspaceId(workspaceId: string): Promise<Mission[]>;
}

export interface MissionRunRepositoryPort {
  save(run: MissionRun): Promise<void>;
  findById(id: string): Promise<MissionRun | null>;
  findByMissionId(missionId: string): Promise<MissionRun[]>;
}
