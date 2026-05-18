import { ApprovalRequest } from "@epios/domain";
import { ApprovalRepositoryPort } from "@epios/ports";

export interface ListApprovalsRequest {
  missionId: string;
  onlyPending?: boolean;
}

export class ListApprovalsUseCase {
  constructor(private approvalRepo: ApprovalRepositoryPort) {}

  async execute(request: ListApprovalsRequest): Promise<ApprovalRequest[]> {
    if (request.onlyPending) {
      return this.approvalRepo.findPendingByMissionId(request.missionId);
    }
    // If we need all, we might need a findByMissionId in ApprovalRepositoryPort
    // For now, pending is the most important for the UI.
    return this.approvalRepo.findPendingByMissionId(request.missionId);
  }
}
