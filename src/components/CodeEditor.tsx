import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { useEffect, useState } from "react";

interface CodeEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  extensions: Extension[];
  onViewReady?: (view: EditorView) => void;
}

export function CodeEditor({
  label,
  value,
  onChange,
  extensions,
  onViewReady,
}: CodeEditorProps) {
  const [theme, setTheme] = useState<"light" | "dark">(
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setTheme(root.dataset.theme === "dark" ? "dark" : "light");
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="editor-panel">
      <div className="panel-header">
        <div>
          <p className="panel-eyebrow">Editor</p>
          <span>{label}</span>
        </div>
        <span className="panel-meta">{value ? `${value.split("\n").length} lines` : "Empty"}</span>
      </div>
      <CodeMirror
        aria-label={label}
        className="code-editor"
        value={value}
        height="100%"
        theme={theme === "dark" ? oneDark : EditorView.theme({})}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: false,
          foldGutter: false,
        }}
        editable
        extensions={extensions}
        onChange={onChange}
        onCreateEditor={onViewReady}
      />
    </section>
  );
}
