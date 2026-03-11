import type { DiffDocument } from "../types/diff";

export function formatUnifiedDiff(document: DiffDocument): string {
  return document.blocks
    .flatMap((block, index) => {
      const header = `@@ change-${index + 1} @@`;
      const lines = block.lines.flatMap((line) => {
        if (line.changeKind === "context") {
          return [`  ${line.leftText}`];
        }
        if (line.changeKind === "modification") {
          return [`- ${line.leftText}`, `+ ${line.rightText}`];
        }
        if (line.changeKind === "addition") {
          return [`+ ${line.rightText}`];
        }
        return [`- ${line.leftText}`];
      });
      return [header, ...lines];
    })
    .join("\n");
}
