import {
  Workspace,
  EpistemicNode,
  EpistemicEdge,
  ADR,
  Source,
  Rating,
  MappingRun,
  Mission,
  MissionRun,
  EvidenceSet,
  EvidenceRef,
  ConcurrencyError,
  LivingArtifact,
  ArtifactPatch,
  ArtifactVersion,
  DecisionRecord,
  ApprovalRequest,
  Assignment,
  OrgUnit,
  OrgPosition,
  User,
} from "@epios/domain";
import {
  WorkspaceRepositoryPort,
  GraphRepositoryPort,
  SourceRepositoryPort,
  RatingRepositoryPort,
  MappingRepositoryPort,
  OutboxRepositoryPort,
  OutboxMessage,
  MissionRepositoryPort,
  MissionRunRepositoryPort,
  EvidenceRepositoryPort,
  ArtifactRepositoryPort,
  DecisionRepositoryPort,
  ApprovalRepositoryPort,
  AssignmentRepositoryPort,
  OrgRepositoryPort,
  IdentityRepositoryPort,
} from "@epios/ports";

export class InMemoryADRRepository {
  private adrs: Map<string, ADR> = new Map();

  constructor(initialAdrs: ADR[] = []) {
    for (const adr of initialAdrs) {
      this.adrs.set(adr.id, adr);
    }
  }

  async list(): Promise<ADR[]> {
    return Array.from(this.adrs.values());
  }

  async get(id: string): Promise<ADR | null> {
    return this.adrs.get(id) || null;
  }

  async save(adr: ADR): Promise<void> {
    this.adrs.set(adr.id, adr);
  }
}

export const MOCK_ADRS: ADR[] = [
  {
    id: "ADR-0001",
    title: "Create Epistemic OS as a New Project",
    status: "Accepted",
    priority: "P0",
    date: "2026-05-10",
    author: "Kernel Team",
    context: "Initial project setup.",
    decision: "Create a new project named Epistemic OS.",
    consequences: {
      positive: ["Clean slate", "Purpose built"],
      negative: ["Initial setup overhead"],
    },
  },
  {
    id: "ADR-0026",
    title: "Use Apache-2.0 as Recommended Default License",
    status: "Proposed",
    priority: "P1",
    date: "2026-05-13",
    author: "Legal",
    context: "Need a permissive license for open source.",
    decision: "Adopt Apache-2.0.",
    consequences: {
      positive: ["Permissive", "Well-known"],
      negative: ["Requires attribution"],
    },
  },
  {
    id: "ADR-ES-001",
    title: "Adopt Event Sourcing for Mission History",
    status: "Proposed",
    priority: "P1",
    date: "2026-05-13",
    author: "Architect",
    context:
      "A draft ADR proposes event sourcing for all mission history. It claims better auditability and replay, but ignores complexity, migration cost, query model overhead and team familiarity.",
    decision: "Use append-only trace for MVP, defer full event sourcing.",
    consequences: {
      positive: ["Reduced complexity", "Sufficient auditability for MVP"],
      negative: ["Delayed full event sourcing benefits"],
    },
  },
];

export class InMemoryWorkspaceRepository implements WorkspaceRepositoryPort {
  private workspaces: Map<string, Workspace> = new Map();

  constructor(initialWorkspaces: Workspace[] = []) {
    for (const m of initialWorkspaces) {
      this.workspaces.set(m.id, m);
    }
  }

  async save(workspace: Workspace): Promise<void> {
    this.workspaces.set(workspace.id, workspace);
  }

  async findById(id: string): Promise<Workspace | null> {
    return this.workspaces.get(id) || null;
  }

  async findAll(): Promise<Workspace[]> {
    return Array.from(this.workspaces.values());
  }
}

export class InMemoryGraphRepository implements GraphRepositoryPort {
  private nodes: Map<string, EpistemicNode> = new Map();
  private edges: Map<string, EpistemicEdge> = new Map();

  constructor(
    initialNodes: EpistemicNode[] = [],
    initialEdges: EpistemicEdge[] = [],
  ) {
    for (const n of initialNodes) this.nodes.set(n.id, n);
    for (const e of initialEdges) this.edges.set(e.id, e);
  }

