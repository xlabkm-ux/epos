export type MappingRunStatus = "pending" | "running" | "completed" | "failed";

export interface MappingRun {
  id: string;
  workspaceId: string;
  missionId: string;
  status: MappingRunStatus;
  progress: number; // 0 to 100
  claimsFound: number;
  evidenceFound: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
