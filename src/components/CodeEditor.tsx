import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import type { DiffTheme } from "../types/diff";

interface CodeEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  extensions: Extension[];
  theme: DiffTheme;
  onViewReady?: (view: EditorView) => void;
}

export function CodeEditor({
  label,
  value,
  onChange,
  extensions,
  theme,
  onViewReady,
}: CodeEditorProps) {
  const editorTheme = useMemo(
    () => (theme === "dark" ? oneDark : EditorView.theme({})),
    [theme],
  );

  return (
    <section className="editor-panel">
      <div className="panel-header">
        <span>{label}</span>
      </div>
      <CodeMirror
        aria-label={label}
        className="code-editor"
        value={value}
        height="100%"
        theme={editorTheme}
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
