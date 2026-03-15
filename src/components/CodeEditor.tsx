import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";

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
        theme={EditorView.theme({})}
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
