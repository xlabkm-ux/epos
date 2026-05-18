import { EvidenceRef, EvidenceSet } from "@epios/domain";

export interface EvidenceRepositoryPort {
  saveRef(ref: EvidenceRef): Promise<void>;
  findRefById(id: string): Promise<EvidenceRef | null>;
  findRefsByMissionId(missionId: string): Promise<EvidenceRef[]>;
  
  saveSet(set: EvidenceSet): Promise<void>;
  findSetById(id: string): Promise<EvidenceSet | null>;
  findSetByMissionId(missionId: string): Promise<EvidenceSet | null>;
}
