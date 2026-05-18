/* eslint-disable @typescript-eslint/no-explicit-any */
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import {
  UnitOfWork,
  UnitOfWorkPort,
  GraphRepositoryPort,
  GovernanceRepositoryPort,
  WorkspaceRepositoryPort,
  SourceRepositoryPort,
  RatingRepositoryPort,
  OutboxRepositoryPort,
  MissionRepositoryPort,
  MissionRunRepositoryPort,
  EvidenceRepositoryPort,
  ArtifactRepositoryPort,
  DecisionRepositoryPort,
  ApprovalRepositoryPort,
  MappingRepositoryPort,
} from "@epios/ports";
import { PostgresGraphRepository } from "./graph.repository.js";
import { PostgresWorkspaceRepository } from "./workspace.repository.js";
import { PostgresSourceRepository } from "./source.repository.js";
import { PostgresRatingRepository } from "./rating.repository.js";
import { PostgresGovernanceRepository } from "./governance.repository.js";
import { PostgresOutboxRepository } from "./outbox.repository.js";
import {
  PostgresMissionRepository,
  PostgresMissionRunRepository,
} from "./mission.repository.js";
import { PostgresEvidenceRepository } from "./evidence.repository.js";
import { PostgresArtifactRepository } from "./artifact.repository.js";
import {
  PostgresDecisionRepository,
  PostgresApprovalRepository,
} from "./decision.repository.js";
import { PostgresMappingRepository } from "./mapping.repository.js";

/**
 * PostgresUnitOfWork provides access to all repositories within a single Drizzle transaction.
 */
export class PostgresUnitOfWork implements UnitOfWork {
  constructor(
    public readonly graphRepository: GraphRepositoryPort,
    public readonly governanceRepository: GovernanceRepositoryPort,
    public readonly workspaceRepository: WorkspaceRepositoryPort,
    public readonly sourceRepository: SourceRepositoryPort,
    public readonly ratingRepository: RatingRepositoryPort,
    public readonly outboxRepository: OutboxRepositoryPort,
    public readonly missionRepository: MissionRepositoryPort,
    public readonly missionRunRepository: MissionRunRepositoryPort,
    public readonly evidenceRepository: EvidenceRepositoryPort,
    public readonly artifactRepository: ArtifactRepositoryPort,
    public readonly decisionRepository: DecisionRepositoryPort,
    public readonly approvalRepository: ApprovalRepositoryPort,
    public readonly mappingRepository: MappingRepositoryPort,
  ) {}
}

/**
 * PostgresUnitOfWorkProvider manages Drizzle transactions and provides UnitOfWork instances.
 */
export class PostgresUnitOfWorkProvider implements UnitOfWorkPort {
  constructor(private readonly db: PostgresJsDatabase) {}

  async runInTransaction<T>(work: (uow: UnitOfWork) => Promise<T>): Promise<T> {
    // Drizzle's transaction method handles commit/rollback automatically based on promise resolution/rejection.
    return await this.db.transaction(async (tx) => {
      const uow = new PostgresUnitOfWork(
        new PostgresGraphRepository(tx as any),
        new PostgresGovernanceRepository(tx as any),
        new PostgresWorkspaceRepository(tx as any),
        new PostgresSourceRepository(tx as any),
        new PostgresRatingRepository(tx as any),
        new PostgresOutboxRepository(tx as any),
        new PostgresMissionRepository(tx as any),
        new PostgresMissionRunRepository(tx as any),
        new PostgresEvidenceRepository(
          tx as any,
        ) as unknown as EvidenceRepositoryPort,
        new PostgresArtifactRepository(tx as any),
        new PostgresDecisionRepository(tx as any),
        new PostgresApprovalRepository(tx as any),
        new PostgresMappingRepository(tx as any),
      );
      return await work(uow);
    });
  }
}
