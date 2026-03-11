export type DiffGranularity = "line" | "word" | "char";
export type DiffViewMode = "side-by-side" | "unified";
export type DiffTheme = "light" | "dark";
export type DiffStrategyKind = "myers" | "patience-lite";
export type InputSide = "left" | "right";

export interface ComparisonOptions {
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
  trimLines: boolean;
  granularity: DiffGranularity;
  viewMode: DiffViewMode;
  language: string;
  strategy: DiffStrategyKind;
}

export interface DiffToken {
  value: string;
  type: "context" | "addition" | "deletion";
}

export interface DiffLine {
  id: string;
  leftLineNumber: number | null;
  rightLineNumber: number | null;
  leftText: string;
  rightText: string;
  leftType: "context" | "addition" | "deletion" | "empty";
  rightType: "context" | "addition" | "deletion" | "empty";
  leftTokens: DiffToken[];
  rightTokens: DiffToken[];
  changeKind: "context" | "addition" | "deletion" | "modification";
}

export interface DiffBlock {
  id: string;
  anchorId: string;
  lines: DiffLine[];
  changeKind: "context" | "addition" | "deletion" | "modification";
}

export interface DiffStats {
  additions: number;
  deletions: number;
  modifications: number;
}

export interface DiffDocument {
  blocks: DiffBlock[];
  stats: DiffStats;
  hasChanges: boolean;
}

export interface DiffStrategy {
  compare(
    original: string,
    modified: string,
    options: ComparisonOptions,
  ): DiffDocument;
}

export interface ImportSource {
  side: InputSide;
  fileName: string;
  extension: string;
  content: string;
}

export interface PersistedSession {
  version: 1;
  leftText: string;
  rightText: string;
  options: ComparisonOptions;
  theme: DiffTheme;
}
