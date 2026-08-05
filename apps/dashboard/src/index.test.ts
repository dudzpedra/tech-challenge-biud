import { describe, expect, it } from "vitest";
import { formatCurrency, toSearchParams } from "./index";

describe("dashboard", () => {
  it("formats a transaction value as BRL currency", () => {
    expect(formatCurrency("120.5")).toBe("R$ 120,50");
  });

  it("serializes the filters used by the transaction endpoint", () => {
    expect(toSearchParams({ status: "pendente", page: 2 }).toString()).toBe(
      "status=pendente&page=2",
    );
  });
});