  async saveNode(node: EpistemicNode): Promise<void> {
    const existing = this.nodes.get(node.id);
    if (existing && existing.version !== node.version) {
      throw new ConcurrencyError(`Node ${node.id} concurrency conflict`);
    }
    this.nodes.set(node.id, node);
  }

  async saveEdge(edge: EpistemicEdge): Promise<void> {
    this.edges.set(edge.id, edge);
  }

  async deleteNode(id: string): Promise<boolean> {
    return this.nodes.delete(id);
  }

  async deleteEdge(id: string): Promise<boolean> {
    return this.edges.delete(id);
  }

  async findNodesByWorkspaceId(workspaceId: string): Promise<EpistemicNode[]> {
    return Array.from(this.nodes.values()).filter(
      (n) => n.workspaceId === workspaceId,
    );
  }

  async findNodesByMissionId(missionId: string): Promise<EpistemicNode[]> {
    return Array.from(this.nodes.values()).filter(
      (n) => n.missionId === missionId,
    );
  }

  async findEdgesByWorkspaceId(workspaceId: string): Promise<EpistemicEdge[]> {
    return Array.from(this.edges.values()).filter(
      (e) => e.workspaceId === workspaceId,
    );
  }

  async findNodeById(id: string): Promise<EpistemicNode | null> {
    return this.nodes.get(id) || null;
  }

  async findEdgeById(id: string): Promise<EpistemicEdge | null> {
    return this.edges.get(id) || null;
  }

  async findAllNodes(): Promise<EpistemicNode[]> {
    return Array.from(this.nodes.values());
  }
}

export class InMemorySourceRepository implements SourceRepositoryPort {
  private sources: Map<string, Source> = new Map();

  constructor(initialSources: Source[] = []) {
    for (const s of initialSources) {
      this.sources.set(s.id, s);
    }
  }

  async save(source: Source): Promise<void> {
    this.sources.set(source.id, source);
  }

  async findByWorkspaceId(workspaceId: string): Promise<Source[]> {
    return Array.from(this.sources.values()).filter(
      (s) => s.workspaceId === workspaceId,
    );
  }

  async findByMissionId(missionId: string): Promise<Source[]> {
    return Array.from(this.sources.values()).filter(
      (s) => s.missionId === missionId,
    );
  }

  async findActiveByWorkspaceId(workspaceId: string): Promise<Source[]> {
    return Array.from(this.sources.values()).filter(
      (s) => s.workspaceId === workspaceId && !s.deletedAt,
    );
  }

  async findActiveByMissionId(missionId: string): Promise<Source[]> {
    return Array.from(this.sources.values()).filter(
      (s) => s.missionId === missionId && !s.deletedAt,
    );
  }

  async findById(id: string): Promise<Source | null> {
    return this.sources.get(id) || null;
  }
}

export class InMemoryRatingRepository implements RatingRepositoryPort {
  private ratings: Map<string, Rating> = new Map();

  async save(rating: Rating): Promise<void> {
    this.ratings.set(rating.id, rating);
  }

  async findBySubjectId(subjectId: string): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter((r) => r.subjectId === subjectId);
  }
}

export class InMemoryMappingRepository implements MappingRepositoryPort {
  private runs: Map<string, MappingRun> = new Map();

  async save(run: MappingRun): Promise<void> {
    this.runs.set(run.id, run);
  }

  async findById(id: string): Promise<MappingRun | null> {
    return this.runs.get(id) || null;
  }

  async findByWorkspaceId(workspaceId: string): Promise<MappingRun[]> {
    return Array.from(this.runs.values()).filter(
      (r) => r.workspaceId === workspaceId,
    );
  }

  async findAll(): Promise<MappingRun[]> {
    return Array.from(this.runs.values());
  }
}

export class InMemoryOutboxRepository implements OutboxRepositoryPort {
  private messages: Map<string, OutboxMessage> = new Map();

  async save(message: OutboxMessage): Promise<void> {
    this.messages.set(message.id, { ...message });
  }

