import { GraphRepositoryPort } from "./graph.repository.port.js";
import { GovernanceRepositoryPort } from "./governance.port.js";
import {
  WorkspaceRepositoryPort,
  RatingRepositoryPort,
  SourceRepositoryPort,
  MappingRepositoryPort,
} from "./domain.repository.port.js";
import { OutboxRepositoryPort } from "./outbox.repository.port.js";
import {
  MissionRepositoryPort,
  MissionRunRepositoryPort,
} from "./mission.repository.port.js";
import { EvidenceRepositoryPort } from "./evidence.repository.port.js";
import { ArtifactRepositoryPort } from "./artifact.repository.port.js";
import {
  DecisionRepositoryPort,
  ApprovalRepositoryPort,
} from "./decision.repository.port.js";

/**
 * UnitOfWork provides access to all repositories within a single transaction scope.
 */
export interface UnitOfWork {
  graphRepository: GraphRepositoryPort;
  governanceRepository: GovernanceRepositoryPort;
  workspaceRepository: WorkspaceRepositoryPort;
  missionRepository: MissionRepositoryPort;
  missionRunRepository: MissionRunRepositoryPort;
  sourceRepository: SourceRepositoryPort;
  evidenceRepository: EvidenceRepositoryPort;
  ratingRepository: RatingRepositoryPort;
  artifactRepository: ArtifactRepositoryPort;
  decisionRepository: DecisionRepositoryPort;
  approvalRepository: ApprovalRepositoryPort;
  mappingRepository: MappingRepositoryPort;
  outboxRepository: OutboxRepositoryPort;
}

/**
 * UnitOfWorkPort defines the contract for managing transactional boundaries.
 */
export interface UnitOfWorkPort {
  /**
   * Executes the provided work within a transaction.
   * If the work completes successfully, the transaction is committed.
   * If an error is thrown, the transaction is rolled back.
   */
  runInTransaction<T>(work: (uow: UnitOfWork) => Promise<T>): Promise<T>;
}
