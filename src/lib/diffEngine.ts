import { diffArrays, diffChars, diffWordsWithSpace } from "diff";
import { normalizeLine, splitLines } from "./normalization";
import type {
  ComparisonOptions,
  DiffBlock,
  DiffDocument,
  DiffLine,
  DiffStrategy,
  DiffToken,
} from "../types/diff";

interface IndexedLine {
  raw: string;
  normalized: string;
  index: number;
}

interface Operation {
  type: "context" | "addition" | "deletion";
  leftIndex?: number;
  rightIndex?: number;
}

type TokenPart = {
  value?: string;
  added?: boolean;
  removed?: boolean;
};

export function createDiffStrategy(kind: ComparisonOptions["strategy"]): DiffStrategy {
  return {
    compare(original, modified, options) {
      return compareDocuments(original, modified, options, kind);
    },
  };
}

function compareDocuments(
  original: string,
  modified: string,
  options: ComparisonOptions,
  strategy: ComparisonOptions["strategy"],
): DiffDocument {
  const leftRaw = splitLines(original);
  const rightRaw = splitLines(modified);
  const left = leftRaw.map<IndexedLine>((raw, index) => ({
    raw,
    normalized: normalizeLine(raw, options),
    index,
  }));
  const right = rightRaw.map<IndexedLine>((raw, index) => ({
    raw,
    normalized: normalizeLine(raw, options),
    index,
  }));

  const operations =
    strategy === "patience-lite"
      ? patienceDiff(left, right)
      : fallbackDiff(left, right);

  return buildDocument(operations, leftRaw, rightRaw, options);
}

function fallbackDiff(left: IndexedLine[], right: IndexedLine[]): Operation[] {
  const changes = diffArrays(left, right, {
    comparator: (a, b) => a.normalized === b.normalized,
  });
  const operations: Operation[] = [];

  for (const change of changes) {
    const values = change.value as IndexedLine[];
    if (change.added) {
      operations.push(
        ...values.map((entry) => ({
          type: "addition" as const,
          rightIndex: entry.index,
        })),
      );
      continue;
    }
    if (change.removed) {
      operations.push(
        ...values.map((entry) => ({
          type: "deletion" as const,
          leftIndex: entry.index,
        })),
      );
      continue;
    }
    operations.push(
      ...values.map((entry) => ({
        type: "context" as const,
        leftIndex: entry.index,
        rightIndex: entry.index,
      })),
    );
  }

  return operations;
}

function patienceDiff(left: IndexedLine[], right: IndexedLine[]): Operation[] {
  const operations: Operation[] = [];

  function walk(
    leftStart: number,
    leftEnd: number,
    rightStart: number,
    rightEnd: number,
  ) {
    if (leftStart >= leftEnd && rightStart >= rightEnd) {
      return;
    }
    if (leftStart >= leftEnd) {
      for (let index = rightStart; index < rightEnd; index += 1) {
        operations.push({ type: "addition", rightIndex: right[index].index });
      }
      return;
    }
    if (rightStart >= rightEnd) {
      for (let index = leftStart; index < leftEnd; index += 1) {
        operations.push({ type: "deletion", leftIndex: left[index].index });
      }
      return;
    }

    const anchors = findPatienceAnchors(
      left.slice(leftStart, leftEnd),
      right.slice(rightStart, rightEnd),
    );

    if (anchors.length === 0) {
      operations.push(
        ...fallbackDiff(
          left.slice(leftStart, leftEnd),
          right.slice(rightStart, rightEnd),
        ),
      );
      return;
    }

    let previousLeft = leftStart;
    let previousRight = rightStart;

    for (const anchor of anchors) {
      const nextLeft = leftStart + anchor.leftOffset;
      const nextRight = rightStart + anchor.rightOffset;
      walk(previousLeft, nextLeft, previousRight, nextRight);
      operations.push({
        type: "context",
        leftIndex: left[nextLeft].index,
        rightIndex: right[nextRight].index,
      });
      previousLeft = nextLeft + 1;
      previousRight = nextRight + 1;
    }

    walk(previousLeft, leftEnd, previousRight, rightEnd);
  }

  walk(0, left.length, 0, right.length);
  return operations;
}

