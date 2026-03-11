import type { ComparisonOptions } from "../types/diff";

export const STORAGE_KEY = "code-compare-session";

export const DEFAULT_LEFT_TEXT = [
  "function greet(name) {",
  "  const message = `Hello, ${name}!`;",
  "  return message;",
  "}",
].join("\n");

export const DEFAULT_RIGHT_TEXT = [
  "function greet(userName) {",
  "  const message = `Hello, ${userName}!`;",
  "  return message.trim();",
  "}",
].join("\n");

export const DEFAULT_OPTIONS: ComparisonOptions = {
  ignoreCase: false,
  ignoreWhitespace: false,
  trimLines: false,
  granularity: "word",
  viewMode: "side-by-side",
  language: "javascript",
  strategy: "patience-lite",
};

export const SUPPORTED_IMPORT_EXTENSIONS = new Set([
  "txt",
  "js",
  "ts",
  "tsx",
  "jsx",
  "py",
  "json",
  "html",
  "css",
  "md",
  "xml",
  "yml",
  "yaml",
  "java",
  "c",
  "cpp",
  "cs",
  "go",
  "rs",
  "php",
  "sql",
]);

export const LANGUAGE_OPTIONS = [
  { value: "auto", label: "Auto detect" },
  { value: "plaintext", label: "Plain text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "json", label: "JSON" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "markdown", label: "Markdown" },
  { value: "sql", label: "SQL" },
  { value: "xml", label: "XML" },
  { value: "php", label: "PHP" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C / C++" },
];
