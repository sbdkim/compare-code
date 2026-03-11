import type { Extension } from "@codemirror/state";

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  json: "json",
  html: "html",
  htm: "html",
  css: "css",
  md: "markdown",
  markdown: "markdown",
  sql: "sql",
  xml: "xml",
  yml: "xml",
  yaml: "xml",
  php: "php",
  go: "go",
  rs: "rust",
  java: "java",
  c: "cpp",
  cpp: "cpp",
  h: "cpp",
  hpp: "cpp",
  txt: "plaintext",
};

export function getLanguageFromExtension(extension: string): string {
  return EXTENSION_TO_LANGUAGE[extension.toLowerCase()] ?? "plaintext";
}

export function detectLanguage(left: string, right: string): string {
  const sample = `${left}\n${right}`.trim();
  if (!sample) {
    return "plaintext";
  }

  if (/^\s*[{[]/.test(sample)) {
    try {
      JSON.parse(sample);
      return "json";
    } catch {
      // Continue with heuristics.
    }
  }

  if (/<(!doctype|html|div|span|script|style|body|head)\b/i.test(sample)) {
    return "html";
  }
  if (/^\s*<\?xml\b/i.test(sample) || /<\/?[a-z][^>]*>/i.test(sample)) {
    return "xml";
  }
  if (/(^|\n)\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)\b/i.test(sample)) {
    return "sql";
  }
  if (/(^|\n)\s*def\s+\w+\s*\(|(^|\n)\s*import\s+\w+|:\s*(#.*)?$/m.test(sample)) {
    return "python";
  }
  if (/(^|\n)\s*package\s+\w+|(^|\n)\s*func\s+\w+\s*\(/m.test(sample)) {
    return "go";
  }
  if (/(^|\n)\s*fn\s+\w+\s*\(|(^|\n)\s*let\s+mut\s+/m.test(sample)) {
    return "rust";
  }
  if (/(^|\n)\s*(public|private|class|interface)\b.*[{;]/m.test(sample)) {
    return /:\s*[A-Z][A-Za-z0-9_<>\[\]\|]+/.test(sample)
      ? "typescript"
      : "java";
  }
  if (/(^|\n)\s*(interface|type)\s+\w+\s*=|:\s*[A-Z][A-Za-z0-9_<>\[\]\|]+/m.test(sample)) {
    return "typescript";
  }
  if (/^\s*#{1,6}\s|\[[^\]]+\]\([^)]+\)/m.test(sample)) {
    return "markdown";
  }
  if (/(^|\n)\s*[.#]?[a-zA-Z0-9_-]+\s*\{[^}]*:/m.test(sample)) {
    return "css";
  }
  if (/(^|\n)\s*<\?php\b/i.test(sample)) {
    return "php";
  }
  if (/(^|\n)\s*(const|let|var|function|export|import)\b/m.test(sample)) {
    return "javascript";
  }

  return "plaintext";
}

export async function loadLanguageExtension(language: string): Promise<Extension[]> {
  switch (language) {
    case "javascript": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return [javascript({ jsx: true })];
    }
    case "typescript": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return [javascript({ typescript: true, jsx: true })];
    }
    case "python": {
      const { python } = await import("@codemirror/lang-python");
      return [python()];
    }
    case "json": {
      const { json } = await import("@codemirror/lang-json");
      return [json()];
    }
    case "html": {
      const { html } = await import("@codemirror/lang-html");
      return [html()];
    }
    case "css": {
      const { css } = await import("@codemirror/lang-css");
      return [css()];
    }
    case "markdown": {
      const { markdown } = await import("@codemirror/lang-markdown");
      return [markdown()];
    }
    case "sql": {
      const { sql } = await import("@codemirror/lang-sql");
      return [sql()];
    }
    case "xml": {
      const { xml } = await import("@codemirror/lang-xml");
      return [xml()];
    }
    case "php": {
      const { php } = await import("@codemirror/lang-php");
      return [php()];
    }
    case "go": {
      const { go } = await import("@codemirror/lang-go");
      return [go()];
    }
    case "rust": {
      const { rust } = await import("@codemirror/lang-rust");
      return [rust()];
    }
    case "java": {
      const { java } = await import("@codemirror/lang-java");
      return [java()];
    }
    case "cpp": {
      const { cpp } = await import("@codemirror/lang-cpp");
      return [cpp()];
    }
    default:
      return [];
  }
}
