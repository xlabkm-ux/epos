import { User } from "@epios/domain";
import { IdentityRepositoryPort, SecurityPort } from "@epios/ports";

export interface LoginRequest {
  username: string;
  password?: string; // Optional for now to maintain backward compatibility if needed, but we will use it.
}

export interface LoginResponse {
  user: User;
  token: string;
}

export class LoginUseCase {
  constructor(
    private readonly identityRepo: IdentityRepositoryPort,
    private readonly security: SecurityPort,
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const user = await this.identityRepo.findByUsername(request.username);
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    if (request.password && user.passwordHash) {
      const isValid = await this.security.comparePassword(
        request.password,
        user.passwordHash,
      );
      if (!isValid) {
        throw new Error("INVALID_PASSWORD");
      }
    }

    const token = await this.security.generateToken(user);

    return {
      user,
      token,
    };
  }
}
