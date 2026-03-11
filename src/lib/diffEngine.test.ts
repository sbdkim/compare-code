import { describe, expect, it } from "vitest";
import { DEFAULT_OPTIONS } from "./constants";
import { createDiffStrategy } from "./diffEngine";

describe("diff engine", () => {
  const strategy = createDiffStrategy("patience-lite");

  it("returns no changes for identical input", () => {
    const document = strategy.compare("alpha\nbeta", "alpha\nbeta", DEFAULT_OPTIONS);
    expect(document.hasChanges).toBe(false);
    expect(document.stats).toEqual({
      additions: 0,
      deletions: 0,
      modifications: 0,
    });
  });

  it("tracks additions, deletions, and modifications", () => {
    const document = strategy.compare(
      "alpha\nbeta\ngamma",
      "alpha\nbeta changed\ndelta",
      DEFAULT_OPTIONS,
    );

    expect(document.stats.modifications).toBe(2);
    expect(document.stats.deletions).toBe(0);
    expect(document.stats.additions).toBe(0);
  });

  it("supports character-level intraline diffs", () => {
    const document = strategy.compare("return a;", "return b;", {
      ...DEFAULT_OPTIONS,
      granularity: "char",
    });

    const modifiedLine = document.blocks
      .flatMap((block) => block.lines)
      .find((line) => line.changeKind === "modification");

    expect(modifiedLine?.leftTokens.some((token) => token.type === "deletion")).toBe(
      true,
    );
    expect(modifiedLine?.rightTokens.some((token) => token.type === "addition")).toBe(
      true,
    );
  });

  it("respects ignore-case and trim settings", () => {
    const document = strategy.compare("  Apple", "apple  ", {
      ...DEFAULT_OPTIONS,
      ignoreCase: true,
      trimLines: true,
    });

    expect(document.hasChanges).toBe(false);
  });

  it("uses patience-lite anchors for reordered code-like blocks", () => {
    const document = strategy.compare(
      ["const keep = true;", "function beta() {}", "function alpha() {}"].join("\n"),
      ["const keep = true;", "function alpha() {}", "function beta() {}"].join("\n"),
      DEFAULT_OPTIONS,
    );

    expect(document.hasChanges).toBe(true);
    expect(document.blocks.some((block) => block.changeKind === "modification")).toBe(
      true,
    );
  });
});
