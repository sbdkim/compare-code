import type {
  ComparisonOptions,
  DiffTheme,
  DiffViewMode,
  InputSide,
} from "../types/diff";
import { LANGUAGE_OPTIONS } from "../lib/constants";

interface ToolbarProps {
  options: ComparisonOptions;
  theme: DiffTheme;
  resolvedLanguage: string;
  onOptionsChange: (update: Partial<ComparisonOptions>) => void;
  onThemeToggle: () => void;
  onSwap: () => void;
  onClear: () => void;
  onCopyPane: (side: InputSide) => void;
  onCopyDiff: () => void;
  onImport: (side: InputSide) => void;
}

export function Toolbar({
  options,
  theme,
  resolvedLanguage,
  onOptionsChange,
  onThemeToggle,
  onSwap,
  onClear,
  onCopyPane,
  onCopyDiff,
  onImport,
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar-group">
        <label>
          <span>Language</span>
          <select
            value={options.language}
            onChange={(event) =>
              onOptionsChange({ language: event.target.value })
            }
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Algorithm</span>
          <select
            value={options.strategy}
            onChange={(event) =>
              onOptionsChange({
                strategy: event.target.value as ComparisonOptions["strategy"],
              })
            }
          >
            <option value="patience-lite">Patience lite</option>
            <option value="myers">Myers</option>
          </select>
        </label>
        <label>
          <span>Granularity</span>
          <select
            value={options.granularity}
            onChange={(event) =>
              onOptionsChange({
                granularity: event.target.value as ComparisonOptions["granularity"],
              })
            }
          >
            <option value="line">Line</option>
            <option value="word">Word</option>
            <option value="char">Character</option>
          </select>
        </label>
        <label>
          <span>View</span>
          <select
            value={options.viewMode}
            onChange={(event) =>
              onOptionsChange({
                viewMode: event.target.value as DiffViewMode,
              })
            }
          >
            <option value="side-by-side">Side by side</option>
            <option value="unified">Unified</option>
          </select>
        </label>
      </div>
      <div className="toolbar-group toolbar-group-toggles">
        <label className="toggle">
          <input
            type="checkbox"
            checked={options.ignoreWhitespace}
            onChange={(event) =>
              onOptionsChange({ ignoreWhitespace: event.target.checked })
            }
          />
          <span>Ignore whitespace</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={options.ignoreCase}
            onChange={(event) =>
              onOptionsChange({ ignoreCase: event.target.checked })
            }
          />
          <span>Ignore case</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={options.trimLines}
            onChange={(event) =>
              onOptionsChange({ trimLines: event.target.checked })
            }
          />
          <span>Trim lines</span>
        </label>
      </div>
      <div className="toolbar-group toolbar-actions">
        <button type="button" onClick={() => onImport("left")}>
          Import left
        </button>
        <button type="button" onClick={() => onImport("right")}>
          Import right
        </button>
        <button type="button" onClick={() => onCopyPane("left")}>
          Copy left
        </button>
        <button type="button" onClick={() => onCopyPane("right")}>
          Copy right
        </button>
        <button type="button" onClick={onCopyDiff}>
          Copy diff
        </button>
        <button type="button" onClick={onSwap}>
          Swap
        </button>
        <button type="button" onClick={onClear}>
          Clear
        </button>
        <button type="button" onClick={onThemeToggle} className="theme-button">
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
      <div className="toolbar-meta">Detected: {resolvedLanguage}</div>
    </header>
  );
}
