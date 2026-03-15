import type { DiffDocument } from "../types/diff";

interface DiffSummaryProps {
  document: DiffDocument;
  activeIndex: number;
  totalChanges: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function DiffSummary({
  document,
  activeIndex,
  totalChanges,
  onPrevious,
  onNext,
}: DiffSummaryProps) {
  const hasChanges = totalChanges > 0;

  return (
    <div className="summary-bar">
      <div className="summary-stats" aria-label="Difference summary">
        <span className="stat-pill additions">{document.stats.additions} additions</span>
        <span className="stat-pill deletions">{document.stats.deletions} deletions</span>
        <span className="stat-pill changes">{document.stats.modifications} changes</span>
      </div>
      <div className="summary-nav">
        <span className="status-message">
          {hasChanges ? `${activeIndex + 1} / ${totalChanges} highlighted change sets` : "No differences detected"}
        </span>
        <button className="button-ghost" type="button" onClick={onPrevious} disabled={!hasChanges}>
          Previous
        </button>
        <button className="button-secondary" type="button" onClick={onNext} disabled={!hasChanges}>
          Next
        </button>
      </div>
    </div>
  );
}
