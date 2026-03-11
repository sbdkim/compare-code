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
  return (
    <div className="summary-bar">
      <div className="summary-stats" aria-label="Difference summary">
        <span>{document.stats.additions} additions</span>
        <span>{document.stats.deletions} deletions</span>
        <span>{document.stats.modifications} changes</span>
      </div>
      <div className="summary-nav">
        <span>
          {totalChanges === 0 ? "No changes" : `${activeIndex + 1} / ${totalChanges}`}
        </span>
        <button type="button" onClick={onPrevious} disabled={totalChanges === 0}>
          Previous
        </button>
        <button type="button" onClick={onNext} disabled={totalChanges === 0}>
          Next
        </button>
      </div>
    </div>
  );
}
