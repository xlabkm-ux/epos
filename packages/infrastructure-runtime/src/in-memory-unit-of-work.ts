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

/**
 * InMemoryUnitOfWork provides access to all repositories.
 * Note: This implementation does not support true transactional rollback.
 */
export class InMemoryUnitOfWork implements UnitOfWork {
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
 * InMemoryUnitOfWorkProvider provides InMemoryUnitOfWork instances.
 */
export class InMemoryUnitOfWorkProvider implements UnitOfWorkPort {
  constructor(
    private readonly graphRepo: GraphRepositoryPort,
    private readonly governanceRepo: GovernanceRepositoryPort,
    private readonly workspaceRepo: WorkspaceRepositoryPort,
    private readonly sourceRepo: SourceRepositoryPort,
    private readonly ratingRepo: RatingRepositoryPort,
    private readonly outboxRepo: OutboxRepositoryPort,
    private readonly missionRepo: MissionRepositoryPort,
    private readonly missionRunRepo: MissionRunRepositoryPort,
    private readonly evidenceRepo: EvidenceRepositoryPort,
    private readonly artifactRepo: ArtifactRepositoryPort,
    private readonly decisionRepo: DecisionRepositoryPort,
    private readonly approvalRepo: ApprovalRepositoryPort,
    private readonly mappingRepo: MappingRepositoryPort,
  ) {}

  async runInTransaction<T>(work: (uow: UnitOfWork) => Promise<T>): Promise<T> {
    const uow = new InMemoryUnitOfWork(
      this.graphRepo,
      this.governanceRepo,
      this.workspaceRepo,
      this.sourceRepo,
      this.ratingRepo,
      this.outboxRepo,
      this.missionRepo,
      this.missionRunRepo,
      this.evidenceRepo,
      this.artifactRepo,
      this.decisionRepo,
      this.approvalRepo,
      this.mappingRepo,
    );
    return await work(uow);
  }
}
