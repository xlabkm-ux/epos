export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class InvalidTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`Cannot transition from ${from} to ${to}`);
    this.name = "InvalidTransitionError";
  }
}

export class ConcurrencyError extends DomainError {
  constructor(message: string = "Entity was modified by another process") {
    super(message);
    this.name = "ConcurrencyError";
  }
}

export class SecurityError extends DomainError {
  constructor(message: string, public code: string = "E_SECURITY_VIOLATION") {
    super(message);
    this.name = "SecurityError";
  }
}
