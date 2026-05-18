import { describe, it, expect, vi } from "vitest";
import { ConsoleTracer } from "../src/tracer.js";

describe("T-SEC-04: Data Redaction", () => {
  it("should redact sensitive fields in payload", () => {
    const tracer = new ConsoleTracer();
    const consoleSpy = vi.spyOn(console, "log");

    tracer.emit({
      type: "TEST_EVENT",
      payload: {
        username: "alice",
        password: "secret-password-123",
        apiKey: "sk-1234567890abcdef1234567890abcdef1234567890abcdef",
        nested: {
          token: "bearer-token",
          safe: "data"
        }
      }
    });

    expect(consoleSpy).toHaveBeenCalled();
    const logOutput = JSON.parse(consoleSpy.mock.calls[0][0]);
    
    expect(logOutput.payload.password).toBe("[REDACTED]");
    expect(logOutput.payload.apiKey).toBe("[REDACTED]");
    expect(logOutput.payload.nested.token).toBe("[REDACTED]");
    expect(logOutput.payload.nested.safe).toBe("data");
    expect(logOutput.payload.username).toBe("alice");
  });

  it("should redact values that match secret patterns even if keys are safe", () => {
    const tracer = new ConsoleTracer();
    const consoleSpy = vi.spyOn(console, "log");

    tracer.emit({
      type: "TEST_EVENT",
      payload: {
        someField: "sk-1234567890abcdef1234567890abcdef1234567890abcdef", // OpenAI format
      }
    });

    const logOutput = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logOutput.payload.someField).toBe("[REDACTED]");
  });
});
