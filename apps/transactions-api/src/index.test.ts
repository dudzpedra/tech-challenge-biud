import { describe, expect, it } from "vitest";
import { normalizeTransactionStatus } from "./index";

describe("transactions-api", () => {
  it("normalizes approved status names for event-driven updates", () => {
    expect(normalizeTransactionStatus("approved")).toBe("aprovada");
    expect(normalizeTransactionStatus("APROVED")).toBe("aprovada");
  });

  it("normalizes rejected status names for event-driven updates", () => {
    expect(normalizeTransactionStatus("rejected")).toBe("rejeitada");
    expect(normalizeTransactionStatus("REJEITADA")).toBe("rejeitada");
  });

  it("normalizes pending statuses and rejects unknown statuses", () => {
    expect(normalizeTransactionStatus("pending")).toBe("pendente");
    expect(normalizeTransactionStatus("unknown")).toBeUndefined();
  });
});
