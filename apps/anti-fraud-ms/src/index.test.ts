import { describe, expect, it } from "vitest";
import { evaluateTransaction } from "./index";

describe("anti-fraud-ms", () => {
  it("approves transactions up to 1000", () => {
    expect(evaluateTransaction(1000).approved).toBe(true);
  });

  it("rejects transactions above 1000", () => {
    expect(evaluateTransaction(1001).approved).toBe(false);
  });
});