  async findPending(): Promise<OutboxMessage[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.status === "pending")
      .map((m) => ({ ...m }));
  }

  async markProcessed(id: string): Promise<void> {
    const message = this.messages.get(id);
    if (message) {
      message.status = "processed";
    }
  }
}

export class InMemoryMissionRepository implements MissionRepositoryPort {
  private missions: Map<string, Mission> = new Map();

  async save(mission: Mission): Promise<void> {
    this.missions.set(mission.id, mission);
  }

  async findById(id: string): Promise<Mission | null> {
    return this.missions.get(id) || null;
  }

  async findAll(): Promise<Mission[]> {
    return Array.from(this.missions.values());
  }

  async findByWorkspaceId(workspaceId: string): Promise<Mission[]> {
    return Array.from(this.missions.values()).filter(
      (m) => m.workspaceId === workspaceId,
    );
  }

  async findActiveByWorkspaceId(workspaceId: string): Promise<Mission[]> {
    return Array.from(this.missions.values()).filter(
      (m) => m.workspaceId === workspaceId && !m.deletedAt,
    );
  }
}

export class InMemoryMissionRunRepository implements MissionRunRepositoryPort {
  private runs: Map<string, MissionRun> = new Map();

  async save(run: MissionRun): Promise<void> {
    this.runs.set(run.id, run);
  }

  async findById(id: string): Promise<MissionRun | null> {
    return this.runs.get(id) || null;
  }

  async findByMissionId(missionId: string): Promise<MissionRun[]> {
    return Array.from(this.runs.values()).filter(
      (r) => r.missionId === missionId,
    );
  }
}

export class InMemoryEvidenceRepository implements EvidenceRepositoryPort {
  private sets: Map<string, EvidenceSet> = new Map();
  private refs: Map<string, EvidenceRef> = new Map();

  async saveSet(set: EvidenceSet): Promise<void> {
    this.sets.set(set.id, set);
  }

  async findSetById(id: string): Promise<EvidenceSet | null> {
    return this.sets.get(id) || null;
  }

  async findSetByMissionId(missionId: string): Promise<EvidenceSet | null> {
    return (
      Array.from(this.sets.values()).find((s) => s.missionId === missionId) ||
      null
    );
  }

  async saveRef(ref: EvidenceRef): Promise<void> {
    this.refs.set(ref.id, ref);
  }

  async findRefById(id: string): Promise<EvidenceRef | null> {
    return this.refs.get(id) || null;
  }

  async findRefsByMissionId(missionId: string): Promise<EvidenceRef[]> {
    return Array.from(this.refs.values()).filter(
      (r) => r.missionId === missionId,
    );
  }
}

export class InMemoryArtifactRepository implements ArtifactRepositoryPort {
  private artifacts: Map<string, LivingArtifact> = new Map();
  private patches: Map<string, ArtifactPatch> = new Map();
  private versions: Map<string, ArtifactVersion[]> = new Map();

  async saveArtifact(artifact: LivingArtifact): Promise<void> {
    this.artifacts.set(artifact.id, artifact);
  }

  async findArtifactById(id: string): Promise<LivingArtifact | null> {
    return this.artifacts.get(id) || null;
  }

  async findArtifactsByMissionId(missionId: string): Promise<LivingArtifact[]> {
    return Array.from(this.artifacts.values()).filter(
      (a) => a.missionId === missionId,
    );
  }

  async savePatch(patch: ArtifactPatch): Promise<void> {
    this.patches.set(patch.id, patch);
  }

  async findPatchById(id: string): Promise<ArtifactPatch | null> {
    return this.patches.get(id) || null;
  }

  async findPatchesByArtifactId(artifactId: string): Promise<ArtifactPatch[]> {
    return Array.from(this.patches.values()).filter(
      (p) => p.toProps().artifactId === artifactId,
    );
  }

  async saveVersion(version: ArtifactVersion): Promise<void> {
    const artifactVersions = this.versions.get(version.artifactId) || [];
    artifactVersions.push(version);
    this.versions.set(version.artifactId, artifactVersions);
  }

