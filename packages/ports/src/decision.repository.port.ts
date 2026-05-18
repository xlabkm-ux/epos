import { DecisionRecord, ApprovalRequest } from "@epios/domain";

export interface DecisionRepositoryPort {
  save(decision: DecisionRecord): Promise<void>;
  findById(id: string): Promise<DecisionRecord | null>;
  findByMissionId(missionId: string): Promise<DecisionRecord[]>;
}

export interface ApprovalRepositoryPort {
  save(approval: ApprovalRequest): Promise<void>;
  findById(id: string): Promise<ApprovalRequest | null>;
  findByRunId(runId: string): Promise<ApprovalRequest[]>;
  findBySubjectRef(ref: string): Promise<ApprovalRequest | null>;
  findPendingByMissionId(missionId: string): Promise<ApprovalRequest[]>;
}