function findPatienceAnchors(left: IndexedLine[], right: IndexedLine[]) {
  const leftCounts = countByNormalized(left);
  const rightCounts = countByNormalized(right);

  const candidates = left
    .map((entry, leftOffset) => ({ entry, leftOffset }))
    .filter(
      ({ entry }) =>
        entry.normalized &&
        leftCounts.get(entry.normalized) === 1 &&
        rightCounts.get(entry.normalized) === 1,
    )
    .map(({ entry, leftOffset }) => ({
      leftOffset,
      rightOffset: right.findIndex(
        (rightEntry) => rightEntry.normalized === entry.normalized,
      ),
    }))
    .filter((candidate) => candidate.rightOffset >= 0);

  return longestIncreasingSubsequence(candidates);
}

function countByNormalized(lines: IndexedLine[]) {
  const counts = new Map<string, number>();
  for (const line of lines) {
    counts.set(line.normalized, (counts.get(line.normalized) ?? 0) + 1);
  }
  return counts;
}

function longestIncreasingSubsequence(
  values: Array<{ leftOffset: number; rightOffset: number }>,
) {
  const sorted = [...values].sort((a, b) => a.leftOffset - b.leftOffset);
  if (sorted.length === 0) {
    return [];
  }

  const sizes = new Array(sorted.length).fill(1);
  const previous = new Array<number>(sorted.length).fill(-1);
  let bestIndex = 0;

  for (let current = 0; current < sorted.length; current += 1) {
    for (let candidate = 0; candidate < current; candidate += 1) {
      if (
        sorted[candidate].rightOffset < sorted[current].rightOffset &&
        sizes[candidate] + 1 > sizes[current]
      ) {
        sizes[current] = sizes[candidate] + 1;
        previous[current] = candidate;
      }
    }
    if (sizes[current] > sizes[bestIndex]) {
      bestIndex = current;
    }
  }

  const sequence: Array<{ leftOffset: number; rightOffset: number }> = [];
  let cursor = bestIndex;
  while (sorted[cursor]) {
    sequence.unshift(sorted[cursor]);
    cursor = previous[cursor];
    if (cursor === -1) {
      break;
    }
  }
  return sequence;
}

function buildDocument(
  operations: Operation[],
  leftLines: string[],
  rightLines: string[],
  options: ComparisonOptions,
): DiffDocument {
  const lines: DiffLine[] = [];
  const stats = {
    additions: 0,
    deletions: 0,
    modifications: 0,
  };
  let leftPosition = 0;
  let rightPosition = 0;
  let lineId = 0;

  for (let index = 0; index < operations.length; index += 1) {
    const current = operations[index];
    if (current.type === "context") {
      const leftText = leftLines[leftPosition] ?? "";
      const rightText = rightLines[rightPosition] ?? "";
      lines.push(
        buildLine({
          id: `line-${lineId += 1}`,
          leftLineNumber: leftPosition + 1,
          rightLineNumber: rightPosition + 1,
          leftText,
          rightText,
          leftType: "context",
          rightType: "context",
          changeKind: "context",
          options,
        }),
      );
      leftPosition += 1;
      rightPosition += 1;
      continue;
    }

    const deletions: string[] = [];
    const additions: string[] = [];

    while (operations[index]?.type === "deletion") {
      deletions.push(leftLines[leftPosition] ?? "");
      leftPosition += 1;
      index += 1;
    }
    while (operations[index]?.type === "addition") {
      additions.push(rightLines[rightPosition] ?? "");
      rightPosition += 1;
      index += 1;
    }
    index -= 1;

    const shared = Math.min(deletions.length, additions.length);
    for (let offset = 0; offset < shared; offset += 1) {
      lines.push(
        buildLine({
          id: `line-${lineId += 1}`,
          leftLineNumber: leftPosition - deletions.length + offset + 1,
          rightLineNumber: rightPosition - additions.length + offset + 1,
          leftText: deletions[offset],
          rightText: additions[offset],
          leftType: "deletion",
          rightType: "addition",
          changeKind: "modification",
          options,
        }),
      );
      stats.modifications += 1;
    }

    for (let offset = shared; offset < deletions.length; offset += 1) {
      lines.push(
        buildLine({
          id: `line-${lineId += 1}`,
          leftLineNumber: leftPosition - deletions.length + offset + 1,
          rightLineNumber: null,
          leftText: deletions[offset],
          rightText: "",
          leftType: "deletion",
          rightType: "empty",
          changeKind: "deletion",
          options,
        }),
      );
      stats.deletions += 1;
    }

    for (let offset = shared; offset < additions.length; offset += 1) {
      lines.push(
        buildLine({
          id: `line-${lineId += 1}`,
          leftLineNumber: null,
          rightLineNumber: rightPosition - additions.length + offset + 1,
          leftText: "",
          rightText: additions[offset],
          leftType: "empty",
          rightType: "addition",
          changeKind: "addition",
          options,
        }),
      );
      stats.additions += 1;
    }
  }

  const blocks = groupBlocks(lines);
  return {
    blocks,
    stats,
    hasChanges:
      stats.additions > 0 || stats.deletions > 0 || stats.modifications > 0,
  };
}

