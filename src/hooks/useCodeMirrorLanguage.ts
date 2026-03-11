import { useEffect, useState } from "react";
import type { Extension } from "@codemirror/state";
import { detectLanguage, loadLanguageExtension } from "../lib/language";

export function useCodeMirrorLanguage(
  language: string,
  leftText: string,
  rightText: string,
) {
  const resolvedLanguage =
    language === "auto" ? detectLanguage(leftText, rightText) : language;
  const [extensions, setExtensions] = useState<Extension[]>([]);

  useEffect(() => {
    let cancelled = false;

    loadLanguageExtension(resolvedLanguage).then((loaded) => {
      if (!cancelled) {
        setExtensions(loaded);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [resolvedLanguage]);

  return { extensions, resolvedLanguage };
}