  async findVersionsByArtifactId(
    artifactId: string,
  ): Promise<ArtifactVersion[]> {
    return this.versions.get(artifactId) || [];
  }

  async getLatestVersion(artifactId: string): Promise<ArtifactVersion | null> {
    const artifactVersions = this.versions.get(artifactId) || [];
    if (artifactVersions.length === 0) return null;
    return artifactVersions.sort((a, b) => b.version - a.version)[0];
  }
}

export class InMemoryDecisionRepository implements DecisionRepositoryPort {
  private decisions: Map<string, DecisionRecord> = new Map();

  async save(decision: DecisionRecord): Promise<void> {
    this.decisions.set(decision.id, decision);
  }

  async findById(id: string): Promise<DecisionRecord | null> {
    return this.decisions.get(id) || null;
  }

  async findByMissionId(missionId: string): Promise<DecisionRecord[]> {
    return Array.from(this.decisions.values()).filter(
      (d) => d.toProps().missionId === missionId,
    );
  }
}

export class InMemoryApprovalRepository implements ApprovalRepositoryPort {
  private approvals: Map<string, ApprovalRequest> = new Map();

  async save(approval: ApprovalRequest): Promise<void> {
    this.approvals.set(approval.id, approval);
  }

  async findById(id: string): Promise<ApprovalRequest | null> {
    return this.approvals.get(id) || null;
  }

  async findByRunId(runId: string): Promise<ApprovalRequest[]> {
    return Array.from(this.approvals.values()).filter(
      (a) => a.toProps().runId === runId,
    );
  }

  async findBySubjectRef(ref: string): Promise<ApprovalRequest | null> {
    return (
      Array.from(this.approvals.values()).find((a) => a.subjectRef === ref) ||
      null
    );
  }

  async findPendingByMissionId(missionId: string): Promise<ApprovalRequest[]> {
    return Array.from(this.approvals.values()).filter(
      (a) => a.missionId === missionId && a.status === "pending",
    );
  }
}

export class InMemoryAssignmentRepository implements AssignmentRepositoryPort {
  private assignments: Map<string, Assignment> = new Map();

  constructor(initial: Assignment[] = []) {
    for (const a of initial) {
      this.assignments.set(a.id, a);
    }
  }

  async findById(workplaceId: string): Promise<Assignment | null> {
    return this.assignments.get(workplaceId) || null;
  }

  async findByUserId(userId: string): Promise<Assignment[]> {
    return Array.from(this.assignments.values()).filter(
      (a) => a.userId === userId,
    );
  }

  async save(assignment: Assignment): Promise<void> {
    this.assignments.set(assignment.id, assignment);
  }

  async delete(workplaceId: string): Promise<void> {
    this.assignments.delete(workplaceId);
  }

  async listAll(): Promise<Assignment[]> {
    return Array.from(this.assignments.values());
  }
}

export class InMemoryOrgRepository implements OrgRepositoryPort {
  private units: Map<string, OrgUnit> = new Map();
  private positions: Map<string, OrgPosition> = new Map();

  constructor(units: OrgUnit[] = [], positions: OrgPosition[] = []) {
    for (const u of units) this.units.set(u.id, u);
    for (const p of positions) this.positions.set(p.id, p);
  }

  async listUnits(): Promise<OrgUnit[]> {
    return Array.from(this.units.values());
  }

  async listPositions(): Promise<OrgPosition[]> {
    return Array.from(this.positions.values());
  }

  async saveUnit(unit: OrgUnit): Promise<void> {
    this.units.set(unit.id, unit);
  }

  async savePosition(position: OrgPosition): Promise<void> {
    this.positions.set(position.id, position);
  }

  async deleteUnit(id: string): Promise<void> {
    this.units.delete(id);
  }

  async deletePosition(id: string): Promise<void> {
    this.positions.delete(id);
  }
}

export class InMemoryIdentityRepository implements IdentityRepositoryPort {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    const user = this.users.get(id) || null;
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return (
      Array.from(this.users.values()).find((u) => u.username === username) ||
      null
    );
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async listAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }
}