function buildLine({
  id,
  leftLineNumber,
  rightLineNumber,
  leftText,
  rightText,
  leftType,
  rightType,
  changeKind,
  options,
}: Omit<DiffLine, "leftTokens" | "rightTokens"> & {
  options: ComparisonOptions;
}): DiffLine {
  const { leftTokens, rightTokens } = buildTokens(
    leftText,
    rightText,
    changeKind,
    options,
  );
  return {
    id,
    leftLineNumber,
    rightLineNumber,
    leftText,
    rightText,
    leftType,
    rightType,
    leftTokens,
    rightTokens,
    changeKind,
  };
}

function buildTokens(
  leftText: string,
  rightText: string,
  changeKind: DiffLine["changeKind"],
  options: ComparisonOptions,
) {
  if (changeKind === "context") {
    return {
      leftTokens: [{ value: leftText, type: "context" as const }],
      rightTokens: [{ value: rightText, type: "context" as const }],
    };
  }

  if (changeKind === "addition") {
    return {
      leftTokens: [],
      rightTokens: [{ value: rightText, type: "addition" as const }],
    };
  }

  if (changeKind === "deletion") {
    return {
      leftTokens: [{ value: leftText, type: "deletion" as const }],
      rightTokens: [],
    };
  }

  if (
    normalizeLine(leftText, options) === normalizeLine(rightText, options) ||
    options.granularity === "line"
  ) {
    return {
      leftTokens: [{ value: leftText, type: "deletion" as const }],
      rightTokens: [{ value: rightText, type: "addition" as const }],
    };
  }

  const parts =
    options.granularity === "char"
      ? diffChars(leftText, rightText)
      : diffWordsWithSpace(leftText, rightText);

  return partsToTokens(parts);
}

function partsToTokens(parts: TokenPart[]) {
  const leftTokens: DiffToken[] = [];
  const rightTokens: DiffToken[] = [];

  for (const part of parts) {
    const value = part.value ?? "";
    if (!value) {
      continue;
    }
    if (part.added) {
      rightTokens.push({ value, type: "addition" });
      continue;
    }
    if (part.removed) {
      leftTokens.push({ value, type: "deletion" });
      continue;
    }
    leftTokens.push({ value, type: "context" });
    rightTokens.push({ value, type: "context" });
  }

  return {
    leftTokens: mergeTokens(leftTokens),
    rightTokens: mergeTokens(rightTokens),
  };
}

function mergeTokens(tokens: DiffToken[]) {
  return tokens.reduce<DiffToken[]>((accumulator, token) => {
    const previous = accumulator.at(-1);
    if (previous && previous.type === token.type) {
      previous.value += token.value;
      return accumulator;
    }
    accumulator.push({ ...token });
    return accumulator;
  }, []);
}

function groupBlocks(lines: DiffLine[]): DiffBlock[] {
  const blocks: DiffBlock[] = [];
  let current: DiffLine[] = [];
  let changeKind: DiffBlock["changeKind"] = "context";
  let blockIndex = 0;

  function pushBlock() {
    if (current.length === 0) {
      return;
    }
    blocks.push({
      id: `block-${blockIndex + 1}`,
      anchorId: `change-anchor-${blockIndex + 1}`,
      lines: current,
      changeKind,
    });
    blockIndex += 1;
    current = [];
  }

  for (const line of lines) {
    const nextKind =
      line.changeKind === "context" ? "context" : line.changeKind;
    if (
      current.length > 0 &&
      ((changeKind === "context" && nextKind !== "context") ||
        (changeKind !== "context" && nextKind === "context"))
    ) {
      pushBlock();
    }
    if (current.length === 0) {
      changeKind = nextKind;
    }
    if (changeKind !== "context" && nextKind !== "context") {
      changeKind = "modification";
    }
    current.push(line);
  }

  pushBlock();
  return blocks;
}
