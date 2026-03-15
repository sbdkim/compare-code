import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent } from "react";
import { EditorView } from "@codemirror/view";
import { CodeEditor } from "./components/CodeEditor";
import { DiffSideBySideView } from "./components/DiffSideBySideView";
import { DiffSummary } from "./components/DiffSummary";
import { DiffUnifiedView } from "./components/DiffUnifiedView";
import { Toolbar } from "./components/Toolbar";
import { useCodeMirrorLanguage } from "./hooks/useCodeMirrorLanguage";
import { DEFAULT_OPTIONS } from "./lib/constants";
import { createDiffStrategy } from "./lib/diffEngine";
import { readImportFile } from "./lib/imports";
import { getLanguageFromExtension } from "./lib/language";
import {
  clearSession,
  loadSession,
  saveSession,
} from "./lib/persistence";
import { formatUnifiedDiff } from "./lib/unifiedText";
import type {
  ComparisonOptions,
  InputSide,
  PersistedSession,
} from "./types/diff";

function App() {
  const initialSession = useMemo(loadSession, []);
  const [leftText, setLeftText] = useState(initialSession.leftText);
  const [rightText, setRightText] = useState(initialSession.rightText);
  const [options, setOptions] = useState(initialSession.options);
  const [message, setMessage] = useState("Ready");
  const [activeIndex, setActiveIndex] = useState(0);
  const leftImportRef = useRef<HTMLInputElement>(null);
  const rightImportRef = useRef<HTMLInputElement>(null);
  const leftEditorRef = useRef<EditorView | null>(null);
  const rightEditorRef = useRef<EditorView | null>(null);

  const deferredLeftText = useDeferredValue(leftText);
  const deferredRightText = useDeferredValue(rightText);
  const deferredOptions = useDeferredValue(options);

  const { extensions, resolvedLanguage } = useCodeMirrorLanguage(
    options.language,
    leftText,
    rightText,
  );

  const diffDocument = useMemo(() => {
    const strategy = createDiffStrategy(deferredOptions.strategy);
    return strategy.compare(
      deferredLeftText,
      deferredRightText,
      deferredOptions,
    );
  }, [deferredLeftText, deferredOptions, deferredRightText]);

  const changedBlocks = useMemo(
    () => diffDocument.blocks.filter((block) => block.changeKind !== "context"),
    [diffDocument.blocks],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = "light";
  }, []);

  useEffect(() => {
    const session: PersistedSession = {
      version: 1,
      leftText,
      rightText,
      options,
      theme: "light",
    };
    saveSession(session);
  }, [leftText, options, rightText]);

  useEffect(() => {
    setActiveIndex((current) => {
      if (changedBlocks.length === 0) {
        return 0;
      }
      return Math.min(current, changedBlocks.length - 1);
    });
  }, [changedBlocks.length]);

  useEffect(() => {
    if (!message || message === "Ready") {
      return;
    }
    const timeout = window.setTimeout(() => setMessage("Ready"), 3000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const activeAnchorId = changedBlocks[activeIndex]?.anchorId;

  function updateOptions(update: Partial<ComparisonOptions>) {
    startTransition(() => {
      setOptions((current) => ({ ...current, ...update }));
    });
  }

  function updateText(side: InputSide, value: string) {
    startTransition(() => {
      if (side === "left") {
        setLeftText(value);
      } else {
        setRightText(value);
      }
    });
  }

  async function copyToClipboard(value: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(successMessage);
    } catch {
      setMessage("Clipboard access failed");
    }
  }

  function syncEditorScroll() {
    const leftScroll = leftEditorRef.current?.scrollDOM.scrollTop ?? 0;
    if (rightEditorRef.current) {
      rightEditorRef.current.scrollDOM.scrollTop = leftScroll;
    }
  }

  function handleSwap() {
    startTransition(() => {
      setLeftText(rightText);
      setRightText(leftText);
    });
    syncEditorScroll();
    setMessage("Inputs swapped");
  }

  function handleClear() {
    startTransition(() => {
      setLeftText("");
      setRightText("");
      setOptions(DEFAULT_OPTIONS);
    });
    clearSession();
    setMessage("Editors cleared");
  }

  async function handleImport(
    event: ChangeEvent<HTMLInputElement>,
    side: InputSide,
  ) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const imported = await readImportFile(file, side);
      updateText(side, imported.content);
      if (options.language === "auto") {
        updateOptions({ language: getLanguageFromExtension(imported.extension) });
      }
      setMessage(`Imported ${imported.fileName}`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Import failed";
      setMessage(detail);
    } finally {
      event.target.value = "";
    }
  }

  function handleNavigate(direction: "next" | "previous") {
    if (changedBlocks.length === 0) {
      return;
    }

    setActiveIndex((current) => {
      if (direction === "next") {
        return (current + 1) % changedBlocks.length;
      }
      return (current - 1 + changedBlocks.length) % changedBlocks.length;
    });
  }

  return (
    <div className="app-shell">
      <header className="suite-hero">
        <div>
          <p className="eyebrow">Northline Dev</p>
          <h1>Compare Code</h1>
          <p className="hero-copy">
            Review changes in a cleaner local-first workspace with editor-grade
            diff views and fewer visual distractions.
          </p>
        </div>
        <div className="hero-note">
          <span className="hero-note-label">Workspace</span>
          <strong>Local-first compare</strong>
          <p>{message}. All comparisons stay in the browser and persist locally between visits.</p>
        </div>
      </header>

      <Toolbar
        options={options}
        resolvedLanguage={resolvedLanguage}
        onOptionsChange={updateOptions}
        onSwap={handleSwap}
        onClear={handleClear}
        onCopyPane={(side) =>
          copyToClipboard(
            side === "left" ? leftText : rightText,
            `Copied ${side} pane`,
          )
        }
        onCopyDiff={() =>
          copyToClipboard(formatUnifiedDiff(diffDocument), "Copied diff output")
        }
        onImport={(side) =>
          (side === "left" ? leftImportRef.current : rightImportRef.current)?.click()
        }
      />

      <input
        ref={leftImportRef}
        hidden
        type="file"
        accept=".txt,.js,.ts,.tsx,.jsx,.py,.json,.html,.css,.md,.xml,.yml,.yaml,.java,.c,.cpp,.cs,.go,.rs,.php,.sql"
        onChange={(event) => void handleImport(event, "left")}
      />
      <input
        ref={rightImportRef}
        hidden
        type="file"
        accept=".txt,.js,.ts,.tsx,.jsx,.py,.json,.html,.css,.md,.xml,.yml,.yaml,.java,.c,.cpp,.cs,.go,.rs,.php,.sql"
        onChange={(event) => void handleImport(event, "right")}
      />

      <main className="workspace">
        <section className="editor-grid">
          <CodeEditor
            label="Original"
            value={leftText}
            onChange={(value) => updateText("left", value)}
            extensions={extensions}
            onViewReady={(view) => {
              leftEditorRef.current = view;
            }}
          />
          <CodeEditor
            label="Modified"
            value={rightText}
            onChange={(value) => updateText("right", value)}
            extensions={extensions}
            onViewReady={(view) => {
              rightEditorRef.current = view;
            }}
          />
        </section>

        <DiffSummary
          document={diffDocument}
          activeIndex={activeIndex}
          totalChanges={changedBlocks.length}
          onPrevious={() => handleNavigate("previous")}
          onNext={() => handleNavigate("next")}
        />

        <section className="results-panel">
          <div className="panel-header">
            <span>Diff output</span>
            <span className="status-message">{message}</span>
          </div>
          {options.viewMode === "side-by-side" ? (
            <DiffSideBySideView
              blocks={diffDocument.blocks}
              activeAnchorId={activeAnchorId}
            />
          ) : (
            <DiffUnifiedView
              blocks={diffDocument.blocks}
              activeAnchorId={activeAnchorId}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
