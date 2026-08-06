import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("exibe o status pendente de forma acessível", () => {
    const markup = renderToStaticMarkup(<StatusBadge status="pendente" />);
    expect(markup).toContain("pendente");
  });

  it("exibe o status aprovada", () => {
    const markup = renderToStaticMarkup(<StatusBadge status="aprovada" />);
    expect(markup).toContain("aprovada");
  });
});
