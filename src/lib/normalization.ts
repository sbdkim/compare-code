import type { ComparisonOptions } from "../types/diff";

export function splitLines(value: string): string[] {
  return value.replace(/\r\n/g, "\n").split("\n");
}

export function normalizeLine(
  value: string,
  options: Pick<
    ComparisonOptions,
    "ignoreCase" | "ignoreWhitespace" | "trimLines"
  >,
): string {
  let next = value;
  if (options.trimLines) {
    next = next.trim();
  }
  if (options.ignoreWhitespace) {
    next = next.replace(/\s+/g, "");
  }
  if (options.ignoreCase) {
    next = next.toLocaleLowerCase();
  }
  return next;
}

export function normalizeLines(
  lines: string[],
  options: Pick<
    ComparisonOptions,
    "ignoreCase" | "ignoreWhitespace" | "trimLines"
  >,
): string[] {
  return lines.map((line) => normalizeLine(line, options));
}
