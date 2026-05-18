import {
  ListUserAssignmentsUseCase,
  ListAllAssignmentsUseCase,
  ManageAssignmentUseCase,
  LoginUseCase,
} from "@epios/application";
import {
  AssignmentRepositoryPort,
  IdentityRepositoryPort,
  OrgRepositoryPort,
  SecurityPort,
} from "@epios/ports";

/**
 * IdentityContext encapsulates all identity-related components (repositories and use cases).
 * This helps in maintaining a clean server.ts by grouping related logic.
 */
export class IdentityContext {
  public listUserAssignments: ListUserAssignmentsUseCase;
  public listAllAssignments: ListAllAssignmentsUseCase;
  public manageAssignment: ManageAssignmentUseCase;
  public login: LoginUseCase;

  constructor(
    public identityRepo: IdentityRepositoryPort,
    public assignmentRepo: AssignmentRepositoryPort,
    public orgRepo: OrgRepositoryPort,
    public security: SecurityPort,
  ) {
    this.listUserAssignments = new ListUserAssignmentsUseCase(assignmentRepo);
    this.listAllAssignments = new ListAllAssignmentsUseCase(assignmentRepo);
    this.manageAssignment = new ManageAssignmentUseCase(assignmentRepo);
    this.login = new LoginUseCase(identityRepo, security);
  }
}
