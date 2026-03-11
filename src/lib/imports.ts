import type { ImportSource, InputSide } from "../types/diff";
import { SUPPORTED_IMPORT_EXTENSIONS } from "./constants";

export async function readImportFile(
  file: File,
  side: InputSide,
): Promise<ImportSource> {
  const extension = getExtension(file.name);
  if (!SUPPORTED_IMPORT_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported file type: .${extension || "unknown"}`);
  }

  const content = await readFileText(file);
  return {
    side,
    fileName: file.name,
    extension,
    content,
  };
}

function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.at(-1)!.toLowerCase() : "";
}

function readFileText(file: File): Promise<string> {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file"));
    reader.readAsText(file);
  });
}
